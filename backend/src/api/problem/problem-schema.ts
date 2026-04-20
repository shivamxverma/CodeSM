import * as yup from 'yup';

export const createProblemSchema = yup.object({
    title: yup.string().required("Title is required"),
    description: yup.string().required("Description is required"),
    slug: yup.string().required("Slug is required"),
    difficulty: yup.string().required("Difficulty is required"),
    inputFormat: yup.string().required("Input Format is required"),
    outputFormat: yup.string().required("Output Format is required"),
    constraints: yup.string().required("Constraints is required"),
    timeLimit: yup.number().required("Time Limit is required"),
    memoryLimit: yup.number().required("Memory Limit is required"),
    editorialContent: yup.string().required("Editorial is required"),
    editorialLink: yup.string().required("Editorial Link is required"),
    solution: yup.string().required("Solution is required"),
    tags: yup.array().of(yup.string()).required("Tags is required"),
    testcases: yup.number().required(),
    sampleTestcases: yup.number().required()
});