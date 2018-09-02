const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    chatName: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
});

UserSchema.statics.authenticate = function(email, password, callback) {
    User.findOne({ email: email })
        .exec((err, result) => {
            if (err) {
                return callback(err);
            } else if (!result) {
                return callback(err);
            }
            bcrypt.compare(password, result.password, (err, res) => {
                if(res === true) {
                    return callback(null, result);
                } else {
                    return callback(err);                
                }
            });
        }
    );
}

UserSchema.pre('save', function(next) {
    let user = this;
    let password = user.password;
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    });
});

let User = mongoose.model('User', UserSchema);
module.exports = User;