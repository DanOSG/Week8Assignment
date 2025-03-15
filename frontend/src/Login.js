import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setToken }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', formData);
      const token = response.data.token;
      setToken(token);
      setFormData({ email: '', password: '' }); // Clear form
    } catch (error) {
      alert('Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        name="email" 
        placeholder="Email" 
        value={formData.email}
        onChange={handleChange} 
      />
      <input 
        type="password" 
        name="password" 
        placeholder="Password" 
        value={formData.password}
        onChange={handleChange} 
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
