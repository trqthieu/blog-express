const jwt = require('jsonwebtoken');
const CommentModel = require('../models/comment.model');
const PostModel = require('../models/post.model');
const UserModel = require('../models/user.model');

const checkAuth = (req, res, next) => {
  const accessToken = req.headers.authorization?.split(' ')[1];
  if (accessToken && accessToken?.length < 500) {
    jwt.verify(accessToken, process.env.TOKEN_SECRET_KEY, (err, user) => {
      if (err) return next({ message: err.message });
      req.userId = user._id;
      next();
    });
  } else {
    next({
      message: 'Request is denied! Please login!',
    });
  }
};

const checkPostOwner = async (req, res, next) => {
  const { userId,isAdmin } = req;
  const {_id}=req.body
  const post = await PostModel.findOne({
    _id,
    creator: userId,
  });
  if (post || isAdmin) {
    next();
  } else {
    next({
      message: 'Request is denied! You are not the owner post',
    });
  }
};

const checkCommentOwner = async (req, res, next) => {
  const { userId,isAdmin } = req;
  const {_id}=req.body
  const comment = await CommentModel.findOne({
    _id,
    userId,
  });
  if (comment || isAdmin) {
    next();
  } else {
    next({
      message: 'Request is denied! You are not the owner comment',
    });
  }
};

const checkAdmin = async (req, res, next) => {
  const { userId } = req;
  const user = await UserModel.findById(userId);
  if (user.role === 'admin') {
    req.isAdmin=true;
    next();
  } else {
    next({
      message: 'Request is denied! You do not have permission',
    });
  }
};

module.exports = { checkAuth, checkPostOwner, checkCommentOwner, checkAdmin };
