import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import { FiEdit2, FiTrash2, FiSave, FiX, FiThumbsUp, FiThumbsDown, FiMessageSquare } from 'react-icons/fi';
import { BiCategory } from 'react-icons/bi';
import { FaUser } from 'react-icons/fa';
import ReactMde from 'react-mde';
import "react-mde/lib/styles/css/react-mde-all.css";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const CATEGORIES = [
  'Technology',
  'Lifestyle',
  'Travel',
  'Food',
  'Health'
];

const PostList = ({ token, onDeletePost }) => {
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [socket, setSocket] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.userId);
      } catch (error) {
        console.error('Could not verify your identity:', error);
      }
    }
  }, [token]);

  useEffect(() => {
    // Connect to chat
    const newSocket = io(API_URL);
    setSocket(newSocket);

    // Clean up when leaving
    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    if (socket) {
      // Show new posts as they come in
      socket.on('newPost', (post) => {
        if (!selectedCategory || post.category === selectedCategory) {
          setPosts(prevPosts => [post, ...prevPosts]);
        }
      });

      // Remove deleted posts
      socket.on('deletePost', (deletedPostId) => {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== deletedPostId));
      });

      // Update edited posts
      socket.on('updatePost', (updatedPost) => {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === updatedPost.id ? updatedPost : post
          )
        );
      });

      socket.on('commentAdded', ({ postId, comment }) => {
        setComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), comment]
        }));
      });

      socket.on('commentDeleted', ({ postId, commentId }) => {
        setComments(prev => ({
          ...prev,
          [postId]: prev[postId]?.filter(comment => comment.id !== commentId) || []
        }));
      });

      // Clean up our listeners
      return () => {
        socket.off('newPost');
        socket.off('deletePost');
        socket.off('updatePost');
        socket.off('commentAdded');
        socket.off('commentDeleted');
      };
    }
  }, [socket, selectedCategory]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/posts` + (selectedCategory ? `?category=${selectedCategory}` : ''),
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPosts(response.data);

        // Fetch likes and comments for each post
        response.data.forEach(post => {
          fetchLikeStatus(post.id);
          fetchComments(post.id);
        });
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    if (token) {
      fetchPosts();
    }
  }, [token, selectedCategory]);

  const fetchLikeStatus = async (postId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/posts/${postId}/like`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, likes: response.data.likes, dislikes: response.data.dislikes }
            : post
        )
      );
    } catch (error) {
      console.error('Error fetching like status:', error);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/posts/${postId}/comments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(prev => ({
        ...prev,
        [postId]: response.data
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleLike = async (postId, type) => {
    try {
      await axios.post(
        `${API_URL}/api/posts/${postId}/like`,
        { type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchLikeStatus(postId);
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleComment = async (postId) => {
    try {
      await axios.post(
        `${API_URL}/api/posts/${postId}/comments`,
        { content: newComment[postId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      fetchComments(postId);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await axios.delete(
        `${API_URL}/api/posts/${postId}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchComments(postId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleEdit = (post) => {
    setEditingPost({
      ...post,
      isEditing: true
    });
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
  };

  const handleSaveEdit = async (post) => {
    try {
      await axios.put(
        `${API_URL}/api/posts/${post.id}`,
        {
          title: post.title,
          content: post.content,
          category: post.category
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingPost(null);
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post');
    }
  };

  const handleInputChange = (e, field) => {
    setEditingPost({
      ...editingPost,
      [field]: e.target.value
    });
  };

  const generateMarkdownPreview = (markdown) => {
    return Promise.resolve(
      <div className="mde-preview-content">
        <ReactMarkdown>{markdown || ''}</ReactMarkdown>
      </div>
    );
  };

  return (
    <div>
      <div className="category-filter">
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-dropdown"
        >
          <option value="">All Posts</option>
          {CATEGORIES.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <div className="posts-container">
        {posts.map((post) => (
          <div key={post.id} className="post">
            {editingPost && editingPost.id === post.id ? (
              <div className="edit-form">
                <input
                  type="text"
                  value={editingPost.title}
                  onChange={(e) => handleInputChange(e, 'title')}
                  className="edit-input"
                  placeholder="Post title"
                />
                <ReactMde
                  value={editingPost.content}
                  onChange={(value) => handleInputChange({ target: { value } }, 'content')}
                  selectedTab="write"
                  onTabChange={() => {}}
                  generateMarkdownPreview={generateMarkdownPreview}
                />
                <select
                  value={editingPost.category}
                  onChange={(e) => handleInputChange(e, 'category')}
                  className="category-dropdown"
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <div className="edit-controls">
                  <button onClick={() => handleSaveEdit(editingPost)} className="save-button">
                    <FiSave /> Save Changes
                  </button>
                  <button onClick={handleCancelEdit} className="cancel-button">
                    <FiX /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2>{post.title}</h2>
                <div className="post-meta">
                  <p className="post-category">
                    <BiCategory /> {post.category}
                  </p>
                  <p className="post-author">
                    <FaUser /> {post.User?.username || 'Unknown'}
                  </p>
                </div>
                <div className="post-content markdown-content">
                  <ReactMarkdown>{post.content || ''}</ReactMarkdown>
                </div>
                <div className="post-interactions">
                  <button onClick={() => handleLike(post.id, 'like')} className="like-button">
                    <FiThumbsUp /> {post.likes || 0}
                  </button>
                  <button onClick={() => handleLike(post.id, 'dislike')} className="dislike-button">
                    <FiThumbsDown /> {post.dislikes || 0}
                  </button>
                  <button 
                    onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                    className="comment-button"
                  >
                    <FiMessageSquare /> {comments[post.id]?.length || 0}
                  </button>
                </div>
                {showComments[post.id] && (
                  <div className="comments-section">
                    <div className="comment-form">
                      <textarea
                        value={newComment[post.id] || ''}
                        onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder="Write a comment..."
                      />
                      <button onClick={() => handleComment(post.id)}>Post Comment</button>
                    </div>
                    <div className="comments-list">
                      {comments[post.id]?.map(comment => (
                        <div key={comment.id} className="comment">
                          <p>{comment.content}</p>
                          <div className="comment-meta">
                            <span>{comment.User?.username || 'Unknown'}</span>
                            {currentUserId === comment.userId && (
                              <button 
                                onClick={() => handleDeleteComment(post.id, comment.id)}
                                className="delete-comment"
                              >
                                <FiTrash2 />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {currentUserId === post.userId && (
                  <div className="post-controls">
                    <button onClick={() => handleEdit(post)} className="edit-button">
                      <FiEdit2 /> Edit Post
                    </button>
                    <button onClick={() => onDeletePost(post.id)} className="delete-button">
                      <FiTrash2 /> Delete Post
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostList;