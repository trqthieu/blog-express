const postRoute = require('./post.route');
const userRoute = require('./user.route');

const initRoute = app => {
  app.use('/post', postRoute);
  app.use('/user', userRoute);
  app.use((data, req, res, next) => {
    console.log('Handling error middleware',data);
    res.status(404).json(data);
  });
};
module.exports = initRoute;
