## Overview

This is a Node.js library for integrating with the Braintree gateway.

The library is a work in progress and a few features are still missing. Until
we hit version 1.0 we may break backwards compatibility, but the changes
should be minimal. We're using [semantic versioning](http://semver.org/).
[Email us](mailto:support@braintreepayments.com) if you have any questions.

## Installing

### From NPM

* npm install braintree
* braintree = require('braintree')

### From Source

* clone the latest tag somewhere in your require.paths
* require 'braintree-node/lib/braintree'

## Dependencies

* node 0.4.x

## Not Yet Implemented

* search APIs (transactions, vault, subscriptions)

## Quick Start

    var sys = require('sys'),
        _ = require('underscore')._,
        braintree = require('braintree');

    var gateway = braintree.connect({
      environment: braintree.Environment.Sandbox,
      merchantId: 'your_merchant_id',
      publicKey: 'your_public_key',
      privateKey: 'your_private_key'
    });

    gateway.transaction.sale(
      {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      },
      function (err, response) {
        if (err) {
          sys.puts(err.message);
          return;
        }

        if (response.success) {
          sys.puts('Transaction id: ' + response.transaction.id);
          sys.puts('Transaction status: ' + response.transaction.status);
          sys.puts('Transaction amount: ' + response.transaction.amount);
        } else {
          if (response.transaction) {
            sys.puts('Transaction status: ' + response.transaction.status);
          } else {
            _.each(response.errors.deepErrors(), function (error) {
              sys.puts(error.message);
            });
          }
        }
      }
    );

## Maintainers

The Braintree Node library is maintained by the Braintree dev team.

* [Dan Manges](https://github.com/dan-manges)
* [Patrick Schless](https://github.com/plainlystated)
* [Paul Gross](https://github.com/pgr0ss)
* [Drew Olson](https://github.com/drewolson)
* [Hammer](https://github.com/thehammer)
* [Paul Hinze](https://github.com/phinze)
* [Ali Aghareza](https://github.com/aghareza)
* [Tony Pitluga](https://github.com/pitluga)
* [Ben Mills](https://github.com/benmills)

