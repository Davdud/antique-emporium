if(process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY
const db = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;

const express = require('express')
const app = express()
const fs = require('fs');
const stripe = require('stripe')(stripeSecretKey)
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose');

//Database
mongoose.connect(db, { useNewUrlParser: true })
  .then(() => console.log("Connected"))
  .catch(err => console.log("Error: ", err));

app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.static('public'))
app.use(expressLayouts)
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/' , require('./routes/index'));

app.get('/shop', function(req, res) {
    fs.readFile('items.json', function(err, data) {
      if(err) {
        res.status(500).end()
      } else {
        res.render('store.ejs', {
          stripePublicKey: stripePublicKey,
          items: JSON.parse(data),
        })
      }
    })
}) 

app.post('/purchase', function(req, res) {
  fs.readFile('items.json', function(err, data) {
    if(err) {
      res.status(500).end()
    } else {
      const itemsJson = JSON.parse(data)
      const itemsArray = itemsJson.stock.concat(itemsJson)
      let total = 0
      req.body.items.forEach(function(item) {
        const itemJson = itemsArray.find(function(i) {
          return i.id == item.id
        })
        total = total + itemJson.price * item.quantity
      })

      stripe.charges.create({
        amount: total,
        source: req.body.stripeTokenId,
        currency: 'usd'
      }).then(function() {
        console.log('Charge Successful')
        res.json({ message: 'Successfully purchased items' })
      }).catch(function() {
        console.log('Charge Fail')
        res.status(500).end()
      })
    }
  })
}) 

// Users
app.use('/' , require('./routes/users'));

app.listen(PORT, console.log(`Server running at port ${PORT}`))