"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var express = require("express");
var mysql = require('../mysql');
var jwt = require("jsonwebtoken");
var passport = require("passport");
var passportJWT = require("passport-jwt");
var bcrypt = require('bcrypt');
var saltRounds = 10;
var authentication = express.Router();
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;
var users;
var jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    secretOrKey: 'tasmanianDevil'
};
var strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
    console.log('payload received', jwt_payload);
    var user = users[_.findIndex(users, { id: jwt_payload.id })];
    if (user) {
        next(null, user);
    }
    else {
        next(null, false);
    }
});
passport.use(strategy);
authentication.post("/login", function (req, res) {
    var name = "";
    var pass = "";
    if (req.body.username && req.body.password) {
        name = req.body.username;
        pass = req.body.password;
    }
    var query = "select * from `user`";
    var connection, user;
    mysql.pool.getConnection()
        .then(function (conn) {
        connection = conn;
        return connection.query(query);
    })
        .then(function (_users) {
        users = _users;
        var user = users[_.findIndex(users, { username: name })];
        if (!(user != null))
            res.status(401).json({ message: "no such user found" });
        bcrypt.compare(pass, user.password).then(function (passwordMatch) {
            if (passwordMatch) {
                var payload = { id: user.id };
                var token = jwt.sign(payload, jwtOptions.secretOrKey);
                res.json({ message: "ok", token: token });
            }
            else
                res.status(401).json({ message: "passwords did not match" });
        });
    })
        .catch(function (err) {
        if (connection && connection.end)
            connection.release();
        res.status(500).json({ message: err });
        throw err;
    });
});
authentication.get("/secret", passport.authenticate('jwt', { session: false }), function (req, res) {
    res.json("Success! You can not see this without a token");
});
authentication.get("/secretDebug", function (req, res, next) {
    console.log(req.get('Authorization'));
    next();
}, function (req, res) {
    res.json("debugging");
});
function addUserToDB() {
    bcrypt.hash("shenkarYoker5", saltRounds).then(function (hash) {
        mysql.pool.getConnection()
            .then(function (conn) {
            conn.query("INSERT INTO `user`(`username`, `password`) VALUES ('sswisa','" + hash + "')");
        });
    });
}
module.exports = authentication;
//# sourceMappingURL=authentication.js.map