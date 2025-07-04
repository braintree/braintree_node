"use strict";

let Nonces = {
  Transactable: "fake-valid-nonce",
  Consumed: "fake-consumed-nonce",
  PayPalOneTimePayment: "fake-paypal-one-time-nonce",
  // NEXT_MAJOR_VERSION - no longer supported in the Gateway, remove this constant
  PayPalFuturePayment: "fake-paypal-future-nonce",
  PayPalBillingAgreement: "fake-paypal-billing-agreement-nonce",
  ApplePayVisa: "fake-apple-pay-visa-nonce",
  ApplePayMasterCard: "fake-apple-pay-mastercard-nonce",
  ApplePayAmEx: "fake-apple-pay-amex-nonce",
  ApplePayMpan: "fake-apple-pay-mpan-nonce",
  AbstractTransactable: "fake-abstract-transactable-nonce",
  Europe: "fake-europe-bank-account-nonce",
  // NEXT_MAJOR_VERSION rename Android Pay to Google Pay
  AndroidPay: "fake-android-pay-nonce",
  AndroidPayDiscover: "fake-android-pay-discover-nonce",
  AndroidPayVisa: "fake-android-pay-visa-nonce",
  AndroidPayMasterCard: "fake-android-pay-mastercard-nonce",
  AndroidPayAmEx: "fake-android-pay-amex-nonce",
  ThreeDSecureVisaFullAuthentication:
    "fake-three-d-secure-visa-full-authentication-nonce",
  ThreeDSecureVisaLookupTimeout:
    "fake-three-d-secure-visa-lookup-timeout-nonce",
  ThreeDSecureVisaFailedSignature:
    "fake-three-d-secure-visa-failed-signature-nonce",
  ThreeDSecureVisaFailedAuthentication:
    "fake-three-d-secure-visa-failed-authentication-nonce",
  ThreeDSecureVisaAttemptsNonParticipating:
    "fake-three-d-secure-visa-attempts-non-participating-nonce",
  ThreeDSecureVisaNoteEnrolled: "fake-three-d-secure-visa-not-enrolled-nonce",
  ThreeDSecureVisaUnavailable: "fake-three-d-secure-visa-unavailable-nonce",
  ThreeDSecureVisaMPILookupError:
    "fake-three-d-secure-visa-mpi-lookup-error-nonce",
  ThreeDSecureVisaMPIAuthenticateError:
    "fake-three-d-secure-visa-mpi-authenticate-error-nonce",
  ThreeDSecureVisaAuthenticationUnavailable:
    "fake-three-d-secure-visa-authentication-unavailable-nonce",
  ThreeDSecureVisaBypassedAuthentication:
    "fake-three-d-secure-visa-bypassed-authentication-nonce",
  ThreeDSecureTwoVisaSuccessfulFrictionlessAuthentication:
    "fake-three-d-secure-two-visa-successful-frictionless-authentication-nonce",
  ThreeDSecureTwoVisaSuccessfulStepUpAuthentication:
    "fake-three-d-secure-two-visa-successful-step-up-authentication-nonce",
  ThreeDSecureTwoVisaErrorOnLookup:
    "fake-three-d-secure-two-visa-error-on-lookup-nonce",
  ThreeDSecureTwoVisaTimeoutOnLookup:
    "fake-three-d-secure-two-visa-timeout-on-lookup-nonce",
  TransactableVisa: "fake-valid-visa-nonce",
  TransactableAmEx: "fake-valid-amex-nonce",
  TransactableMasterCard: "fake-valid-mastercard-nonce",
  TransactableDiscover: "fake-valid-discover-nonce",
  TransactableJCB: "fake-valid-jcb-nonce",
  TransactableMaestro: "fake-valid-maestro-nonce",
  TransactableDinersClub: "fake-valid-dinersclub-nonce",
  TransactablePrepaid: "fake-valid-prepaid-nonce",
  TransactablePrepaidReloadable: "fake-valid-prepaid-reloadable-nonce",
  TransactableBusiness: "fake-valid-business-nonce",
  TransactableConsumer: "fake-valid-consumer-nonce",
  TransactableCorporate: "fake-valid-corporate-nonce",
  TransactablePurchase: "fake-valid-purchase-nonce",
  TransactableCommercial: "fake-valid-commercial-nonce",
  TransactableDurbinRegulated: "fake-valid-durbin-regulated-nonce",
  TransactableHealthcare: "fake-valid-healthcare-nonce",
  TransactableDebit: "fake-valid-debit-nonce",
  TransactablePayroll: "fake-valid-payroll-nonce",
  TransactableNoIndicators: "fake-valid-no-indicators-nonce",
  TransactableUnknownIndicators: "fake-valid-unknown-indicators-nonce",
  TransactableCountryOfIssuanceUSA: "fake-valid-country-of-issuance-usa-nonce",
  TransactableCountryOfIssuanceCAD: "fake-valid-country-of-issuance-cad-nonce",
  TransactableIssuingBankNetworkOnly:
    "fake-valid-issuing-bank-network-only-nonce",
  TransactablePinlessDebitVisa: "fake-pinless-debit-visa-nonce",
  ProcessorDeclinedVisa: "fake-processor-declined-visa-nonce",
  ProcessorDeclinedMasterCard: "fake-processor-declined-mastercard-nonce",
  ProcessorDeclinedAmEx: "fake-processor-declined-amex-nonce",
  ProcessorDeclinedDiscover: "fake-processor-declined-discover-nonce",
  ProcessorFailureJCB: "fake-processor-failure-jcb-nonce",
  LuhnInvalid: "fake-luhn-invalid-nonce",
  LocalPayment: "fake-local-payment-method-nonce",
  PayPalFuturePaymentRefreshToken: "fake-paypal-future-refresh-token-nonce",
  GatewayRejectedFraud: "fake-gateway-rejected-fraud-nonce",
  GatewayRejectedRiskThresholds: "fake-gateway-rejected-risk-thresholds-nonce",
  VenmoAccount: "fake-venmo-account-nonce",
  VenmoAccountTokenIssuanceError:
    "fake-token-issuance-error-venmo-account-nonce",
  VisaCheckoutAmEx: "fake-visa-checkout-amex-nonce",
  VisaCheckoutDiscover: "fake-visa-checkout-discover-nonce",
  VisaCheckoutMasterCard: "fake-visa-checkout-mastercard-nonce",
  VisaCheckoutVisa: "fake-visa-checkout-visa-nonce",
  // NEXT_MAJOR_VERSION SamsungPayCard is deprecated, remove all associated nonces
  SamsungPayAmEx: "tokensam_fake_american_express",
  SamsungPayDiscover: "tokensam_fake_discover",
  SamsungPayMasterCard: "tokensam_fake_mastercard",
  SamsungPayVisa: "tokensam_fake_visa",
  SepaDirectDebit: "fake-sepa-direct-debit-nonce",
  UsBankAccount: "fake-us-bank-account-nonce",
  MetaCheckoutCard: "fake-meta-checkout-card-nonce",
  MetaCheckoutToken: "fake-meta-checkout-token-nonce",
};

module.exports = { Nonces: Nonces };
