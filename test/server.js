var express = require("express");
var app = express();
var sticker = require("../lib/index.js")(app);
var stick = sticker.stick;

stick("checkLogin", function(req, res, next, params) {
	next(null);
});

stick("checkAvailability", function(req, res, next) {
	next(null);
});

var fetchUserData = stick("fetchUserData", ["checkLogin", "checkAvailability"], function(req, res, next, params) {
	next(null, {user: "jack"});
});

stick("displayUser", [fetchUserData], function(req, res, next, params) {
	res.end(params.user);
	next(true, params);
});

stick("overrideDisplayUser", ["displayUser"], function(req, res, params) {
	res.end();
	next(null, params);
});

stick("displayWall", function(req, res, next, params) {
	res.end("Wall !");
	next(null, params);
});

stick("displayAdmin", function(req, res, next, params) {
	res.end("Admin interface !");
	next(true, params);
});

/* --------------- SERVER CONFIG ------------------- */

app.configure(function() {
	this.use(express.bodyParser());
    this.use(app.router);
});

var err = sticker.addRoutes(__dirname + "/routes.js", {prod: true});

app.listen(8000);
console.log("server running...");

module.exports.sticker = sticker;
module.exports.err = err;
module.exports.fetchUserData = fetchUserData;