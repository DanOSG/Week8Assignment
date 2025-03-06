const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const User = require('./User');

const Post = sequelize.define('Post', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

User.hasMany(Post);
Post.belongsTo(User);

module.exports = Post;