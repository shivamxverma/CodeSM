import * as yup from 'yup';

export const generateInterviewQuestionsSchema = yup.object({
    role: yup.string().required("Role is required"),
    experience: yup.string().required("Experience is required"),
    customRequirements: yup.string().optional(),
    questionCount: yup.number().required("Question count is required"),
    interviewLevel: yup.string().required("Interview level is required"),
    round: yup.string().required("Round is required"),
    codingLanguage: yup.string().optional()
})

export const getAnswerScoreSchema = yup.object({
    question: yup.string().required("Question is required"),
    answer: yup.string().required("Answer is required")
})