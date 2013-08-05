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

#### Initialization of the sticker
```js
var express = require("express");
var app = express();
var sticker = require("../lib/index.js")(app);
```

#### Creation of the sticks
 - Every sticks must call next(error, params) at the end of its execution.
 - The params of all the dependencies are merged in one object.
 - If there is an error in the dependencies, the execution of the dependencies is stopped and the main stick is called with the error in req.err.
 - It's possible to override a stick who is using res.end(), its res.end() will be ineffective but yours will work.
 - If you want to force the end, the method res.forceEnd() is available, usefull for some stuff like the checkLogin example. In this case do not call the next callback.

```js
var stick = sticker.stick;

stick("checkLogin", function(next, params, req, res) {
    if (!req.user) {
        res.redirect("/login");
        res.forceEnd();
    } else {
        next(false);
    }
});

stick("checkAvailability", function(next) {
    next(null);
});

var fetchUserData = stick("fetchUserData", ["checkAvailability"], function(next, params) {
    next(null, {user: "jack"});
});

stick("displayUser", ["checkLogin", fetchUserData], function(next, params, req, res) {
    if (req.error)
        res.end("error");
    else
        res.end(params.user);
    next(true, params);
});

stick("overrideDisplayUser", ["displayUser"], function(next, params ,req, res) {
    res.end("user: " + params.user);
    next(null, params);
});
```

#### Get a stick and execute it
```js
var myStick = sticker.stick("displayUser");
sticker.execute(myStick, function(err, params) {
    console.log("stick executed");
});
// Or
sticker.execute("displayUser", {type: "poney"}, function(err, params) {
    console.log("stick executed");
});
// Remove it
sticker.remove("displayUser");
```

#### Initialization of the routes file
 - Possibility to add multiple files
 - Possibility to pass params to the routes file.
 - You must add the routes after the sticks are loaded.

```js
var params = {prod: true};
var err = sticker.addRoutes(__dirname + "/routes.js", params);
```

#### Routes file example:
```js
module.exports = function(params) {
    return [{action: "get", path: "/user", stick: "displayUser"},
            {action: "get", path: "/wall", stick: "displayWall"},
            {action: "get", path: "/admin", stick: "displayAdmin", enabled: params.prod}];
}
```

## License

(The MIT License)

Copyright (c) 2013 Maxime Mezrahi

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
