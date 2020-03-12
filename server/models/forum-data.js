const mongoose = require('mongoose');

var forumData = new mongoose.Schema( {
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true
    },
    data : {

    }
}   