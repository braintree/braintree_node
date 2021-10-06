'use strict';

let ValidationErrorCodes = require('../../../lib/braintree/validation_error_codes').ValidationErrorCodes;

let braintree = specHelper.braintree;

describe('OAuthGateway', function () {
  describe('createTokenFromCode', function () {
    it('creates token from code using oauth credentials', function (done) {
      let gateway = new braintree.BraintreeGateway({
        clientId: 'client_id$development$integration_client_id',
        clientSecret: 'client_secret$development$integration_client_secret'
      });

      specHelper.createGrant(gateway, {merchantPublicId: 'integration_merchant_id', scope: 'read_write'}, (err, code) =>
        gateway.oauth.createTokenFromCode({code, scope: 'read_write'}, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          let credentials = response.credentials;

          assert.isNotNull(credentials.accessToken);
          assert.isNotNull(credentials.refreshToken);
          assert.isNotNull(credentials.expiresAt);
          assert.equal(credentials.tokenType, 'bearer');

          done();
        })
      );
    });

    it('returns validation errors when using a bad grant code', function (done) {
      let gateway = new braintree.BraintreeGateway({
        clientId: 'client_id$development$integration_client_id',
        clientSecret: 'client_secret$development$integration_client_secret'
      });

      return gateway.oauth.createTokenFromCode({code: 'badCode', scope: 'read_write'}, function (err, response) {
        assert.isNull(err);
        assert.isFalse(response.success);
        assert.equal(
          response.errors.for('credentials').on('code')[0].code,
          ValidationErrorCodes.OAuth.InvalidGrant
        );
        assert.equal(
          response.message,
          'Invalid grant: code not found'
        );

        done();
      });
    });
  });

  describe('createTokenFromRefreshToken', () =>
    it('creates an access token from a refresh token', function (done) {
      let gateway = new braintree.BraintreeGateway({
        clientId: 'client_id$development$integration_client_id',
        clientSecret: 'client_secret$development$integration_client_secret'
      });

      specHelper.createGrant(gateway, {merchantPublicId: 'integration_merchant_id', scope: 'read_write'}, (err, code) =>
        gateway.oauth.createTokenFromCode({code, scope: 'read_write'}, (err, refreshTokenResponse) =>
          gateway.oauth.createTokenFromRefreshToken({refreshToken: refreshTokenResponse.credentials.refreshToken, scope: 'read_write'}, function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            let credentials = response.credentials;

            assert.isNotNull(credentials.accessToken);
            assert.isNotNull(credentials.refreshToken);
            assert.isNotNull(credentials.expiresAt);
            assert.equal(credentials.tokenType, 'bearer');

            done();
          })
        )
      );
    })
  );

  describe('revokeAccessToken', () =>
    it('revokes an access token', function (done) {
      let gateway = new braintree.BraintreeGateway({
        clientId: 'client_id$development$integration_client_id',
        clientSecret: 'client_secret$development$integration_client_secret'
      });

      specHelper.createGrant(gateway, {merchantPublicId: 'integration_merchant_id', scope: 'read_write'}, (err, code) =>
        gateway.oauth.createTokenFromCode({code, scope: 'read_write'}, (err, accessTokenResponse) =>
          gateway.oauth.revokeAccessToken(accessTokenResponse.credentials.accessToken, function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.isTrue(response.result.success);

            gateway = new braintree.BraintreeGateway({
              accessToken: accessTokenResponse.credentials.accessToken
            });

            return gateway.customer.create({}, function (err) {
              assert.isNotNull(err);
              assert.equal(err.name, 'authenticationError');

              done();
            });
          })
        )
      );
    })
  );

  describe('connectUrl', function () {
    it('builds a connect url', function () {
      let queryString;
      let gateway = new braintree.BraintreeGateway({
        clientId: 'client_id$development$integration_client_id',
        clientSecret: 'client_secret$development$integration_client_secret'
      });

      let url = gateway.oauth.connectUrl({
        merchantId: 'integration_merchant_id',
        redirectUri: 'http://bar.example.com',
        scope: 'read_write',
        state: 'baz_state',
        landingPage: 'login',
        loginOnly: 'true',
        user: {
          country: 'USA',
          email: 'foo@example.com',
          firstName: 'Bob',
          lastName: 'Jones',
          phone: '555-555-5555',
          dobYear: '1970',
          dobMonth: '01',
          dobDay: '01',
          streetAddress: '222 W Merchandise Mart',
          locality: 'Chicago',
          region: 'IL',
          postalCode: '60606'
        },
        business: {
          name: '14 Ladders',
          registeredAs: '14.0 Ladders',
          industry: 'Ladders',
          description: 'We sell the best ladders',
          streetAddress: '111 N Canal',
          locality: 'Chicago',
          region: 'IL',
          postalCode: '60606',
          country: 'USA',
          annualVolumeAmount: '1000000',
          averageTransactionAmount: '100',
          maximumTransactionAmount: '10000',
          shipPhysicalGoods: true,
          fulfillmentCompletedIn: 7,
          currency: 'USD',
          website: 'http://example.com'
        },
        paymentMethods: ['credit_card', 'paypal']
      });

      let query = function (searchKey) { // eslint-disable-line func-style
        let parts = queryString.split('&');
        let foundValue;

        parts.forEach(function (part) {
          let parts = Array.from(part.split('='));
          let key = parts[0];
          let value = parts[1];

          if (decodeURIComponent(key) === searchKey) {
            foundValue = decodeURIComponent(value);
          }
        });

        return foundValue;
      };

      let parts = Array.from(url.split('?'));
      let urlAndPath = parts[0];
      let port = process.env.GATEWAY_PORT || '3000';

      queryString = parts[1];

      assert.equal(urlAndPath, `http://localhost:${port}/oauth/connect`);

      assert.equal(query('merchant_id'), 'integration_merchant_id');

      assert.equal(query('user[country]'), 'USA');

      assert.equal(query('merchant_id'), 'integration_merchant_id');
      assert.equal(query('client_id'), 'client_id$development$integration_client_id');
      assert.equal(query('redirect_uri'), 'http://bar.example.com');
      assert.equal(query('scope'), 'read_write');
      assert.equal(query('state'), 'baz_state');
      assert.equal(query('landing_page'), 'login');
      assert.equal(query('login_only'), 'true');

      assert.equal(query('user[country]'), 'USA');
      assert.equal(query('business[name]'), '14 Ladders');

      assert.equal(query('user[email]'), 'foo@example.com');
      assert.equal(query('user[first_name]'), 'Bob');
      assert.equal(query('user[last_name]'), 'Jones');
      assert.equal(query('user[phone]'), '555-555-5555');
      assert.equal(query('user[dob_year]'), '1970');
      assert.equal(query('user[dob_month]'), '01');
      assert.equal(query('user[dob_day]'), '01');
      assert.equal(query('user[street_address]'), '222 W Merchandise Mart');
      assert.equal(query('user[locality]'), 'Chicago');
      assert.equal(query('user[region]'), 'IL');
      assert.equal(query('user[postal_code]'), '60606');

      assert.equal(query('business[name]'), '14 Ladders');
      assert.equal(query('business[registered_as]'), '14.0 Ladders');
      assert.equal(query('business[industry]'), 'Ladders');
      assert.equal(query('business[description]'), 'We sell the best ladders');
      assert.equal(query('business[street_address]'), '111 N Canal');
      assert.equal(query('business[locality]'), 'Chicago');
      assert.equal(query('business[region]'), 'IL');
      assert.equal(query('business[postal_code]'), '60606');
      assert.equal(query('business[country]'), 'USA');
      assert.equal(query('business[annual_volume_amount]'), '1000000');
      assert.equal(query('business[average_transaction_amount]'), '100');
      assert.equal(query('business[maximum_transaction_amount]'), '10000');
      assert.equal(query('business[ship_physical_goods]'), 'true');
      assert.equal(query('business[fulfillment_completed_in]'), '7');
      assert.equal(query('business[currency]'), 'USD');
      assert.equal(query('business[website]'), 'http://example.com');
    });

    it('builds a connect url without optional parameters', function () {
      let queryString;
      let gateway = new braintree.BraintreeGateway({
        clientId: 'client_id$development$integration_client_id',
        clientSecret: 'client_secret$development$integration_client_secret'
      });

      let url = gateway.oauth.connectUrl({});

      let query = function (searchKey) { // eslint-disable-line func-style
        let parts = queryString.split('&');
        let foundValue;

        parts.forEach(function (part) {
          let parts = Array.from(part.split('='));
          let key = parts[0];
          let value = parts[1];

          if (decodeURIComponent(key) === searchKey) {
            foundValue = decodeURIComponent(value);
          }
        });

        return foundValue;
      };

      let parts = Array.from(url.split('?'));

      queryString = parts[1];

      assert.equal(query('redirect_url'), null);
    });

    it('encodes connect url query parameters containing special characters not encoded by encodeURIComponent', function () {
      let queryString;
      let gateway = new braintree.BraintreeGateway({
        clientId: 'client_id$development$integration_client_id',
        clientSecret: 'client_secret$development$integration_client_secret'
      });

      let url = gateway.oauth.connectUrl({
        merchantId: 'integration_merchant_id',
        redirectUri: 'http://bar.example.com',
        business: {
          name: "wacky symbols !'()*"
        }
      });

      queryString = Array.from(url.split('?'))[1];

      let parts = Array.from(queryString.split('&').find(item => item.indexOf('wacky') > -1).split('='));
      let key = parts[0];
      let value = parts[1];

      assert.equal(key, 'business%5Bname%5D');
      assert.equal(value, 'wacky%20symbols%20%21%27%28%29%2A');
    });

    it('builds a connect url with multiple payment methods', function () {
      let queryString;
      let gateway = new braintree.BraintreeGateway({
        clientId: 'client_id$development$integration_client_id',
        clientSecret: 'client_secret$development$integration_client_secret'
      });

      let url = gateway.oauth.connectUrl({
        paymentMethods: ['credit_card', 'paypal']
      });

      let query = function (searchKey) { // eslint-disable-line func-style
        let parts = queryString.split('&');
        let matches = [];

        parts.forEach(function (part) {
          let parts = Array.from(part.split('='));
          let key = parts[0];
          let value = parts[1];

          if (decodeURIComponent(key) === searchKey) {
            matches.push(decodeURIComponent(value));
          }
        });

        return matches;
      };

      let parts = Array.from(url.split('?'));

      queryString = parts[1];

      assert.deepEqual(query('payment_methods[]'), ['credit_card', 'paypal']);
    });

    it("doesn't modify the argument", function () {
      let gateway = new braintree.BraintreeGateway({
        clientId: 'client_id$development$integration_client_id',
        clientSecret: 'client_secret$development$integration_client_secret'
      });
      let options = {paymentMethods: ['credit_card']};

      gateway.oauth.connectUrl(options);

      assert.deepEqual(options, {paymentMethods: ['credit_card']});
    });
  });
});
