{CredentialsParser} = require('./credentials_parser')

class Config
  constructor: (rawConfig) ->
    @timeout = 60000
    @apiVersion = '4'
    parser = new CredentialsParser()
    if rawConfig.clientId || rawConfig.clientSecret
      parser.parseClientCredentials(rawConfig.clientId, rawConfig.clientSecret)
      @clientId = parser.clientId
      @clientSecret = parser.clientSecret
      @environment = parser.environment
    else if rawConfig.accessToken
      parser.parseAccessToken(rawConfig.accessToken)
      @accessToken = parser.accessToken
      @environment = parser.environment
      @merchantId = parser.merchantId
    else
      @publicKey = rawConfig.publicKey
      @privateKey = rawConfig.privateKey
      @merchantId = rawConfig.merchantId || rawConfig.partnerId
      @environment = rawConfig.environment
      throw new Error('Missing publicKey') unless @publicKey
      throw new Error('Missing privateKey') unless @privateKey
      throw new Error('Missing merchantId') unless @merchantId
      throw new Error('Missing environment') unless @environment

  baseMerchantPath: -> "/merchants/#{@merchantId}"

  baseUrl: -> @environment.baseUrl()

  baseMerchantUrl: -> @baseUrl() + @baseMerchantPath()

exports.Config = Config
