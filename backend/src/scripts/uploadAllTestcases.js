import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();


const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = "codesm-testcases-bucket";

// DATA
const data = {
    "68a09c06e997c7fa34ec8600": {
      testcases: [
        { input: "10", output: "10" },
        { input: "5 5 5", output: "5 5 5" },
        { input: "-1 0 1", output: "1 0 -1" },
        { input: "1 2 3 4 5 6 7 8 9 10", output: "10 9 8 7 6 5 4 3 2 1" },
        { input: "100 -100 0", output: "0 -100 100" },
        { input: "9 8 7 6 5", output: "5 6 7 8 9" },
        { input: "42", output: "42" },
        { input: "-5 -4 -3 -2 -1", output: "-1 -2 -3 -4 -5" }
      ]
    },
    "68a18efb5c751391cf7bcc0b": {
      testcases: [
        { input: "1 3\n2 4", output: "1 2 3 4" },
        { input: " \n1 2 3", output: "1 2 3" },
        { input: "1 2 3\n ", output: "1 2 3" },
        { input: "-2 -1\n-3 0", output: "-3 -2 -1 0" },
        { input: "1 1\n1 1", output: "1 1 1 1" },
        { input: "10\n5 6 7", output: "5 6 7 10" },
        { input: " \n ", output: " " },
        { input: "0 2 4 6\n1 3 5 7", output: "0 1 2 3 4 5 6 7" }
      ]
    },
    "68a18f635c751391cf7bcc28": {
      testcases: [
        { input: "1 2 3 4 5", output: "4" },
        { input: "5 4 3 2 1", output: "0" },
        { input: "2 4 1 5", output: "4" },
        { input: "3 3 3", output: "0" },
        { input: "10", output: "0" },
        { input: "7 1 5 3 6 4 10", output: "9" },
        { input: "0 1 0 2 0", output: "2" },
        { input: "100 1 200", output: "199" }
      ]
    },
    "68a18fba5c751391cf7bcc31": {
      testcases: [
        { input: "1 2 3 4 5", output: "false" },
        { input: "1 2 2 3", output: "true" },
        { input: "100 200 100", output: "true" },
        { input: "-1 -2 -1", output: "true" },
        { input: "1 3 5 7 9 11", output: "false" },
        { input: "5 5", output: "true" },
        { input: "1 2 3 4 1", output: "true" },
        { input: "-10 -20 -30 -10", output: "true" }
      ]
    },
    "68a190225c751391cf7bcc43": {
      testcases: [
        { input: "abc\nbac", output: "true" },
        { input: "abc\nabd", output: "false" },
        { input: "a\na", output: "true" },
        { input: "rat\ntar", output: "true" },
        { input: "hello\nworld", output: "false" },
        { input: "anagram\nmargana", output: "true" },
        { input: "listen\nsilent", output: "true" },
        { input: "paper\nrrepa", output: "false" }
      ]
    },
    "68a1fbdc769d7c89006a3635": {
      testcases: [
        { input: "1 3 5 2 4 6", output: "4" },
        { input: "10 9 2 5 3 7 101 18 20", output: "5" },
        { input: "1 2 3 4", output: "4" },
        { input: "4 3 2 1", output: "1" },
        { input: "-1 0 1 2 -2", output: "4" },
        { input: "3 1 4 1 5", output: "3" },
        { input: "7 7 7", output: "1" },
        { input: "0 1 0 3 2 3", output: "4" }
      ]
    },
    "68a1fc62769d7c89006a3647": {
      testcases: [
        { input: "1", output: "1" },
        { input: "1 2\n3 4", output: "1 2 4 3" },
        { input: "1\n2\n3", output: "1 2 3" },
        { input: "1 2 3 4\n5 6 7 8\n9 10 11 12\n13 14 15 16", output: "1 2 3 4 8 12 16 15 14 13 9 5 6 7 11 10" },
        { input: "-1 0\n1 2", output: "-1 0 2 1" },
        { input: "10 20 30", output: "10 20 30" },
        { input: "1 2\n3 4\n5 6", output: "1 2 4 6 5 3" },
        { input: "1 2 3\n4 5 6\n7 8 9\n10 11 12", output: "1 2 3 6 9 12 11 10 7 4 5 8" }
      ]
    }
};

async function upload(problemId, testcases) {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: `problems/${problemId}/testcases.json`,
      Body: JSON.stringify(testcases),
      ContentType: "application/json",
    });

    await s3.send(command);

    console.log(`✅ Uploaded: ${problemId}`);
  } catch (err) {
    console.error(`❌ Failed: ${problemId}`, err.message);
  }
}

async function main() {
  const promises = [];

  for (const problemId in data) {
    const testcases = data[problemId].testcases;

    promises.push(upload(problemId, testcases));
  }

  await Promise.all(promises);

  console.log("🎉 All uploads done");
}

main();