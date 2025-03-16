import React, { useState } from 'react';
import axios from 'axios';
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const API_URL = process.env.REACT_APP_API_URL || 'https://week8assignment-wt6d.onrender.com';

const CATEGORIES = [
  'Technology',
  'Lifestyle',
  'Travel',
  'Food',
  'Health'
];

const PostForm = ({ token }) => {
  const [formData, setFormData] = useState({ 
    title: '', 
    content: '', 
    category: CATEGORIES[0] // Default to first category
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContentChange = (value) => {
    setFormData({ ...formData, content: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/posts`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Clear form after successful submission
      setFormData({ title: '', content: '', category: CATEGORIES[0] });
      window.location.reload(); // Refresh to show new post
    } catch (error) {
      alert('Post creation failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="post-form">
      <div className="form-group">
        <input 
          type="text" 
          name="title" 
          placeholder="Title" 
          value={formData.title}
          onChange={handleChange} 
        />
      </div>
      <div className="form-group">
        <MDEditor
          value={formData.content}
          onChange={handleContentChange}
          preview="edit"
        />
      </div>
      <div className="form-group">
        <select 
          name="category" 
          value={formData.category}
          onChange={handleChange}
          className="category-dropdown"
        >
          {CATEGORIES.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="submit-button">Create Post</button>
    </form>
  );
};

export default PostForm;
