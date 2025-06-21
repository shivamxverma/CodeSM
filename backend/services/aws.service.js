import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function getObjectURL(key) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME || "codesm-cf",
    Key: key,
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return url;
}

const uploadTestCaseFileToS3 = async (filename, problemName, testcases) => {
  const command = new PutObjectCommand({
    Bucket: "codesm-cf",
    Key: `problems/${problemName}/${filename}`,
    Body: JSON.stringify(testcases),
    ContentType: "application/json",
  });

  try {
    await s3Client.send(command);
    console.log(`File uploaded successfully to ${problemName}/${filename}`);
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};

const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
});

async function fetchTestcasesFromS3(problemName) {
  const key = `problems/${problemName}/testcases.json`;

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key
  });

  const { Body } = await s3Client.send(command);
  const json = await streamToString(Body);
  return JSON.parse(json);
}

export { uploadTestCaseFileToS3 , fetchTestcasesFromS3};
