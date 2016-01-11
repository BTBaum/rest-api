// BASE SETUP
// Calling Packages
var User = require('./modules/user');
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser'); // get body-parser
var morgan = require('morgan'); // used to see requests
var mongoose = require('mongoose'); // for working w/ our database
var port = process.env.PORT || 8080; // set the port for our app

// Connecting to our database (locally)
mongoose.connect('mongodb://localhost:27017/myDatabase');

// App Configuration
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

// Middleware to use for all requests
apiRouter.use(function(req, res, next) {
  // do logging
  console.log('Somebody just came to our app!');

  // this is where users will be authenticated
  next();
})

// Routes for API
// route for home page
app.get('/', function(req, res) {
  res.send('Welcome to the home page!')
});

// instance of the express router
var apiRouter = express.Router();

// test route to make sure everything is working
// accessed at GET http://localhost:8080/api
apiRouter.get('/', function(req, res) {
  res.json({message: 'Welcome to the API!!!'})
});

// More routes for our API will happen here
app.use('/api', apiRouter);

// Start the server
app.listen(port);
console.log('Magic is happening on port ' + port);

// start server with command: $ nodemon server.js
