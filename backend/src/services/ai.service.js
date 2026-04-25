import { GoogleGenerativeAI } from '@google/generative-ai';
import env from '../config/index.js';

if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

async function generateHintsWithAI(problem) {

    const prompt = `
    You are an expert programming tutor for a competitive programming platform called "codesm".
    Your task is to provide a series of high-quality, step-by-step hints for the following programming problem.

    **RULES:**
    1.  **DO NOT** provide the final code solution or large snippets of code in any language. Your goal is to guide, not to solve.
    2.  Break down the solution into 4 logical steps or hints.
    3.  The hints must be progressive. Start with a high-level conceptual hint and gradually get more specific.
    4.  The final hint can suggest the main algorithm, data structure, or key observation needed to solve the problem efficiently (e.g., "Consider using a hash map to track frequencies" or "Think about a two-pointer approach").
    5.  Tailor the tone and complexity of the hints based on the problem's **difficulty** and **tags**.
    6.  The response **MUST** be a valid JSON object. Do not include any markdown formatting (like \`\`\`) or any text outside of the JSON structure.

    **OUTPUT FORMAT:**
    Your output must be a JSON object with a single key "hints", which is an array of hint objects. Each hint object must have a "title" and a "content" key.
    Example format:
    {
      "hints": [
        {
          "title": "Understanding the Problem",
          "content": "First, make sure you understand what the input represents and what the expected output should be. Look at the examples carefully.",
          "order": "1",
        },
        {
          "title": "Thinking about the Logic",
          "content": "Think about the logic of the problem and how you can solve it efficiently.",
          "order": "2",
        },
        {
          "title": "Choosing the Right Approach",
          "content": "What data structure would be efficient for storing and retrieving data quickly?",
          "order": "3",
        },
        {
          "title": "Let's Try Coding",
          "content": "Try to code the solution using the hints above. If you get stuck, come back and we'll help you further!",
          "order": "4",
        }
      ]
    }

    **PROBLEM TO ANALYZE:**
    Title: ${problem.title}
    Difficulty (800-3000): ${problem.difficulty}
    Tags: ${problem.tags.join(', ')}
    Description: ${problem.description}
    Input Format: ${problem.inputFormat}
    Output Format: ${problem.outputFormat}
    Constraints: ${problem.constraints}
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        const parsedResult = JSON.parse(text);
        
        if (!parsedResult.hints || !Array.isArray(parsedResult.hints)) {
            throw new Error("AI response did not follow the expected JSON format.");
        }
        
        return parsedResult.hints;

    } catch (error) {
        console.error("AI Generation Error:", error);
        return [{
            title: "Hints Unavailable",
            content: "We couldn't generate hints for this problem at the moment. Please try again later or check the editorial."
        }];
    }
}

export { generateHintsWithAI };