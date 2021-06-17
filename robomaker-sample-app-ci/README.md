# AWS RoboMaker Sample Application CI Github Action

This action will build and bundle your AWS RoboMaker Sample Application package.

You use a [setup-ros-docker docker container], see usage section to see how to use this container. 

## Usage

Using a Ubuntu docker container:

```
jobs:
  build-and-bundle-robot_ws-kinetic:
    runs-on: ubuntu-latest
    name: Build Kinetic
    container:
    image: ubuntu:bionic
    steps:
    - name: Build
      uses: aws-robotics/aws-robomaker-github-actions/robomaker-sample-app-ci@2.3.0
      with:
        ros-distro: kinetic
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
        workspace-dir: simulation_ws
```

## Inputs

### `ros-distro`

**Required** Distribution of ROS you are using (`[melodic|foxy]`)

### `workspace-dir`

Path to the workspace folder of your package (*eg.*: `[robot_ws|simulation_ws]`, *default:* `./`). 

[ubuntu container]: https://hub.docker.com/_/ubuntu
