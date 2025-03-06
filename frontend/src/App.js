import React, { useState } from 'react';
import './App.css';
import Register from './Register';
import Login from './Login';
import PostForm from './PostForm';
import PostList from './PostList';
import axios from 'axios';

const App = () => {
  const [token, setToken] = useState(null);

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`http://localhost:3001/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh the post list or update the state to reflect the deletion
      window.location.reload();
    } catch (error) {
      alert('Failed to delete post');
    }
  };

  return (
    <div>
      <h1>Blog Platform</h1>
      {!token ? (
        <>
          <Register />
          <Login setToken={setToken} />
        </>
      ) : (
        <>
          <PostForm token={token} />
          <PostList token={token} onDeletePost={handleDeletePost} />
        </>
      )}
    </div>
  );
};

export default App;