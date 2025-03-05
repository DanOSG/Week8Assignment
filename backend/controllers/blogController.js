const Blog = require('../models/blog');

exports.createBlog = async (req, res) => {
  const { title, content, category } = req.body;
  const blog = await Blog.create({ title, content, category, userId: req.user.id });
  res.status(201).json(blog);
};

exports.getBlogs = async (req, res) => {
  const blogs = await Blog.findAll();
  res.json(blogs);
};

exports.updateBlog = async (req, res) => {
  const { id } = req.params;
  const { title, content, category } = req.body;
  const blog = await Blog.findByPk(id);
  if (blog.userId === req.user.id) {
    blog.title = title;
    blog.content = content;
    blog.category = category;
    await blog.save();
    res.json(blog);
  } else {
    res.status(403).json({ message: 'Not authorized' });
  }
};

exports.deleteBlog = async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findByPk(id);
  if (blog.userId === req.user.id) {
    await blog.destroy();
    res.json({ message: 'Blog deleted' });
  } else {
    res.status(403).json({ message: 'Not authorized' });
  }
};
