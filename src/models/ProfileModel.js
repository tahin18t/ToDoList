const mongoose = require('mongoose');
const UserSchema = mongoose.Schema({
    FirstName: {type:String, required:true},
    LastName: {type:String, required:true},
    UserName: {type:String, unique:true},
    Email: {type:String, unique:true},
    Phone: {type:String, unique:true},
    Password: {type:String, required:true},
    RegDate: {type:Date, default:Date.now, required:false},
}, {versionKey: false});

const ProfileModel = mongoose.model('Profile', UserSchema)  // 'Profile' is collection name of database
module.exports = ProfileModel;