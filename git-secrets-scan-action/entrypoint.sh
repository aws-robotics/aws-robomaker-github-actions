#!/bin/sh

set -e

WORK_DIR=`pwd`

# Clone into $HOME dir and install git-secrets from source
cd ${HOME}
git clone https://github.com/awslabs/git-secrets.git && cd git-secrets && make install 

# Change directory to the default workspace directory. 
cd ${WORK_DIR}
ls -A $1

# Check if repo directory exists and the repository is checked-out. If yes, change current directory to repo directory.
# $1(path) defaults to '.' and can be a path relative to WORK_DIR or can also be an absolute path as well.
if [[ -d "$1" && ! -z "$(ls -A $1)" ]]; then
    cd $1
else
    echo "The provided path variable does not point to a valid directory or is empty. Does the path variable point to the directory where your repo is checked-out?"
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