# csv-converter

A serverless application that converts CSV files to JSON format using AWS Lambda and S3.

## Tech Stack

- **AWS CDK** - Infrastructure as code
- **AWS Lambda** - Serverless compute
- **Amazon S3** - Object storage
- **Python** - Lambda function implementation
- **Bash** - Utility scripts

## Getting Started

### Prerequisites

- AWS CLI configured with appropriate credentials
- Node.js and npm (for CDK)
- Python 3.8+ (for Lambda function)

### Deployment

1. Install dependencies:

```
npm install
```

2. Deploy the stack:

```
npx cdk deploy
```

3. Note the bucket name from the stack output

## Usage

### Upload a CSV File

```bash
# Upload the sample CSV to your application bucket
aws s3 cp sample.csv s3://YOUR_BUCKET_NAME/uploads/sample.csv
```

### Check Processing Results

```bash
# List processed files
aws s3 ls s3://YOUR_BUCKET_NAME/processed/

# List files for a specific date
aws s3 ls s3://YOUR_BUCKET_NAME/processed/YYYY-MM-DD/
```

### Download Processed JSON

#### Using the download script

We provide a convenient script to download processed JSON files:

```bash
# Basic usage
./download-json.sh YOUR_BUCKET_NAME [DATE] [FILENAME]

# Examples:
# Download with default date (today) and filename (sample)
./download-json.sh YOUR_BUCKET_NAME

# Download with specific date
./download-json.sh YOUR_BUCKET_NAME 2024-03-13

# Download with specific date and filename
./download-json.sh YOUR_BUCKET_NAME 2024-03-13 myfile
```

The script will:

- Create a local directory structure in `downloads/processed/DATE/`
- Download the JSON file from S3
- Provide feedback on success or failure

#### Using AWS CLI directly

```bash
# Download a specific JSON file
aws s3 cp s3://YOUR_BUCKET_NAME/processed/YYYY-MM-DD/FILENAME.json .
```

## How It Works

1. CSV files uploaded to the S3 bucket trigger a Lambda function
2. The Lambda function:
   - Reads the CSV file
   - Converts it to JSON format
   - Adds metadata (filename, processing timestamp, record count)
   - Saves the result to the `processed/YYYY-MM-DD/` prefix in the same bucket

## Troubleshooting

- If files aren't being processed, check the Lambda function logs in CloudWatch
- Ensure your CSV files have a header row and are properly formatted
- Verify that the S3 event trigger is correctly configured
