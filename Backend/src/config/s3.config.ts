import { S3Client } from "@aws-sdk/client-s3";

const awsRegion = process.env.AWS_S3_REGION || "us-east-1";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3Client = new S3Client({
  region: awsRegion,
  // Use explicit credentials only when both keys are provided.
  // Otherwise AWS SDK resolves credentials from the default provider chain
  // (for example, Elastic Beanstalk EC2 instance profile role).
  ...(accessKeyId && secretAccessKey
    ? {
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      }
    : {}),
});

export default s3Client;