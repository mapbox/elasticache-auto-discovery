var fs = require('fs');
var chai = require('chai');
var expect = chai.expect;
var Ecad = require('..');

describe('Elasticache Auto Discovery', function() {

    // Elasticache must be accessed from an EC2, therefore, tests for now are
    // limited to res parsing and failure to connect to Elasticache endpoint.

    describe('#parsing', function() {

        it('should parse payload with single host', function() {
            var ecad = new Ecad({endpoints: 'localhost:11211'});
            var payload = fs.readFileSync(__dirname + '/fixtures/single', 'utf8');
            var hosts = ecad._parse([payload]);
            expect(hosts).to.deep.equal([
              'lit-ca-1sfttco9eo1j2.a9z8qi.0001.use1.cache.amazonaws.com:11211'
            ]);
        });
        it('should parse payload with multiple hosts', function() {
            var ecad = new Ecad({endpoints: 'localhost:11211'});
            var payload = fs.readFileSync(__dirname + '/fixtures/multiple', 'utf8');
            var hosts = ecad._parse([payload]);
            expect(hosts).to.deep.equal([
              'foo.a8ssop.0001.use1.cache.amazonaws.com:11211',
              'foo.a8ssop.0002.use1.cache.amazonaws.com:11211',
              'foo.a8ssop.0003.use1.cache.amazonaws.com:11211',
              'foo.a8ssop.0004.use1.cache.amazonaws.com:11211',
              'foo.a8ssop.0005.use1.cache.amazonaws.com:11211',
              'foo.a8ssop.0006.use1.cache.amazonaws.com:11211',
              'foo.a8ssop.0007.use1.cache.amazonaws.com:11211',
              'foo.a8ssop.0008.use1.cache.amazonaws.com:11211',
              'foo.a8ssop.0009.use1.cache.amazonaws.com:11211',
              'foo.a8ssop.0010.use1.cache.amazonaws.com:11211'
            ]);
        });
        it('should return error on empty payload', function() {
            var ecad = new Ecad({endpoints: 'localhost:11211'});
            var payload = fs.readFileSync(__dirname + '/fixtures/empty', 'utf8');
            var hosts = ecad._parse([payload]);
            expect(function() { throw hosts; })
              .to.throw(/Bad response from Elasticache/);
        });
        it('should return error on bad hosts line', function() {
            var ecad = new Ecad({endpoints: 'localhost:11211'});
            var payload = fs.readFileSync(__dirname + '/fixtures/badhosts', 'utf8');
            var hosts = ecad._parse([payload]);
            expect(function() { throw hosts; })
              .to.throw(/No Elasticache hosts found/);
        });
    });

    describe('#fetching', function() {
        it('should return error when unable to connect to host', function(done) {
            var ecad = new Ecad({endpoints: '10.255.255.255:11211', timeout: 500});
            ecad.fetch(function(err, hosts) {
                expect(function() { throw err; })
                  .to.throw(/Elasticache auto-discovery request timed out/);
                done();
            });
        });
        it('should retry three times when unable to connect to host', function(done) {
            this.timeout(20000);
            var ecad = new Ecad({
              endpoints: '10.255.255.255:11211',
              timeout: 500,
              minTimeout: 1000,
              maxTimeout: 1000,
              retries: 2});
            ecad.fetch(function(err, hosts) {
                expect(function() { throw err; })
                  .to.throw(/Elasticache auto-discovery request timed out/);
                expect(hosts.pop()).to.eql(3);
                done();
            });
        });
    });

});
