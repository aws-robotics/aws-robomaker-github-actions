# Action to put a file in a Codecommit repo 🔄

This action uses the [vanilla AWS CLI](https://docs.aws.amazon.com/cli/index.html) to update the package version in the Appmanifest.


## Usage

### `workflow.yml` Example

Place in a `.yml` file such as this one in your `.github/workflows` folder. [Refer to the documentation on workflow YAML syntax here.](https://help.github.com/en/articles/workflow-syntax-for-github-actions)

```
name: Codecommit put-file
on: push

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@master
    - name: Put file into a codecommit repo
      uses: aws-robotics/robomaker-sample-app-ci/codecommit-put-file-action@v2.0.0
      env:
        REPO_NAME: 'test-codecommit-repo'
        BRANCH_NAME: 'mainline'
        FILE_CONTENT: '{"name": "hello-world"}
        FILE_PATH: '/test_file'
        COMMIT_MSG: 'test commit'
        PARENT_COMMIT_FLAG: ''  
        USER_EMAIL: xyz@abc.com
        USER_NAME: xyz.abc
```


### Environment Variables

| Key | Value | Type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `REPO_NAME` | Codecommit repo name | `env` | **Yes** |
| `BRANCH_NAME` | Codecommit repo branch name |`env` | **Yes** |
| `FILE_CONTENT` | File/ File content | `env` | **Yes** |
| `FILE_PATH` | Path where the file should be put inside the repo | `env` | **Yes** |
| `COMMIT_MSG` | Commit message | `env` | **Yes** |
| `PARENT_COMMIT_FLAG` | Parent commit flag | `env` | **Yes** |
| `USER_EMAIL` | Email-ID to be associated with this commit | `env` | **Yes** |
| `USER_NAME` | user-name to be associated with this commit | `env` | **Yes** |
| `AWS_REGION` | The region where you created your bucket in. For example, `eu-central-1`. [Full list of regions here.](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#concepts-available-regions) | `env` | **Yes** |



### Required Secret Variables

The following variables should be added as "secrets" in the action's configuration.

| Key | Value | Type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `AWS_S3_BUCKET` | The name of the bucket you're syncing to. For example, `golang-deployment-bucket`. | `secret` | **Yes** |
| `AWS_ACCESS_KEY_ID` | Your AWS Access Key. [More info here.](https://docs.aws.amazon.com/general/latest/gr/managing-aws-access-keys.html) | `secret` | **Yes** |
| `AWS_SECRET_ACCESS_KEY` | Your AWS Secret Access Key. [More info here.](https://docs.aws.amazon.com/general/latest/gr/managing-aws-access-keys.html) | `secret` | **Yes** |
