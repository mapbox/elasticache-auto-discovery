var net = require('net');
var Step = require('step');
var retry = require('retry');

var Ecad = function(options) {
    options.timeout = options.timeout || 3000;
    options.minTimeout = options.minTimeout || 1000;
    options.maxTimeout = options.maxTimeout || 2000;
    options.retries = options.retries || 0;
    options.endpoints = Array.isArray(options.endpoints) ? options.endpoints :
      [options.endpoints];
    this.config = options;
    return this;
};

Ecad.prototype.fetch = function(fn) {
    var that = this;
    var opts = this.config;
    var list = [];

    var attempt = function(endpoint, cb) {
        var operation = retry.operation({
            retries: opts.retries,
            minTimout: opts.minTimeout,
            maxTimeout: opts.maxTimeout
        });
        operation.attempt(function(attempts) {
            that._fetch(endpoint, function(err, result) {
                if (operation.retry(err)) {
                    return;
                }
                if (err) return cb(operation.mainError(), attempts);
                else return cb(null, result);
            });
        });
    };

    Step(function() {
        var group = this.group();
        opts.endpoints.forEach(function(endpoint) {
            attempt(endpoint, group());
        });
    }, function(err, res) {
        // In case of err, res will be number of attempts
        if (err) return fn(err, res);
        list = list.concat.apply(list, res);
        fn(null, list);
    });
};

Ecad.prototype._fetch = function(endpoint, fn) {
    var that = this;
    var opts = this.config;
    var res = [];
    var hosts = [];

    if (!~endpoint.indexOf(':'))
        return fn(new Error('Not a valid Elasticache endpoint. Endpoint: ' + endpoint));

    var parts = endpoint.split(':');
    var client = net.connect({host: parts[0], port: parts[1]}, function() {
        client.write('config get cluster\r\n');
    });

    client.setTimeout(opts.timeout);
    client.setEncoding('utf8');

    client.on('data', function(chunk) {
        res.push(chunk);
        if (~chunk.indexOf('END') || ~chunk.indexOf('ERROR'))
            client.end();
    });

    client.on('end', function() {
        var result = that._parse(res);
        if (result instanceof Error)
            return fn(new Error(result.message + ' Endpoint: ' + endpoint));
        else return fn(null, result);
    });

    client.on('timeout', function() {
        client.removeAllListeners();
        client.end();
        client.destroy();
        return fn(new Error('Elasticache auto-discovery request timed out. ' +
            'Endpoint: ' + endpoint));
    });

    client.on('error', function(err) {
        return fn(new Error('Elasticache auto-discovery request error: ' + err +
            ' Endpoint: ' + endpoint));
    });
};

Ecad.prototype._parse = function(res) {
    var hosts = [];
    var payload = res.join('');
    var lines = payload.split('\n');
    if (!lines[2])
        return new Error('Bad response from Elasticache.');
    var list = lines[2].split(' ');
    if (!list.length)
        return new Error('No Elasticache hosts found.');
    list.forEach(function(item) {
        var parts = item.split('|');
        if (parts.length < 2)
            return new Error('Malformed host list from Elasticache.');
        hosts.push(parts[0] + ':' + parts[2]);
    });
    return hosts;
};

module.exports = Ecad;
