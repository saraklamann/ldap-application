(function() {
  var YamlLoader, _, crypto, extend, fs, rsa, yaml;

  crypto = require('crypto');

  fs = require('fs');

  yaml = require('js-yaml');

  _ = require('lodash');

  extend = require('node.extend');

  rsa = {
    decrypt: function(str, private_key) {
      var buffer, decrypted;
      buffer = new Buffer(str, 'base64');
      decrypted = crypto.privateDecrypt(private_key, buffer);
      return decrypted.toString('utf8');
    },
    encrypt: function(str, public_key) {
      var buffer, encrypted;
      buffer = new Buffer(str);
      encrypted = crypto.publicEncrypt(public_key, buffer);
      return encrypted.toString('base64');
    }
  };

  YamlLoader = (function() {
    function YamlLoader(path1, options1) {
      this.path = path1;
      this.options = options1;
      if (this.path == null) {
        throw new Error('Missing path parameter.');
      }
      if (this.options.key != null) {
        this.key_file = fs.readFileSync(this.options.key);
      }
      this.env = this.options.env || process.env.NODE_ENV || 'development';
    }

    YamlLoader.prototype.load = function() {
      var configs, data, defaults, env;
      data = yaml.safeLoad(fs.readFileSync(this.path, 'utf8'));
      defaults = data["default"] || {};
      env = data[this.env] || {};
      configs = extend(true, extend(true, {}, defaults), env);
      if (_.isEmpty(configs)) {
        configs = data;
      }
      return this.configs = this.parse(configs);
    };

    YamlLoader.prototype.parse = function(obj) {
      var _this, matches;
      _this = this;
      if (_.isArray(obj)) {
        return _.map(obj, function(value) {
          return _this.parse(value);
        });
      } else if (_.isObject(obj)) {
        _.each(obj, function(value, key) {
          return obj[key] = _this.parse(value);
        });
        return obj;
      } else {
        if (_.isString(obj) && /decrypt\(.+\)/.exec(obj)) {
          if (this.key_file == null) {
            throw new Error('Private key for decryption is missing...');
          }
          matches = /decrypt\((.+)\)/.exec(obj);
          return rsa.decrypt(matches[1], this.key_file);
        } else {
          return obj;
        }
      }
    };

    return YamlLoader;

  })();

  module.exports = {
    load: function(path, env, options) {
      var loader;
      if (options == null) {
        options = {};
      }
      if (env != null) {
        if (_.isString(env)) {
          options.env = env;
        } else {
          options = env;
        }
      }
      loader = new YamlLoader(path, options);
      return loader.load();
    },
    encrypt: function(phrase, public_key) {
      return rsa.encrypt(phrase, fs.readFileSync(public_key));
    }
  };

}).call(this);
