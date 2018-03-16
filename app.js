var express = require('express');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var simpleOauthModule = require('simple-oauth2')

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

const oath2trakt = simpleOauthModule.create({
  client:{
    id: 'dc5e44dfa4e2ed9123c5a8b446802acad6ce20bfd7ccf07ffe9b80b85327aa09',
    secret: 'bbb080674bbe76acca667bc51723017e0e6561584455a99254eaafb29d7c393e'
  },
  auth:{
    tokenHost:'https://trakt.tv',
    tokenPath: '/oauth/token',
    authorizePath:'/oauth/authorize'
  } 
});

// Authorization uri definition
const authorizationUri = oath2trakt.authorizationCode.authorizeURL({
  redirect_uri: 'http://localhost:8000/traktCallBack',
  scope: '',
  state: '',
});

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', index);
//app.use('/users', users);

// Initial page redirecting to Github
app.get('/auth', (req, res) => {
  console.log(authorizationUri);
  res.redirect(authorizationUri);
});


// Callback service parsing the authorization token and asking for the access token
app.get('/traktCallBack', async (req, res) => {
  const code = req.query.code;
  console.log(code);
  const tokenConfig = {
    code: code,
    redirect_uri: 'http://localhost:8000/traktCallBack',
    scope: '' // also can be an array of multiple scopes, ex. ['<scope1>, '<scope2>', '...']
  };

  try {
    const result = await oath2trakt.authorizationCode.getToken(tokenConfig);

    console.log('The resulting token: ', result);

    const tokenObject = {
      'access_token': result.access_token,
      'refresh_token': result.refresh_token,
      'expires_in': result.expires_in
    };

    
    let token = oath2trakt.accessToken.create(tokenObject);

    return res.status(200).json(token)

  } catch(error) {
    console.error('Access Token Error', error.message);
    return res.status(500).json('Authentication failed');
  }
});

app.get('/api/movies', function(req, res){
  console.log("Movies")
})


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



app.listen(8000)
console.log("App started at port 8000")

module.exports = app;
