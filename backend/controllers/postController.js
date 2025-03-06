const Post = require('../models/Post');
const User = require('../models/User');

exports.createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const post = await Post.create({ title, content, category, userId: req.user.id });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category } = req.body;
    const post = await Post.findByPk(id);
    if (post.userId === req.user.id) {
      post.title = title;
      post.content = content;
      post.category = category;
      await post.save();
      res.json(post);
    } else {
      res.status(403).json({ message: 'Not authorized' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByPk(id);
    if (post && post.userId === req.user.id) {
      await post.destroy();
      res.json({ message: 'Post deleted successfully' });
    } else {
      res.status(403).json({ message: 'Not authorized' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const { category } = req.query;
    const where = category ? { category } : {};
    const posts = await Post.findAll({
      where,
      include: {
        model: User,
        attributes: ['username'], // Only fetch the username field
      },
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};