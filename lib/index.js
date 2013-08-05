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

	if (deps != null) {
		for (var i=0;i<deps.length;i++) {
			var elem = deps[i];
			deps[i] = sticks[elem];
			if (!deps[i])
				deps[i] = elem;
		}
	}

	var stick = {deps: deps, next: next};
	sticks[name] = stick;
	return stick;
}

var remove = function(name) {
	sticks[name] = null;
}

var executeDependencies = function(deps, req, res, param, func) {
	var cpt = 0;
	var params = [];
	var error = null;
	var stick;

	if (param) params.push(param);

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
		callStick(false, stick, req, res, param, done);
	}
}

var callStick = function(begin, stick, req, res, param, func) {

	if (begin == false && (stick.deps == null || stick.deps.length == 0)) {
		stick.next(func, param, req, res);
	} else if (stick.deps != null && stick.deps.length) {
		executeDependencies(stick.deps, req, res, param, function(err, params) {
			req.err = err;
			if (!err && begin != true) {
				stick.next(func, params, req, res);
			}
			else {
				func(err, params);
			}
		});
	} else {
		func(null, {});
	}
}

var executeStick = function(name, params, func) {

	if (typeof params == "function") {
		func = params;
		params = {};
	}
	if (!params) params = {};

	var stick;
	var req = params.req ? params.req : {};
	var res = params.res ? params.res : {};
	var originalEnd = res.end;

	delete params.req;
	delete params.res;
	if (typeof name == "object")
		stick = name;
	else
		stick = sticks[name];

	res.end = function() {};
	res.forceEnd = originalEnd;
	if (!stick && func) return func("undefined stick " + name);
	callStick(true, stick, req, res, params, function(err, param) {
		if (originalEnd) res.end = originalEnd;
		stick.next(function(err, params) {
			var prop;
			for (prop in params)
				param[prop] = params[prop];
			if (func) func(err, param);
		}, param, req, res);
	});
};

var addRoutes = function(path, params) {
	if (!fs.existsSync(path))
		return "Routes file: " + path + " doesn't exists";
	var routes = require(path)(params);
	var route;
	if (!params) params = {};

	var addRoute = function(route) {
		if (route.enabled === false) return;
		express[route.action](route.path, function(req, res) {
			var p = {req: req, res: res};
			var prop;
			for (prop in params)
				p[prop] = params[prop];
			executeStick(route.stick, p);
		});
	};

	for (var i=0;i<routes.length;i++) {
		route = routes[i];
		if (!express[route.action])
			return "In your routes file:" + path + ", Action: " + route.action + " doesn't exists";
		if (!sticks[route.stick])
			return "In your routes file:" + path + ", Stick: " + route.stick + " doesn't exists";
		addRoute(route);
	}
	return false;
}


module.exports = function(expressApp) {
	express = expressApp;
	return {
		stick: stick,
		execute: executeStick,
		remove: remove,
		addRoutes: addRoutes
	};
};