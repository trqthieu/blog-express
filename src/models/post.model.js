const mongoose = require('mongoose');

const postSchema = mongoose.Schema(
  {
    title: String,
    content: String,
    creator: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Users',
    },
    tags: [String],
    file: String,
    likes: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Users',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Posts', postSchema);
