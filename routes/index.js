const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
    res.status(200);
    res.render('index.ejs');
  }) 

router.get('/about', function(req, res) {
    res.status(200);
    res.render('about.ejs');
  })
  
router.get('/success', function(req, res) {
    res.status(200);
    res.send('Correct!')
  })

router.get('/errors', function(req, res) {
    res.status(400);
    res.send('Something went wrong...')
  }) 

module.exports = router;