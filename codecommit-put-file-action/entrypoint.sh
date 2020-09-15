#!/bin/sh

set -e

# set aws-credentials
mkdir -p ~/.aws
touch ~/.aws/credentials

echo "[default]
aws_access_key_id = ${AWS_ACCESS_KEY_ID}
aws_secret_access_key = ${AWS_SECRET_ACCESS_KEY}" > ~/.aws/credentials

set +e # May fail
BRANCH_INFO=`aws codecommit get-branch --repository-name $AWS_CODECOMMIT_REPO_NAME --branch-name $AWS_CODECOMMIT_BRANCH_NAME`
BRANCH_INFO_STATUS=$?
set -e
if [ $BRANCH_INFO_STATUS -ne 0 ]; then
    # this would be the first commit to this branch
    BRANCH_COMMIT_ID=''
else
    # this would be the head commit on this branch
    BRANCH_COMMIT_ID=`echo $BRANCH_INFO | jq -r '.branch.commitId'`
fi

# parent commit flag is required if the repo exists, else no flag is required. (https://docs.aws.amazon.com/cli/latest/reference/codecommit/put-file.html) 
export PARENT_COMMIT_FLAG=""
if [ -n "$BRANCH_COMMIT_ID" ]; then
    PARENT_COMMIT_FLAG="--parent-commit-id=$BRANCH_COMMIT_ID"
fi

aws codecommit put-file --repository-name "$AWS_CODECOMMIT_REPO_NAME" --branch-name "$AWS_CODECOMMIT_BRANCH_NAME" --file-content "$DEST_FILE_CONTENT" --file-path "$DEST_FILE_PATH" --commit-message "$COMMIT_MSG" --name "$USER_NAME" --email "$USER_EMAIL" $PARENT_COMMIT_FLAG
rm -rf ~/.aws

set +e
