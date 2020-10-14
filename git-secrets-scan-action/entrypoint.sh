#!/bin/sh

set -e

# Clone and install git-secrets from source
cd ${HOME}
git clone https://github.com/awslabs/git-secrets.git && cd git-secrets && make install 

# Check if $GITHUB_WORKSPACE is set
if [[ -z "${GITHUB_WORKSPACE}" ]]; then
    echo "Required variable GITHUB_WORKSPACE not set."
    exit 1
fi 

if [ $1 ]; then
    # actions/checkout@v2
    REPO_PATH=${GITHUB_WORKSPACE}/$1
else
    # actions/checkout@v1
    REPO_PATH=${GITHUB_WORKSPACE}
fi

# Check if repository is checked-out and repo directory is not empty
if [[ -d "${REPO_PATH}" && ! -z "$(ls -A ${REPO_PATH})"]]; then
    cd ${REPO_PATH}
else
    echo "${REPO_PATH} does not point to a valid directory or is empty. Please check usage of $path input variable based on which version of actions/checkout you have used."
    exit 1
fi

# Register git-secrets in the workspace repo
git secrets --install
git secrets --register-aws

set +e

# Scan entire history for secrets being committed (secrets can be committed in earlier commits which also need to be pointed out here)
git secrets --scan-history 2> secret_logs.txt
cat secret_logs.txt | grep -q "[ERROR]";
_secret_exists=$?

if [ ${_secret_exists} == 0 ]; then
    # Secrets exist. Echo error and exit with code 1
    echo "Secrets exist in your commits. Please rectify the bad commits and re-commit."
    cat secret_logs.txt
    rm -rf secret_logs.txt
    exit 1
else
    # Secrets don't exist. Exit with code 0
    echo "No secrets exist in your commits."
    exit 0
fi 