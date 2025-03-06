
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PostList = ({ token, onDeletePost }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await axios.get('http://localhost:3001/api/posts');
      setPosts(response.data);
    };
    fetchPosts();
  }, []);

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id} className="post">
          <h2>{post.title}</h2>
          <p className="post-content">{post.content}</p>
          <p className="post-category">Category: {post.category}</p>
          <p className="post-author">
            Author: {post.User ? post.User.username : 'Unknown'}
          </p>
          {token && post.User && post.User.id === token.userId && (
            <button onClick={() => onDeletePost(post.id)}>Delete</button>
          )}
        </div>
      ))}
    </div>
  );
};

export default PostList;