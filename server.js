//  CALLING PACKAGES ===========================================================
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser'); // get body-parser
var morgan = require('morgan'); // used to see requests
var mongoose = require('mongoose'); // for working w/ our database
var port = process.env.PORT || 8080; // set the port for our app
var jwt = require('jsonwebtoken');
var superSecret = 'ilovescotchscotchyscotchscotch';
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

// PUBLIC ROUTES ===============================================================
// route for home page
app.get('/', function(req, res) {
  res.send('Welcome to the home page!')
});

// ROUTERS =====================================================================
// instance of express router
var apiRouter = express.Router();

// API ROUTES ==================================================================

// AUTHENTICATING USERS ========================================================
// route to authenticate a user
// accessed at GET http://localhost:8080/api/authenticate
apiRouter.post('/authenticate', function(req, res) {
  // find user
  // select the name username and password explicitly
  User.findOne({
    username: req.body.username
  }).select('name username password').exec(function(err, user) {
    if (err) throw err;

    // no user with that username was found
    if (!user) {
      res.json({
        success: false,
        message: 'Authentication failed. User not found.'
      });
    } else if (user) {
      // check if password matches
      var validPassword = user.comparePassword(req.body.password);
      if (!validPassword) {
        res.json({
          success: false,
          message: 'Authentication failed. Wrong password.'
        });
      } else {
        // if user is found and password is correct
        // create a token
        var token = jwt.sign({
          name: user.name,
          username: user.username
        }, superSecret, {
          expiresInMinutes: 1440 // expires in 24 hours
        });

        res.json({
          sucess: true,
          message: 'Enjoy your token!',
          token: token
        });
      }
    }
  });
});

// accessed at GET http://localhost:8080/api
// Middleware to use for all requests
// route middleware to verify token
apiRouter.use(function(req, res, next) {
  console.log('Somebody just came to our app!');
  // check header on url parameters or post params for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, superSecret, function(err, decoded) {
      if (err) {
        return res.status(403).send({
          success: false,
          message: 'Failed to authenticate token.'
        });
      } else {
        // if everything is good, dave to req for use in other routes
        req.decoded = decoded;

        next();
      }
    });
  } else {
    // if there is no token
    // return an HTTP res of 403 (access forbidden) and an err message
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });
  }
});

// test route to make sure everything is working
// accessed at GET http://localhost:8080/api
apiRouter.get('/', function(req, res) {
  res.json({message: 'horray! welcome to our api!!!'})
});

// Users Route
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
  })

  // Get all of the users (accessed at GET localhost:8080/api/users)
  .get(function(req, res) {
    User.find(function(err, users) {
      if (err) res.send(err);

      // return the users
      res.json(users);
    });
  });

apiRouter.route('/users/:user_id')
  // get specific user based on user id
  // (accessed at GET http://localhost:8080/api/users/:user_id)
  .get(function(req, res) {
    User.findById(req.params.user_id, function(err, user) {
      if (err) res.send(err);

      //return specific user with corresponding id
      res.json(user);
    });
  })

  // update the user with this id
  .put(function(req, res) {
    // use the user model to fiond the user we want to update
    User.findById(req.params.user_id, function(err, user) {
      if (err) res.send(err);

      // update the user info only if it is new info
      if (req.body.name) user.name = req.body.name;
      if (req.body.username) user.username = req.body.username;
      if (req.body.password) user.password = req.body.password;

      // save the user
      user.save(function(err) {
        if (err) res.send(err);

        // retrun message
        res.json({ message: 'User updated!' });
      });
    });
  })

  // delete the user with specific id
  .delete(function(req, res) {
    User.remove({
      _id: req.params.user_id
    }, function(err, user) {
      if (err) return res.send(err);

      //retrun mseeage
      res.json({ message: 'Sucessfully deleted'});
    });
  });




// REGISTER OUR ROUTES =========================================================
// More routes for our API will happen here
app.use('/api', apiRouter);

// START THE SERVER ============================================================
app.listen(port);
console.log('Magic is happening on port ' + port);

// start server with command: $ nodemon server.js
