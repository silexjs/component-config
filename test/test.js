(new (require('spaceload'))(true, './')).registerFile(require('../package.json').autoload);

var assert = require('assert');

var Config = USE('Silex.Component.Config.Config');


describe('Create config (set, get, has)', function() {
	var config = new Config;
	
	it('Set values', function() {
		config.set('hello', 'Bonjour');
		config.set({
			myNameIs: 'My name is %name% and not %%name%%',
			'country.france.capital': 'Lyon',
			country: {
				usa: {
					capital: 'Washington',
				},
			},
			'country.france.capital': 'Paris',
		});
	});
	
	it('Get values', function() {
		assert.equal(config.get('hello'), 'Bonjour');
		assert.equal(config.get('myNameIs'), 'My name is  and not %name%');
		assert.equal(config.get('country.france.capital'), 'Paris');
	});
	
	it('Has values', function() {
		assert.equal(config.has('country.usa.capital'), true);
		assert.equal(config.has('country.canada.capital'), false);
		assert.equal(config.has('country'), true);
	});
	
	it('Test force set', function() {
		config.set('test_force', 'alpha');
		config.set('test_force', 'beta', false);
		assert.equal(config.get('test_force'), 'alpha');
		config.set('test_force', 'beta');
		assert.equal(config.get('test_force'), 'beta');
	});
	
	it('Test parameters', function() {
		config.set('parameters.name', 'Valentin');
		assert.equal(config.get('myNameIs'), 'My name is Valentin and not %name%');
		config.set('parameters.name', 'Pol');
		assert.equal(config.get('myNameIs'), 'My name is Pol and not %name%');
		config.set('myNameIs', 'My name is %name%, %name% or %name% and %name% !');
		assert.equal(config.get('myNameIs'), 'My name is Pol, Pol or Pol and Pol !');
		config.set('wtfTest', '%var_1%%%%%%var_2%%%%var_3%%%%%var_3%%%var_1%');
		config.set('parameters', {
			var_1: 'A',
			var_2: 'B',
			var_3: 'C',
		});
		assert.equal(config.get('wtfTest'), 'A%%B%C%%var_3%A');
	});
});

describe('Create config (load)', function() {
	var config = new Config;
	
	it('Load files (this is normal, the conversion is slow in YAML)', function() {
		config.set('alpha', 'beta');
		config.set('GMT', 2);
		config.load(__dirname+'/config/config.json');
	});
	
	it('Check loaded files', function() {
		assert.equal(config.get('GMT'), 2);
		assert.equal(config.get('name'), 'Valentin Seven');
		assert.equal(config.get('city'), 'Paris');
		assert.equal(config.get('languages.1'), 'en');
		assert.equal(config.get('math.pi'), Math.PI);
		assert.equal(config.get('theVersionIs'), 'The version is 2.0.0');
		assert.equal(config.get('theEnvironment'), 'The environment is production');
		assert.equal(config.get('alpha'), 'beta');
	});
});
