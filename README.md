[![Build Status](https://travis-ci.org/mapbox/elasticache-auto-discovery.png)](https://travis-ci.org/mapbox/elasticache-auto-discovery)

node.js client for AWS Elasticache [Auto Discovery Endpoint](http://docs.aws.amazon.com/AmazonElastiCache/latest/UserGuide/AutoDiscovery.html)

### Usage

```javascript
var Ecad = require('ecad');
var client = new Ecad({host: 'my-ecad-endpoint', port: 11211});
client.fetch(err, hosts) {
    // that's it.
});
```
