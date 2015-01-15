var fs = require('fs');
var jsYaml = require('js-yaml');


var Yaml = function(path) {
	return jsYaml.safeLoad(fs.readFileSync(path));
};


module.exports = Yaml;
