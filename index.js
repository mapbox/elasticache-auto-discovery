var net = require('net');

var Ecad = function(options) {
    options.port = options.port || 11211;
    options.host = options.host || 'localhost';
    options.timeout = options.timeout || 3000;

    this.config = options;
    return this;
};

Ecad.prototype.fetch = function(fn) {
    var that = this;
    var opts = this.config;
    var res = [];
    var hosts = [];
    var client = net.connect({port: opts.port, host: opts.host}, function() {
        client.write('config get cluster\r\n');
    });

    client.setTimeout(opts.timeout);
    client.setEncoding('utf8');

    client.on('data', function(chunk) {
        res.push(chunk);
        if (~chunk.indexOf('END'))
            client.end();
    });

    client.on('end', function() {
        var hosts = that._parse(res);
        if (hosts instanceof Error) return fn(hosts);
        else return fn(null, hosts);
    });

    client.on('timeout', function() {
        client.removeAllListeners();
        client.end();
        client.destroy();
        return fn(new Error('Elasticache auto-discovery request timed out'));
    });

    client.on('error', function(err) {
        return fn(err);
    });
};

Ecad.prototype._parse = function(res) {
    var hosts = [];
    var payload = res.join('');
    var lines = payload.split('\n');
    if (!lines[2])
        return new Error('Bad response from Elasticache');
    var list = lines[2].split(' ');
    if (!list.length)
        return new Error('No Elasticache endpoints found');
    list.forEach(function(item) {
        var parts = item.split('|');
        if (parts.length < 2)
            return new Error('Malformed host list from Elasticache');
        hosts.push(parts[0] + ':' + parts[2]);
    });
    return hosts;
};

module.exports = Ecad;
