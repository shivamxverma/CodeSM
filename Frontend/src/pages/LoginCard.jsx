function LoginCard(){
    return(
        <div className="login">
            <h1>Login Page</h1>
            <input className="login-fields" type="text" placeholder="Enter Username"/>
            <input className="login-fields" type="password" placeholder="Password"/>
            <button className="submit-button">Submit</button>
        </div>
    );
}

export default LoginCard