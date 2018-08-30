const mongoose = require('mongoose');
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
            } else {
                return callback(null, result);
            }
        });
}

let User = mongoose.model('User', UserSchema);
module.exports = User;