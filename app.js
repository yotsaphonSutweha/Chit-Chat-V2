const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const hello = io.of('/hello');
r = require('rethinkdb');



app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/hello', (req, res) => {
    res.sendFile(__dirname + '/hello.html');
});

io.sockets.on('connection', (socket) => {
    var c = null;
    r.connect({host: 'localhost', port: 28015, db: 'chat'}, (err, conn) => {
        if (err) throw err;
        console.log('a user connected');
        console.log('Db connection is made');
        c = conn;
        socket.on('room', (room) => {
            socket.join(room);
        
            io.sockets.in(room).emit('join', 'A user has joined the room');

            socket.on('typing', (data) => {
                io.sockets.in(room).emit('typing', data);
            })
           
            socket.on('messages', (data) => {
                console.log(data.input);
                r.table('msgs').insert({
                    name: data.nickname,
                    msg: data.input
                }).run(c, (err, result) => {
                    if (err) throw err;
                    console.log(JSON.stringify(result, null, 2));
                    console.log(result.generated_keys[0]);
                    r.table('msgs').get(result.generated_keys[0]).run(c, (err, result) => {
                        if (err) throw err;
                        io.sockets.in(room).emit('messages', {username: result.name, msg: result.msg});
                    });
                });
            });

            socket.on('show', (data) => {
                console.log(data);
                r.table('msgs').run(c, (err, cursor) => {
                    if (err) throw err;
                    cursor.toArray((err, result) => {
                        if (err) throw err;
                        console.log(JSON.stringify(result, null, 2));
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


// hello.on('connection', (socket) => {
//     console.log('someone is in hello namespace');
// });

http.listen(3000, '127.0.0.1');
