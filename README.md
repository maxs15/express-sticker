# express-sticker

> Group your express routes to access them globally and save the routes path in a configuration file


## Getting Started
Group your express routes to access them globally from all your application and save the routes path in a configuration file.
You can add dependencies in order to structure your code correctly.
Check the usage examples to see how it's working.


```shell
npm install express-sticker
```

### Usage examples

Initialization of the sticker
```js
var express = require("express");
var app = express();
var sticker = require("../lib/index.js")(app);
```

Initialization of the routes file, possibility to add multiple files
Possibility to pass params to the routes file.
```js
var params = {prod: true};
var err = sticker.addRoutes(__dirname + "/routes.js", params);
```

Routes file example:
```js
module.exports = function(params) {
    return [{action: "get", path: "/user", stick: "displayUser"},
            {action: "get", path: "/wall", stick: "displayWall"},
            {action: "get", path: "/admin", stick: "displayAdmin", enabled: params.prod}];
}
```

Creation of the sticks
 - Every sticks must call next(error, params) at the end of its execution.
 - The params of all the dependencies are merged in one object.
 - If there is an error in the dependencies, the execution of the dependencies is stopped and the main stick is called with the error in req.err.
 - It's possible to override a stick who is using res.end(), its res.end() will be ineffective but yours will work.
```js
var stick = sticker.stick;

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
    if (req.error)
        res.end("error");
    else
        res.end(params.user);
    next(true, params);
});

stick("overrideDisplayUser", ["displayUser"], function(req, res, params) {
    res.end();
    next(null, params);
});
```
Using a variable in the dependencies array is better because faster, express-sticker doesn't have to look for the stick id but both practises are working.

Get a stick and execute it
```js
var myStick = sticker.stick("displayUser");
sticker.execute(stick);
```
