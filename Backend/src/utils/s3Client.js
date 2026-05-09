import {
  CreateBucketCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteBucketCommand,
  PutBucketPolicyCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import s3Client from "../config/s3.config.js";

// Promisified S3 helpers
const bucketExistsAsync = async (name) => {
  const command = new HeadBucketCommand({ Bucket: name });
  try {
    await s3Client.send(command);
    return true;
  } catch (error) {
    if (error.name === "NotFound") {
      return false;
    }
    throw error;
  }
};

const makeBucketAsync = (name) => {
  const command = new CreateBucketCommand({ Bucket: name });
  return s3Client.send(command);
};

const setBucketPolicyAsync = (name, policy) => {
  const command = new PutBucketPolicyCommand({
    Bucket: name,
    Policy: policy,
  });
  return s3Client.send(command);
};

const setupBucket = async (bucketName) => {
  try {
    const exists = await bucketExistsAsync(bucketName);
    if (!exists) {
      await makeBucketAsync(bucketName);
      console.log(`Bucket '${bucketName}' created successfully.`);
    }

    const publicReadPolicy = {
      Version: "2012-10-17",
      Statement: [
        {
          Action: ["s3:GetObject"],
          Effect: "Allow",
          Principal: "*",
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };

    await setBucketPolicyAsync(
      bucketName,
      JSON.stringify(publicReadPolicy)
    );
    console.log(`Bucket '${bucketName}' access policy set to Public Read.`);
  } catch (error) {
    console.error("Error configuring S3 bucket:", error);
    throw error;
  }
};

/**
 * Uploads an object to S3.
 * * @param {Object} params
 * @param {string} params.bucket - The name of the bucket
 * @param {string} params.objectName - The file path/name inside the bucket
 * @param {Buffer} params.buffer - The file data
 * @param {Object} params.meta - Metadata (e.g., {"ContentType": "image/webp"})
 * @returns {Promise<string>} The etag of the uploaded object
 */
const putObjectAsync = (params) => {
  const command = new PutObjectCommand({
    Bucket: params.bucket,
    Key: params.objectName,
    Body: params.buffer,
    ContentLength: params.size,
    ...params.meta,
  });
  return s3Client.send(command).then((data) => data.ETag);
};

const deleteBucketAsync = (bucketName) => {
  const command = new DeleteBucketCommand({ Bucket: bucketName });
  return s3Client.send(command);
};

const deleteObjectAsync = (bucketName, objectName) => {
  console.log(
    `Attempting to delete object '${objectName}' from bucket '${bucketName}'`
  );
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: objectName,
  });
  return s3Client.send(command);
};

export {
  bucketExistsAsync,
  makeBucketAsync,
  setBucketPolicyAsync,
  putObjectAsync,
  deleteBucketAsync,
  deleteObjectAsync,
  setupBucket,
};


