import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import { FiEdit2, FiTrash2, FiSave, FiX, FiThumbsUp, FiThumbsDown, FiMessageSquare } from 'react-icons/fi';
import { BiCategory } from 'react-icons/bi';
import { FaUser } from 'react-icons/fa';
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

  const handleContentChange = (value) => {
    setEditingPost({
      ...editingPost,
      content: value
    });
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
          <div key={post.id} className="post-card">
            {editingPost && editingPost.id === post.id ? (
              <div className="edit-form">
                <input
                  type="text"
                  value={editingPost.title}
                  onChange={(e) => handleInputChange(e, 'title')}
                  className="edit-title"
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
                <MDEditor
                  value={editingPost.content}
                  onChange={handleContentChange}
                  preview="edit"
                />
                <div className="button-group">
                  <button onClick={() => handleSaveEdit(editingPost)} className="save-button">
                    <FiSave /> Save
                  </button>
                  <button onClick={handleCancelEdit} className="cancel-button">
                    <FiX /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="post-header">
                  <h2>{post.title}</h2>
                  {currentUserId === post.userId && (
                    <div className="post-actions">
                      <button onClick={() => handleEdit(post)} className="edit-button">
                        <FiEdit2 />
                      </button>
                      <button onClick={() => onDeletePost(post.id)} className="delete-button">
                        <FiTrash2 />
                      </button>
                    </div>
                  )}
                </div>
                <div className="post-meta">
                  <span className="post-category">
                    <BiCategory /> {post.category}
                  </span>
                  <span className="post-author">
                    <FaUser /> {post.authorName}
                  </span>
                </div>
                <div className="post-content">
                  <MDEditor.Markdown source={post.content} />
                </div>
                <div className="post-footer">
                  <div className="post-reactions">
                    <button onClick={() => handleLike(post.id, 'like')} className="like-button">
                      <FiThumbsUp /> {post.likes || 0}
                    </button>
                    <button onClick={() => handleLike(post.id, 'dislike')} className="dislike-button">
                      <FiThumbsDown /> {post.dislikes || 0}
                    </button>
                  </div>
                  <button
                    onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                    className="comments-toggle"
                  >
                    <FiMessageSquare /> {comments[post.id]?.length || 0} Comments
                  </button>
                </div>
                {showComments[post.id] && (
                  <div className="comments-section">
                    <div className="comments-list">
                      {comments[post.id]?.map(comment => (
                        <div key={comment.id} className="comment">
                          <div className="comment-header">
                            <span className="comment-author">{comment.authorName}</span>
                            {currentUserId === comment.userId && (
                              <button
                                onClick={() => handleDeleteComment(post.id, comment.id)}
                                className="delete-comment"
                              >
                                <FiTrash2 />
                              </button>
                            )}
                          </div>
                          <div className="comment-content">{comment.content}</div>
                        </div>
                      ))}
                    </div>
                    <div className="add-comment">
                      <textarea
                        value={newComment[post.id] || ''}
                        onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder="Add a comment..."
                      />
                      <button onClick={() => handleComment(post.id)}>Post</button>
                    </div>
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