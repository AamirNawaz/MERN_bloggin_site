var express = require("express");
var router = express.Router();
var jwt = require("jsonwebtoken");
const { token } = require("morgan");
const { route } = require(".");
const SECRETKEY = "Qwerty@2345";

//password encryption
const bcrypt = require("bcryptjs");
var salt = bcrypt.genSaltSync(10);

//importing User Model
const User = require("../models/User");

//TokenVerification
const varifyTheToken = (req, res, next) => {
  const bearer = req.headers["authorization"];
  if (bearer) {
    const bearerToken = bearer.split(" ");
    const token = bearerToken[1];

    jwt.verify(token, SECRETKEY, (err, data) => {
      if (err) {
        res.sendStatus(403);
      }
      req.userData = data;
      next();
    });
  } else {
    res.sendStatus(403);
  }
};

//login function
router.post("/login", function (req, res, next) {
  const { email, password } = req.body;
  User.findOne({
    where: {
      email: email,
    },
  })
    .then((user) => {
      if (!user) {
        res.json({
          status: 201,
          message: "User Email not found in our Record!",
        });
      }

      const hash = user.dataValues.password;
      bcrypt.compare(password, hash, function (err, response) {
        if (response === true) {
          const userData = {
            email,
          };

          jwt.sign(userData, SECRETKEY, { expiresIn: "1h" }, (err, token) => {
            if (err) {
              res.json({
                status: 201,
                message: "Faild to Generate Token",
              });
            }
            res.json({
              token,
            });
          });
        } else {
          res.json({
            status: 201,
            message: "You have entered wrong password!",
          });
        }
      });
    })

    .catch((err) => {
      res.json({
        status: 201,
        message: err.message,
      });
    });

  // if (email === "aamir@gmail.com" && password === "aamir") {
  //   const userData = {
  //     email,
  //   };

  //   jwt.sign(userData, SECRETKEY, (err, token) => {
  //     if (err) {
  //       res.sendStatus(403);
  //     }
  //     res.json({
  //       token,
  //     });
  //   });
  // } else {
  //   res.sendStatus(403);
  // }
});

//User signup
router.post("/signup", async function (req, res) {
  const reqBody = req.body;

  if (req.body.data.password === req.body.data.confirmPassword) {
    var hashPassword = bcrypt.hashSync(req.body.data.password, salt);
  } else {
    res.status(201).send({
      message: "Password Not match with Confirm password!",
    });
  }

  const user = await User.create({
    fullname: reqBody.data.fullname,
    email: reqBody.data.email,
    password: hashPassword,
  })
    .then((user) => {
      if (user) {
        res.status(200).send({
          message: "User Registered succesffuly!",
        });
      }
    })
    .catch((err) => {
      res.status(201).send({
        message: "User Already Exist against this email!",
      });
    });
});

//forgot password
router.post("/forgot", function (req, res) {
  const reqBody = req.body;
  console.log(reqBody);
});

//delete user
router.post("/delete", varifyTheToken, (req, res) => {
  console.log("delete user", req.userData);
  res.send("User Deleted");
});

module.exports = router;
