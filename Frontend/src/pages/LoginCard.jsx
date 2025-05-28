import React,{useState} from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

function LoginCard(){
    const [Username,SetUsername] = useState("");
    const [Password,SetPassword] = useState("");
    const navigate = useNavigate();

    const onsubmit = async()=> {
        try {
            const response = await axios.post("http://localhost:8000/api/login", {
              Username,
              Password
            }, {
              headers: {
                'Content-Type': 'application/json'
              }
            });
        // console.log(response);
        navigate("/");

        } catch (error) {
          console.error("Login failed:", error.response?.data || error.message);
        }
    }
    return(
        <div className="login">
            <h1>Login Page</h1>
            <input 
             className="login-fields" 
             type="text" 
             placeholder="Enter Username"
             value = {Username}
             onChange={(e)=>SetUsername(e.target.value)}
            />
            <input 
             className="login-fields" 
             type="password" 
             placeholder="Password"
             value={Password}
             onChange={(e) => SetPassword(e.target.value)}
            />
            <button className="submit-button" onClick={onsubmit}>Submit</button>
        </div>
    );
}

export default LoginCard;