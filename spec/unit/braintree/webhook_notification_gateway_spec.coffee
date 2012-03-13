require('../../spec_helper')
{WebhookNotification} = require('../../../lib/braintree/webhook_notification')

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
          WebhookNotification.Kind.SubscriptionPastDue,
          "my_id"
        )
        specHelper.defaultGateway.webhookNotification.parse(signature, payload, @callback)
        undefined

      'returns a parsable signature and payload': (err, webhookNotification) ->
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.SubscriptionPastDue)
        assert.equal(webhookNotification.subscription.id, "my_id")
        assert.ok(webhookNotification.timestamp?)

  .export(module)
