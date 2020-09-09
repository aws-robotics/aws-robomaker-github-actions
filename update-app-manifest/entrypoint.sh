#!/bin/bash
set -e

# Set username and password to commit to the app-manifest repo 
# TODO: update user email and name 
GH_USER_EMAIL = "travis-ci"
GH_USER_NAME = "travis@travis-ci.org"

# Fetch the relevant CodePipeline
APP_MANIFEST_REPO="AppManifest-$SA_NAME-$ROS_DISTRO-gazebo$GAZEBO_VERSION"
BRANCH_INFO=`aws codecommit get-branch --repository-name $APP_MANIFEST_REPO --branch-name mainline`
BRANCH_INFO_STATUS=$?
set -e
if [ $BRANCH_INFO_STATUS -ne 0 ]; then
    echo "Could not find mainline branch for repository $APP_MANIFEST_REPO. Creating first commit."
else
    export BRANCH_COMMIT_ID=`echo $BRANCH_INFO | jq -r '.branch.commitId'`
fi

export PARENT_COMMIT_FLAG=""
if [ -n "$BRANCH_COMMIT_ID" ]; then
    PARENT_COMMIT_FLAG="--parent-commit-id=$BRANCH_COMMIT_ID"
fi

if [ -z "$SA_VERSION" ]; then
    echo "Please set the SA_VERSION env variable"
    exit 1
fi

# # Use Github Actions build number for versioning;
TIMESTAMP=`date +%s`
aws codecommit put-file --repository-name "$APP_MANIFEST_REPO" --branch-name mainline --file-content "{\"application_version\": \"$SA_VERSION\",\"timestamp\":\"$TIMESTAMP\"}" --file-path "/version.json" --commit-message "Updating to version $SA_VERSION." --name "$GH_USER_NAME" --email "$GH_USER_EMAIL" $PARENT_COMMIT_FLAG

set +e
