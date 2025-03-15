const express = require('express');
const router = express.Router();
const { createPost, getPosts, updatePost, deletePost } = require('../controllers/postController');
const { handleLike, getLikeStatus } = require('../controllers/likeController');
const { addComment, getComments, deleteComment } = require('../controllers/commentController');
const auth = require('../middleware/auth');

// Post routes
router.post('/posts', auth, createPost);
router.get('/posts', getPosts);
router.put('/posts/:id', auth, updatePost);
router.delete('/posts/:id', auth, deletePost);

// Like routes
router.post('/posts/:postId/like', auth, handleLike);
router.get('/posts/:postId/like', auth, getLikeStatus);

// Comment routes
router.post('/posts/:postId/comments', auth, addComment);
router.get('/posts/:postId/comments', getComments);
router.delete('/posts/:postId/comments/:commentId', auth, deleteComment);

module.exports = router; 