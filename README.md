[![Build Status](https://travis-ci.org/mapbox/elasticache-auto-discovery.png)](https://travis-ci.org/mapbox/elasticache-auto-discovery)

node.js client for AWS Elasticache [Auto Discovery Endpoint](http://docs.aws.amazon.com/AmazonElastiCache/latest/UserGuide/AutoDiscovery.html)

### Usage

```javascript
var Ecad = require('ecad');
var endpoints = [
  'my-elasticache-cluster-hostname1:11211',
  'my-elasticache-cluster-hostname2:11211'];
var client = new Ecad({{endpoints: endpoints, timeout: 500}});
client.fetch(err, hosts) {
    // that's it.
});
```
