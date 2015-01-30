## Overview

This is a Node.js library for integrating with the [Braintree](http://www.braintreepayments.com) gateway.

## Installation

* `npm install braintree`
* `var braintree = require('braintree')`

### Dependencies

* node ~0.6.6

## Links

* [Documentation](https://developers.braintreepayments.com/node/sdk/server/overview)
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

## Open Source Attribution

A list of open source projects that help power Braintree can be found [here](https://www.braintreepayments.com/developers/open-source).

## License

See the LICENSE file.
