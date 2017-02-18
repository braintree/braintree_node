'use strict';

require('../../spec_helper');
let braintree = specHelper.braintree;

describe('AddressGateway', function () {
  describe('create', function () {
    it('handles a successful response', done =>
      specHelper.defaultGateway.customer.create({}, function (err, response) {
        let addressParams = {
          customerId: response.customer.id,
          streetAddress: '123 Fake St',
          extendedAddress: 'Suite 403',
          locality: 'Chicago',
          region: 'IL',
          postalCode: '60607',
          countryName: 'United States of America'
        };

        specHelper.defaultGateway.address.create(addressParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.address.streetAddress, '123 Fake St');
          assert.equal(response.address.extendedAddress, 'Suite 403');
          assert.equal(response.address.locality, 'Chicago');
          assert.equal(response.address.region, 'IL');
          assert.equal(response.address.postalCode, '60607');
          assert.equal(response.address.countryName, 'United States of America');
          done();
        });
      })
    );

    it('handles error responses', done =>
      specHelper.defaultGateway.customer.create({}, function (err, response) {
        let addressParams = {
          customerId: response.customer.id,
          countryName: 'invalid country'
        };

        specHelper.defaultGateway.address.create(addressParams, function (err, response) {
          assert.isNull(err);
          assert.isFalse(response.success);
          assert.equal(response.message, 'Country name is not an accepted country.');
          assert.equal(response.errors.for('address').on('countryName')[0].code, '91803');
          assert.equal(response.errors.for('address').on('countryName')[0].attribute, 'country_name');

          let errorCodes = (() => {
            let result = [];

            for (let error of Array.from(response.errors.deepErrors())) {
              let code = error.code;

              result.push(code);
            }
            return result;
          })();

          assert.equal(errorCodes.length, 1);
          assert.include(errorCodes, '91803');
          done();
        });
      })
    );
  });

  describe('delete', () =>
    it('deletes the address', done =>
      specHelper.defaultGateway.customer.create({}, function (err, response) {
        let addressParams = {
          customerId: response.customer.id,
          countryName: 'United States of America'
        };

        specHelper.defaultGateway.address.create(addressParams, (err, response) => {
          let address = response.address;

          specHelper.defaultGateway.address.delete(address.customerId, address.id, () =>
            specHelper.defaultGateway.address.find(address.customerId, address.id, function (err, address) {
              assert.isNull(address);
              assert.equal(err.type, braintree.errorTypes.notFoundError);
              done();
            })
          );
        });
      })
    )
  );

  describe('find', function () {
    it('finds an existing address', done =>
      specHelper.defaultGateway.customer.create({}, (err, response) =>
        specHelper.defaultGateway.address.create({
          customerId: response.customer.id,
          streetAddress: '123 Fake St',
          extendedAddress: 'Suite 403',
          locality: 'Chicago',
          region: 'IL',
          postalCode: '60607',
          countryName: 'United States of America'
        }, (err, response) => {
          let address = response.address;

          specHelper.defaultGateway.address.find(address.customerId, address.id, function (err, address) {
            assert.isNull(err);
            assert.equal(address.streetAddress, '123 Fake St');
            assert.equal(address.extendedAddress, 'Suite 403');
            assert.equal(address.locality, 'Chicago');
            assert.equal(address.region, 'IL');
            assert.equal(address.postalCode, '60607');
            assert.equal(address.countryName, 'United States of America');
            done();
          });
        })
      )
    );

    it('yields a not found error when the address cannot be found', done =>
      specHelper.defaultGateway.address.find('non-existent-customer', 'id', function (err, address) {
        assert.isNull(address);
        assert.equal(err.type, braintree.errorTypes.notFoundError);
        done();
      })
    );

    it('handles whitespace in the customer id', done =>
      specHelper.defaultGateway.address.find(' ', 'id', function (err, address) {
        assert.isNull(address);
        assert.equal(err.type, braintree.errorTypes.notFoundError);
        done();
      })
    );

    it('handles whitespace in the address', done =>
      specHelper.defaultGateway.address.find('blah', '\t ', function (err, address) {
        assert.isNull(address);
        assert.equal(err.type, braintree.errorTypes.notFoundError);
        done();
      })
    );
  });

  describe('update', function () {
    it('yields the updated address', done =>
      specHelper.defaultGateway.customer.create({}, (err, response) =>
        specHelper.defaultGateway.address.create({
          customerId: response.customer.id,
          streetAddress: '1 Old Street',
          extendedAddress: 'Old Extended',
          locality: 'Old City',
          region: 'Old State',
          postalCode: '60607',
          countryName: 'France'
        }, (err, response) => {
          let address = response.address;

          specHelper.defaultGateway.address.update(address.customerId, address.id, {
            streetAddress: '1 New Street',
            extendedAddress: 'New Extended',
            locality: 'New City',
            region: 'New State',
            postalCode: '60630',
            countryName: 'United States of America'
          }, function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.equal(response.address.streetAddress, '1 New Street');
            assert.equal(response.address.extendedAddress, 'New Extended');
            assert.equal(response.address.locality, 'New City');
            assert.equal(response.address.region, 'New State');
            assert.equal(response.address.postalCode, '60630');
            assert.equal(response.address.countryName, 'United States of America');
            done();
          });
        })
      )
    );

    it('handles invalid params', done =>
      specHelper.defaultGateway.customer.create({}, (err, response) =>
        specHelper.defaultGateway.address.create({
          customerId: response.customer.id,
          streetAddress: '1 Old Street',
          extendedAddress: 'Old Extended',
          locality: 'Old City',
          region: 'Old State',
          postalCode: '60607',
          countryName: 'France'
        }, (err, response) => {
          let address = response.address;

          specHelper.defaultGateway.address.update(address.customerId, address.id, {
            countryName: 'invalid country'
          }, function (err, response) {
            assert.isNull(err);
            assert.isFalse(response.success);
            assert.equal(response.message, 'Country name is not an accepted country.');
            assert.equal(response.errors.for('address').on('countryName')[0].code, '91803');
            assert.equal(response.errors.for('address').on('countryName')[0].attribute, 'country_name');
            let errorCodes = (() => {
              let result = [];

              for (let error of Array.from(response.errors.deepErrors())) {
                let code = error.code;

                result.push(code);
              }
              return result;
            })();

            assert.equal(errorCodes.length, 1);
            assert.include(errorCodes, '91803');
            done();
          });
        })
      )
    );
  });
});
