var express = require("express");
var app = express();
var sticker = require("../lib/index.js")(app);
var stick = sticker.stick;
var http = require("http");
var assert = require("assert");

stick("checkLogin", function(req, res, next) {
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

/* -------------- MOCHA TESTS ----------------------- */

describe('testing routes file', function () {

  it('should open it and return no errors', function (done) {
      assert.equal(false, err);
      done();
  });

});

describe('testing sticks', function () {

  it('should return the stick after creating a stick', function (done) {
      assert.notEqual(null, fetchUserData);
      done();
  });

  it('should execute the stick', function (done) {
      assert.notEqual(null, fetchUserData);

      sticker.execute(fetchUserData, {}, {}, function(err, params) {
        assert.equal(null, err);
        assert.equal("jack", params.user);
        done();
      });

  });

});

describe('testing classic route with no dependencies', function () {

  it('should return 200', function (done) {
    http.get('http://localhost:8000/wall', function (res) {
      assert.equal(200, res.statusCode);
      done();
    });
  });

  it('should say "Wall !"', function (done) {
    http.get('http://localhost:8000/wall', function (res) {
      var data = '';

      res.on('data', function (chunk) {
        data += chunk;
      });

      res.on('end', function () {
        assert.equal('Wall !', data);
        done();
      });

    });
  });

});


describe('testing route with dependencies', function () {

  it('should return 200', function (done) {
    http.get('http://localhost:8000/user', function (res) {
      assert.equal(200, res.statusCode);
      done();
    });
  });

  it('should return the param "jack"', function (done) {
    http.get('http://localhost:8000/user', function (res) {
      var data = '';

      res.on('data', function (chunk) {
        data += chunk;
      });

      res.on('end', function () {
        assert.equal('jack', data);
        done();
      });

    });
  });

});

