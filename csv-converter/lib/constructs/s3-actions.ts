/**
 * Common S3 action configurations for different access patterns
 */
export const S3Actions = {

  READ_ONLY: [
    's3:GetObject',
    's3:ListBucket',
    's3:GetBucketLocation',
  ],

  READ_WRITE: [
    's3:GetObject',
    's3:PutObject',
    's3:ListBucket',
    's3:GetBucketLocation',
  ],


  FULL_ACCESS: [
    's3:GetObject',
    's3:PutObject',
    's3:DeleteObject',
    's3:ListBucket',
    's3:GetBucketLocation',
    's3:PutObjectAcl',
    's3:GetObjectAcl',
  ],


  DATA_PROCESSING: [
    's3:GetObject',
    's3:PutObject',
    's3:ListBucket',
    's3:GetBucketLocation',
    's3:DeleteObject',
    's3:GetObjectTagging',
    's3:PutObjectTagging',
  ],
};