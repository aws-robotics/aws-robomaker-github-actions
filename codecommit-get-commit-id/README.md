# Action to put a file in a Codecommit repo 🔄

This action uses the [vanilla AWS CLI](https://docs.aws.amazon.com/cli/index.html) to get the most recent commit-id from a codecommit repo branch.


## Usage

### `workflow.yml` Example

Place in a `.yml` file such as this one in your `.github/workflows` folder. [Refer to the documentation on workflow YAML syntax here.](https://help.github.com/en/articles/workflow-syntax-for-github-actions)

```
name: Get latest codecommit commit-id
on: push

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@master
    - name: Get the most recent commit-id on a codecommit repo branch
      id: get_commit_id
      uses: aws-robotics/robomaker-sample-app-ci/codecommit-get-commit-id@v2.0.0
      env:
        AWS_REGION: us-east-2
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        AWS_CODECOMMIT_REPO_NAME: ${{ secrets.REPO_NAME }}
        AWS_CODECOMMIT_BRANCH_NAME: ${{ secrets.BRANCH_NAME }}
    # Use the output from the previous step
    - name: Get the output time
      run: echo "The time was ${{ steps.get_commit_id.outputs.commit_id }}"
```


### Environment Variables

| Key | Value | Type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `AWS_REGION` | The region where you created your bucket in. For example, `eu-central-1`. [Full list of regions here.](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#concepts-available-regions) | `env` | **Yes** |



### Required Secret Variables

The following variables should be added as "secrets" in the action's configuration.

| Key | Value | Type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `AWS_CODECOMMIT_REPO_NAME` | Codecommit repo name | `secret` | **Yes** |
| `AWS_CODECOMMIT_BRANCH_NAME` | Codecommit repo branch name |`secret` | **Yes** |
| `AWS_ACCESS_KEY_ID` | Your AWS Access Key. [More info here.](https://docs.aws.amazon.com/general/latest/gr/managing-aws-access-keys.html) | `secret` | **Yes** |
| `AWS_SECRET_ACCESS_KEY` | Your AWS Secret Access Key. [More info here.](https://docs.aws.amazon.com/general/latest/gr/managing-aws-access-keys.html) | `secret` | **Yes** |
