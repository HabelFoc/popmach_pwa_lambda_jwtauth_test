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

const secretKey = 'thesecretkey098123poiqwemnbzxc';

module.exports.auth = async (event) => {


  // authentication
  if (event.httpMethod === "POST" && event.path === "/auth") {

    if (event.headers.Authorization.split(" ")[1]) {

      const token = event.headers.Authorization.split(" ")[1];

      try {
        const decoded = jwt.verify(token, secretKey);

        const email = decoded.data.user.email;



        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Lambda Trigger Successfully. User SignIn.',
            data: decoded,
            authenticated: true
          }),
        };


      } catch (err) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'UnAuthorized. Authorization failed.',
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

    const { username, email } = JSON.parse(event.body);

    // check user on databse
    try {
      const document = await User.find({ email: email });
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Lambda Trigger Successfully. User SignIn.',
          data: document,
          authenticated: true
        }),
      };
    } catch (err) {
      // signin new user
      try {
        const token = await jwt.sign({ user: { username, email } }, secretKey)

        await User({ username, email, token, date_created: Date.now() }).save();

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Lambda Trigger Successfully. Sign New User Success.',
            data: { username, email, token },
            authenticated: true
          }),
        };

      } catch (err) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: `An error occurred. Error: ${err}`,
            authenticated: false
          }),
        };
      }
    }










  }

};
