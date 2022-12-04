const mongoose = require('mongoose');

const commentSchema = mongoose.Schema(
  {
    postId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Posts',
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Users',
    },
    content: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comments', commentSchema);
