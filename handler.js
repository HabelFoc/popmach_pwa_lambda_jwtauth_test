'use strict';

const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');

mongoose.connect('mongodb://habelfoc:test123@ds221416.mlab.com:21416/popmach-users-dev', { useNewUrlParser: true }).then(() => console.log('mongo connected!')).catch(err => console.log(err));

const Schema = mongoose.Schema;

const UserScheme = new Schema({
  username: String,
  email: String,
  token: String,
  date_created: Date
});

const User = mongoose.model('users', UserScheme);

const secretKey = process.env.JWT_SECRET;

module.exports.auth = async (event) => {


  // authentication
  if (event.httpMethod === "POST" && event.path === "/auth") {

    const headerToken = event.headers.Authorization.split(" ")[1];

    if (headerToken !== "") {

      try {
        const decoded = jwt.verify(headerToken, secretKey);

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Lambda Trigger Successfully. User Verified.',
            data: decoded,
            authenticated: true
          }),
        };


      } catch (err) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'UnAuthorized. Authorization failed.',
            err: err,
            authenticated: false
          }),
        };
      }



    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'UnAuthorized. No Token Specify.',
          authenticated: false
        }),
      };
    }
  }


  // sign/signup
  if (event.httpMethod === "POST" && event.path === "/signin") {

    // check user on databse
    try {
      const document = await User.find({ email: JSON.parse(event.body).email });

      if (document.length > 0) {
        let { username, email, token } = document[0];
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Lambda Trigger Successfully. User Exist, Signing User In.',
            data: { username, email, token },
            authenticated: true
          }),
        };
      } else {
        const { username, email } = JSON.parse(event.body)
        let token = await jwt.sign({ user: { username, email } }, secretKey)

        await User({ username, email, token, date_created: Date.now() }).save();

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Lambda Trigger Successfully. New User Created.',
            data: { username, email, token },
            authenticated: true
          }),
        };
      }
    } catch (err) {
      // signin new user
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `An error occurred. Error: ${err}`,
          authenticated: false
        }),
      };
    }










  }

};
