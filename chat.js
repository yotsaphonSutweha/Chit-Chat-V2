const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const cookieParser = require('cookie-parser');
const chatRoom = io.of('/chatroom');
r = require('rethinkdb');

let name = '';
app.use(cookieParser());
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
    name = req.cookies.chatname;
    console.log(name);
});

// app.get('/hello', (req, res) => {
//     res.sendFile(__dirname + '/hello.html');
// });

io.sockets.on('connection', (socket) => {
    var c = null;
    r.connect({host: 'localhost', port: 28015, db: 'chat'}, (err, conn) => {
        if (err) throw err;
        c = conn;
        socket.on('room', (room) => {

            socket.join(room);
            io.sockets.in(room).emit('join', 'A user has joined the room');

            socket.on('typing', (data) => {
                io.sockets.in(room).emit('typing', data);
            })
           
            socket.on('messages', (data) => {
                r.table('msgs').insert({
                    name: data.nickname,
                    msg: data.input,
                    timestamp: new Date()
                }).run(c, (err, result) => {
                    if (err) throw err;
                    r.table('msgs').get(result.generated_keys[0]).run(c, (err, result) => {
                        if (err) throw err;
                        io.sockets.in(room).emit('messages', {username: name, msg: result.msg});
                    });
                });
            });

            socket.on('show', () => {
                r.table('msgs').run(c, (err, cursor) => {
                    if (err) throw err;
                    cursor.toArray((err, result) => {
                        if (err) throw err;
                        for(let i = result.length - 1; i >= 0; i--) {
                            io.sockets.in(room).emit('messages', result[i].msg);
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

http.listen(3000, '127.0.0.1');
