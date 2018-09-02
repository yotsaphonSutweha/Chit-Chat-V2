const isLoggedIn = (req, res, next) => {
    if(req.session && req.session.userId) {
        return res.redirect('/about');
    } 
    return next();
}

module.exports.isLoggedIn = isLoggedIn;