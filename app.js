const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');
let chatRoom = io.of('/chatroom');
r = require('rethinkdb');

mongoose.connect('mongodb://localhost:27017/chatapp', {useNewUrlParser: true});
let db = mongoose.connection;
app.use(session({
    secret: 'kjvsdhgalsjd',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db
    })
}));
app.use(cookieParser());
app.use((req, res, next) => {
    res.locals.currentUser = req.session.userId;
    next();
});
db.on('error', console.error.bind(console, 'connection error: '));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( {extended: false} ));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

let routes = require('./routes/index');
app.use('/', routes);
// app.use((req, res, next) => {
//     let err = new Error('File not found');
//     err.status = 404;
//     next(err);
// });
// app.use((err, req, res, next) => {
//     res.status(err.status || 500);
//     res.render('error', {
//         message: err.message,
//         error: {}
//     });
// });

app.get('/chatroom', (req, res) => {
    res.sendFile(__dirname + '/index.html');
    name = req.cookies.chatname;
    console.log(req.cookies.chatname);
});
chatRoom.on('connection', (socket) => {
    var c = null;
    r.connect({host: 'localhost', port: 28015, db: 'chat'}, (err, conn) => {
        if (err) throw err;
        c = conn;
        socket.on('room', (room) => {
            socket.join(room);
            chatRoom.in(room).emit('join', 'A user has joined the room');
            
            socket.on('typing', (data) => {
                chatRoom.in(room).emit('typing', { username: data });
            });

            socket.on('messages', (data) => {
                r.table('msgs').insert({
                    name: data.nickname,
                    msg: data.input,
                    timestamp: new Date()
                }).run(c, (err, result) => {
                    if (err) throw err;
                    r.table('msgs').get(result.generated_keys[0]).run(c, (err, result) => {
                        if (err) throw err;
                        chatRoom.in(room).emit('messages', { username: result.name, msg: result.msg });
                    });
                });
            });

            socket.on('show', () => {
                r.table('msgs').run(c, (err, cursor) => {
                    if (err) throw err;
                    cursor.toArray((err, result) => {
                        if (err) throw err;
                        for(let i = result.length - 1; i >= 0; i--) {
                            chatRoom.in(room).emit('messages', result[i].msg);
                        }
                    });
                });
            });

            socket.on('delete', (data) => {
                console.log(data);
                r.table('msgs').run(c, (err, cursor) => {
                    if (err) throw err;
                    cursor.toArray((err, result) => {
                        if (err) throw err;
                        if (result.length > 0) {
                            r.table('msgs').delete({durability: "soft"}).run(c, (err) => {
                                if (err) throw err;
                            });
                        }  else {
                            console.log('The table is empty!');
                        }       
                    });
                });
            });
        }); 
    })
});

http.listen(8888, () => {
    console.log('Registeration system is running on localhost:8888');
});
