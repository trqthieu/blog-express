const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

const UserModel = require('../models/user.model');
const PostModel = require('../models/post.model');
const FriendModel = require('../models/friend.model');
const { default: mongoose } = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error('Invalid input');
    }
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      throw new Error('Email is not correct!');
    }
    const checkPassword = bcrypt.compareSync(password, user.password);
    if (!checkPassword) {
      throw new Error('Password is not correct!');
    }
    const accessToken = jwt.sign(
      {
        _id: user._id,
        name: user.name,
      },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({ accessToken });
  } catch (error) {
    next({ message: error.message });
  }
};
const signUp = async (req, res, next) => {
  try {
    const user = req.body;
    const { name, email, password, avatar, confirmPassword } = user;

    if (!name || !email || !password || !password) {
      throw new Error('Invalid input');
    }
    if (password !== confirmPassword) {
      throw new Error('Password does not match');
    }
    const existedUser = await UserModel.findOne({ email: email });
    if (existedUser) {
      throw new Error('Email is existed! Try another email!');
    }
    const hashPassword = bcrypt.hashSync(password, salt);

    const newUser = new UserModel({
      ...user,
      password: hashPassword,
    });
    await newUser.save();
    const accessToken = jwt.sign(
      {
        _id: newUser._id,
        name: user.name,
      },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.status(201).json({ accessToken });
  } catch (error) {
    next({ message: error.message });
  }
};
const getMe = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await UserModel.findById(userId, { password: 0 });
    if (!user) {
      throw new Error('User not exist');
    }
    res.json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const changeMe = async (req, res, next) => {
  try {
    const { name, description, avatar, _id } = req.body;
    const newUser = await UserModel.findOneAndUpdate(
      { _id },
      { name, description, avatar },
      {
        new: true,
        fields: { password: 0 },
      }
    );
    res.json(newUser);
  } catch (error) {
    next(404).json({ message: error.message });
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { _id, password, newPassword, confirmPassword } = req.body;

    const user = await UserModel.findById(_id);
    if (!user) {
      throw new Error('User not existed');
    }

    if (!password || !newPassword || !confirmPassword) {
      throw new Error('Invalid input');
    }
    const checkPassword = bcrypt.compareSync(password, user.password);
    if (!checkPassword) {
      throw new Error('Your password is not correct');
    }
    if (newPassword !== confirmPassword) {
      throw new Error('Your confirm password does not match');
    }
    const hashPassword = bcrypt.hashSync(newPassword, salt);

    const newUser = await UserModel.findOneAndUpdate(
      { _id },
      { password: hashPassword },
      {
        new: true,
        fields: { password: 0 },
      }
    );

    res.json(newUser);
  } catch (error) {
    next({ message: error.message });
  }
};

const savePost = async (req, res, next) => {
  try {
    const { userId } = req;
    const { id: postId } = req.body;

    const user = await UserModel.findById(userId);

    const saved = user.collectionList.includes(postId);
    const newCollectionList = saved
      ? user.collectionList.filter(pId => !pId.equals(ObjectId(postId)))
      : [...user.collectionList, postId];
    const newUser = await UserModel.findOneAndUpdate(
      { _id: userId },
      { collectionList: newCollectionList },
      {
        new: true,
        fields: { password: 0 },
      }
    );
    res.json(newUser);
  } catch (error) {
    next({ message: error.message });
  }
};

const getMyPosts = async (req, res, next) => {
  try {
    const { userId } = req;
    const total = await PostModel.find({
      creator: userId,
    }).countDocuments();
    const posts = await PostModel.find({
      creator: userId,
    });

    res.json({
      data: posts,
      currentPage: 1,
      totalPage: Math.ceil(total / 6),
      totalPosts: total,
    });
  } catch (error) {
    next({ message: error.message });
  }
};
const getMyCollection = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await UserModel.findById(userId);
    const total = await PostModel.find({
      _id: {
        $in: user.collectionList,
      },
    }).countDocuments();
    const posts = await PostModel.find({
      _id: {
        $in: user.collectionList,
      },
    });
    res.json({
      data: posts,
      currentPage: 1,
      totalPage: Math.ceil(total / 6),
      totalPosts: total,
    });
  } catch (error) {
    next({ message: error.message });
  }
};

const getMyFriendRequest = async (req, res, next) => {
  try {
    const { userId } = req;

    UserModel.findOne({ _id: userId })
      .populate('friendRequest', {
        _id: 1,
        name: 1,
        avatar: 1,
      })
      .exec((err, user) => {
        if (err) throw err;
        res.json(user.friendRequest);
      });
  } catch (error) {
    next({ message: error.message });
  }
};

const getStatusRequest = async (req, res, next) => {
  try {
    const { userId } = req;

    const { userId: friendId } = req.params;

    const friendUser = await UserModel.findById(friendId);
    const requested = friendUser.friendRequest.includes(userId);

    res.json({
      status: requested,
    });
  } catch (error) {
    next({ message: error.message });
  }
};

const getMyFriendList = async (req, res, next) => {
  try {
    const { userId } = req;

    const friendList = await FriendModel.find({
      $or: [
        {
          personRequest: userId,
        },
        {
          personReceive: userId,
        },
      ],
    })
      .populate('personRequest', {
        _id: 1,
        name: 1,
        avatar: 1,
      })
      .populate('personReceive', {
        _id: 1,
        name: 1,
        avatar: 1,
      });
    const newFriendList = friendList.map(friend => {
      if (friend.personReceive._id.equals(ObjectId(userId))) {
        return {
          _id: friend._id,
          user: friend.personRequest,
        };
      }
      return {
        _id: friend._id,
        user: friend.personReceive,
      };
    });
    res.json(newFriendList);
  } catch (error) {
    next({ message: error.message });
  }
};
const unfriend = async (req, res, next) => {
  try {
    const { userId } = req;
    const { _id } = req.body;

    const friend = await FriendModel.findById(_id);
    if (!friend) {
      throw new Error('Friendship is not exist!');
    }
    if (
      !friend.personRequest.equals(ObjectId(userId)) &&
      !friend.personReceive.equals(ObjectId(userId))
    ) {
      throw new Error('You are not in friendship with this user');
    }

    await FriendModel.findByIdAndRemove({
      _id,
    });
    const newFriendList = await FriendModel.find();
    res.json(newFriendList);
  } catch (error) {
    next({ message: error.message });
  }
};
const confirmFriendRequest = async (req, res, next) => {
  try {
    const { userId } = req;
    const { friendId } = req.body;

    const me = await UserModel.findById(userId);
    const friend = await UserModel.findById(friendId);

    if (!me.friendRequest.includes(friendId)) {
      throw new Error('Some thing went wrong. Pls reload website!!');
    }

    const meUpdated = me.friendRequest.filter(
      f => !f.equals(ObjectId(friendId))
    );

    const friendUpdated = friend.friendRequest.filter(
      f => !f.equals(ObjectId(userId))
    );

    await UserModel.findOneAndUpdate(
      { _id: userId },
      {
        friendRequest: meUpdated,
      }
    );
    await UserModel.findOneAndUpdate(
      { _id: friendId },
      {
        friendRequest: friendUpdated,
      }
    );

    const friendship = new FriendModel({
      personRequest: friendId,
      personReceive: userId,
    });
    await friendship.save();
    res.json(friendship);
  } catch (error) {
    next({ message: error.message });
  }
};

const getUserInfo = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId, {
      password: 0,
      collectionList: 0,
    });
    if (!user) throw new Error('User not existed!');

    res.json(user);
  } catch (error) {
    next({ message: error.message });
  }
};

const getUserPosts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const total = await PostModel.find({
      creator: userId,
    }).countDocuments();
    const posts = await PostModel.find({
      creator: userId,
    });

    res.json({
      data: posts,
      currentPage: 1,
      totalPage: Math.ceil(total / 6),
      totalPosts: total,
    });
  } catch (error) {
    next({ message: error.message });
  }
};

const requestFriend = async (req, res, next) => {
  try {
    const { userId } = req;
    const { friendId } = req.body;
    const friend = await UserModel.findById(friendId);
    if (!friend) throw new Error('Friend not existed');

    const friendship = await FriendModel.findOne({
      $or: [
        {
          personRequest: friendId,
          personReceive: userId,
        },
        {
          personRequest: userId,
          personReceive: friendId,
        },
      ],
    });
    if (friendship) {
      throw new Error('You are in the friendship! Pls reload website!!!');
    }

    // const userExisted=friend.friendRequest.includes(userId)

    const friendUpdated = friend.friendRequest.includes(userId)
      ? friend.friendRequest.filter(f => !f.equals(ObjectId(userId)))
      : [...friend.friendRequest, userId];

    const newUser = await UserModel.findOneAndUpdate(
      { _id: friendId },
      {
        friendRequest: friendUpdated,
      },
      {
        new: true,
      }
    );

    res.json({ status: newUser.friendRequest.includes(userId) });
  } catch (error) {
    next({ message: error.message });
  }
};
const saveMessage = async (req, res, next) => {
  try {
    const { _id, fromUser, content } = req.body;
    const friend = await FriendModel.findById(_id);
    const messageList = friend.message;
    const newMessage = {
      from: fromUser,
      content: content,
      timeSend: new Date(),
    };
    messageList.push(newMessage);
    const newFriend = await FriendModel.findOneAndUpdate(
      { _id: _id },
      {
        message: messageList,
      }
    );
    res.json(newFriend.message);
  } catch (error) {
    next({ message: error.message });
  }
};
const getMyRoomMessage = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const friend = await FriendModel.findById(roomId);
    res.json(friend.message);
  } catch (error) {
    next({ message: error.message });
  }
};

module.exports = {
  signIn,
  signUp,
  getMe,
  changeMe,
  changePassword,
  savePost,
  getMyCollection,
  getMyPosts,
  getUserInfo,
  getUserPosts,
  requestFriend,
  getMyFriendRequest,
  confirmFriendRequest,
  getMyFriendList,
  unfriend,
  getStatusRequest,
  saveMessage,
  getMyRoomMessage,
};
