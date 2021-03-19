# AWS RoboMaker Sample Application CI Github Action

This action will build and bundle your AWS RoboMaker Sample Application package.
It must run in an environment that has all core ROS dependencies already installed for the ROS distro you are using (Kinetic, Melodic, Dashing, Foxy etc). 

You use a [setup-ros-docker docker container], see usage section to see how to use this container. 

## Usage

Using a [setup-ros-docker docker container] docker container:

```
jobs:
  build-and-bundle-robot_ws-kinetic:
    runs-on: ubuntu-latest
    name: Build Kinetic
    container:
    image: rostooling/setup-ros-docker:ubuntu-xenial-ros-kinetic-ros-base-latest
    steps:
    - name: Build
      uses: aws-robotics/aws-robomaker-github-actions/robomaker-sample-app-ci@2.3.0
      with:
        ros-distro: kinetic
        gazebo-version: 7
        workspace-dir: robot_ws
        generate-sources: true
  build-and-bundle-simulation_ws-kinetic:
    runs-on: ubuntu-latest
    name: Build Kinetic
    container:
      image: ros:kinetic-ros-core
    steps:
    - name: Build
      uses: aws-robotics/aws-robomaker-github-actions/robomaker-sample-app-ci@2.3.0
      with:
        ros-distro: kinetic
        gazebo-version: 7
        workspace-dir: simulation_ws
```

## Inputs

### `ros-distro`

**Required** Distribution of ROS you are using (`[kinetic|melodic|dashing|foxy]`)

### `workspace-dir`

Path to the workspace folder of your package (*eg.*: `[robot_ws|simulation_ws]`, *default:* `./`). 

[setup-ros-docker container]: https://hub.docker.com/r/rostooling/setup-ros-docker
