const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
    },
    description: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
    avatar: {
      type: String,
      require: true,
    },
    collectionList: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Posts',
      },
    ],
    friendRequest: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Users',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Users', userSchema);
