#!/bin/bash

# Check if bucket name is provided
if [ -z "$1" ]; then
  echo "Error: Bucket name is required"
  echo "Usage: ./download-json.sh BUCKET_NAME [DATE] [FILENAME]"
  echo "Example: ./download-json.sh my-bucket 2025-03-13 sample"
  exit 1
fi

# Configuration
BUCKET=${1:-"your-default-bucket-name"} # Use your bucket name
DATE=${2:-$(date +%Y-%m-%d)}  # Use provided date or today's date
FILENAME=${3:-"sample"}       # Use provided filename or default to "sample"

# Create directory structure
mkdir -p "downloads/processed/$DATE"

# Download the file
echo "Downloading from s3://$BUCKET/processed/$DATE/$FILENAME.json..."
aws s3 cp "s3://$BUCKET/processed/$DATE/$FILENAME.json" "downloads/processed/$DATE/$FILENAME.json"

# Check if download was successful
if [ $? -eq 0 ]; then
  echo "Successfully downloaded $FILENAME.json to downloads/processed/$DATE/"
  echo "Full path: $(pwd)/downloads/processed/$DATE/$FILENAME.json"
else
  echo "Error: File not found or download failed"
  echo "Attempted to download: s3://$BUCKET/processed/$DATE/$FILENAME.json"
fi