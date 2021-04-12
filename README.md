## Braintree Node library

The Braintree Node library provides integration access to the Braintree Gateway.

## Please Note
> **The Payment Card Industry (PCI) Council has [mandated](https://blog.pcisecuritystandards.org/migrating-from-ssl-and-early-tls) that early versions of TLS be retired from service.  All organizations that handle credit card information are required to comply with this standard. As part of this obligation, Braintree is updating its services to require TLS 1.2 for all HTTPS connections. Braintree will also require HTTP/1.1 for all connections. Please see our [technical documentation](https://github.com/paypal/tls-update) for more information.**

## Installation

* `npm install braintree`
* `var braintree = require('braintree')`

### Dependencies

* node >= 10

## Versions

Braintree employs a deprecation policy for our SDKs. For more information on the statuses of an SDK check our [developer docs](http://developers.braintreepayments.com/reference/general/server-sdk-deprecation-policy).

| Major version number | Status      | Released        | Deprecated      | Unsupported     |
| -------------------- | ----------- | --------------- | --------------- | --------------- |
| 3.x.x                | Active      | September 2020  | TBA             | TBA             |
| 2.x.x                | Inactive    | February 2017   | September 2022  | September 2023  |

## Links

* [Documentation](https://developers.braintreepayments.com/node/sdk/server/overview)
* [Bug Tracker](https://github.com/braintree/braintree_node/issues)

Updating from an Inactive, Deprecated, or Unsupported version of this SDK? Check our [Migration Guide](https://developers.braintreepayments.com/reference/general/server-sdk-migration-guide/node) for tips.

## Quick Start

```javascript
var braintree = require('braintree');

var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: 'your_merchant_id',
  publicKey: 'your_public_key',
  privateKey: 'your_private_key'
});

gateway.transaction.sale({
  amount: '5.00',
  paymentMethodNonce: 'nonce-from-the-client',
  options: {
    submitForSettlement: true
  }
}, function (err, result) {
  if (err) {
    console.error(err);
    return;
  }

  if (result.success) {
    console.log('Transaction ID: ' + result.transaction.id);
  } else {
    console.error(result.message);
  }
});
```

## Promises

You can also use Promises instead of callbacks.

```javascript
var braintree = require('braintree');

var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: 'your_merchant_id',
  publicKey: 'your_public_key',
  privateKey: 'your_private_key'
});

gateway.transaction.sale({
  amount: '5.00',
  paymentMethodNonce: 'nonce-from-the-client',
  options: {
    submitForSettlement: true
  }
}).then(function (result) {
  if (result.success) {
    console.log('Transaction ID: ' + result.transaction.id);
  } else {
    console.error(result.message);
  }
}).catch(function (err) {
  console.error(err);
});
```

Almost all methods that uses a callback can alternatively use a Promise. The only exceptions are `gateway.merchantAccount.all` or any of the `search` methods because they return a stream if no callback is provided. 

## Documentation

* [Official documentation](https://developers.braintreepayments.com/node/sdk/server/overview)

## Developing (Docker)

The `Makefile` and `Dockerfile` will build an image containing the dependencies and drop you to a terminal where you can run tests.

```
make
```

## Tests

The unit specs can be run by anyone on any system, but the integration specs are meant to be run against a local development server of our gateway code. These integration specs are not meant for public consumption and will likely fail if run on your system. To run unit tests use rake (`rake test:unit`) or npm (`npm test`).

## License

See the LICENSE file.
