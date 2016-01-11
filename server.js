//  CALLING PACKAGES ===========================================================
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser'); // get body-parser
var morgan = require('morgan'); // used to see requests
var mongoose = require('mongoose'); // for working w/ our database
var port = process.env.PORT || 8080; // set the port for our app

// BASE SETUP ==================================================================
var User = require('./modules/user');

// APP CONFIGURATION ===========================================================
// use body parser to grab info from POST requests
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

// Configure app to handle CORS requests
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \ Authorization');
  next();
});

// Log all requests to the console
app.use(morgan('dev'));

// MongoDB
// Connecting to our database (locally)
mongoose.connect('mongodb://localhost:27017/myDatabase');

// ROUTERS =====================================================================
var apiRouter = express.Router();

// API ROUTES ==================================================================
// accessed at GET http://localhost:8080/api

// Middleware to use for all requests
apiRouter.use(function(req, res, next) {
  console.log('Somebody just came to our app!');
  // this is where users will be authenticated
  next();
});

// test route to make sure everything is working
// accessed at GET http://localhost:8080/api
apiRouter.get('/', function(req, res) {
  res.json({message: 'horray! welcome to our api!!!'})
});

// api/users
apiRouter.route('/users')
  // create a user (accessed at localhost:8080/api/users)
  .post(function(req, res) {
    // create a new instance of the User model
    var user = new User();
    // set the users info (comes from the request)
    user.name = req.body.name;
    user.username = req.body.username;
    user.password = req.body.password;

    // save the user and check for errors
    user.save(function(err) {
      if (err) {
        if (err.code === 11000) {
          return res.json({ sucess: false, messaage: 'A user with that username already exists.'});
        } else {
          return res.send(err);
        }
      }
      res.json({ message: 'User created!' });
    });

  });



// PUBLIC ROUTES ===============================================================
// route for home page
app.get('/', function(req, res) {
  res.send('Welcome to the home page!')
});

// REGISTER OUR ROUTES =========================================================
// More routes for our API will happen here
app.use('/api', apiRouter);

// START THE SERVER ============================================================
app.listen(port);
console.log('Magic is happening on port ' + port);

// start server with command: $ nodemon server.js
