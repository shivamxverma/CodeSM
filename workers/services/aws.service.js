import {
  S3Client,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import env from "../config/index.js";

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

async function fetchTestcasesFromS3(problemId) {
  try {
    const command = new GetObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: `problems/${problemId}/testcases.json`,
    });

    const response = await s3Client.send(command);
    const jsonString = await streamToString(response.Body);
    const data = JSON.parse(jsonString);
    // console.log("Testcases fetched from S3:", data);
    return data;
  } catch (err) {
    console.error("Error fetching testcases:", err);
    return null;
  }
}

export { fetchTestcasesFromS3 };
