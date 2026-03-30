import {EmailPasswordRegisterRequest, RegisterResponse} from './user-types';
export const handleEmailPasswordRegister = async(
    data : EmailPasswordRegisterRequest
) : Promise<RegisterResponse> => {
    const {username , email , password} = data;
    
}