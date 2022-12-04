const express = require('express');
const {
  signIn,
  signUp,
  getMe,
  changeMe,
  changePassword,
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
  getMyRoomMessage
} = require('../controllers/user.controller');
const { checkAuth } = require('../middlewares/auth.middleware');
const router = express.Router();

router.post('/signIn', signIn);
router.post('/signUp', signUp);
router.get('/getMe', checkAuth, getMe);
router.post('/changeMe', checkAuth, changeMe);
router.post('/changePassword', checkAuth, changePassword);
router.get('/myCollection', checkAuth, getMyCollection);
router.get('/myFriendRequest', checkAuth, getMyFriendRequest);
router.get('/myFriendList', checkAuth, getMyFriendList);
router.post('/confirmFriendRequest', checkAuth, confirmFriendRequest);
router.post('/unfriend', checkAuth, unfriend);
router.get('/myPosts', checkAuth, getMyPosts);
router.get('/:userId/posts', checkAuth, getUserPosts);
router.get('/:userId/requested', checkAuth, getStatusRequest);
router.post('/requestFriend', checkAuth, requestFriend);
router.post('/message', checkAuth, saveMessage);
router.get('/message/:roomId', checkAuth, getMyRoomMessage);
router.get('/:userId', checkAuth, getUserInfo);

module.exports = router;
