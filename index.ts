import * as express from "express";
import * as bodyParser from "body-parser";
import * as morgan from "morgan";
import * as passport from "passport";

let app = express();
let port = process.env.PORT || 8081;

// get our request parameters
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// log to console
app.use(morgan('dev'));

// Use the passport package in our application
app.use(passport.initialize());

app.use(function (req: any, res: any, next: any) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "authorization, content-type, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, PATCH, OPTIONS");
    next();
});

app.use(require('./src/mysql'));
app.use(require('./src/authentication/authentication'));


// demo Route (GET http://localhost:8081)
app.get('/', (req: any, res: any) => {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

// Start the server
app.listen(port);
console.log("Server runs on port: " + port);