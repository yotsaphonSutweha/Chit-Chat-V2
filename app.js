const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

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

app.listen(8888, () => {
    console.log('Registeration system is running on localhost:8888');
});
