import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

async function textToAudio(text) {
    const data = {
        text: text,
        voiceId: "en-US-terrell",
    };
    try {
        const response = await axios.post(
            "https://api.murf.ai/v1/speech/generate",
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "api-key": process.env.MURF_API_KEY,
                },
            }
        );
        return response.data.audioFile;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}


async function generateQuestions(role, experience) {
    const prompt = `
You are an expert technical interviewer for software development roles. Your task is to generate a set of high-quality, relevant interview questions tailored to the candidate's role and experience level.

ROLE DETAILS:
- ID: ${role.id}
- Name: ${role.name}
- Description: ${role.desc}

EXPERIENCE DETAILS:
- ID: ${experience.id}
- Name: ${experience.name}
- Years: ${experience.years}

INSTRUCTIONS:
- Generate 10 questions that assess both technical skills and problem-solving abilities.
- Vary the difficulty based on the candidate's experience.
- Avoid generic questions; focus on practical scenarios, coding challenges, and conceptual understanding.
- Ensure each question is clear, concise, and unambiguous.
- Do not repeat questions.
- Do not include answers.

OUTPUT FORMAT:
Return a JSON object with:
{
  "interviewId": "<uuid>",
  "questions": [
    { "title": "Question Title", "text": "Question content" , audioUrl: "https://example.com/audio.mp3" },
  ]
}
`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json"
        }
    };

    try {
        const result = await model.generateContent(payload);
        const data = JSON.parse(result.response.text());

        if (!data.interviewId) {
            data.interviewId = uuidv4();
        }

        if (Array.isArray(data.questions)) {
            for (const question of data.questions) {
                const audioData = await textToAudio(question.text);
                question.audioUrl = audioData || null;
            }
        }

        return data;
    } catch (error) {
        console.error("Error generating interview questions:", error);
        return null;
    }
}


async function AnswerScore(question, answer) {
    const prompt = `Analyze the following answer to the question. Provide an integer score from 1 to 10 and a brief analysis. Return the response as a JSON object with 'score' and 'analysis' keys.

        Question: ${question}
        Answer: ${answer}`;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        score: { type: "INTEGER" },
                        analysis: { type: "STRING" }
                    },
                    propertyOrdering: ["score", "analysis"]
                }
            }
        };

        const result = await model.generateContent(payload);
        // console.log("Result:", result);

        let responseText;
        if (result && result.response && typeof result.response.text === "function") {
            responseText = result.response.text();
        } else if (result && result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts[0] && result.candidates[0].content.parts[0].text) {
            responseText = result.candidates[0].content.parts[0].text;
        } else {
            throw new Error("Unexpected response format from generative model.");
        }

        const { score, analysis } = JSON.parse(responseText);
        return { score, analysis };
}

export {
    generateQuestions,
    AnswerScore
};
