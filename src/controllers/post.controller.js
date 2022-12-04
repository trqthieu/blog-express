const PostModel = require('../models/post.model.js');
const CommentModel = require('../models/comment.model.js');
const { default: mongoose } = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const getPosts = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const pageInt = Number.parseInt(page) || 1;
    const limitInt = Number.parseInt(limit) || 6;
    const skip = (pageInt - 1) * limitInt;
    const total = await PostModel.countDocuments({});

    PostModel.aggregate([
      {
        $lookup: {
          from: 'users', // collection name in db
          localField: 'creator',
          foreignField: '_id',
          as: 'creatorData',
        },
      },
      { $limit: skip + limitInt },
      { $skip: skip },
      {
        $project: {
          creatorData: {
            password: 0,
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ]).exec(function (err, posts) {
      if (err) throw err;
      res.json({
        data: posts,
        currentPage: pageInt,
        totalPage: Math.ceil(total / limitInt),
      });
    });
  } catch (error) {
    next({ message: error.message });
  }
};

const createPost = async (req, res) => {
  try {
    const post = req.body;
    const { userId } = req;

    const newPost = new PostModel({
      ...post,
      creator: userId,
      tags: post.tags.filter(tag => tag.trim().length > 0),
    });
    await newPost.save();
    PostModel.aggregate([
      {
        $match: {
          _id: newPost._id,
        },
      },
      {
        $lookup: {
          from: 'users', // collection name in db
          localField: 'creator',
          foreignField: '_id',
          as: 'creatorData',
        },
      },
      {
        $project: {
          creatorData: {
            password: 0,
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ]).exec(function (err, newPost) {
      if (err) throw err;
      res.json(newPost);
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const post = req.body;
    const filter = { _id: post._id };
    const update = {
      ...post,
      tags: post.tags.filter(tag => tag.trim().length > 0),
    };
    let newPost = await PostModel.findOneAndUpdate(filter, update, {
      new: true,
    });
    PostModel.aggregate([
      {
        $match: {
          _id: newPost._id,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'creator',
          foreignField: '_id',
          as: 'creatorData',
        },
      },
      {
        $project: {
          creatorData: {
            password: 0,
          },
        },
      },
    ]).exec(function (err, newPost) {
      if (err) throw err;
      res.json(newPost);
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const filter = req.body;
    const deletedPost = await PostModel.findByIdAndRemove(filter._id);
    res.json(deletedPost);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
const likePost = async (req, res) => {
  try {
    const { userId } = req;
    const post = req.body;
    const filter = { _id: post._id };
    const userLiked = post.likes.includes(userId);
    const updateLike = userLiked
      ? post.likes.filter(idLiked => idLiked !== userId)
      : [...post.likes, userId];
    let newPost = await PostModel.findOneAndUpdate(
      filter,
      { likes: updateLike },
      {
        new: true,
      }
    );

    PostModel.aggregate([
      {
        $match: {
          _id: newPost._id,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'creator',
          foreignField: '_id',
          as: 'creatorData',
        },
      },
      {
        $project: {
          creatorData: {
            password: 0,
          },
        },
      },
    ]).exec(function (err, newPost) {
      if (err) throw err;

      res.json(newPost);
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const searchPost = async (req, res) => {
  try {
    const { q: query, page, limit } = req.query;
    const pageInt = Number.parseInt(page) || 1;
    const limitInt = Number.parseInt(limit) || 6;
    const skip = (pageInt - 1) * limitInt;
    const total = await PostModel.countDocuments({
      $or: [
        {
          title: { $regex: query || '', $options: 'i' },
        },
        {
          tags: {
            $all: [query],
          },
        },
      ],
    });

    PostModel.aggregate([
      {
        $match: {
          $or: [
            {
              title: { $regex: query || '', $options: 'i' },
            },
            {
              tags: {
                $all: [query],
              },
            },
          ],
        },
      },
      { $limit: skip + limitInt },
      { $skip: skip },
      {
        $lookup: {
          from: 'users',
          localField: 'creator',
          foreignField: '_id',
          as: 'creatorData',
        },
      },
      {
        $project: {
          creatorData: {
            password: 0,
          },
        },
      },
    ]).exec(function (err, posts) {
      if (err) throw err;

      res.json({
        data: posts,
        currentPage: pageInt,
        totalPage: Math.ceil(total / limitInt),
      });
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const showPost = async (req, res) => {
  try {
    const { id } = req.params;
    PostModel.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'creator',
          foreignField: '_id',
          as: 'creatorData',
        },
      },
      {
        $project: {
          creatorData: {
            password: 0,
            email: 0,
          },
        },
      },
    ]).exec(function (err, post) {
      if (err) throw err;

      res.json(post);
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const showComments = async (req, res) => {
  try {
    const { id } = req.params;
    CommentModel.aggregate([
      {
        $match: {
          postId: ObjectId(id),
        },
      },
      {
        $lookup: {
          localField: 'userId',
          from: 'users',
          foreignField: '_id',
          as: 'userData',
        },
      },
      {
        $project: {
          userData: {
            password: 0,
            email: 0,
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ]).exec((err, comments) => {
      if (err) throw err;
      res.json(comments);
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const commentPost = async (req, res) => {
  try {
    const { postId, userId, content } = req.body;

    const newComment = new CommentModel({ postId, userId, content });
    await newComment.save();

    CommentModel.aggregate([
      {
        $match: {
          postId: ObjectId(postId),
        },
      },
      {
        $lookup: {
          localField: 'userId',
          from: 'users',
          foreignField: '_id',
          as: 'userData',
        },
      },
      {
        $project: {
          userData: {
            password: 0,
            email: 0,
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ]).exec((err, comment) => {
      if (err) throw err;
      res.json(comment);
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const { _id, content } = req.body;

    const newComment = await CommentModel.findOneAndUpdate(
      { _id },
      { content },
      {
        new: true,
      }
    );

    CommentModel.aggregate([
      {
        $match: {
          _id: newComment._id,
        },
      },
      {
        $lookup: {
          localField: 'userId',
          from: 'users',
          foreignField: '_id',
          as: 'userData',
        },
      },
      {
        $project: {
          userData: {
            password: 0,
            email: 0,
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ]).exec((err, comment) => {
      if (err) throw err;
      res.json(comment);
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { _id } = req.body;

    await CommentModel.findOneAndDelete({ _id });

    res.json({ _id });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
  searchPost,
  showPost,
  commentPost,
  showComments,
  updateComment,
  deleteComment,
};
