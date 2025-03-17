# CSV-to-JSON Converter

A serverless ETL pipeline that automatically converts CSV files to JSON format using AWS Lambda and S3.

## Features

- **Event-driven processing**: CSV uploads automatically trigger Lambda functions
- **Metadata enrichment**: Adds filename, timestamp, and record count to JSON output
- **Date-based partitioning**: Organizes processed files by date for efficient retrieval
- **Least privilege security**: Only developer group members can upload files
- **Infrastructure as code**: All AWS resources defined and deployed with CDK

## Tech Stack

- **AWS CDK** - Infrastructure as code (TypeScript)
- **AWS Lambda** - Serverless compute (Python)
- **Amazon S3** - Object storage
- **IAM** - Access control

## Getting Started

### Prerequisites

- AWS CLI configured with appropriate credentials
- Node.js and npm (for CDK)
- Python 3.8+ (for Lambda function)
- IAM group named 'developer' (for access control)

### Deployment

```bash
# Install dependencies
npm install

# Deploy the stack
npx cdk deploy
```

## Usage

### Upload a CSV File

```bash
# Upload CSV to trigger processing
aws s3 cp sample.csv s3://YOUR_BUCKET_NAME/uploads/sample.csv
```

### Download Processed JSON

```bash
# Using the provided script from the root directory
./download-json.sh YOUR_BUCKET_NAME [DATE] [FILENAME]
```

## Security

- Only members of the 'developer' IAM group can upload files (using IAM service principal with conditions)
- Lambda function has specific read/write permissions
- All other users are denied upload access

## Implementation Notes

- Uses IAM service principal with conditions for group access instead of direct group ARNs
- This approach resolves the "Invalid principal in policy" error that can occur with direct group references
- Follows AWS security best practices for S3 bucket policies

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
