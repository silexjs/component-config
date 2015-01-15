var pa = require('path');
var merge = require('object-merge');

var Loader = USE('Silex.Component.Config.Loader.Loader');


var Config = function() {
	this.loader = new Loader;
	var self = this;
	this.events = {};
	this.addEvent(function(value) {
		return self.replaceParameters(value);
	}, 0);
};
Config.prototype = {
	data: {
		parameters: {},
	},
	loader: null,
	events: {},
	
	set: function(key, value, force) {
		if(key instanceof Object === true) {
			for(var k in key) {
				this.set(k, key[k], value);
			}
			return this;
		}
		
		var force = (force===undefined||force===true?true:false);
		var configPath = configAdd = {};
		var listKey = key.split('.');
		var listKeyLength = listKey.length-1;
		for(var i=0; i<listKeyLength; i++) {
			configPath = configPath[listKey[i]] = {};
		}
		configPath[listKey[listKeyLength]] = value;
		
		if(force === true) {
			this.data = merge(this.data, configAdd);
		} else {
			this.data = merge(configAdd, this.data);
		}
		
		return this;
	},
	get: function(key) {
		var configValue = this.data;
		var listKey = key.split('.');
		var listKeyLength = listKey.length;
		for(var i=0; i<listKeyLength; i++) {
			if(configValue[listKey[i]] !== undefined) {
				configValue = configValue[listKey[i]];
			} else {
				return undefined;
			}
		}
		var self = this;
		configValue = this.readValue(configValue, function(value) {
			return self.analyzerValue(value);
		});
		
		return configValue;
	},
	has: function(key) {
		return this.get(key)!==undefined?true:false;
	},
	
	load: function(path, force) {
		var force = force || false;
		var self = this;
		
		var loadFile = function(path, baseConfig) {
			var config = self.loader.load(path);
			
			if(config.parameters !== undefined) {
				baseConfig.parameters = merge(config.parameters, baseConfig.parameters);
			}
			
			if(config.imports !== undefined) {
				if(typeof config.imports === 'string') {
					config.imports = [{ resource: imports }];
				}
				var configImportsLength = config.imports.length;
				for(var i=0; i<configImportsLength; i++) {
					if(typeof config.imports[i] === 'string') {
						config.imports[i] = { resource: config.imports[i] };
					}
					var resourcePath = pa.resolve(pa.dirname(path), self.analyzerValue(config.imports[i].resource, path));
					var resourceConfig = loadFile(resourcePath, baseConfig);
					if(config.imports[i].force === undefined || config.imports[i].force === false) {
						config = merge(resourceConfig, config);
					} else {
						config = merge(config, resourceConfig);
					}
				}
				delete config.imports;
			}
			
			loopObject(config, function(obj, key, objBack, keyBack) {
				if(key === 'import') {
					var resourcePath = pa.resolve(pa.dirname(path), self.analyzerValue(obj[key], path));
					var resourceConfig = loadFile(resourcePath, baseConfig);
					objBack[keyBack] = resourceConfig;
				}
			});
			
			return config;
		};
		var loopObject = function(obj, callback, objBack, keyBack) {
			for(var key in obj) {
				callback(obj, key, objBack, keyBack);
				if((typeof obj[key] === 'object' || obj[key] instanceof Array === true) && obj[key] !== null) {
					loopObject(obj[key], callback, obj, key);
				}
			}
		};
		var configFile = loadFile(pa.resolve(path), this.data);
		
		this.set(configFile, force);
		return this;
	},
	
	addEvent: function(callback, priority) {
		if(priority === undefined) { priority = 20; }
		priority = -priority;
		if(this.events[priority] === undefined) {
			this.events[priority] = [];
		}
		this.events[priority].push(callback);
	},
	applyEvent: function(value, file) {
		var file = file || null;
		for(var priority in this.events) {
			for(var i in this.events[priority]) {
				value = this.events[priority][i](value, file);
			}
		}
		return value;
	},
	
	analyzerValue: function(value, file) {
		return this.applyEvent(value, file || null);
	},
	
	replaceParameters: function(value) {
		if(typeof value !== 'string') {
			return value;
		}
		var parameters = this.data.parameters;
		return value.replace(/%([A-Za-z0-9_\.]*)%/g, function(match, contents, offset, s) {
			if(match === '%%' && contents === '') {
				return '%';
			} else if(parameters[contents] !== undefined) {
				return parameters[contents];
			}
			return '';
		});
	},
	readValue: function(obj, callbackValue, callbackAll) {
		var callbackValue = callbackValue || function(){};
		var callbackAll = callbackAll || function(){};
		if(obj instanceof Object) {
			for(var key in obj) {
				var result = callbackAll(obj[key], key);
				if(result !== undefined) {
					obj[key] = result;
				}
				if(typeof obj[key] === 'object' && obj[key] !== null) {
					var result = this.readValue(obj[key], callbackValue, callbackAll);
				} else {
					var result = callbackValue(obj[key], key);
				}
				if(result !== undefined) {
					obj[key] = result;
				}
			}
		} else {
			var result = callbackValue(obj, null);
			if(result !== undefined) {
				obj = result;
			}
		}
		return obj;
	},
};


module.exports = Config;
