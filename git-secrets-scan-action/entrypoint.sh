#!/bin/sh

set -e

# Clone and install git-secrets from source
cd ${HOME}
git clone https://github.com/awslabs/git-secrets.git && cd git-secrets && make install 

cd ${GITHUB_WORKSPACE}

# Register git-secrets in the workspace repo
git secrets --install
git secrets --register-aws

set +e

# Scan for secrets being committed
if git secrets --scan 2>&1 >/dev/null | grep -q "[ERROR]"; then
    # Secrets exist. Echo error and exit with code 1
    _secret_exists=1
    echo "Secrets exist in your commits. Please rectify and re-commit."
    echo "::set-output name=secret_exists::$_secret_exists"
    exit 1
else
    # Secrets don't exist. Exit with code 0
    _secret_exists=0
    echo "No secrets exist in your commits."
    echo "::set-output name=secret_exists::$_secret_exists"
    exit 0
fi 