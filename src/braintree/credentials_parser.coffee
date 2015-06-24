{Environment} = require('./environment')

class CredentialsParser
  parseClientCredentials: (@clientId, @clientSecret) ->
    throw new Error('Missing clientId') unless @clientId
    throw new Error('Missing clientSecret') unless @clientSecret

    throw new Error('Value passed for clientId is not a client id') if @clientId.indexOf('client_id') != 0
    throw new Error('Value passed for clientSecret is not a client secret') if @clientSecret.indexOf('client_secret') != 0

    clientIdEnvironment = @parseEnvironment(@clientId)
    clientSecretEnvironment = @parseEnvironment(@clientSecret)
    if clientIdEnvironment != clientSecretEnvironment
      throw new Error("Mismatched credential environments: clientId environment is #{clientIdEnvironment} and clientSecret environment is #{clientSecretEnvironment}")
    else
      @environment = clientIdEnvironment

  parseEnvironment: (credential) ->
    env = credential.split('$')[1]
    switch env
      when 'development', 'integration' then Environment.Development
      when 'qa' then Environment.Qa
      when 'sandbox' then Environment.Sandbox
      when 'production' then Environment.Production
      else throw new Error('Unknown environment: ' + env)

exports.CredentialsParser = CredentialsParser
