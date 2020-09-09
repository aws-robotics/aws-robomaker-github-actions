# GitHub Action to update the package version in the Appmanifest🔄

This action uses the [vanilla AWS CLI](https://docs.aws.amazon.com/cli/index.html) to update the package version in the Appmanifest.


## Usage

### `workflow.yml` Example

Place in a `.yml` file such as this one in your `.github/workflows` folder. [Refer to the documentation on workflow YAML syntax here.](https://help.github.com/en/articles/workflow-syntax-for-github-actions)

```
name: Update App-manifest
on: push

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@master
    - name: Update App-manifest version number
      uses: aws-robotics/robomaker-sample-app-ci/update-app-manifest@v2.0.0
      env:
        SA_NAME: 'hello-world'
        ROS_DISTRO: 'kinetic'
        GAZEBO_VERSION: 'gazebo7'
        SA_VERSION: '1.0.0.1000'
```


### Environment Variables

| Key | Value | Type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `SA_VERSION` | Latest sample app version number which the Appmanifest should point to | `env` | **Yes** |
| `SA_NAME` | Sample app name |`env` | **Yes** |
| `ROS_DISTRO` | ROS distribution | `env` | **Yes** |
| `GAZEBO_VERSION` | Gazebo version | `env` | **Yes** |

