const isLoggedIn = (req, res, next) => {
    if(req.session.userId) {
        res.redirect('/about');
    }
    next();
}

module.exports.isLoggedIn = isLoggedIn;