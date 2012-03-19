require('../../spec_helper')
{WebhookNotification} = require('../../../lib/braintree/webhook_notification')
errorTypes = require('../../../lib/braintree/error_types')

vows
  .describe('WebhookNotificationGateway')
  .addBatch
    'verify':
      topic: specHelper.defaultGateway.webhookNotification.verify("verification_token")

      'creates a verification string for the challenge': (result) ->
        assert.equal(result, "integration_public_key|c9f15b74b0d98635cd182c51e2703cffa83388c3")

    'sampleNotification':
      topic: ->
        {signature, payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.SubscriptionWentPastDue,
          "my_id"
        )
        specHelper.defaultGateway.webhookNotification.parse(signature, payload, @callback)
        undefined

      'returns a parsable signature and payload': (err, webhookNotification) ->
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.SubscriptionWentPastDue)
        assert.equal(webhookNotification.subscription.id, "my_id")
        assert.ok(webhookNotification.timestamp?)

    'invalidSignature':
      topic: ->
        {signature, payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.SubscriptionWentPastDue,
          "my_id"
        )
        specHelper.defaultGateway.webhookNotification.parse("bad_signature", payload, @callback)
        undefined

      'gets an errback with InvalidSignatureError when signature is totally invalid': (err, webhookNotification) ->
        assert.equal(err.type, errorTypes.invalidSignatureError)

    'modifiedPublicKey':
      topic: ->
        {signature, payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.SubscriptionWentPastDue,
          "my_id"
        )
        specHelper.defaultGateway.webhookNotification.parse("bad#{signature}", payload, @callback)
        undefined

      'gets an errback with InvalidSignatureError when signature is totally invalid': (err, webhookNotification) ->
        assert.equal(err.type, errorTypes.invalidSignatureError)

    'modifiedSignature':
      topic: ->
        {signature, payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.SubscriptionWentPastDue,
          "my_id"
        )
        specHelper.defaultGateway.webhookNotification.parse("#{signature}bad", payload, @callback)
        undefined

      'gets an errback with InvalidSignatureError when signature is totally invalid': (err, webhookNotification) ->
        assert.equal(err.type, errorTypes.invalidSignatureError)

  .export(module)
