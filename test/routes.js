module.exports = function(params) {
	return [{action: "get", path: "/user", stick: "displayUser"},
			{action: "get", path: "/wall", stick: "displayWall"},
			{action: "get", path: "/admin", stick: "displayAdmin", enabled: params.prod}];
}