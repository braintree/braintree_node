generate = (number) ->
  "stub-" + number

VenmoSdk = {
  generateTestPaymentMethodCode: generate
  VisaPaymentMethodCode: generate("4111111111111111")
}

exports.VenmoSdk = VenmoSdk
