const {
  Thought,
  User
} = require('../models');
const thoughtController = {

  //get all thoughts
  getAllThoughts(req, res) {
      Thought.find({})
          .then(dbThoughtData => res.json(dbThoughtData))
          .catch(err => {
              console.log(err);
              res.status(500).json(err);
          });
  },

  //get one thought by id
  getThoughtById({
      params
  }, res) {
      Thought.findOne({
              _id: params.thoughtId
          })
          .select('-__v')
          .sort({
              _id: -1
          })
          .then(dbThoughtData => {
              if (!dbThoughtData) {
                  res.status(404).json({
                      message: 'No thought found with id.'
                  });
                  return;
              }
              res.json(dbThoughtData)
          })
          .catch(err => {
              console.log(err);
              res.status(400).json(err);
          });
  },

  //create thought
  addThought({
      body
  }, res) {
      User.findById(body.userId)
          .then(user => {
              if (!user) {
                  return res.status(404).json({
                      message: 'No user found with this id.'
                  });
              }
              return Thought.create(body)
                  .then(thought => User.findOneAndUpdate({
                      _id: user._id
                  }, {
                      $addToSet: {
                          thoughts: thought._id
                      }
                  }, {
                      new: true
                  }).then(updatedUser => {
                      if (!updatedUser) {
                          return Thought.deleteOne({
                              _id: thought._id
                          }).then(() => res.status(404).json({
                              message: 'No user found with this id.'
                          }));
                      }
                      res.json(updatedUser);
                  }));
          })
          .catch(err => {
              console.log(err);
              res.status(400).json(err);
          });
  },

  //update thought by id
  updateThought({
      params,
      body
  }, res) {
      Thought.findOneAndUpdate({
              _id: params.thoughtId
          }, {
              $set: body
          }, {
              runValidators: true,
              new: true
          })
          .then(updateThought => {
              if (!updateThought) {
                  return res.status(404).json({
                      message: 'No thought with this id!'
                  });
              }
              return res.json({
                  message: "Success"
              });
          })
          .catch(err => res.json(err));
  },

  //delete thought
  removeThought({
      params
  }, res) {
      Thought.findOneAndDelete({
              _id: params.thoughtId
          })
          .then(deletedThought => {
              if (!deletedThought) {
                  res.status(404).json({
                      message: 'No thought with this id!'
                  });
                  return null;
              }
              return User.findOneAndUpdate({
                  thoughts: params.thoughtId
              }, {
                  $pull: {
                      thoughts: params.thoughtId
                  }
              }, {
                  new: true
              });
          })
          .then(dbUserData => {
              if (dbUserData === null) {
                  return;
              }
              if (!dbUserData) {
                  res.status(404).json({
                      message: 'No thought found with this id!'
                  });
                  return;
              }
              res.json(dbUserData);
          })
          .catch(err => res.json(err));
  },

  //create reactions
  addReaction({
      params,
      body
  }, res) {
      Thought.findOneAndUpdate({
              _id: params.thoughtId
          }, {
              $push: {
                  reactions: body
              }
          }, {
              new: true,
              runValidators: true
          })
          .then(updatedThought => {
              if (!updatedThought) {
                  res.status(404).json({
                      message: 'No reaction found with this id!'
                  });
                  return;
              }
              res.json(updatedThought);
          })
          .catch(err => res.json(err));
  },
  // Delete a reaction
  removeReaction({
      params
  }, res) {
      Thought.findOneAndUpdate({
                  _id: params.thoughtId
              },
              //allows to remove the reaction by id
              {
                  $pull: {
                      reactions: {
                          reactionId: params.reactionId
                      }
                  }
              }, {
                  new: true
              }
          )
          .then((thought) => {
              if (!thought) {
                  res.status(404).json({
                      message: 'No reaction found with this id.'
                  });
                  return;
              }
              res.json(thought)
          })
          .catch(err => res.json(err));
  },
}

module.exports = thoughtController;