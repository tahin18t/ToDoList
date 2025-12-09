const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const jwtSecretKey = process.env.JWT_SECRET_KEY;

module.exports = (req, res, next) => {
    let token = req.headers['token-key'];
    jwt.verify(token, jwtSecretKey, (err, decode) => {
        if (err) {
            res.status(401).send({
                status: "Unauthorized"
            })
        }
        else {
            // copy username from decoded json to request header
            req.headers.UserName = decode.data.UserName;
            next()
        }
    })
}