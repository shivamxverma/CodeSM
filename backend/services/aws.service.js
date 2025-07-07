import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
dotenv.config();

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function generateUploadURL(problemName) {
  // console.log("Generating upload URL for problem:", problemName);
  const params = new PutObjectCommand({
    Bucket: "codesm-cf",
    Key: `/uploads/${problemName}/testcases.json`,
    Expires: 3600,
    ContentType: "application/json",
  });
  console.log("S3 Params:", params);
  const url = await getSignedUrl(s3Client, params);
  console.log("Generated URL:", url);
  return url;
}

export { generateUploadURL };
