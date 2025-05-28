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
        const response = await axios.post('http://localhost:8000/api/signup',{email,username,password});
        console.log(response);
    }

    return(
        <div className="signup">
            <h1>SignUp Page</h1>
            <input 
              className="signup-fields" 
              type="email" 
              placeholder="Email id"
              value={email}
              onChange={(e)=>SetEmail(e.target.value)}
            />
            <input 
              className="signup-fields" 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => SetUsername(e.target.value)}
            />
            <input 
              className="signup-fields" 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => SetPassword(e.target.value)}
            />
            <input 
              className="signup-fields" 
              type="password" 
              placeholder="Confirm Password" 
              value={cpassword}
              onChange={(e) => SetCpassword(e.target.value)}
            />
            <button className="submit-button" onClick={onSubmit}>Submit</button>
        </div>
    );
}

export default SignUpCard



