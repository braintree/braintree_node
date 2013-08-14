require('../../spec_helper')

braintree = specHelper.braintree
{MerchantAccount} = require('../../../lib/braintree/merchant_account')
{ValidationErrorCodes} = require('../../../lib/braintree/validation_error_codes')

merchantAccountParams =
  applicantDetails:
    companyName: "Waterfalls, inc"
    firstName: "Joe"
    lastName: "Bloggs"
    email: "joe@bloggs.com"
    phone: "555-555-5555"
    address:
      streetAddress: "123 Credibility St."
      postalCode: "60606"
      locality: "Chicago"
      region: "IL"
    dateOfBirth: "10/9/1980"
    ssn: "123-000-1234"
    taxId: "123456789"
    routingNumber: "122100024"
    accountNumber: "43759348798"
  tosAccepted: true
  masterMerchantAccountId: "sandbox_master_merchant_account"

describe "MerchantAccountGateway", ->
  describe "create", ->
    it "doesn't require an id", (done) ->
      specHelper.defaultGateway.merchantAccount.create merchantAccountParams, (err, response) ->
        assert.isTrue(response.success)
        assert.equal(response.merchantAccount.status, MerchantAccount.Status.Pending)
        assert.equal(response.merchantAccount.masterMerchantAccount.id, "sandbox_master_merchant_account")

        done()

    it "allows an id", (done) ->
      paramsWithId = new merchantAccountParams.constructor()
      for key of merchantAccountParams
        paramsWithId[key] = merchantAccountParams[key]
      rand = Math.floor(Math.random() * 1000)
      paramsWithId["id"] = "sub_merchant_account_id" + rand
      specHelper.defaultGateway.merchantAccount.create paramsWithId, (err, response) ->
        assert.isTrue(response.success)
        assert.equal(response.merchantAccount.status, MerchantAccount.Status.Pending)
        assert.equal(response.merchantAccount.masterMerchantAccount.id, "sandbox_master_merchant_account")
        assert.equal(response.merchantAccount.id, "sub_merchant_account_id" + rand)

        done()

    it "handles an unsuccessful result", (done) ->
      specHelper.defaultGateway.merchantAccount.create {}, (err, response) ->
        assert.isFalse(response.success)
        assert.equal(
          response.errors.for('merchantAccount').on('masterMerchantAccountId')[0].code,
          ValidationErrorCodes.MerchantAccount.MasterMerchantAccountIdIsRequired
        )

        done()
