#!/bin/sh

set -e

# Clone and install git-secrets from source
cd ${HOME}
git clone https://github.com/awslabs/git-secrets.git && cd git-secrets && make install 

# In actions/checkout@v1, path is the absolute path to where the repo will get checked-out.
# In actions/checkout@v2, is a path relative to ${GITHUB_WORKSPACE} where the repo will get checked-out.
# Hence, we check the provided path is valid as an absolute path or as an relative path.
LOCAL_REPO_PATH=${GITHUB_WORKSPACE}/$1
ABS_REPO_PATH=/$1

if [[ -d "${ABS_REPO_PATH}" ]]; then
    cd ${ABS_REPO_PATH}
    REPO_PATH=${ABS_REPO_PATH}
elif [[ -z "${GITHUB_WORKSPACE}" ]]; then
    echo "Required variable GITHUB_WORKSPACE not set."
    exit 1
elif [[ ! -z "${GITHUB_WORKSPACE}" && -d "${LOCAL_REPO_PATH}" ]]; then
    cd ${LOCAL_REPO_PATH}
    REPO_PATH=${LOCAL_REPO_PATH}
else
    echo "Neither ${ABS_REPO_PATH} nor ${LOCAL_REPO_PATH} point to a valid directory."
    exit 1
fi
# Check if repository is checked-out using actions/checkout
if [ -z "$(ls -A .)" ]; then
    echo "${REPO_PATH} is empty. Did you checkout the repository using actions/checkout?"
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