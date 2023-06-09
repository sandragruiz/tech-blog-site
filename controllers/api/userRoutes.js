const router = require('express').Router();
const {User, Post, Comment} = require('../../models');
const withAuth = require('../../utils/auth');

// GET all users

router.get ('/', (req, res) => {
    User.findAll ({
      attributes: {exclude: ['password']}
    })
    .then(userData => res.json(userData))
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
  });

  // GET one user by id

  router.get ('/:id', (req, res) => {
    User.findOne({
      attributes: {exclude: ['password']},
      where: {
        id: req.params.id
      },
      include: [
        {
          model: Post,
          attributes: ['id', 'title', 'post_text', 'created_at']
        },
        {
          model: Comment,
          attributes: ['id', 'comment_text', 'created_at']
        }
      ]
    })
    .then(userData => {
      if (!userData) {
        res.status(404).json({ message: 'No user found with this id' });
        return;
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
  });

  // POST //Create new user

  router.post('/', (req, res) => {
    User.create({
      username: req.body.username,
      password: req.body.password
    })
    .then(userData => {
      req.session.save(() => {
        req.session.user_id = userData.id;
        req.session.username = userData.username;
        req.session.loggedIn = true;
  
        res.json(userData)
      })
    })    
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
  });
  
  //login route
  router.post('/login', withAuth, (req, res) => {
    User.findOne({
      where: {
        username: req.body.username
      }
    })
    .then(userData => {
      //verify user
      if(!userData) {
        res.status(400).json({ message: 'Username not found' });
        return;
      }
      const validPassword = userData.checkPassword(req.body.password);
      if (!validPassword) {
        res.status(400).json({ message: 'Incorrect Password' });
        return;
      }
      req.session.save(() => {
        req.session.user_id = userData.id;
        req.session.username = userData.username;
        req.session.loggedIn = true;
        res.json({user: userData, message: 'You are now logged in!' });
      });
    });
  });
  
  //logout route
  router.post('/logout', (req, res) => {
    if (req.session.loggedIn) {
      req.session.destroy(() => {
        res.status(204).end();
      })
    } else {
      res.status(404).end();
    }
  });
  
  //PUT //update a user by id number

  router.put('/:id', (req, res) => {
    User.update(req.body, {
      individualHooks: true,
      where: {
        id: req.params.id
      }
    })
    .then(userData => {
      if (!userData[0]) {
        res.status(404).json({ message: 'No User found with this id' });
        return;
      }
      res.json(userData);
    })
    .catch(err => {
      res.status(500).json(err);
    });
  });
  
  // DELETE a user by id number
  
  router.delete('/:id', (req, res) => {
    User.destroy({
      where: {
        id: req.params.id
      }
    })
    .then(userData => {
      if (!userData) {
        res.status(404).json({ message: 'No User found with this id' });
        return;
      }
      res.json(userData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
  });
  
  
  module.exports = router;
  