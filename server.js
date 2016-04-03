var express   = require('express');
var app       = express();
var http = require('http');
var server = http.createServer(app);
var port      = process.env.PORT || 8080;
var mongoose  = require('mongoose');
var passport  = require('passport');
var flash     = require('connect-flash');
var morgan    = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require ('body-parser');
var session = require('express-session');

var configDB = require('./config/database.js');
require('./config/passport')(passport);
var trigger  = require('./config/trigger');

mongoose.connect(configDB.url);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());

app.set('view engine', 'ejs');

app.use(session({
  secret: 'cis197rocks'
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use("/css", express.static(__dirname + '/css'));
app.use("/images", express.static(__dirname + '/images'));
app.use("/js", express.static(__dirname + '/js'));
require('./app/routes.js')(app, passport, trigger);

app.listen(port);
console.log('ITS HAPPENING (on port ' + port);

//Video Chat code
var io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket) {


    socket.on('message', function(message) {
        socket.broadcast.emit('message', message);
    });

   socket.on('chat', function(message) {
        socket.broadcast.emit('chat', message);
    });

    socket.on('create or join', function(room) {
        var numClients = io.sockets.clients(room).length;

        if (numClients === 0) {
            socket.join(room);
            socket.emit('created', room);
        } else if (numClients == 1) {

            io.sockets. in (room).emit('join', room);
            socket.join(room);
            socket.emit('joined', room);
        } else {
            socket.emit('full', room);
        }
        socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
        socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);

    });

});