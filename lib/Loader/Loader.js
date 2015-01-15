var pa = require('path');


var Loader = function(path) {
	this.registerExt(['js', 'node'],	'Silex.Component.Config.Loader.Js')
		.registerExt('json',			'Silex.Component.Config.Loader.Json')
		.registerExt(['yml', 'yaml'],	'Silex.Component.Config.Loader.Yaml');
};
Loader.prototype = {
	exts: {},
	
	registerExt: function(ext, namespace) {
		if(typeof ext === 'string') {
			ext = [ext];
		}
		for(var i in ext) {
			this.exts[ext[i]] = namespace;
		}
		return this;
	},
	load: function(path) {
		var ext = pa.extname(path);
		ext = ext.substr(1);
		if(this.exts[ext] !== undefined) {
			return USE(this.exts[ext])(path);
		}
		throw new Error(
			  'Could not load type configuration files "'+ext+'"\n'
			+ 'List of supported file: '+Object.keys(this.exts).join(', ')
		);
	},
};


module.exports = Loader;
