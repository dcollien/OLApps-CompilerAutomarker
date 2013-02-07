
var dryRun = function(environment, code) {
	output = (function() {
		eval(code);
		return Program(environment).run();
	}).call(null);

	return output;
};

var demoEnvironment = {
	args: [],
	stdin: "hello\n",
	init: function (fs) {
		// path, filename, data, readable, writable:
		fs.createDataFile('/', 'foo', 'abc', true, false);
	}
};
