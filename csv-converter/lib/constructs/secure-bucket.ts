import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { S3Actions } from './s3-actions';

export interface SecureBucketProps {
  bucketName?: string;
  environment: string;
  roleArn?: string;
  groupName?: string;
  accessLevel?: 'readOnly' | 'readWrite' | 'fullAccess' | 'dataProcessing';
  customActions?: string[];
  autoDeleteObjects?: boolean;
}

/**
 * SecureBucket - Creates an S3 bucket with environment-specific security settings
 * and restricted access controls.
 *
 * Features:
 * - Server-side encryption (S3 managed)
 * - Environment-based versioning (prod only)
 * - Environment-based deletion protection (prod only)
 * - Granular IAM role-based access control
 *
 * @param bucketName - Name for the S3 bucket
 * @param roleArn - ARN of the IAM role granted access
 * @param allowedActions - List of S3 actions to permit (e.g., ['s3:GetObject', 's3:PutObject'])
 * @param environment - Deployment environment ('dev', 'prod', etc.)
 */
export class SecureBucket extends Construct {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: SecureBucketProps) {
    super(scope, id);

    // ! create s3 bucket
    this.bucket = new s3.Bucket(this, 'Bucket', {
      bucketName: props.bucketName,
      versioned: props.environment === 'prod',
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: props.environment === 'prod'
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: props.autoDeleteObjects,

    });


    // determine which actions to use
    let actions: string[] = [];

    if (props.customActions) {
      // use custom actions if provided
      actions = props.customActions;
    } else if (props.accessLevel) {
      switch (props.accessLevel) {
        case 'readOnly':
          actions = S3Actions.READ_ONLY;
          break;
        case 'readWrite':
          actions = S3Actions.READ_WRITE;
          break;
        case 'fullAccess':
          actions = S3Actions.FULL_ACCESS;
          break;
        case 'dataProcessing':
          actions = S3Actions.DATA_PROCESSING;
          break;
      }
    }

    if (props.roleArn && actions.length > 0) {
      this.addRoleAccess(props.roleArn, actions);
    }

    if (props.groupName && actions.length > 0) {
      console.log("🚀 ~ SecureBucket ~ constructor ~ actions:")
      console.log(actions)

      this.addGroupAccess(props.groupName, actions);
    }

  }

  private addRoleAccess(roleArn: string, actions: string[]) {
    const policyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: actions,
      resources: [
        this.bucket.bucketArn,
        `${this.bucket.bucketArn}/*`
      ],
      principals: [new iam.ArnPrincipal(roleArn)],
    })
    this.bucket.addToResourcePolicy(policyStatement);
  }

  private addGroupAccess(groupName: string, actions: string[]) {
    const policyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: actions,
      resources: [
        this.bucket.bucketArn,
        `${this.bucket.bucketArn}/*`
      ],
      principals: [new iam.ServicePrincipal('iam.amazonaws.com')],
      conditions: {
        'StringEquals': {
          'aws:PrincipalTag/aws:iam:groupName': groupName,
        },
      },
    });
    this.bucket.addToResourcePolicy(policyStatement);
  }

}