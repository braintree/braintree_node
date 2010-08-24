var Http = require('./http').Http;

var Gateway = function(config) {
  return {
    config: config,
    http: Http(config)
  };
};

exports.Gateway = Gateway;
