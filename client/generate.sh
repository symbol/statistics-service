#!/bin/bash
set -e

OPERATION_ARG="$1"
SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ROOT_DIR="${SCRIPT_DIR}/.."
ALPHA_PREFIX=-alpha

VERSION=$(npm --prefix $ROOT_DIR run version --silent)

PROJECT_NAME='statistics-service'
REPO_SLUG="symbol/$PROJECT_NAME"

GIT_USER_ID="$(cut -d'/' -f1 <<<"$REPO_SLUG")"
GIT_REPO_ID="$(cut -d'/' -f2 <<<"$REPO_SLUG")"
INPUT="${ROOT_DIR}/openapi/openapi.yml"
BUILD_DIR="${SCRIPT_DIR}/build"

if [[ $OPERATION_ARG == "main" ]]; then
  OPERATION_ARG="publish"
fi

if [[ $OPERATION_ARG == "release" ]]; then
  FULL_VERSION="$VERSION"
else
  FULL_VERSION="$VERSION$ALPHA_PREFIX-$(date +%Y%m%d%H%M)"
fi
LIBRARY_ARG="typescript-fetch"

echo "Library: $LIBRARY_ARG"
echo "Operation: $OPERATION_ARG"
echo "Full Version: $FULL_VERSION"
echo "Version: $VERSION"
echo "Repo Slug: $REPO_SLUG"
echo "Git User ID: $GIT_USER_ID"
echo "Git Repo ID: $GIT_REPO_ID"
echo "Open Api generator version: $(npx --prefix $ROOT_DIR openapi-generator-cli version)"

export JAVA_OPTS="-Dlog.level=error"

generateTypescript() {
  LIBRARY="$1"
  OPERATION="$2"
  ARTIFACT_ID="symbol-$PROJECT_NAME-$LIBRARY-client"
  TEMPLATE_FOLDER="${SCRIPT_DIR}/templates/$LIBRARY-templates"
  echo "Generating $LIBRARY"
  rm -rf "$BUILD_DIR/$ARTIFACT_ID"
  npx --prefix $ROOT_DIR openapi-generator-cli generate -g "$LIBRARY" \
    -o "$BUILD_DIR/$ARTIFACT_ID" \
    -t "$TEMPLATE_FOLDER/" \
    -i "$INPUT" \
    --git-user-id "$GIT_USER_ID" \
    --git-repo-id "$GIT_REPO_ID" \
    --additional-properties="supportsES6=true" \
    --additional-properties="legacyDiscriminatorBehavior=false" \
    --additional-properties="npmName=$ARTIFACT_ID" \
    --additional-properties=gitUserId=$GIT_USER_ID \
    --additional-properties=gitRepoId=$GIT_REPO_ID \
    --additional-properties="npmVersion=$FULL_VERSION" \
    --additional-properties="useSingleRequestParameter=false" \
    --additional-properties="typescriptThreePlus=true" \
    --type-mappings=x-number-string=string
  cp "$TEMPLATE_FOLDER/.npmignore" "$BUILD_DIR/$ARTIFACT_ID"
  sh -c "cd $BUILD_DIR/$ARTIFACT_ID && npm install"
  sh -c "cd $BUILD_DIR/$ARTIFACT_ID && npm run-script build"
  if [[ $OPERATION == "publish" ]]; then
    cp "$TEMPLATE_FOLDER/.npmrc" "$BUILD_DIR/$ARTIFACT_ID/.npmrc"
    sh -c "cd $BUILD_DIR/$ARTIFACT_ID && npm publish --tag alpha"
  fi
  if [[ $OPERATION == "release" ]]; then
    cp "$TEMPLATE_FOLDER/.npmrc" "$BUILD_DIR/$ARTIFACT_ID/.npmrc"
    sh -c "cd $BUILD_DIR/$ARTIFACT_ID && npm publish"
  fi
  return 0
}

generateTypescript "$LIBRARY_ARG" "$OPERATION_ARG"
