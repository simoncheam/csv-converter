import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import { Construct } from 'constructs';
import * as path from 'path';

import { SecureBucket } from './constructs/secure-bucket';

export class CsvConverterStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    // create s3 bucket using the secure bucket construct

    const dataBucket = new SecureBucket(this, 'DataBucket', {

      bucketName: `csv-data-${this.account}-${this.region}`,
      environment: 'dev',
      groupName: 'developer',
      accessLevel: 'fullAccess',
      autoDeleteObjects: true,

    }).bucket;


    const processorFunction = new lambda.Function(this, 'CsvProcessor', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/converter')),
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(30),
      environment: {
        BUCKET_NAME: dataBucket.bucketName
      }
    });


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