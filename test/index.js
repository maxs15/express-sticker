var http = require("http");
var assert = require("assert");
var server = require("./server");
var sticker = server.sticker;
var err = server.err;
var fetchUserData = server.fetchUserData;

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

  it('Mode 1: should execute the stick and return the params', function (done) {
      sticker.execute(fetchUserData, {type: "poney"}, function(err, params) {
        assert.equal(null, err);
        assert.equal("poney", params.type);
        assert.equal("jack", params.user);
        done();
      });
  });

  it('Mode 2: should execute the stick', function (done) {
      sticker.execute(fetchUserData, function(err, params) {
        assert.equal(null, err);
        done();
      });
  });

  it('Mode 3: should execute the stick', function (done) {
      sticker.execute(fetchUserData, {type: "poney"});
      done();
  });

   it('Mode 4: should execute the stick', function (done) {
      sticker.execute("fetchUserData");
      done();
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

