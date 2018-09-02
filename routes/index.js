const express = require('express');
const router = express.Router();
const User = require('../modals/user');
const middleware = require('../middleware');
const jwt = require('jsonwebtoken');

// GET Login
router.get('/login', middleware.isLoggedIn ,(req, res, next) => {
    return res.render('login');
});

// POST Login
router.post('/login', (req, res, next) => {
    if(req.body.email && req.body.password) {
        User.authenticate(req.body.email, req.body.password, (err, result) => {
            if(err || !result) {
                console.log(err);
                console.log('Please put in the right password or email');
            } 
            req.session.userId = result._id;
            res.cookie('chatname', result.chatName);
            console.log('User session id: ' + req.session.id);
            return res.redirect('/about');
        });
    } else {
        console.log('You cannot leave these fields blank');
    }
});

// GET register
router.get('/register', (req, res, next) => {
    return res.render('register');
})

// POST register
router.post('/register', (req, res, next) => {
    if(req.body.name && req.body.chatName && req.body.email && req.body.password && req.body.confirmPassword) {
        if(req.body.password != req.body.confirmPassword) {
            console('Please try again!');
        }
        // create object with form input
        let userData = {
            name: req.body.name,
            chatName: req.body.chatName,
            email: req.body.email,
            password: req.body.password
        }
        User.create(userData, (err, result) => {
            if(err) {
                console.log('Something goes wrong when inserting data')
            } else {
                console.log(result.name);
                req.session.userId = result._id;
                console.log(req.session.userId);
                res.cookie('chatname', result.chatName);
                return res.redirect('/about');
            }
        });
    } else {
        console.log('Something is wrong here');
    }
});

// Get about
router.get('/about', (req, res, next) => {
    User.findById(req.session.userId)
        .exec((err, result) => {
            if (err) {
                console.log(err);
            } else {
                let token = jwt.sign({username: result.chatName}, 'kjsadfnalskdf');
                console.log(token);
                return res.render('about', {name: result.name, chatName: result.chatName, email: result.email});
            }
        }
    );  
});

router.get('/logout', (req, res, next) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.log(err);
            }
            res.clearCookie('chatname');
            return res.redirect('/login')
        });  
    } 
});


module.exports = router;