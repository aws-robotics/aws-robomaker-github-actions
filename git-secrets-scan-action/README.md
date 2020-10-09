# GitHub Action to `git secrets --scan` in your CI  🔄

This simple action uses the [vanilla AWS CLI](https://docs.aws.amazon.com/cli/index.html) and [git secrets](https://github.com/awslabs/git-secrets) to scan your repository for secrets being commited to public. 

The action checks for common AWS patterns and ensures that keys present in ~/.aws/credentials are not found in any commit. The following checks are added:

* AWS Access Key IDs via (A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}
* AWS Secret Access Key assignments via ":" or "=" surrounded by optional quotes
* AWS account ID assignments via ":" or "=" surrounded by optional quotes
* Allowed patterns for example AWS keys (AKIAIOSFODNN7EXAMPLE and wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY)
* Known credentials from ~/.aws/credentials

## Usage

### `workflow.yml` Example

Place in a `.yml` file such as this one in your `.github/workflows` folder. [Refer to the documentation on workflow YAML syntax here.](https://help.github.com/en/articles/workflow-syntax-for-github-actions)

```
name: Scan Secrets
on: push

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@v1
    - name: scan-git-secrets
      uses: aws-robotics/aws-robomaker-github-actions/git-secrets-scan-action@2.4.0
```


### Environment Variables

| Key | Value | Type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `GITHUB_WORKSPACE` | The GitHub workspace directory path. The workspace directory contains a subdirectory with a copy of your repository if your workflow uses the actions/checkout action. If you don't use the actions/checkout action, the directory will be empty. For example, /home/runner/work/my-repo-name/my-repo-name. This variable is set by GH actions. | `env` | **Yes** |


