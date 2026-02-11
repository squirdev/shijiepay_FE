#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Determine build environment
if [ -z "$1" ]; then
  BUILD_ENV="pro"
  BUILD_COMMAND="pnpm build:pro"
  ENV_FILE=".env.pro"
elif [ "$1" == "test" ]; then
  BUILD_ENV="test"
  BUILD_COMMAND="pnpm build:test"
  ENV_FILE=".env.test"
else
  echo "Invalid argument. Usage: $0 [test]"
  exit 1
fi

echo "Starting deployment for environment: ${BUILD_ENV}, using env file: ${ENV_FILE}"

# Pull latest code for production environment
if [ "$BUILD_ENV" == "pro" ]; then
  echo "Pulling latest changes from Git..."
  if ! git pull; then
    echo "Failed to pull latest changes from Git. Aborting deployment."
    exit 1
  fi
fi

# 1. Install dependencies
echo "Running pnpm install..."
pnpm install

# 2. Modify env file for pay4Mgr
echo "Configuring for pay4Mgr build..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s|^VITE_OUT_DIR=.*|VITE_OUT_DIR=dist_pay4Mgr|" "${ENV_FILE}"
  sed -i '' "s|^VITE_BASE_PATH=.*|VITE_BASE_PATH=/pay4Mgr/|" "${ENV_FILE}"
else
  sed -i "s|^VITE_OUT_DIR=.*|VITE_OUT_DIR=dist_pay4Mgr|" "${ENV_FILE}"
  sed -i "s|^VITE_BASE_PATH=.*|VITE_BASE_PATH=/pay4Mgr/|" "${ENV_FILE}"
fi

# 3. Build for pay4Mgr
echo "Building for pay4Mgr with command: ${BUILD_COMMAND}..."
${BUILD_COMMAND}

# 4. Modify env file for pay4Mch
echo "Configuring for pay4Mch build..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s|^VITE_OUT_DIR=.*|VITE_OUT_DIR=dist_pay4Mch|" "${ENV_FILE}"
  sed -i '' "s|^VITE_BASE_PATH=.*|VITE_BASE_PATH=/pay4Mch/|" "${ENV_FILE}"
else
  sed -i "s|^VITE_OUT_DIR=.*|VITE_OUT_DIR=dist_pay4Mch|" "${ENV_FILE}"
  sed -i "s|^VITE_BASE_PATH=.*|VITE_BASE_PATH=/pay4Mch/|" "${ENV_FILE}"
fi

# 5. Build for pay4Mch
echo "Building for pay4Mch with command: ${BUILD_COMMAND}..."
${BUILD_COMMAND}


# 6. Organize build artifacts
echo "Organizing build artifacts..."
# Ensure the main dist directory exists
mkdir -p dist

# Create the timestamped directory inside dist
TIMESTAMP=$(date +%Y_%m_%d_%H_%M)
TARGET_DIR="dist/${TIMESTAMP}"
mkdir -p "${TARGET_DIR}"

echo "Created target directory: ${TARGET_DIR}"

# Copy the build output directories to the new target directory
echo "Copying build outputs..."
cp -r dist_pay4Mgr "${TARGET_DIR}/pay4Mgr"
cp -r dist_pay4Mch "${TARGET_DIR}/pay4Mch"

# 7. Atomically update the 'current' symlink
echo "Updating 'dist/current' to point to the latest build..."

if [[ "$OSTYPE" == "darwin"* ]]; then
  # On macOS, `mv` lacks the -T option. `ln -sfh` is the common practice.
  # It's not perfectly atomic, but the race condition window is minuscule.
  # -h prevents following 'current' if it's already a symlink.
  TIMESTAMP_DIR=$(basename "${TARGET_DIR}")
  (cd dist && ln -sfh "${TIMESTAMP_DIR}" "current")
else
  # On Linux, use the robust atomic update method.
  TIMESTAMP_DIR=$(basename "${TARGET_DIR}")
  ln -sfn "${TIMESTAMP_DIR}" "dist/current.tmp"
  mv -fT "dist/current.tmp" "dist/current"
fi

echo "Successfully pointed 'dist/current' to ${TARGET_DIR}"

# 8. Reload Nginx to apply changes
echo "Reloading Nginx configuration..."
sudo nginx -s reload

echo "Deployment script finished successfully."

