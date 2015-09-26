#!/bin/bash
set -e # exit with non-zero exit code if there are failures

RELEASE_VERSION=$1
USER_EMAIL=$2
USER_NAME=$3
LATEST_BRANCH=$4
FILES_TO_ADD=$5
GIT_URL=$6
TMP_BRANCH=$7

_echo () {
  echo "> PL >>" ${@//https:\/\/*@/https:\/\/token-hidden@}
}

run_git () {
  if [ ! "$DRY_RUN" ]; then
    _echo "running git $*"
    git "$@"
  else
    _echo "DRY_RUN of git $*"
  fi
}

_echo "setting global git config: $USER_NAME, $USER_EMAIL"
run_git config --global user.email "$USER_EMAIL"
run_git config --global user.name "\"$USER_NAME\""

_echo "setting remote"
run_git remote set-url origin $GIT_URL

_echo "checking for $LATEST_BRANCH branch"
if run_git ls-remote origin | grep -sw "$LATEST_BRANCH" 2>&1>/dev/null; then
  _echo "$LATEST_BRANCH exists on remote"
else
  _echo "$LATEST_BRANCH does not exist on remote... creating it..."
  run_git checkout -b $LATEST_BRANCH
  run_git push origin $LATEST_BRANCH
fi

_echo "checking out temp branch $TMP_BRANCH"
run_git checkout -b "$TMP_BRANCH"

_echo "adding $FILES_TO_ADD"
run_git add $FILES_TO_ADD -f

_echo "committing with $RELEASE_VERSION"
run_git commit -m v$RELEASE_VERSION --no-verify

_echo "checking out $LATEST_BRANCH"
run_git remote set-branches --add origin $LATEST_BRANCH # required because travis clones with --branch=master
run_git fetch origin
run_git checkout $LATEST_BRANCH

_echo "merging built files"
run_git merge $TMP_BRANCH -m v$RELEASE_VERSION -X theirs

_echo "pushing"
run_git push origin HEAD:$LATEST_BRANCH -f

_echo "done!"

