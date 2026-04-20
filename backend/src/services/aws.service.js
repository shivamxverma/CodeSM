import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import env from "../config/index.js";
import { Readable } from "stream";


const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

async function generateUploadURL(key, filename) {
  const params = new PutObjectCommand({
    Bucket: env.AWS_BUCKET_NAME,
    Key: `${key}/${filename}`,
    ContentType: "application/json",
  });
  const url = await getSignedUrl(s3Client, params, { expiresIn: 3600 });
  return url;
}

const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });

async function fetchTestcasesFromS3(s3Key) {
  try {
    const command = new GetObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: s3Key,
    });

    const response = await s3Client.send(command);
    const jsonString = await streamToString(response.Body);
    const data = JSON.parse(jsonString);
    return data;
  } catch (err) {
    console.error("Error fetching testcases:", err);
    return null;
  }
}

export { generateUploadURL, fetchTestcasesFromS3 };
