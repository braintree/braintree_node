## Overview

This is a node.js library for integrating with the Braintree gateway. It is a work in progress, very much beta. Feedback is appreciated.
It can be used in the sandbox environment, [contact us](mailto:support@getbraintree.com) if you're interested in using
it in production.

## Installing

* clone this repo somewhere in your require.paths
* require 'braintree-node/lib/braintree'
* npm coming soon!

## Dependencies

* node 0.4.7
* underscore.js

## Quick Start

    var sys = require('sys'),
        _ = require('underscore')._,
        braintree = require('braintree-node/lib/braintree');

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
