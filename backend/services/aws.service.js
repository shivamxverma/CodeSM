import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import { Readable } from "stream";
dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function generateUploadURL(problemId) {
  const params = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `/problems/${problemId}/testcases.json`,
    ContentType: "application/json",
  });
  const url = await getSignedUrl(s3Client, params,{ expiresIn: 3600 });
  return url;
}

const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });

async function fetchTestcasesFromS3(problemId) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `/problems/${problemId}/testcases.json`,
    });

    const response = await s3Client.send(command);
    const jsonString = await streamToString(response.Body);
    const data = JSON.parse(jsonString);
    console.log("Testcases fetched from S3:", data);
    return data;
  } catch (err) {
    console.error("Error fetching testcases:", err);
    return null;
  }
}

export { generateUploadURL , fetchTestcasesFromS3};
