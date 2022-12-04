const express=require('express')
const router=express.Router()
const {showComments,commentPost,showPost,getPosts,createPost,updatePost,deletePost,likePost,searchPost, updateComment, deleteComment}=require('../controllers/post.controller')
const {savePost}=require('../controllers/user.controller')
const { checkAuth, checkPostOwner, checkCommentOwner } = require('../middlewares/auth.middleware')

router.get('/search',searchPost)
router.post('/likePost',checkAuth,likePost)
router.post('/commentPost',checkAuth,commentPost)
router.post('/savePost',checkAuth,savePost)
router.get('/:id/comment',showComments);
router.put('/comment',checkAuth,checkCommentOwner,updateComment);
router.delete('/comment',checkAuth,checkCommentOwner,deleteComment);
router.get('/:id',showPost);
router.post('/',checkAuth,createPost)
router.put('/',checkAuth,checkPostOwner,updatePost)
router.delete('/',checkAuth,checkPostOwner,deletePost)
router.get('/',getPosts);


module.exports=router