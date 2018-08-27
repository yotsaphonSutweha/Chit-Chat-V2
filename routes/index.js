const express = require('express');
const router = express.Router();
const User = require('../modals/user');

router.get('/register', (req, res, next) => {
    res.render('register');
})

router.post('/register', (req, res, next) => {
    if(req.body.name && req.body.chatName && req.body.email && req.body.password && req.body.confirmPassword) {
        
    }
});

module.exports = router;