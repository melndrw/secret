require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const app = express();

mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ['password']
});

const User = mongoose.model('User', userSchema);

app.use(express.static('public'));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('home');
});

app
  .route('/register')
  .get((req, res) => {
    res.render('register');
  })
  .post((req, res) => {
    const newUser = new User({
      email: req.body.username,
      password: req.body.password,
    });
    newUser.save((err) => {
      if (!err) {
        res.render('secrets');
      } else {
        console.log(err);
      }
    });
  });
app
  .route('/login')
  .get((req, res) => {
    res.render('login');
  })
  .post((req, res) => {
    let user = req.body.username;
    let password = req.body.password;

    User.findOne({
        email: user,
      },
      (err, docs) => {
        if (!docs) {
          res.send('You are not registered yet');
        } else if (docs.password === password) {
          res.render('secrets');
        } else {
          res.send('You input a wrong password');
        }
      }
    );
  });

app.get('/submit', (req, res) => {
  res.render('submit');
});

app.listen(3000, () => {
  console.log('The server is started at port 3000');
});