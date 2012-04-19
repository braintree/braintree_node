## Overview

This is a Node.js library for integrating with the [Braintree](http://www.braintreepayments.com) gateway.

## Installing

### From NPM

* `npm install braintree`
* `var braintree = require('braintree')`

### From Source

* clone the latest tag somewhere in your require.paths
* `var braintree = require('braintree-node/lib/braintree')`

### Dependencies

* node ~0.6.6
* coffee-script ~1.1
* xml2js >= 0.1.13

## Links

* [Documentation](http://www.braintreepayments.com/docs/node)
* [Bug Tracker](http://github.com/braintree/braintree_node/issues)

## Quick Start
```javascript
var util = require('util'),
    braintree = require('braintree');

var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: 'your_merchant_id',
  publicKey: 'your_public_key',
  privateKey: 'your_private_key'
});

gateway.transaction.sale({
  amount: '5.00',
  creditCard: {
    number: '5105105105105100',
    expirationDate: '05/12'
  }
}, function (err, result) {
  if (err) throw err;

  if (result.success) {
    util.log('Transaction ID: ' + result.transaction.id);
  } else {
    util.log(result.message);
  }
});
```

## License

See the LICENSE file.
