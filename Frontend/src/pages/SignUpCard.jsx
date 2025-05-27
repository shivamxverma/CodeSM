function SignUpCard(){
    return(
        <div className="signup">
            <h1>SignUp Page</h1>
            <input className="signup-fields" type="email" placeholder="email id" />
            <input className="signup-fields" type="text" placeholder="Username" />
            <input className="signup-fields" type="password" placeholder="Password"/>
            <input className="signup-fields" type="password" placeholder="Confirm Password"/>
            <button className="submit-button">Submit</button>
        </div>
    );
}

export default SignUpCard