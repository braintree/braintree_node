'use strict';

let CustomerGateway = require('../../../lib/braintree/customer_gateway').CustomerGateway;
let errorTypes = require('../../../lib/braintree/error_types').errorTypes;

describe('CustomerGateway', () =>
  describe('sale', function () {
    let fakeGateway = {
      config: {
        baseMerchantPath() {
          return '';
        }
      },
      http: {
        post(url, params) {
          return Promise.resolve(params);
        }
      }
    };

    it('throws error if not a valid input', function (done) {
      let customerGateway = new CustomerGateway(fakeGateway);
      let customerParams = {
        invalidParam: 'invalidValue'
      };

      customerGateway.create(customerParams, (err, params) => {
        assert.notExists(params);
        assert.isNotNull(err);

        assert.equal(err.type, errorTypes.invalidKeysError);
        assert.equal(err.message, 'These keys are invalid: invalidParam');
        done();
      });
    });
  })
);
