import * as yup from 'yup';

export const createsubmissionSchema = yup.object({
    code : yup.string().required("Code is required"),
    language : yup.string().required("Language is required")
});

export const problemIdSchema = yup.object({
    problemId : yup.string().required("Problem ID is required")
})
