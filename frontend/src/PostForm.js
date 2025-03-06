import React, { useState } from 'react';
import axios from 'axios';

const PostForm = ({ token }) => {
  const [formData, setFormData] = useState({ title: '', content: '', category: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/posts', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Post created successfully');
    } catch (error) {
      alert('Post creation failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="title" placeholder="Title" onChange={handleChange} />
      <textarea name="content" placeholder="Content" onChange={handleChange}></textarea>
      <input type="text" name="category" placeholder="Category" onChange={handleChange} />
      <button type="submit">Create Post</button>
    </form>
  );
};

export default PostForm;
