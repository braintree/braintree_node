require('../../spec_helper');

let { braintree } = specHelper;

describe("Braintree", () =>
  describe("AuthenticationError", () =>
    it("is returned with invalid credentials", function(done) {
      let gateway = specHelper.braintree.connect({
        environment: specHelper.braintree.Environment.Development,
        merchantId: 'invalid',
        publicKey: 'invalid',
        privateKey: 'invalid'
      });

      return gateway.transaction.sale({}, function(err, response) {
        assert.equal(err.type, braintree.errorTypes.authenticationError);

        return done();
      });
    })
  )
);
