#!/bin/bash
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
    BRANCH_COMMIT_ID=''
else
    BRANCH_COMMIT_ID=`echo $BRANCH_INFO | jq -r '.branch.commitId'`
fi

# set output variable
echo "::set-output name=commit_id::$BRANCH_COMMIT_ID"

rm -rf ~/.aws

set +e
