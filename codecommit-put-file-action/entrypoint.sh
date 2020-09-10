#!/bin/bash
set -e

# set aws-credentials
mkdir -p ~/.aws
touch ~/.aws/credentials

echo "[default]
aws_access_key_id = ${AWS_ACCESS_KEY_ID}
aws_secret_access_key = ${AWS_SECRET_ACCESS_KEY}" > ~/.aws/credentials

aws codecommit put-file --repository-name "$AWS_CODECOMMIT_REPO_NAME" --branch-name "$AWS_CODECOMMIT_BRANCH_NAME" --file-content "$FILE_CONTENT" --file-path "$FILE_PATH" --commit-message "$COMMIT_MSG" --name "$GH_USER_NAME" --email "$GH_USER_EMAIL" --parent-commit-id $PARENT_COMMIT_FLAG

rm -rf ~/.aws

set +e
