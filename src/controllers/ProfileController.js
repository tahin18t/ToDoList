const ProfileModel = require('../models/ProfileModel');
const jwt = require("jsonwebtoken");

const jwtSecretKey = process.env.JWT_SECRET_KEY || 'SecretKey123';

exports.CreateProfile = (req, res) => {
    ProfileModel.create(req.body)
        .then((user) => res.status(200).json({
            status: 'Registration Successfully',
            data: user,
        }))
        .catch((error) => res.status(400).json({
            status: 'Fail to Registration',
            data: error,
        }));
}

exports.UserLogin = (req, res) => {
    let UserName = req.body.UserName;
    let password = req.body.Password;

    ProfileModel.findOne({ UserName: UserName, Password: password })
        .select("FirstName LastName UserName Phone Email")
        .then((user) => {
            if (user) {
                // create auth
                let payload = {
                    exp: Math.floor(Date.now() / 1000)+(24*60*60),  //24 hours
                    data:user
                }
                let token = jwt.sign(payload, jwtSecretKey);
                res.status(200).json({
                    status: 'success',
                    token: token,
                    data: user
                })
            }
            else {
                res.status(404).json({
                    status: 'error',
                    data: 'Not Found'
                })
            }
        })
        .catch((err) => {
            res.status(500).json({
                status: 'error',
                data: err
            })
        })
}

exports.SelectProfile = (req, res) => {
    ProfileModel.findOne({ UserName: req.headers.UserName })
        .select("FirstName LastName UserName Phone Email")
        .then((user) => res.status(200).json({
            status: 'success',
            data: user
        }))
        .catch((error) => res.status(400).send({
            status: 'fail',
            data: error
        }));
}

exports.UpdateProfile = (req, res) => {
    const UserName = req.headers.UserName;
    const updateProfile = {};

    const allowFields = ["FirstName", "LastName", "Email", "Phone", "Password"];
    allowFields.forEach((field) => {
        if(req.body[field]){
            updateProfile[field] = req.body[field];
        }
    })

    ProfileModel.updateOne({ UserName: UserName}, {$set: updateProfile })
        .then((result) => {
            if (result.modifiedCount>0) {
                res.status(200).json({
                    status: 'success',
                    data: result,
                })
            }
            else {
                res.status(404).json({
                    status: 'fail',
                    data: "No change made or user not found"
                })
            }
        })
        .catch((err) => {
            res.status(500).json({
                status: 'error',
                data: err
            })
        })
}
