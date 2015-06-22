require('../../spec_helper')

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
