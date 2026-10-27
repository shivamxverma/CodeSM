import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import env from "../config/index.js";
import { Readable } from "stream";
import { db } from "../loaders/postgres";
import { problem as problemTable } from 'db-schema';
import { eq } from "drizzle-orm";

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

const MOCK_DATA = {
  'reverse-linked-list': {
    testcases: [
      { input: "10", output: "10" },
      { input: "5 5 5", output: "5 5 5" },
      { input: "-1 0 1", output: "1 0 -1" },
      { input: "1 2 3 4 5 6 7 8 9 10", output: "10 9 8 7 6 5 4 3 2 1" },
      { input: "100 -100 0", output: "0 -100 100" },
      { input: "9 8 7 6 5", output: "5 6 7 8 9" },
      { input: "42", output: "42" },
      { input: "-5 -4 -3 -2 -1", output: "-1 -2 -3 -4 -5" }
    ],
    sampleTestcases: [
      { input: '1 2 3 4 5', output: '5 4 3 2 1' },
      { input: '1 2', output: '2 1' },
      { input: ' ', output: ' ' }
    ]
  },
  'merge-two-sorted-lists': {
    testcases: [
      { input: "1 3\n2 4", output: "1 2 3 4" },
      { input: " \n1 2 3", output: "1 2 3" },
      { input: "1 2 3\n ", output: "1 2 3" },
      { input: "-2 -1\n-3 0", output: "-3 -2 -1 0" },
      { input: "1 1\n1 1", output: "1 1 1 1" },
      { input: "10\n5 6 7", output: "5 6 7 10" },
      { input: " \n ", output: " " },
      { input: "0 2 4 6\n1 3 5 7", output: "0 1 2 3 4 5 6 7" }
    ],
    sampleTestcases: [
      { input: '1 2 4\n1 3 4', output: '1 1 2 3 4 4' },
      { input: ' \n ', output: ' ' },
      { input: ' ', output: '0' },
      { input: '1 2 3\n ', output: '1 2 3' }
    ]
  },
  'best-time-to-buy-and-sell-stock': {
    testcases: [
      { input: "1 2 3 4 5", output: "4" },
      { input: "5 4 3 2 1", output: "0" },
      { input: "2 4 1 5", output: "4" },
      { input: "3 3 3", output: "0" },
      { input: "10", output: "0" },
      { input: "7 1 5 3 6 4 10", output: "9" },
      { input: "0 1 0 2 0", output: "2" },
      { input: "100 1 200", output: "199" }
    ],
    sampleTestcases: [
      { input: '7 1 5 3 6 4', output: '5' },
      { input: '7 6 4 3 1', output: '0' }
    ]
  },
  'contains-duplicate': {
    testcases: [
      { input: "1 2 3 4 5", output: "false" },
      { input: "1 2 2 3", output: "true" },
      { input: "100 200 100", output: "true" },
      { input: "-1 -2 -1", output: "true" },
      { input: "1 3 5 7 9 11", output: "false" },
      { input: "5 5", output: "true" },
      { input: "1 2 3 4 1", output: "true" },
      { input: "-10 -20 -30 -10", output: "true" }
    ],
    sampleTestcases: [
      { input: '1 2 3 1', output: 'true' },
      { input: '1 2 3 4', output: 'false' },
      { input: '2 14 18 22 14', output: 'true' }
    ]
  },
  'valid-anagram': {
    testcases: [
      { input: "abc\nbac", output: "true" },
      { input: "abc\nabd", output: "false" },
      { input: "a\na", output: "true" },
      { input: "rat\ntar", output: "true" },
      { input: "hello\nworld", output: "false" },
      { input: "anagram\nmargana", output: "true" },
      { input: "listen\nsilent", output: "true" },
      { input: "paper\nrrepa", output: "false" }
    ],
    sampleTestcases: [
      { input: 'anagram\nnagaram', output: 'true' },
      { input: 'rat\ncar', output: 'false' }
    ]
  },
  'longest-increasing-subsequence': {
    testcases: [
      { input: "1 3 5 2 4 6", output: "4" },
      { input: "10 9 2 5 3 7 101 18 20", output: "5" },
      { input: "1 2 3 4", output: "4" },
      { input: "4 3 2 1", output: "1" },
      { input: "-1 0 1 2 -2", output: "4" },
      { input: "3 1 4 1 5", output: "3" },
      { input: "7 7 7", output: "1" },
      { input: "0 1 0 3 2 3", output: "4" }
    ],
    sampleTestcases: [
      { input: '10 9 2 5 3 7 101 18', output: '4' },
      { input: '0 1 0 3 2 3', output: '4' },
      { input: '7 7 7 7 7 7 7', output: '1' }
    ]
  }
};

async function getMockData(s3Key) {
  try {
    const parts = s3Key.split('/');
    if (parts.length < 2) return null;
    const problemId = parts[1];
    const filename = parts[parts.length - 1];

    const [prob] = await db
      .select({ slug: problemTable.slug })
      .from(problemTable)
      .where(eq(problemTable.id, problemId));

    if (!prob) return null;
    const slug = prob.slug;
    const mockProb = MOCK_DATA[slug];
    if (!mockProb) return null;

    if (filename === 'content.md') {
      return "## Description\nMock description content";
    }
    if (filename === 'solution.md') {
      return "## Solution\nMock solution content";
    }

    if (filename.startsWith('sampleTestcase_')) {
      const idx = parseInt(filename.replace('sampleTestcase_', '').replace('.json', ''), 10);
      return mockProb.sampleTestcases[idx] || null;
    }

    if (filename.startsWith('testcase_')) {
      const idx = parseInt(filename.replace('testcase_', '').replace('.json', ''), 10);
      return mockProb.testcases[idx] || null;
    }
  } catch (e) {
    console.error("Local mock resolution failed:", e);
  }
  return null;
}

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
    // Try mock local data first
    const mockData = await getMockData(s3Key);
    if (mockData) return mockData;

    const command = new GetObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: s3Key,
    });

    const response = await s3Client.send(command);
    const jsonString = await streamToString(response.Body);
    const data = JSON.parse(jsonString);
    return data;
  } catch (err) {
    console.error("Error fetching testcases from S3, attempting local mock backup:", err);
    try {
      const mockData = await getMockData(s3Key);
      if (mockData) return mockData;
    } catch (_) {}
    return null;
  }
}

async function fetchFileFromS3(s3Key) {
  try {
    // Try mock local data first
    const mockData = await getMockData(s3Key);
    if (mockData) {
      return typeof mockData === 'string' ? mockData : JSON.stringify(mockData);
    }

    const command = new GetObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: s3Key,
    });

    const response = await s3Client.send(command);
    const text = await streamToString(response.Body);
    return text;
  } catch (err) {
    console.error("Error fetching file from S3, attempting local mock backup:", err);
    try {
      const mockData = await getMockData(s3Key);
      if (mockData) {
        return typeof mockData === 'string' ? mockData : JSON.stringify(mockData);
      }
    } catch (_) {}
    return null;
  }
}

export { generateUploadURL, fetchTestcasesFromS3, fetchFileFromS3 };
