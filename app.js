var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var livereload = require('livereload');
var connectLiveReload = require('connect-livereload');

var app = express();

var indexRouter = require('./routes/index');
var aboutRouter = require('./routes/about');

// setup livereload to refresh page on save
const liveReloadServer = livereload.createServer();
liveReloadServer.watch([__dirname + '/views', __dirname + '/public']);
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
    delete require.cache['./app.js']
  }, 100);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(connectLiveReload());

app.use(express.static('public'))
app.use('/', indexRouter);
app.use('/about', aboutRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

module.exports = app;
