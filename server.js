var express = require('express');
var exphbs = require('express-handlebars');
var hbs = require('./helpers/handlebars')(exphbs);
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;

const mongoHost = 'classmongo.engr.oregonstate.edu';
const mongoPort = 27017;
const mongoUser = 'cs290_luuph';
const mongoPassword = '9';
const mongoDBName = 'cs290_luuph';
const mongoURL = 'mongodb://' + mongoUser + ':' + mongoPassword + '@' +
                  mongoHost + ':' + mongoPort + '/' + mongoDBName;

var mongoDB = null;
var allUsers = null;
var currentUser = null;

var app = express();
var port = process.env.PORT || 3012;

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(bodyParser.json());
app.use(express.static('public'));


/**
 * Make routes for whatever we make in the <nav> section (aka, the .navlinks)
 * The list of links is not final yet, as we need to all agree what's on the list.
 *
 * These below are just my proposal and are subject to change.
 */

// "Home" page is the default page every user ends up on.
// It should display only the goal for the day and the user's progress on that day.
app.get('/', function(req, res, next) {
  res.status(200).render('home', {
    userList: allUsers,
    user: currentUser,
    hasSidebar: true,
    activities: currentUser.activities,
    goals: currentUser.goals
  });
});

// "About" page talks about us and the project itself. It's a tutorial for new
// users how to use the web app.
app.get('/about', function(req, res, next) {
  res.status(200).render('about', {
    user: currentUser
  });
});

// "Calendar" page will show a calendar where the user's workout plans are displayed
app.get('/calendar', function(req, res, next) {
  res.status(200).render('calendar', {
    user: currentUser,
    days: currentUser.days
  });
});

// "Leaderboard" page. I'm not sure about this. I just want to find something to
// integrate the database and multi-account into the web app. IMO, this is
// expected to change.
app.get('/leaderboard', function(req, res, next) {
  res.status(200).render('leaderboard', {
    userList: allUsers,
    user: currentUser
  });
});

app.post('/calendar/update', function(req, res, next) {
  if (req.body && req.body.weekday && req.body.content) {
    mongoDB.collection('users').updateOne(
      { name: currentUser.name, "days.weekday": req.body.weekday },
      { $set: { "days.$.content" : req.body.content }}
    );
    res.status(200).send('New plan created');
    updateUsers();
  } else {
    res.status(400).send('Bad request');
  }
});

app.post('/goals/remove', function(req, res, next) {
  if (req.body && req.body.goal) {
    mongoDB.collection('users').updateOne(
      { name: currentUser.name, "goals.description": req.body.goal },
      { $pull: {"goals" : {"description":req.body.goal}}}
    );
    res.status(200).send('Removed goal');
    updateUsers();
  } else {
    res.status(400).send('Bad request');
  }
});

app.post('/goals/add', function(req, res, next) {
  if(req.body && req.body.goal) {
    console.log(req.body);
    mongoDB.collection('users').updateOne(
      { name: currentUser.name },
      { $addToSet: {"goals" : req.body}}
    );
    res.status(200).send('Added goal.');
    updateUsers();
  } else {
    res.status(400).send('Bad request');
  }

});

app.get('*', function(req, res) {
  res.status(404).render('404', {
    user: currentUser
  });
});


function updateUsers() {
  var userCollection = mongoDB.collection('users');
  userCollection.find().toArray(function (err, userTable) {
    if (err) {
      throw err;
    }
    allUsers = userTable;
    currentUser = allUsers[0];
  });
}

MongoClient.connect(mongoURL, function(err, client) {
  if (err) {
    throw err;
  }
  mongoDB = client.db(mongoDBName);

  var userCollection = mongoDB.collection('users');
  userCollection.find().toArray(function (err, userTable) {
    if (err) {
      throw err;
    }
    allUsers = userTable;
    currentUser = allUsers[0];
    // console.log(currentUser);
  });

  app.listen(port, function() {
    console.log("== Server is listening on port", port);
  });
});
