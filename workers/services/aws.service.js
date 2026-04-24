import {
  S3Client,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import env from "../config/index.js";
import { redisClient } from "../loaders/redis.js";

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});


const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });

async function fetchTestcasesFromS3(s3Key) {
  try {
    const cacheKey = `s3_testcase:${s3Key}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const command = new GetObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: s3Key,
    });

    const response = await s3Client.send(command);
    const jsonString = await streamToString(response.Body);
    
    // Cache the result for 24 hours
    await redisClient.set(cacheKey, jsonString, "EX", 86400);

    const data = JSON.parse(jsonString);
    return data;
  } catch (err) {
    console.error("Error fetching testcases:", err);
    return null;
  }
}

async function fetchFileFromS3(s3Key) {
  try {
    const command = new GetObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: s3Key,
    });

    const response = await s3Client.send(command);
    const text = await streamToString(response.Body);
    return text;
  } catch (err) {
    console.error("Error fetching file from S3:", err);
    return null;
  }
}

export { fetchTestcasesFromS3, fetchFileFromS3 };
