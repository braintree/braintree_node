{Digest} = require('./digest')
{SignatureService} = require('./signature_service')

class ClientToken

  @generate: (merchantId, publicKey, privateKey, clientApiUrl, authUrl, options={}) ->
    date = new Date()
    payload = {
      public_key: publicKey,
      created_at: new Date().toISOString(),
    }

    if "customerId" of options
      payload.customer_id = options.customerId

    if "makeDefault" of options
      payload["credit_card[options][make_default]"] = options.makeDefault
    if "verifyCard" of options
      payload["credit_card[options][verify_card]"] = options.verifyCard
    if "failOnDuplicatePaymentMethod" of options
      payload["credit_card[options][fail_on_duplicate_payment_method]"] = options.failOnDuplicatePaymentMethod

    payloadList = []
    for key, value of payload
      payloadList.push("#{key}=#{value}")

    payloadString = payloadList.join("&")
    fingerprint = new SignatureService(privateKey, Digest.Sha256hexdigest).sign(payloadString)
    JSON.stringify({
      authorization_fingerprint: fingerprint,
      client_api_url: clientApiUrl,
      auth_url: authUrl
    })

exports.ClientToken = ClientToken
