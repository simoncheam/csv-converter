import json
import boto3
import csv
import io
from datetime import datetime

s3 = boto3.client('s3')

def handler(event, context):
    # Validate input
    if not event or 'Records' not in event or not event['Records']:
        return {
            'statusCode': 400,
            'body': json.dumps({
                'message': 'Invalid event structure',
                'event': event
            })
        }

    # Get bucket and key from the S3 event
    source_bucket = event['Records'][0]['s3']['bucket']['name']
    source_key = event['Records'][0]['s3']['object']['key']

    # Get the destination bucket from environment variables
    destination_bucket = source_bucket

    try:
        # Download the CSV file from S3
        response = s3.get_object(Bucket=source_bucket, Key=source_key)
        file_content = response['Body'].read().decode('utf-8')

        # Parse CSV
        csv_reader = csv.DictReader(io.StringIO(file_content))
        json_data = list(csv_reader)

        if not json_data:
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'File processed but contained no data',
                    'source': source_key
                })
            }

        # Add metadata
        result = {
            "metadata": {
                "filename": source_key,
                "processed_at": datetime.now().isoformat(),
                "record_count": len(json_data)
            },
            "data": json_data
        }

        # Create output path with processed/ prefix
        today = datetime.now().strftime('%Y-%m-%d')
        filename = source_key.split('/')[-1].replace('.csv', '')
        destination_key = f"processed/{today}/{filename}.json"

        # Write JSON result to S3
        s3.put_object(
            Bucket=destination_bucket,
            Key=destination_key,
            Body=json.dumps(result, indent=2),
            ContentType='application/json'
        )

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Successfully processed file',
                'source': source_key,
                'destination': destination_key,
                'record_count': len(json_data)
            })
        }

    except UnicodeDecodeError as e:
        print(f"Encoding error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Error processing file: encoding issue',
                'error': str(e),
                'source': source_key
            })
        }
    except Exception as e:
        print(f"Error processing {source_key}: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Error processing file',
                'error': str(e),
                'source': source_key
            })
        }