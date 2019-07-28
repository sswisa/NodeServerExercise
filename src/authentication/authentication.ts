import * as _ from "lodash";
import * as express from "express";

let mysql = require('../mysql');
import {IUser} from "../models/interfaces";
import * as jwt from "jsonwebtoken";
import * as passport from "passport";
import * as passportJWT from "passport-jwt";

let bcrypt = require('bcrypt');

const saltRounds = 10;
const authentication = express.Router();

let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;
let users;

let jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    secretOrKey: 'tasmanianDevil'
};

let strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
    console.log('payload received', jwt_payload);
    // usually this would be a database call:
    let user = users[_.findIndex(users, {id: jwt_payload.id})];
    if (user) {
        next(null, user);
    } else {
        next(null, false);
    }
});

passport.use(strategy);

authentication.post("/login", function (req, res) {
    //addUserToDB();

    let name: string = "";
    let pass: string = "";

    if (req.body.username && req.body.password) {
        name = req.body.username;
        pass = req.body.password;
    }

    // usually this would be a database call:
    let query: string = "select * from `user`";
    let connection, user;

    mysql.pool.getConnection()
        .then((conn) => {
            connection = conn;
            return connection.query(query);
        })
        .then((_users) => {
            users = _users;
            let user = users[_.findIndex(users, {username: name})];
            if (!(user != null)) res.status(401).json({message: "no such user found"});
            bcrypt.compare(pass, user.password).then((passwordMatch: boolean) => {
                if (passwordMatch) {
                    // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
                    let payload = {id: user.id};
                    let token = jwt.sign(payload, jwtOptions.secretOrKey);
                    res.json({message: "ok", token: token});
                }
                else res.status(401).json({message: "passwords did not match"});
            });
        })
        .catch((err) => {
            if (connection && connection.end) connection.release();
            res.status(500).json({message: err});
            throw err;
        });
});

authentication.get("/secret", passport.authenticate('jwt', {session: false}), function (req, res) {
    res.json("Success! You can not see this without a token");
});

authentication.get("/secretDebug",
    function (req, res, next) {
        console.log(req.get('Authorization'));
        next();
    }, function (req, res) {
        res.json("debugging");
    });

function addUserToDB() {
    bcrypt.hash("shenkarYoker5", saltRounds).then((hash) => {
        mysql.pool.getConnection()
            .then((conn) => {
                conn.query("INSERT INTO `user`(`username`, `password`) VALUES ('sswisa','" + hash + "')");
            })
    });
}

module.exports = authentication;