# Action to put a file in a Codecommit repo 🔄

This action uses the [vanilla AWS CLI](https://docs.aws.amazon.com/cli/index.html) to put file in the codecommit repo.


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
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        AWS_CODECOMMIT_REPO_NAME: ${{ secrets.REPO_NAME }}
        AWS_CODECOMMIT_BRANCH_NAME: ${{ secrets.BRANCH_NAME }}
        DEST_FILE_CONTENT: {"name": "hello-world"}
        DEST_FILE_PATH: '/test_file'
        COMMIT_MSG: 'test commit'
        USER_EMAIL: 'xyz@abc.com'
        USER_NAME: 'xyz.abc'
```


### Environment Variables

| Key | Value | Type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `DEST_FILE_CONTENT` | File/ File content | `env` | **Yes** |
| `DEST_FILE_PATH` | Path where the file should be put inside the repo | `env` | **Yes** |
| `COMMIT_MSG` | Commit message | `env` | **Yes** |
| `USER_EMAIL` | Email-ID to be associated with this commit | `env` | **Yes** |
| `USER_NAME` | user-name to be associated with this commit | `env` | **Yes** |



### Required Secret Variables

The following variables should be added as "secrets" in the action's configuration.

| Key | Value | Type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `AWS_CODECOMMIT_REPO_NAME` | Codecommit repo name | `secret` | **Yes** |
| `AWS_CODECOMMIT_BRANCH_NAME` | Codecommit repo branch name |`secret` | **Yes** |
| `AWS_ACCESS_KEY_ID` | Your AWS Access Key. [More info here.](https://docs.aws.amazon.com/general/latest/gr/managing-aws-access-keys.html) | `secret` | **Yes** |
| `AWS_SECRET_ACCESS_KEY` | Your AWS Secret Access Key. [More info here.](https://docs.aws.amazon.com/general/latest/gr/managing-aws-access-keys.html) | `secret` | **Yes** |
