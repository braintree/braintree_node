require('../spec_helper');

var _ = require('underscore')._,
    braintree = specHelper.braintree;

vows.describe('AddressGateway').addBatch({
  'create': {
    'adding an address to an existing customer': {
      topic: function () {
        var callback = this.callback;
        specHelper.defaultGateway.customer.create(
          {},
          function (err, response) {
            specHelper.defaultGateway.address.create({
              customerId: response.customer.id,
              streetAddress: '123 Fake St',
              extendedAddress: 'Suite 403',
              locality: 'Chicago',
              region: 'IL',
              postalCode: '60607',
              countryName: 'United States of America'
            }, callback);
          }
        );
      },
      'is succesful': function (err, response) {
        assert.isNull(err);
        assert.equal(response.success, true);
      },
      'returns the address': function (err, result) {
        assert.equal(result.address.streetAddress, '123 Fake St');
        assert.equal(result.address.extendedAddress, 'Suite 403');
        assert.equal(result.address.locality, 'Chicago');
        assert.equal(result.address.region, 'IL');
        assert.equal(result.address.postalCode, '60607');
        assert.equal(result.address.countryName, 'United States of America');
      }
    },
  }
}).export(module);
