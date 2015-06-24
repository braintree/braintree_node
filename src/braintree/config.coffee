{CredentialsParser} = require('./credentials_parser')

class Config
  constructor: (rawConfig) ->
    @apiVersion = '4'
    parser = new CredentialsParser()
    if rawConfig.clientId || rawConfig.clientSecret
      parser.parseClientCredentials(rawConfig.clientId, rawConfig.clientSecret)
      @clientId = parser.clientId
      @clientSecret = parser.clientSecret
      @environment = parser.environment
    else
      @publicKey = rawConfig.publicKey
      @privateKey = rawConfig.privateKey
      @merchantId = rawConfig.merchantId || rawConfig.partnerId
      @environment = rawConfig.environment
      @baseMerchantPath = "/merchants/#{rawConfig.merchantId}"

  baseMerchantUrl: -> @environment.baseUrl() + @baseMerchantPath

exports.Config = Config
