{Gateway} = require('./gateway')
{CreditCardVerification} = require('./credit_card_verification')
{CreditCardVerificationSearch} = require('./credit_card_verification_search')

util = require('util')
_ = require('underscore')

exceptions = require('./exceptions')

class CreditCardVerificationGateway extends Gateway
  constructor: (@gateway) ->
    @config = @gateway.config

  find: (creditCardVerificationId, callback) ->
    if(creditCardVerificationId.trim() == '')
      callback(exceptions.NotFoundError("Not Found"), null)
    else
      @gateway.http.get "#{@config.baseMerchantPath()}/verifications/#{creditCardVerificationId}", (err, response) ->
        if err
          callback(err, null)
        else
          callback(null, new CreditCardVerification(response.verification))

  search: (fn, callback) ->
    search = new CreditCardVerificationSearch()
    fn(search)
    @createSearchResponse("#{@config.baseMerchantPath()}/verifications/advanced_search_ids", search, @pagingFunctionGenerator(search), callback)

  create: (params, callback) ->
    @gateway.http.post "#{@config.baseMerchantPath()}/verifications",
                       {"verification": params},
                       @createResponseHandler("verification", CreditCardVerification, callback)

  responseHandler: (callback) ->
    @createResponseHandler("creditCardVerification", CreditCardVerification, callback)

  pagingFunctionGenerator: (search) ->
    (ids, callback) =>
      searchCriteria = search.toHash()
      searchCriteria["ids"] = ids
      @gateway.http.post("#{@config.baseMerchantPath()}/verifications/advanced_search",
        { search : searchCriteria },
        (err, response) ->
          if err
            callback(err, null)
          else
            if _.isArray(response.creditCardVerifications.verification)
              for creditCardVerification in response.creditCardVerifications.verification
                callback(null, new CreditCardVerification(creditCardVerification))
            else
              callback(null, new CreditCardVerification(response.creditCardVerifications.verification)))

exports.CreditCardVerificationGateway = CreditCardVerificationGateway
