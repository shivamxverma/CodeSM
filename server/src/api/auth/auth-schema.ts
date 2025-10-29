import * as yup from 'yup';

export const registerSchema = yup.object().shape({
    username : yup.string().required("username is required"),
    email : yup.string().required("email is required"),
    fullName : yup.string().required("fullName is required"), 
    password : yup.string().required("fullName is required")
})

export const loginSchema = yup.object().shape({
    username : yup.string().required("username is required"),
    email : yup.string().required("email is required"),
    password : yup.string().required("fullName is required")
})

