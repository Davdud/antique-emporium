const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const passport = require('passport');

const User = require('../models/User')

router.get('/signup', function(req, res) {
    res.render('signup.ejs')
  }) 

router.get('/login', function(req, res) {
    res.render('login.ejs')
  }) 

//Sign Up handler
router.post('/signup', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

// All errors
  if(!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in empty fields '})
  }

  if(password !== password2) {
    errors.push({ msg: 'The passwords do not match' })
  }

  if(password.length < 6) {
    errors.push({ msg: 'The password must have at least 6 characters'})
  }

  if(errors.length > 0){
    res.render('signup.ejs', {
      errors,
      name,
      email,
      password,
      password2
    })
  } else {
    User.findOne({ email: email })
    .then(user => {
      if(user) {
        errors.push({ msg: 'Email is already in use' })
        res.render('signup.ejs', {
          errors,
          name,
          email,
          password,
          password2
        })
      } else {
        const newUser = new User({
          name,
          email,
          password
        })

        //Password hash
        bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
          if(err) throw err;

          newUser.password = hash;
          newUser.save()
          .then(user => {
            res.redirect('/login')
          })
          .catch(err => console.log(err))
        }))
      }
    });
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/success',
    failureRedirect: '/errors',
    failureFlash: true
  })(req, res, next);
});

module.exports = router;