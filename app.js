require('dotenv').config()
const express = require('express');
const path = require('path');
const port = process.env.PORT || 3000;
const app = express();
const mongoose = require('mongoose')
const encrypt = require('mongoose-encryption')

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
})

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = new mongoose.model('User', userSchema)

app.listen(port, () => {
  console.log('Server running at port ' + port);
})

app.get('/', function (req, res) {
  res.render('home')
});

app.get('/login', function (req, res) {
  res.render('login')
});

app.post('/login', function (req, res) {
  const username = req.body.username
  const password = req.body.password
  User.findOne({
    email: username
  }, function (err, foundUser) {
    if (err) {
      console.log(err)
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          res.render('secrets')
        }
      }
    }
  })
})

app.get('/register', function (req, res) {
  res.render('register')
});

app.post('/register', function (req, res) {
  var username = req.body.username
  var password = req.body.password
  const newUser = new User({
    email: username,
    password: password
  })
  newUser.save(function (err) {
    if (err) {
      console.log(err)
    } else {
      res.render('secrets')
    }
  })
})