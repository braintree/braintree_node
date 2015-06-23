require('../../spec_helper')
{ValidationErrorCodes} = require('../../../lib/braintree/validation_error_codes')

braintree = specHelper.braintree

describe "OAuthGateway", ->
  describe "createTokenFromCode", ->
    it "creates token from code using oauth credentials", (done) ->
      gateway = braintree.connect {
        clientId: 'client_id$development$integration_client_id'
        clientSecret: 'client_secret$development$integration_client_secret'
        environment: braintree.Environment.Development
      }

      specHelper.createGrant gateway, {merchantPublicId: 'integration_merchant_id', scope: 'read_write'}, (err, code) ->
        gateway.oauth.createTokenFromCode {code: code, scope: 'read_write'}, (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
          credentials = response.credentials
          assert.isNotNull(credentials.accessToken)
          assert.isNotNull(credentials.refreshToken)
          assert.isNotNull(credentials.expiresAt)
          assert.equal(credentials.tokenType, 'bearer')

          done()

    it "returns validation errors when using a bad grant code", (done) ->
      gateway = braintree.connect {
        clientId: 'client_id$development$integration_client_id'
        clientSecret: 'client_secret$development$integration_client_secret'
        environment: braintree.Environment.Development
      }

      gateway.oauth.createTokenFromCode {code: 'badCode', scope: 'read_write'}, (err, response) ->
        assert.isNull(err)
        assert.isFalse(response.success)
        assert.equal(
          response.errors.for('credentials').on('code')[0].code,
          ValidationErrorCodes.OAuth.InvalidGrant,
        )
        assert.equal(
          response.message,
          'Invalid grant: code not found',
        )

        done()

  describe "createTokenFromRefreshToken", ->
    it "creates an access token from a refresh token", (done) ->
      gateway = braintree.connect {
        clientId: 'client_id$development$integration_client_id'
        clientSecret: 'client_secret$development$integration_client_secret'
        environment: braintree.Environment.Development
      }

      specHelper.createGrant gateway, {merchantPublicId: 'integration_merchant_id', scope: 'read_write'}, (err, code) ->
        gateway.oauth.createTokenFromCode {code: code, scope: 'read_write'}, (err, refreshTokenResponse) ->
          gateway.oauth.createTokenFromRefreshToken {refreshToken: refreshTokenResponse.credentials.refreshToken, scope: 'read_write'}, (err, response) ->
            assert.isNull(err)
            assert.isTrue(response.success)
            credentials = response.credentials
            assert.isNotNull(credentials.accessToken)
            assert.isNotNull(credentials.refreshToken)
            assert.isNotNull(credentials.expiresAt)
            assert.equal(credentials.tokenType, "bearer")

            done()
