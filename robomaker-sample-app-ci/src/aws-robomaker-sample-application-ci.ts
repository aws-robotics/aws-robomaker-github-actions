import * as path from 'path';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { ExecOptions } from '@actions/exec/lib/interfaces';

const fs = require('fs');

const ROS_DISTRO = core.getInput('ros-distro', {required: true});
let GAZEBO_VERSION = core.getInput('gazebo-version');
let SAMPLE_APP_VERSION = '';
const WORKSPACE_DIRECTORY = core.getInput('workspace-dir');
const GENERATE_SOURCES = core.getInput('generate-sources');
let PACKAGES = "none"
const ROS_ENV_VARIABLES: any = {};
const COLCON_BUNDLE_RETRIES = Number.parseInt(core.getInput('colcon-bundle-retries'), 10);
const MINIMUM_BACKOFF_TIME_SECONDS = 32; // delay for the first retry in seconds
const MAXIMUM_BACKOFF_TIME_SECONDS = 128; // maximum delay for a retry in seconds

function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

async function loadROSEnvVariables() {
  const options = {
    listeners: {
      stdout: (data: Buffer) => {
        const lines = data.toString().split("\n");
        lines.forEach(line => {
          if (line.trim().length === 0) return;
          const contents = line.trim().split("=");
          ROS_ENV_VARIABLES[contents[0]] = contents.slice(1).join("=");
        });
      }
    }
  };

  await exec.exec("bash", ["-c", `source /opt/ros/${ROS_DISTRO}/setup.bash && printenv`], options)
}

function getWorkingDirExecOptions(listenerBuffers?): ExecOptions {
  return getExecOptions(WORKSPACE_DIRECTORY, ".", listenerBuffers);
}

function getWorkingDirParentExecOptions(listenerBuffers?): ExecOptions {
  return getExecOptions(WORKSPACE_DIRECTORY, "..", listenerBuffers);
}

function getExecOptions(workingDir, extraPath, listenerBuffers?): ExecOptions {
  var listenerBuffers = listenerBuffers || {};
  const execOptions: ExecOptions = {
    cwd: path.join(workingDir, extraPath),
    env: Object.assign({}, process.env, ROS_ENV_VARIABLES)
  };
  if (listenerBuffers) {
    execOptions.listeners = {
      stdout: (data: Buffer) => {
        listenerBuffers.stdout += data.toString();
      },
      stderr: (data: Buffer) => {
        listenerBuffers.stderr += data.toString();
      }
    };
  }
  return execOptions
}

async function getSampleAppVersion() : Promise<string> {
  let grepAfter = {stdout: '', stderr: ''};
  let version = '';
  try {
    await exec.exec("bash", [
        "-c",
         "find ../robot_ws -name package.xml -exec grep -Po '(?<=<version>)[^\\s<>]*(?=</version>)' {} +"],
      getWorkingDirExecOptions(grepAfter));
    version = grepAfter.stdout.trim();
  } catch(error) {
    core.setFailed(error.message);
  }
  return Promise.resolve(version);
}

// If .rosinstall exists, run 'vcs import' and return a list of names of the packages that were added in both workspaces.
async function fetchRosinstallDependencies(): Promise<string[]> {
  let colconListAfter = {stdout: '', stderr: ''};
  let packages: string[] = [];
  // Download dependencies not in apt if .rosinstall exists
  try {
    // When generate-sources: true, the expected behavior is to include sources from both workspaces including their dependencies. 
    // In order to make generate-sources work as expected, dependencies are fetched in both the workspaces here.
    for (let workspace of ["robot_ws", "simulation_ws"]) {
      if (fs.existsSync(path.join(workspace, '.rosinstall'))) {
        await exec.exec("vcs", ["import", "--input", ".rosinstall"], {cwd: workspace});
      }
    }
    // this is outside the loop as we don't want to build both the dependency packages
    if (fs.existsSync(path.join(WORKSPACE_DIRECTORY, '.rosinstall'))) {
      await exec.exec("colcon", ["list", "--names-only"], getWorkingDirExecOptions(colconListAfter));
      const packagesAfter = colconListAfter.stdout.split("\n");
      packagesAfter.forEach(packageName => {
        packages.push(packageName.trim());
      });
    }
  } catch(error) {
    core.setFailed(error.message);
  }
  return Promise.resolve(packages);
}
 async function setup() {
   try{

    if (!fs.existsSync("/etc/timezone")) {
      //default to US Pacific if timezone is not set.
      const timezone = "US/Pacific";
      await exec.exec("bash", ["-c", `ln -snf /usr/share/zoneinfo/${timezone} /etc/localtime`]);
      await exec.exec("bash" , ["-c", `echo ${timezone} > /etc/timezone`]);
    }
    await exec.exec("bash", ["-c", "scripts/setup.sh"]);
    loadROSEnvVariables();
    await exec.exec("apt-get", ["update"]);
    //zip required for prepare_sources step.
    await exec.exec("apt-get", ["install", "-y", "zip"]);
    SAMPLE_APP_VERSION = await getSampleAppVersion();
    console.log(`Sample App version found to be: ${SAMPLE_APP_VERSION}`);

    let packages = await fetchRosinstallDependencies();
    PACKAGES = packages.join(" ");
   } catch (error) {
    core.setFailed(error.message);
   }
 }

async function prepare_sources() {
  try {
    const sourceIncludes = [
      "robot_ws",
      "simulation_ws",
      "LICENSE*",
      "NOTICE*",
      "README*",
      "roboMakerSettings.json"
    ];
    
    const sourceIncludesStr = sourceIncludes.join(" ");    
    await exec.exec("bash", ["-c", `zip -r sources.zip ${sourceIncludesStr}`], getWorkingDirParentExecOptions());
    await exec.exec("bash", ["-c", `tar cvzf sources.tar.gz ${sourceIncludesStr}`], getWorkingDirParentExecOptions());
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function build() {
  try {
    await exec.exec("colcon", ["build", "--build-base", "build", "--install-base", "install"], getWorkingDirExecOptions());
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function bundle() {
  let delay_ms = 1000 * MINIMUM_BACKOFF_TIME_SECONDS; 
  // indexed from 0 because COLCON_BUNDLE_RETRIES is the number of retries AFTER the initial try
  for (let i = 0; i <= COLCON_BUNDLE_RETRIES; i++) {
    try {
      const bundleFilename = path.basename(WORKSPACE_DIRECTORY);
      await exec.exec("colcon", ["bundle", "--build-base", "build", "--install-base", "install", "--bundle-base", "bundle"], getWorkingDirExecOptions());
      await exec.exec("mv", ["bundle/output.tar", `../${bundleFilename}.tar`], getWorkingDirExecOptions());
      await exec.exec("rm", ["-rf", "bundle"], getWorkingDirExecOptions());  // github actions have been failing with no disk space
      break; // break if colcon bundle passes
    } catch (error) {
      await exec.exec("rm", ["-rf", "bundle"], getWorkingDirExecOptions()); // remove erred bundle assets
      if (i == COLCON_BUNDLE_RETRIES){
        core.setFailed(error.message); // set action to Failed if the colcon bundle fails even after COLCON_BUNDLE_RETRIES number of retries
        break;
      }
      console.log(`Colcon bundle failed.. retrying in ${delay_ms} milliseconds`);
      await delay(delay_ms); // wait for next retry per the current exponential backoff delay
      delay_ms = Math.min(delay_ms * 2, MAXIMUM_BACKOFF_TIME_SECONDS); // double the delay for the next retry, truncate if required
    }
  }
}

async function run() {
  console.log(`ROS_DISTRO: ${ROS_DISTRO}`);
  console.log(`GAZEBO_VERSION: ${GAZEBO_VERSION}`);
  console.log(`WORKSPACE_DIRECTORY: ${WORKSPACE_DIRECTORY}`);
  console.log(`GENERATE_SOURCES: ${GENERATE_SOURCES}`);
  console.log(`COLCON_BUNDLE_RETRIES: ${COLCON_BUNDLE_RETRIES}`);
  
  // check if COLCON_BUNDLE_RETRIES is valid (i.e. 0<) and not too large (i.e. <10)  
  if (COLCON_BUNDLE_RETRIES<0 || 9<COLCON_BUNDLE_RETRIES){
    core.setFailed(`Invalid number of colcon bundle retries. Must be between 0-9 inclusive`);
  }

  await setup();
  if (GENERATE_SOURCES == 'true') {
    await prepare_sources();
  }
  await build();
  await bundle();

  core.setOutput('ros-distro', ROS_DISTRO)
  core.setOutput('gazebo-version', "gazebo"+GAZEBO_VERSION)
  core.setOutput('sample-app-version', SAMPLE_APP_VERSION);
}

run();
