import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';

export class CsvConverterStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 bucket to store CSV files and processed JSON
    const dataBucket = new s3.Bucket(this, 'DataBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT for production
      autoDeleteObjects: true                    // NOT for production
    });

    // Create Lambda function that will process the CSV files
    const processorFunction = new lambda.Function(this, 'CsvProcessor', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/converter')),
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(30),
      environment: {
        BUCKET_NAME: dataBucket.bucketName
      }
    });

    // Reference the existing developer group
    const developerGroup = iam.Group.fromGroupName(this, 'DeveloperGroup', 'developer');

    // Grant put permissions to the developer group
    dataBucket.grantPut(developerGroup);

    // Grant the Lambda function permissions to read from and write to the S3 bucket
    dataBucket.grantReadWrite(processorFunction);

    // Trigger the Lambda function when a new CSV file is uploaded to the "uploads/" folder
    dataBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(processorFunction),
      { prefix: 'uploads/', suffix: '.csv' }
    );

    // Output the bucket name
    new cdk.CfnOutput(this, 'BucketName', {
      value: dataBucket.bucketName,
      description: 'The name of the S3 bucket'
    });
  }
}