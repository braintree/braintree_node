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
  paymentMethodNonce: "nonce-from-the-client",
  options: {
    submitForSettlement: true
  }
},
  function(err, result) {
    if (result) {
      if (result.success) {
        console.log("Transaction ID: " + result.transaction.id)
      } else {
        console.log(result.message)
      }
    } else {
      console.log(err)
    }
});
```
## Tests

The unit specs can be run by anyone on any system, but the integration specs are meant to be run against a local development server of our gateway code. These integration specs are not meant for public consumption and will likely fail if run on your system. To run unit tests use rake (`rake test:unit`) or npm (`npm test`).

## Open Source Attribution

A list of open source projects that help power Braintree can be found [here](https://www.braintreepayments.com/developers/open-source).

## License

See the LICENSE file.
