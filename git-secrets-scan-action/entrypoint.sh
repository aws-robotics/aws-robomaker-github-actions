#!/bin/sh

set -e

# Clone and install git-secrets from source
cd ${HOME}
git clone https://github.com/awslabs/git-secrets.git && cd git-secrets && make install 

# Check if GITHUB_WORKSPACE is set and points to a valid directory
if [[ -z "${GITHUB_WORKSPACE}" || ! -d "${GITHUB_WORKSPACE}" ]]; then
    echo "Required env variable GITHUB_WORKSPACE not set or does not point to a valid directory."
    exit 1
fi

cd ${GITHUB_WORKSPACE}

# Check if repository is checked-out using actions/checkout
if [ -z "$(ls -A .)" ]; then
    echo "Workspace is empty. Did you checkout the repository using actions/checkout?"
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

if [ $_secret_exists == 0 ]; then
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