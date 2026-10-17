const {
  User,
  Thought
} = require('../models');

const userController = {

  //get all users
  getAllUsers(req, res) {
      User.find({})
          .populate({
              path: 'thoughts',
              //allows to remove __v from visuals
              select: ('-__v')
          })
          .populate({
              path: 'friends',
              select: ('-__v')
          })
          .select('-__v')
          // sort by descending order by the _id value
          .sort({
              _id: -1
          })
          .then(dbUserData => res.json(dbUserData))
          .catch(err => {
              console.log(err);
              res.status(500).json(err);
          });
  },

  //get one user by id
  getUserById({
      params
  }, res) {
      User.findOne({
              _id: params.id
          })
          .populate({
              path: 'thoughts',
              select: '-__v'
          })
          .select('-__v')
          .then(dbUserData => res.json(dbUserData))
          .catch(err => {
              console.log(err);
              res.sendStatus(400);
          });
  },

  //create user
  createUser({
      body
  }, res) {
      User.create(body)
          .then(dbUserData => res.json(dbUserData))
          .catch(err => res.status(400).json(err));
  },

  //update user by id
  updateUser({
      params,
      body
  }, res) {
      User.findOneAndUpdate({
              _id: params.id
          }, body, {
              new: true,
              runValidators: true
          })
          .then(dbUserData => {
              if (!dbUserData) {
                  res.status(404).json({
                      message: 'No user found with this id.'
                  });
                  return;
              }
              res.json(dbUserData);
          })
          .catch(err => res.status(400).json(err));
  },

  //delete user
  deleteUser({
      params
  }, res) {
      User.findOneAndDelete({
              _id: params.id
          })
          .then(dbUserData => {
              if (!dbUserData) {
                  res.status(404).json({
                      message: 'No user found with this id.'
                  });
                  return null;
              }
              return Promise.all([
                  User.updateMany({
                      _id: {
                          $in: dbUserData.friends
                      }
                  }, {
                      $pull: {
                          friends: dbUserData._id
                      }
                  }),
                  Thought.deleteMany({
                      username: dbUserData.username
                  })
              ]);
          })
          .then(cleanupResults => {
              if (!cleanupResults) {
                  return;
              }
              res.json({
                  message: 'User deleted successfully'
              });
          })
          .catch(err => {
              console.log(err);
              res.status(400).json(err);
          })
  },

  //add friends
  addToFriendList({
      params
  }, res) {
      User.findOneAndUpdate({
              _id: params.userId
          }, {
              $addToSet: {
                  friends: params.friendId
              }
          }, {
              new: true
          })
          .then(dbUserData => {
              if (!dbUserData) {
                  res.status(404).json({
                      message: 'No user found with this id!'
                  });
                  return;
              }
              res.json(dbUserData);
          })
          .catch(err => {
              console.log(err)
              res.json(err)
          });
  },

  //delete friend
  removefromFriendList({
      params
  }, res) {
      User.findOneAndUpdate({
              _id: params.userId
          }, {
              $pull: {
                  friends: params.friendId
              }
          }, {
              new: true
          })
          .then(dbUserData => {
              if (!dbUserData) {
                  return res.status(404).json({
                      message: 'No user found with this id.'
                  });
              }
              res.json(dbUserData);
          })
          .catch(err => res.status(400).json(err));
  },
};

module.exports = userController;