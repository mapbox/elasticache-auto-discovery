[![Build Status](https://travis-ci.org/mapbox/elasticache-auto-discovery.png)](https://travis-ci.org/mapbox/elasticache-auto-discovery)

node.js client for AWS Elasticache [Auto Discovery Endpoint](http://docs.aws.amazon.com/AmazonElastiCache/latest/UserGuide/AutoDiscovery.html)

### Description

Specify a list of Elasticache Auto Discovery Endpoints to this tiny TCP client
and receive in response a list of Elasticache host nodes found by each of the
Auto Discovery endpoints.  The result will be an array of Elasticache nodes
specified in host:port notation.

### Usage

```javascript
var Ecad = require('ecad');
var endpoints = [
  'my-elasticache-cluster-hostname1:11211',
  'my-elasticache-cluster-hostname2:11211'];
var client = new Ecad({endpoints: endpoints, timeout: 10000});
client.fetch(function(err, hosts) {
    if (err) throw err;
    console.log(hosts);
    // that's it.
});
```

#### Options

- `retries` the number of times to retry connecting to each endpoint.
- `timeout` timeout connection attempt after this many ms.
- `minTimeout` minimum time to wait before retrying connection. Valid only if
  `retries` is not 0.
- `maxTimeout` maximum time to wait before retrying connection. Valid only if
  `retries` is not 0.
