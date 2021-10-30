import * as path from 'path';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { ExecOptions } from '@actions/exec/lib/interfaces';

const fs = require('fs');

const ROS_DISTRO = core.getInput('ros-distro', {required: true});
let SAMPLE_APP_VERSION = '';
const WORKSPACE_DIRECTORY = core.getInput('workspace-dir');
const GENERATE_SOURCES = core.getInput('generate-sources');
const ROS_ENV_VARIABLES: any = {};
const RETRIES = Number.parseInt(core.getInput('retries'), 10);
const MINIMUM_BACKOFF_TIME_SECONDS = 64; // delay for the first retry in seconds
const MAXIMUM_BACKOFF_TIME_SECONDS = 2048; // maximum delay for a retry in seconds

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
  var envVariables = Object.assign({}, process.env, ROS_ENV_VARIABLES);
  envVariables['PYTHONPATH'] = '/home/pypackages/lib/python3.6/site-packages/:$PYTHONPATH';
  const execOptions: ExecOptions = {
    cwd: path.join(workingDir, extraPath),
    env: envVariables
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
  await exec.exec("bash", [
      "-c",
       "find ../robot_ws -name package.xml -not -path '../robot_ws/src/deps/*' -exec grep -Po '(?<=<version>)[^\\s<>]*(?=</version>)' {} +"],
    getWorkingDirExecOptions(grepAfter));
  version = grepAfter.stdout.trim();
  return Promise.resolve(version);
}

// If .rosinstall exists, run 'vcs import'
async function fetchRosinstallDependencies() {
  // Download dependencies not in apt if .rosinstall exists
  // When generate-sources: true, the expected behavior is to include sources from both workspaces including their dependencies. 
  // In order to make generate-sources work as expected, dependencies are fetched in both the workspaces here.
  for (let workspace of ["robot_ws", "simulation_ws"]) {
    if (fs.existsSync(path.join(workspace, '.rosinstall'))) {
      await exec.exec("vcs", ["import", "--input", ".rosinstall"], {cwd: workspace});
    }
  }


}
 async function setup() {
  if (!fs.existsSync("/etc/timezone")) {
    //default to US Pacific if timezone is not set.
    const timezone = "US/Pacific";
    await exec.exec("bash", ["-c", `ln -snf /usr/share/zoneinfo/${timezone} /etc/localtime`]);
    await exec.exec("bash" , ["-c", `echo ${timezone} > /etc/timezone`]);
  }
  await exec.exec("bash", ["-c", `scripts/setup.sh --install-ros ${ROS_DISTRO}`], getWorkingDirParentExecOptions());
  await loadROSEnvVariables();
  await exec.exec("apt-get", ["update"]);
  //zip required for prepare_sources step.
  await exec.exec("apt-get", ["install", "-y", "zip"]);

  SAMPLE_APP_VERSION = await getSampleAppVersion();
  console.log(`Sample App version found to be: ${SAMPLE_APP_VERSION}`);
  await fetchRosinstallDependencies();
 }

async function prepare_sources() {
  const sourceIncludes = [
    "robot_ws",
    "simulation_ws",
    "scripts",
    "LICENSE*",
    "NOTICE*",
    "README*",
    "roboMakerSettings.json"
  ];
  
  const sourceIncludesStr = sourceIncludes.join(" ");    
  await exec.exec("bash", ["-c", `zip -r sources.zip ${sourceIncludesStr}`], getWorkingDirParentExecOptions());
  await exec.exec("bash", ["-c", `tar cvzf sources.tar.gz ${sourceIncludesStr}`], getWorkingDirParentExecOptions());
}

async function build() {
  await exec.exec("colcon", ["build", "--build-base", "build", "--install-base", "install"], getWorkingDirExecOptions());
}

async function bundle() {
  // indexed from 0 because RETRIES is the number of retries AFTER the initial try
  const bundleFilename = path.basename(WORKSPACE_DIRECTORY);
  await exec.exec("colcon", ["bundle", "--build-base", "build", "--install-base", "install", "--bundle-base", "bundle"], getWorkingDirExecOptions());
  await exec.exec("mv", ["bundle/output.tar", `../${bundleFilename}.tar`], getWorkingDirExecOptions());
  await exec.exec("rm", ["-rf", "bundle"], getWorkingDirExecOptions());  // github actions have been failing with no disk space
}

async function installPyparsing() {
  //install pyparsing-2.0.2 to a local directory so that it can be added to PYTHONPATH env variable
  await exec.exec("bash", ["-c", `pip3 install --install-option="--prefix=/home/pypackages" pyparsing==2.0.2`], getWorkingDirExecOptions());
}

async function run() {
  let delay_ms = 1000 * MINIMUM_BACKOFF_TIME_SECONDS;
  console.log(`ROS_DISTRO: ${ROS_DISTRO}`);
  console.log(`WORKSPACE_DIRECTORY: ${WORKSPACE_DIRECTORY}`);
  console.log(`GENERATE_SOURCES: ${GENERATE_SOURCES}`);
  console.log(`RETRIES: ${RETRIES}`);
  
  // check if RETRIES is valid (i.e. 0<) and not too large (i.e. <10)  
  if (RETRIES<0 || 9<RETRIES){
    core.setFailed(`Invalid number of retries. Must be between 0-9 inclusive`);
    return;
  }

  for (let i = 0; i <= RETRIES; i++) {
    try {
      await setup();
      if (GENERATE_SOURCES == 'true') {
        await prepare_sources();
      }
      await installPyparsing();
      await build();
      await bundle();
      core.setOutput('ros-distro', ROS_DISTRO)
      core.setOutput('sample-app-version', SAMPLE_APP_VERSION);
      break; //Break out of retry loop if successful.
    } catch (error) {
      await exec.exec("rm", ["-rf", "bundle"], getWorkingDirExecOptions()); // remove erred bundle assets
      if (i == RETRIES){
        core.setFailed(error.message); // set action to Failed after RETRIES number of retries
        break;
      }
      console.log(`Action failed.. retrying in ${delay_ms} milliseconds`);
      await delay(delay_ms); // wait for next retry per the current exponential backoff delay
      delay_ms = Math.min(delay_ms * 2,  1000 * MAXIMUM_BACKOFF_TIME_SECONDS); // double the delay for the next retry, truncate if required
    }
  }

}

run();
