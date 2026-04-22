import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";
import env from '../config/index.js';

if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);


const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const ROUND_FOCUS = {
    technical: `TECHNICAL (DSA) ROUND: Ask classic data structures & algorithms problems only (e.g. arrays/strings, two pointers, sliding window, binary search, trees, graphs, heaps, hash maps, DP, greedy). Each question should be solvable by implementing a function or algorithm with clear constraints, edge cases, and time/space complexity discussion. Do NOT ask for large system or service design. Do NOT ask behavioral questions.`,
    behavioral: `BEHAVIORAL ROUND: Use situational and past-experience questions only. Prefer STAR-style prompts (Situation, Task, Action, Result). Cover teamwork, conflict, leadership, deadlines, mistakes, and communication. Do not ask for code, pseudocode, or system architecture.`,
    lld: `LOW-LEVEL DESIGN (LLD) ROUND: Ask to model one bounded domain in code (classes, interfaces, method signatures, key data structures, extension points). Examples: LRU cache API, parking lot, elevator controller, in-memory pub-sub, rate limiter. Candidate will answer by writing design-oriented code in their chosen language. Not full distributed system design.`,
    system_design: `SYSTEM DESIGN ROUND: Focus on scalable distributed systems: requirements, capacity, APIs, data stores, caching, load balancing, messaging, consistency, failure modes, and trade-offs. No long coding drills; brief pseudo-code or sketch APIs is fine. Do NOT ask LeetCode-style DSA-only puzzles.`,
};

const LEVEL_FOCUS = {
    easy: 'Difficulty: EASY — shorter, foundational questions; assume less depth.',
    medium: 'Difficulty: MEDIUM — standard seniority-aligned depth for the experience level.',
    hard: 'Difficulty: HARD — demanding questions; expect strong depth and trade-off reasoning.',
    mixed: 'Difficulty: MIXED — vary difficulty within the set while staying appropriate to experience.',
};

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
                    "api-key": env.MURF_API_KEY,
                },
            }
        );
        return response.data.audioFile;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}


async function generateQuestions(role, experience, options = {}) {
    const {
        customRequirements = '',
        questionCount = 10,
        interviewLevel = 'medium',
        round = 'technical',
        codingLanguage,
    } = options;

    const count = Math.min(Math.max(Number(questionCount) || 10, 3), 25);
    const levelLine = LEVEL_FOCUS[interviewLevel] || LEVEL_FOCUS.medium;
    const roundLine = ROUND_FOCUS[round] || ROUND_FOCUS.technical;
    const langLine =
        (round === 'technical' || round === 'lld') && codingLanguage
            ? `\nPROGRAMMING LANGUAGE: The candidate selected "${codingLanguage}" for their editor. Phrase each question so a solution is naturally written in that language (syntax may vary; keep the problem language-agnostic but mention they may implement in ${codingLanguage}).`
            : '';

    const prompt = `
You are an expert interviewer for software development roles. Generate a set of high-quality interview questions tailored to the candidate's role, experience, round type, and difficulty.

ROLE DETAILS:
- ID: ${role.id}
- Name: ${role.name}
- Description: ${role.desc || role.name}

EXPERIENCE DETAILS:
- ID: ${experience.id}
- Name: ${experience.name}
- Years: ${experience.years}

ROUND AND LEVEL:
${roundLine}
${levelLine}
${langLine}

CUSTOM REQUIREMENTS FROM CANDIDATE:
${customRequirements?.trim() ? customRequirements : "No extra requirements provided."}

INSTRUCTIONS:
- Generate exactly ${count} questions (no more, no fewer).
- Every question must fit the selected round type above; do not blend unrelated round types.
- Calibrate depth to the experience level and the interview level (${interviewLevel}).
- Prioritize custom requirements when provided.
- Avoid generic filler; be specific and practical for the role.
- Do not repeat questions. Do not include answers.

OUTPUT FORMAT:
Return a JSON object with:
{
  "interviewId": "<uuid>",
  "questions": [
    { "title": "Short title", "text": "Full question text", "audioUrl": null }
  ]
}
Use null for audioUrl on every question (the server will fill audio).
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
            if (data.questions.length > count) {
                data.questions = data.questions.slice(0, count);
            }
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


function scoringInstructions(round, codingLanguage) {
    if (round === 'technical') {
        return `This is a DSA / coding round. The answer may be source code in ${codingLanguage || 'the candidate\'s chosen language'}. Score on correctness of approach, edge cases, complexity, and code clarity—not on minor syntax if the idea is sound.`;
    }
    if (round === 'lld') {
        return `This is a low-level design round. The answer may be class/API-oriented code in ${codingLanguage || 'the candidate\'s chosen language'}. Score on modeling, separation of concerns, interfaces, and extensibility—not production completeness.`;
    }
    if (round === 'behavioral') {
        return `This is a behavioral round. Score the answer on specificity, impact, reflection, and structure (e.g. STAR). Ignore code.`;
    }
    if (round === 'system_design') {
        return `This is a system design round. Score on requirements, trade-offs, major components, data flow, scaling, and failure handling. Brief pseudo-code is acceptable.`;
    }
    return 'Score the answer appropriately for a software interview.';
}

async function AnswerScore(question, answer, opts = {}) {
    const { round, codingLanguage } = opts;
    const rubric = scoringInstructions(round || '', codingLanguage || '');

    const prompt = `Analyze the following answer to the interview question. ${rubric}

Provide an integer score from 1 to 10 and a brief analysis. Return the response as a JSON object with 'score' and 'analysis' keys.

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
