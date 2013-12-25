var express = require("express");
var app = express();
var stick = require("../lib/index.js").use(app);

stick("checkLogin", function(next, params, req, res) {
	next(null);
});

stick("checkAvailability", function(next) {
	next(null);
});

var fetchUserData = stick("fetchUserData", ["checkAvailability"], function(next, params) {
	next(null, {user: "jack"});
});

stick("displayUser", ["checkLogin", fetchUserData], function(next, params, req, res) {
	res.end(params.user);
	next(true, params);
});

stick("overrideDisplayUser", ["displayUser"], function(next, params ,req, res) {
	res.end();
	next(null, params);
});

stick("displayWall", function(next, params, req, res) {
	res.end("Wall !");
	next(null, params);
});

stick("displayAdmin", function(next, params, req, res) {
	res.end("Admin interface !");
	next(true, params);
});

stick("getMoney", function(next, params) {
	return next(null, {money: 500});
});

var getMoney = stick("getMoney", function(next, params) {
	params.money += 200;
	return next(null, params);
});

/* --------------- SERVER CONFIG ------------------- */

app.configure(function() {
	this.use(express.bodyParser());
    this.use(app.router);
});

var err = stick.addRoutes(__dirname + "/routes.js", {prod: true});

app.listen(8000);
console.log("server running...");

module.exports.sticker = stick;
module.exports.err = err;
module.exports.fetchUserData = fetchUserData;
module.exports.getMoney = getMoney;