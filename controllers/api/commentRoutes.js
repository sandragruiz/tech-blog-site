const router = require('express').Router();
const {Comment} = require('../../models');
const withAuth = require('../../utils/auth');

// GET all comments

router.get('/', (req, res) => {
  Comment.findAll()
  .then(commentData => res.json(commentData))
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

// POST a comment

router.post('/', withAuth, (req, res) => {
  //Check for session
  if (req.session) {
    Comment.create({
      comment_text: req.body.comment_text,      
      post_id: req.body.post_id,
      user_id: req.session.user_id
    })
    .then(commentData => res.json(commentData))
    .catch(err => {
      console.log(err);
      res.status(400).json(err);
    });
  }
});

// DELETE a comment

router.delete('/:id', (req, res) => {
  Comment.destroy({
    where: {
      id: req.params.id
    }
  })
    .then(commentData => {
      if (!commentData) {
        res.status(404).json({ message: 'No comment found with this id' });
        return;
      }
      res.json(commentData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;