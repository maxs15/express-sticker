var fs = require("fs");

var sticks = {};
var express = null;


var stick = function(name, deps, next) {

	// Return the stick if just the name is specified
	if (name && !deps && !next) {
		return sticks[name];
	}
	if (typeof deps == "function") {
		next = deps;
		deps = null;
	}

	var stick = {deps: deps, next: next};
	sticks[name] = stick;
	return stick;
}

var executeDependencies = function(deps, req, res, func) {
	var cpt = 0;
	var params = [];
	var error = null;
	var stick;

	var createParams = function() {
		var paramsObject = {};
		var elem;

		// Convert the array of params to a single params object
		for (var i=0;i<params.length;i++) {
			elem = params[i];
			for (var property in elem) {
				if (elem.hasOwnProperty(property)) {
					paramsObject[property] = elem[property];
    			}
			}
		}
		return paramsObject;
	}

	var done = function(err, newParams) {
		cpt++;
		if (newParams)
			params.push(newParams);
		if (error || err) {
			error = err;
			var paramsObject = createParams();
			return func(err, paramsObject);
		}
		if (cpt == deps.length) {
			var paramsObject = createParams();
			func(err, paramsObject);
		}
	};

	for (var i=0;i<deps.length;i++) {
		if (error) return;
		if (typeof deps[i] == "object")
			stick = deps[i];
		else
			stick = sticks[deps[i]];
		callStick(false, stick, req, res, done);
	}
}

var callStick = function(begin, stick, req, res, func) {

	if (begin == false && (stick.deps == null || stick.deps.length == 0)) {
		stick.next(req, res, func, {});
	} else if (stick.deps != null && stick.deps.length) {
		executeDependencies(stick.deps, req, res, function(err, params) {
			req.err = err;
			if (!err && begin != true) {
				stick.next(req, res, func, params);
			}
			else {
				func(err, params);
			}
		});
	} else {
		func(null, {});
	}
}

var executeStick = function(name, req, res, func) {
	var stick;
	var originalEnd = res.end;

	if (typeof name == "object")
		stick = name;
	else
		stick = sticks[name];

	res.end = function() {};
	if (!stick && func) return func("undefined stick " + name);
	callStick(true, stick, req, res, function(err, params) {
		res.end = originalEnd;
		stick.next(req, res, function(err, params) {
			if (func) func(err, params);
		}, params);
	});
};

var addRoutes = function(path, params) {
	if (!fs.existsSync(path))
		return "Routes file: " + path + " doesn't exists";
	var routes = require(path)(params);
	var route;

	var addRoute = function(route) {
		if (route.enabled === false) return;
		express[route.action](route.path, function(req, res) {
			executeStick(route.stick, req, res);
		});
	};

	for (var i=0;i<routes.length;i++) {
		route = routes[i];
		if (!express[route.action])
			return "Action: " + route.action + " doesn't exists";
		if (!sticks[route.stick])
			return "Stick: " + route.stick + " doesn't exists";
		addRoute(route);
	}
	return false;
}


module.exports = function(expressApp) {
	express = expressApp;
	return {
		stick: stick,
		execute: executeStick,
		addRoutes: addRoutes
	};
};