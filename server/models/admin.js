const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var AdminSchema = new mongoose.Schema( {
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    usertype: {
        type: String
    }
},
{ usePushEach: true }
);

// toJSON 
//returns {_id: a234jfhasdf4h34, username: user}
AdminSchema.methods.toJSON = function() {
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject, ['_id', 'username']);
};

// admin.generateAuthToken
// generates auth token for the admin, adding it to the users' tokens array and returning the token
AdminSchema.methods.generateAuthToken = async function () {

    var user = this;
    var access = 'auth';
    var token = await jwt.sign({
        _id: user._id.toHexString(),
        expiry: Date.now() + 2 * 60 * 60 * 1000 // expires in 2 hours
    },process.env.JWT_SECRET).toString();

    user.tokens.push({
        token
    });

    try {
        await user.save();
    }
    catch (e) {
        console.log(e);
        throw new Error();
    }
    return token;
};

// admin.removeToken
// removes token from the tokens array
AdminSchema.methods.removeToken = function (token) {
    var user = this;

    return user.update({
        $pull: {
            tokens : {token}
        }
    });
};

// Admin.findByToken
// verifies the token and finds user with that token
AdminSchema.statics.findByToken = async function(token) {
    const Admin = this;
    let decoded = await jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.expiry < Date.now()) {
        throw new Error();
        return;
    }
    let user = await Admin.findOne({'_id': decoded._id,
        'tokens.token' : token
    });
    return user;
};

// Admin.login
// logs in a user, returning an auth token for the session
AdminSchema.statics.login = async function (username, password) {
    const Admin = this;
    const user = await Admin.findByUserAndPass(username, password);
    const token = await user.generateAuthToken();
    return token;
}

//Admin.findByUserAndPass
// given a username and password, finds the user or throws an error if couldn't find user
AdminSchema.statics.findByUserAndPass = async function (username, password) {
    const Admin = this;
    const user = await Admin.findOne({username, password});
    if (!user) throw new Error();
    return user;
};


var Admin = mongoose.model('Administrator', AdminSchema);

module.exports = {Admin};