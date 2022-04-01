# Changelog
## 3.11.0

- Added test for `retried` field on transaction.sale response

## 3.10.0

- Add `PaymentMethodCustomerDataUpdated` webhook notification support

## 3.9.0

- Add support for passing a custom [http agent](https://nodejs.org/api/http.html#class-httpagent) in Configuration (thanks @blugavere & @James1x0!)

## 3.8.0

- Add support for `TransactionReview` webhook notification
- Add plan create/update/find API endpoint

## 3.7.0

- Add error code `TaxAmountIsRequiredForAibSwedish` for attribute `tax_amount` in `transaction` key for AIB:Domestic transactions in Sweden
- Add `exchangeRateQuoteId` to `TransactionGateway`
- Add `ExchangeRateQuoteIdIsTooLong` to `validation_error_codes`
- Add the following fields to `AndroidPayCard` and `ApplePayCard`:
  - `commercial`
  - `debit`
  - `durbinRegulated`
  - `healthcare`
  - `payroll`
  - `prepaid`
  - `productId`
  - `countryOfIssuance`
  - `issuingBank`
- Add `localPaymentFunded` and `localPaymentExpired` webhook notication support

## 3.6.0

- Fix issue where webhook data passed to `LocalPaymentReversed` webhook class is missing
- Add `grantedPaymentInstrumentUpdate` to `WebhookNotification`

## 3.5.0

- Add `paymentReaderCardDetails` parameter to `Transaction.sale`
- Add `skipAdvancedFraudChecking` to `Customer.create` and `Customer.update`
- Add webhook sample for `GrantedPaymentMethodRevoked`
- Add `venmoAccountDetails` to `Transaction`
- Add `chargebackProtectionLevel` into dispute search

## 3.4.0

- Add `taxIdentifiers` parameter to `Customer.create` and `Customer.update`

## 3.3.0

- Add `LocalPaymentReversed` webhook notification support
- Support all options for `gateway.transaction.submitForSettlement` and `gateway.transaction.submitForPartialSettlement`
- Fix issue where options passed to `gateway.transaction.submitForSettlement` were being ignored (closes #168)
- Fix issue where options passed to `gateway.transaction.submitForPartialSettlement` were being ignored
- Add `storeId` and `storeIds` fields to `Transaction.search`
- Add `Transaction.adjustAuthorization()` method to support multiple authorizations for a single transaction

## 3.2.2

- Update `dateformat` module to v4.5.1

## 3.2.1

- Remove unnecessary `user` package (#186)

## 3.2.0

- `plan.all`, `discount.all` and `addOn.all` return collections of plan, discount and addOn objects respectively. (fixes #178)
- Deprecate `deviceSessionId` and `fraudMerchantId` in the `CrediteCardGateway`, `CustomerGateway`, `PaymentMethodGateway`, and `TransactionGateway` classes

* Add `installments` to `Transaction` requests
* Add `count` to `installments`
* Add `scaExemption` to `TransactionGateway`
* Add exceptions defined in `exceptions.js` as an export (thanks @jtcooper10!)

## 3.1.0

- Add `AcquirerReferenceNumber` to `Transaction`
- Deprecate `recurring` in `transaction.sale()` requests

## 3.0.0

- Add `RequestTimeoutError` and `GatewayTimeoutError` exceptions
- Remove several no-longer-used dependencies (underscore, semver and readable-stream)
- Breaking Changes
  - Rename `braintree/lib/test` to `braintree/lib/test_values` to avoid accidental removal of directories named `test` (fixes #98 and #174)
  - Remove deprecated iDEAL, Coinbase, and Transparent Redirect
  - Remove deprecated `connect` method
  - Config class now throws an error when token environment does not match passed environment
  - Remove `GrantedPaymentInstrumentUpdate` (deprecated in 2.16.0)
  - Remove `InvalidTransparentRedirectHashError`
  - Remove `SEPA` test nonce
  - Remove deprecated `tag` parameter from dispute calls
  - Remove deprecated validation error codes:
    - `DiscountAmountMustBeGreaterThanZero`
    - `UnitTaxAmountMustBeGreaterThanZero`
    - `SEPABankAccount`:
      - `IBANIsRequired`
      - `BICIsRequired`
      - `AccountHolderNameIsRequired`
    - `SEPAMandate`:
      - `AccountHolderNameIsRequired`
      - `BICIsRequired`
      - `IBANIsRequired`
      - `TypeIsRequired`
      - `IBANInvalidCharacter`
      - `BICInvalidCharacter`
      - `BICLengthIsInvalid`
      - `BICUnsupportedCountry`
      - `IBANUnsupportedCountry`
      - `IBANInvalidFormat`
      - `BillingAddressConflict`
      - `BillingAddressIdIsInvalid`
      - `TypeIsInvalid`
    - `AmountDoesNotMatchIdealPaymentAmount`
    - `IdealPaymentNotComplete`
    - `IdealPaymentsCannotBeVaulted`
    - `MerchantAccountDoesNotMatchIdealPaymentMerchantAccount`
    - `OrderIdDoesNotMatchIdealPaymentOrderId`
    - `OrderIdIsRequiredWithIdealPayment`
  - Rename `DownForMaintenanceError` to `ServiceUnavailableError`
  - Transaction searches throw `UnexpectedError` instead of `DownForMaintenanceError` when search response yields unexpected results
  - Remove Masterpass Card support
  - Remove Amex Express Checkout Card support
  - Rename `braintree/lib/test` to `braintree/lib/test_values` to avoid accidental removal of directories named `test` (fixes #98 and #174)
  - Fix bug where `expired` and `expiringBetween` methods on `CreditCardGateway` did not return full credit card results
  - Bump API version to support declined refund objects.

## 2.24.0

- Add \* `GatewayRejectionReason.RiskThreshold` to `Transaction`
- Update @braintree/wrap-promise to v2.1.0
- Add `networkTransactionId` to `CreditCardVerification`
- Add `retrievalReferenceNumber` to `Transaction`
- Add `productSku` to `Transaction`
- Add `phoneNumber` and `shippingMethod` to `Address`
- Add `customerDeviceId`, `customerLocationZip`, and `customerTenure` to `RiskData`
- Add validation errors:
  - `Transaction.ProductSkuIsInvalid`
  - `Transaction.ShippingMethodIsInvalid`
  - `Transaction.ShippingPhoneNumberIsInvalid`
  - `Transaction.BillingPhoneNumberIsInvalid`
  - `RiskData.CustomerBrowserIsTooLong`
  - `RiskData.CustomerDeviceIdIsTooLong`
  - `RiskData.CustomerLocationZipInvalidCharacters`
  - `RiskData.CustomerLocationZipIsInvalid`
  - `RiskData.CustomerLocationZipIsTooLong`
  - `RiskData.CustomerTenureIsTooLong`
- Add `processedWithNetworkToken` to `Transaction`
- Add `isNetworkTokenized` to `CreditCard`

## 2.23.0

- Add `threeDSecurePassThru` parameters to `Customer.create`, `PaymentMethod.create`, `CreditCard.create`, `Customer.update`, `PaymentMethod.update` and `CreditCard.update`
- Add `threeDSecureAuthenticationId` support on transaction sale
- Add ThreeDSecure test payment method nonces
- Add test `AuthenticationId`s Unreleased
- Add `DisputeAccepted`, `DisputeDisputed`, and `DisputeExpired` webhook constants
- Add `Authentication Insight` support to payment method nonce create
- Add `recurringCustomerConsent` and `recurringMaxAmount` to `authenticationInsightOptions` for `PaymentMethodNonce.create`
- Add `FileIsEmpty` error code

## 2.22.0

- Add `RefundAuthHardDeclined` and `RefundAuthSoftDeclined` to validation errors
- Add GraphQL ID to `CreditCardVerification`, `Customer`, `Dispute`, and `Transaction`
- Add level 2 processing options `purchaseOrderNumber`, `taxAmount`, and `taxExempt` on transaction submitForSettlement
- Add level 3 processing options `discountAmount`, `shippingAmount`, `shipsFromPostalCode`, and `lineItems` on transaction submitForSettlement

## 2.21.0

- Add `AmountNotSupportedByProcessor` validation error to Transaction
- Add `ProcessorDoesNotSupportMotoForCardType` to validation errors
- Fix issue where `SettlementBatchSummary` did not include some custom fields

## 2.20.0

- Add Venmo `TokenIssuance` gateway rejection reason

## 2.19.0

- Add `PostalCodeIsRequiredForCardBrandAndProcessor` to validation errors
- Add `PayPalHereDetails` to Transaction
- Add `xid`, `cavv`, `eciFlag`, `dsTransactionId`, and `threeDSecureVersion` to `ThreeDSecureInfo`
- Add `ThreeDSecureInfo` to `CreditCardVerification`
- Add `GraphQLClient` to `BraintreeGateway` class

## 2.18.0

- Add `captureId` field to localPayment
- Add `refundId` field to localPayment
- Add `debugId` field to localPayment
- Add `transactionFeeAmount` field to localPayment
- Add `transactionFeeCurrencyIsoCode` field to localPayment
- Add `refundFromTransactionFeeAmount` field to localPayment
- Add `refundFromTransactionFeeCurrencyIsoCode` field to localPayment
- Add `threeDSecureVersion`, `authenticationResponse`, `directoryResponse`, `cavvAlgorithm` and `dsTransactionId` to 3DS pass thru fields
- Add `payerInfo` field to paymentMethodNonce
- Add `roomTax` support on transaction sale
- Add `noShow` support on transaction sale
- Add `advancedDeposit` support on transaction sale
- Add `fireSafe` support on transaction sale
- Add `propertyPhone` support on transaction sale
- Add `additionalCharges` support on transaction sale

## 2.17.0

- Update @braintree/wrap-promise to v2.0.0
  - Errors thrown inside developer provided callback functions will log in the console instead of killing the node process [wrap-promise#4](https://github.com/braintree/wrap-promise/issues/4)
- Add `refundFromTransactionFeeAmount` field to paypalAccount
- Add `refundFromTransactionFeeCurrencyIsoCode` field to paypalAccount
- Add `LocalPaymentDetails` to transactions
- Add `revokedAt` field to paypalAccount
- Add support for `PaymentMethodRevokedByCustomer` webhook
- Add `payment_method_nonce` field to `LocalPaymentCompleted` webhook
- Add `transaction` field to `LocalPaymentCompleted` webhook

## 2.16.0

- Deprecate `GrantedPaymentInstrumentUpdate` and add `GrantorUpdatedGrantedPaymentMethod` and `RecipientUpdatedGrantedPaymentMethod`
- Add `accountType` to `Transaction`, `PaymentMethod`, and `CreditCardVerification`.

## 2.15.0

- Add `bin` field to `paymentMethodNonceDetails`
- Add Error indicating pdf uploads too long for dispute evidence.
- Add `GrantedPaymentMethodRevoked` webhook response objects
- Add ability to instantiate a new Braintree Gateway directly
- Add `GraphQL` to main module (`require('braintree').GraphQL`)

## 2.14.0

- Add `processor_response_type` to `Transaction`, `AuthorizationAdjustment`, and `CreditCardVerification`.
- Add `authorizationExpiresAt` to `Transaction`
- Fix `webhookNotification.grantedPaymentInstrumentUpdate` typo to be the correct name
- Allow PayPal payment ID and payer ID to be passed during transaction create
- Add `fraudServiceProvider` field in `riskData`
- Add `travel_flight` support to industry-specific data

## 2.13.1

- Fix `transaction.lineItems` method when returned from transaction searches (#146)

## 2.13.0

- Add missing UsBankAccountVerification export
- Fix dispute results in transactions not showing the correct status sometime
- Fix issue with request lib when used with testing tools (#147)
- Add `externalVault` option to transaction sale
- Visa transactions will now contain a `networkTransactionIdentifier` in the response
- Add `LocalPaymentCompleted` webhook notification support

## 2.12.0

- Add subscription charged unsuccessfully sample webhook to webhook testing gateway
- Add `processor_response_code` and `processor_response_text` to authorization adjustments subfield in transaction response.
- Add `Dispute` to top level `braintree` object
- Add Samsung Pay support
- Add processor respone code and processor response text to authorization adjustments subfield in transaction response.

## 2.11.0

- Throw error if invalid Payload on `CustomerGateway.create`
- Allow payee ID to be passed in options params for transaction create
- Add `merchant_id` alias to ConnectedMerchantStatusTransitioned and ConnectedMerchantPayPalStatusChanged Auth webhooks
- Fix webhook testing sample xml for dispute webhooks to include `amount-won` and `amount-disputed`
- `Config` creation with `AccessToken` should not require `environment`. An `Error` will be logged if optional `environment` does not match with `AccessToken`'s parsed environment
- Add processor respone code and processor response text to authorization adjustments subfield in transaction response.

## 2.10.0

- Bank Account verifications API

## 2.9.0

- Add `oauthAccessRevocation` to `WebhookNotification`s
- Add support for dispute search by `customerId`, `effectiveDate`, and `disbursementDate`
- Remove `sepaMandateType` and `sepaMandateAcceptanceLocation` params from `ClientTokenGateway`
- Add support for categorized dispute evidence

## 2.8.0

- Fix binary multipart uploads.
- Add support for `association_filter_id` in `Customer#find`

## 2.7.0

- Fixes issue where some response objects were not serializable (#126)
- Throw error if signature or payload is null in `WebhookNotificationGateway`.
- Add support for `profile_id` in Transaction#create options for VenmoAccounts.

## 2.6.0

- Deprecated `LineItem/DiscountAmountMustBeGreaterThanZero` error in favor of `DiscountAmountCannotBeNegative`.
- Deprecated `LineItem/UnitTaxAmountMustBeGreaterThanZero` error in favor of `UnitTaxAmountCannotBeNegative`.
- Add `sourceMerchantId` to `WebhookNotification`s if present
- Add support for `taxAmount` field on transaction `lineItems`
- Add `lineItems` method to `Transaction`

## 2.5.0

- Add support for Level 3 summary parameters: `shippingAmount`, `discountAmount`, and `shipsFromPostalCode`
- Fix spec to expect PayPal transactions to move to settling rather than settled
- Add support for transaction line items
- Add support for tagged evidence in `DisputeGateway#addTextEvidence` (Beta release)

## 2.4.0

- Add Too Many Requests error
- Add GrantedPaymentInstrumentUpdate webhook support
- Add ability to create a transaction from a shared nonce
- Fix spec to expect PayPal transaction to settle immediately after successful capture
- Add `options` -> `paypal` -> `shipping` for creating & updating customers as well as creating payment methods
- Add Visa Checkout and Masterpass payment instrument types (Thanks @yijielee)

## 2.3.0

- Add AuthorizationAdjustment class and `authorizationAdjustments` to Transaction
- Coinbase is no longer a supported payment method. `PaymentMethodNoLongerSupported` will be returned for Coinbase operations.
- Add facilitated details to Transaction if present
- Add `submit_for_settlement` to `Subscription.retryCharge`
- Add `options` -> `paypal` -> `description` for creating and updating subscriptions
- Add Dispute API
- Add DocumentUpload API
- Add `deviceDataCaptured` field in `riskData`
- Add support for upgrading a PayPal future payment refresh token to a billing agreement

## 2.2.0

- Fixes wrap-promise issue (closes #102) - Thanks @targunp
- Add iDEAL to PaymentInstrumentTypes
- Adds support for gzip

## 2.1.1

- Fixes request timeout issue (closes #99)

## 2.1.0

- All async methods (with the exception of search methods) return a promise if no callback is provided
- Add support for additional PayPal options when vaulting a PayPal Order
- Add iDEAL support
- Add Visa Checkout Support
- Add Masterpass support
- Add ConnectedMerchantPayPalStatusChanged and ConnectedMerchantStatusTransitioned webooks

## 2.0.2

- Fix a bug where merchantAccounts.all would attempt to fetch too many pages of merchant accounts
- Fix a bug where OAuth connect urls did not properly escape special characters

## 2.0.1

- Fix bug where SDK version number was not being sent in requests

## 2.0.0

- Drop support for Node versions < 4
- `transaction.submitForSettlement` can no longer take an arbitrary number of arguments
- Call callback with an error when invalid keys are used instead of logging a deprecation warning

## 1.47.0

- Fix a bug where xml parsing errors were not being caught
- Stop sending account_description field from us bank accounts

## 1.46.0

- Add functionality to list all merchant accounts for a merchant with `merchantAccount.all`

## 1.45.0

- Add multi-currency updates to merchants onboarded through Braintree Auth

## 1.44.0

- Update UsBank tests to use legal routing numbers
- Add option `skip_advanced_fraud_check` for transaction flows
- Raise an exception when advanced search times out

## 1.43.0

- Spec updates for deprecated keys
- Added error handling for missing configuration credentials
- Fix `UsBankAccount` support for `Customer`s

## 1.42.0

- Add 'UsBankAccount' payment method

## 1.41.0

- Add support for passing risk data
- Allow updating default_payment_method on customer
- Support passing `transaction_source` to set MOTO or recurring ECI flag

## 1.40.0

- Add OrderId to refund
- Add 3DS Pass thru support
- Export missing Payment Instrument Types (Thanks, @kamilwaheed)

## 1.39.0

- Add method of revoking OAuth access tokens

## 1.38.0

- Add transaction `UpdateDetails`
- Add multi-currency support for merchant `create`
- Add logic to stop duplicate callbacks in timeouts (closes issue #76)

## 1.37.1

- Fix issue when checking the instance of a customer's payment method

## 1.37.0

- Add timeout attribute to config
- Add AddOns.all method

## 1.36.0

- Add AccountUpdaterDailyReport webhook parsing

## 1.35.1

- Fix bug in test transaction webhooks

## 1.35.0

- Add verification create API
- Add options to `submit_for_settlement` transaction flows

## 1.34.0

- Update version number

## 1.33.0

- Add deprecation warnings for unknown parameters in `submitForSettlement`
- Add transaction validation errors ProcessorDoesNotSupportUpdatingOrderId and ProcessorDoesNotSupportUpdatingDescriptor

## 1.32.0

- Add payment method revoke
- Make payment method grant return a result object

## 1.31.0

- Add VenmoAccount
- Add support for Set Transaction Context supplementary data
- Add check webhook kind constant

## 1.30.0

- Add transaction data to subscription charged successful webhook
- Add new ProcessorDoesNotSupportAuths error
- Export validation error codes
- Add constants for dispute kind
- Add support for partial settlement transactions
- Add date-opened and date-won to dispute webhooks
- Expose amex express checkout method

## 1.29.0

- Add sourceDescription to Android Pay and Apple Pay
- Add billingAgreementId to PaypalAccount
- Add support for Amex rewards transactions

## 1.28.0

- Add new test payment method nonces
- Allow passing description on PayPal transactions
- Add methods to change transaction settlement status in sandbox

## 1.27.0

- Add oauth support

## 1.26.0

- Add support for Android Pay

## 1.25.0

- Validate webhook challenge payload
- Add missing criteria to CreditCardVerification search

## 1.24.0

- Add 3DS info to server side

## 1.23.0

- Add Coinbase support
- Add support for 3DSecure
- Surface Apple Pay payment instrument name in responses

## 1.22.0

- Add error code constants
- Allow PayPal parameters inside of options.paypal

## 1.21.0

- Add risk_data to Transaction and Verification with Kount decision and id
- Add verification_amount an option when creating a credit card
- Add TravelCruise industry type to Transaction
- Add room_rate to Lodging industry type
- Add CreditCard#verification as the latest verification on that credit card
- Add ApplePay support to all endpoints that may return ApplePayCard objects
- Add prefix to sample Webhook to simulate webhook query params

## 1.20.0

- Allow descriptor to be passed in Funding Details options params for Merchant Account create and update.

## 1.19.0

- Add additional_processor_response to transaction

## 1.18.1

- Allow payee_email to be passed in options params for Transaction create

## 1.18.0

- Added paypal specific fields to transaction calls
- Added SettlementPending, SettlementDeclined transaction statuses

## 1.17.0

- Add descriptor url support

## 1.16.0

- Allow credit card verification options to be passed outside of the nonce for PaymentMethod.create
- Allow billing_address parameters and billing_address_id to be passed outside of the nonce for PaymentMethod.create
- Add Subscriptions to paypal accounts
- Add PaymentMethod.update
- Add fail_on_duplicate_payment_method option to PaymentMethod.create
- Add supoort for dispute webhooks

## 1.15.0

- Support for v.zero SDKs.

## 1.14.1

- Changed Braintree exceptions to Error objects (thanks Raynos)
- Make webhook parsing more robust with newlines
- Add messages to InvalidSignature exceptions

## 1.14.0

- Include Dispute information on Transaction
- Search for Transactions disputed on a certain date

## 1.13.0

- Disbursement Webhooks

## 1.12.0

- Expose constants for advanced search

## 1.11.2

- Adds ability to consume search results as a readable stream in node versions prior to 0.10

## 1.11.1

- Adds ability to consume credit card verification search results as a readable stream

## 1.11.0

- Adds ability to consume search results as a readable stream

## 1.10.0

- Merchant account find API

## 1.9.2

- Merchant account update API
- Merchant account create API v2

## 1.9.1

- Update configuration URLs

## 1.9.0

- Adds support for Partnerships

## 1.8.0

- Adds holdInEscrow method
- Add error codes for verification not supported error
- Supports company_name and tax_id on merchant account create
- Adds cancel_release method
- Adds release_from_escrow functionality
- Adds merchant account phone error code.

## 1.7.0

- Adds disbursement details to transactions.
- Adds image url to transactions.

## 1.6.0

- Adds channel field to transactions.

## 1.5.0

- Adds country of issuance and issuing bank

## 1.4.0

- Adds verification search

## 1.3.0

- Additional card information, such as prepaid, debit, commercial, Durbin regulated, healthcare, and payroll, are returned on credit card responses
- Allows transactions to be specified as recurring

## 1.2.0

- Add prepaid field to credit card (possible values include Yes, No, Unknown)

## 1.1.2

- Compatibility with Node 0.8.x

## 1.1.1

- Fix dateFormat bug with months after October in CreditCardGateway
- Fix TransparentRedirecteGateway url method to return full url (thanks to [sberryman](https://github.com/sberryman))

## 1.1.0

- Add webhook gateways for parsing, verifying, and testing incoming notifications
- Use util.log instead of sys.puts for logging
- Add underscore as a dependency
- Allow failing on credit card creation if a duplicate card already exists

## 1.0.0

- Add search functionality

## 0.5.1

- Exposes plan_id on transactions

## 0.5.0

- Update to be compatible with Node 0.6.6 and replace o3-xml with xml2js (special thanks to [thepatrick](https://github.com/thepatrick))
