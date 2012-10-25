{Gateway} = require('./gateway')
{CreditCardVerification} = require('./credit_card_verification')
{CreditCardVerificationSearch} = require('./credit_card_verification_search')

util = require('util')
_ = require('underscore')

exceptions = require('./exceptions')

class CreditCardVerificationGateway extends Gateway
  constructor: (@gateway) ->

  find: (creditCardVerificationId, callback) ->
    if(creditCardVerificationId.trim() == '')
      callback(exceptions.NotFoundError(), null)
    else
      @gateway.http.get "/verifications/#{creditCardVerificationId}", (err, response) ->
        if err
          callback(err, null)
        else
          callback(null, new CreditCardVerification(response.verification))

  search: (fn, callback) ->
    search = new CreditCardVerificationSearch()
    fn(search)
    @gateway.http.post("/verifications/advanced_search_ids", {search: search.toHash()}, @searchResponseHandler(@pagingFunctionGenerator(search), callback))

  responseHandler: (callback) ->
    @createResponseHandler("creditCardVerification", CreditCardVerification, callback)

  pagingFunctionGenerator: (search) ->
    (ids, callback) =>
      searchCriteria = search.toHash()
      searchCriteria["ids"] = ids
      @gateway.http.post("/verifications/advanced_search",
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
