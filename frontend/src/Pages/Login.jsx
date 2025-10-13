import React, { useState } from 'react'
import './CSS/Login.css'
import { API } from '../config';

export const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const changeHandler = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const login = async () => {
    let responseData;
    await fetch(`${API}/login`,{
      method:"POST",
      headers:{
        Accept:"application/json",
        "Content-Type":"application/json"
      },
      body: JSON.stringify(formData),
    }).then(res=>res.json()).then(data=>{responseData=data});

    if(responseData.success){
      localStorage.setItem("auth-token",responseData.token)
      window.location.replace("/");
    } else {
      alert(responseData.errors)
    }
  };

  return (
    <div className='login'>
      <div className="login-container">
        <h1>Login</h1>
        <div className="login-fields">
          <input 
            name="email" 
            value={formData.email} 
            onChange={changeHandler} 
            type="email" 
            placeholder='Email Address' />
          <input 
            name="password" 
            value={formData.password} 
            onChange={changeHandler} 
            type="password" 
            placeholder='Password' />
        </div>
        <button onClick={login}>Continue</button>
        <p className='login-login'>
          Don’t have an account? <a href="/signup">Sign Up here</a>
        </p>
      </div>
    </div>
  );
};
