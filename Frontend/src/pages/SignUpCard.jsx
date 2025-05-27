import React,{useState} from "react";
import axios from 'axios';


function SignUpCard(){
    const [email,SetEmail] = useState("");
    const [username,SetUsername] = useState("");
    const [password,SetPassword] = useState("");
    const [cpassword,SetCpassword] = useState("");

    const onSubmit = async() => {
        if(password !== cpassword){
            return ;
        }
        
        const response = await axios.post('http://localhost:8000/signup',{email,username,password});
        console.log(response);
    }

    return(
        <div className="signup">
            <h1>SignUp Page</h1>
            <input className="signup-fields" type="email" placeholder="Email id" />
            <input className="signup-fields" type="text" placeholder="Username" />
            <input className="signup-fields" type="password" placeholder="Password"/>
            <input className="signup-fields" type="password" placeholder="Confirm Password"/>
            <button className="submit-button" onClick={onSubmit}>Submit</button>
        </div>
    );
}

export default SignUpCard



