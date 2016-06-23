## 1.40.0
* Add OrderId to refund
* Add 3DS Pass thru support
* Export missing Payment Instrument Types (Thanks, @kamilwaheed)

## 1.39.0
* Add method of revoking OAuth access tokens

## 1.38.0
* Add transaction `UpdateDetails`
* Add multi-currency support for merchant `create`
* Add logic to stop duplicate callbacks in timeouts (closes issue #76)

## 1.37.1
* Fix issue when checking the instance of a customer's payment method

## 1.37.0
* Add timeout attribute to config
* Add AddOns.all method

## 1.36.0
* Add AccountUpdaterDailyReport webhook parsing

## 1.35.1
* Fix bug in test transaction webhooks

## 1.35.0
* Add verification create API
* Add options to `submit_for_settlement` transaction flows

## 1.34.0
* Update version number

## 1.33.0
* Add deprecation warnings for unknown parameters in `submitForSettlement`
* Add transaction validation errors ProcessorDoesNotSupportUpdatingOrderId and ProcessorDoesNotSupportUpdatingDescriptor

## 1.32.0
* Add payment method revoke
* Make payment method grant return a result object

## 1.31.0
* Add VenmoAccount
* Add support for Set Transaction Context supplementary data
* Add check webhook kind constant

## 1.30.0
* Add transaction data to subscription charged successful webhook
* Add new ProcessorDoesNotSupportAuths error
* Export validation error codes
* Add constants for dispute kind
* Add support for partial settlement transactions
* Add date-opened and date-won to dispute webhooks
* Expose amex express checkout method

## 1.29.0
* Add sourceDescription to Android Pay and Apple Pay
* Add billingAgreementId to PaypalAccount
* Add support for Amex rewards transactions

## 1.28.0
* Add new test payment method nonces
* Allow passing description on PayPal transactions
* Add methods to change transaction settlement status in sandbox

## 1.27.0
* Add oauth support

## 1.26.0
* Add support for Android Pay

## 1.25.0
* Validate webhook challenge payload
* Add missing criteria to CreditCardVerification search

## 1.24.0
* Add 3DS info to server side

## 1.23.0
* Add Coinbase support
* Add support for 3DSecure
* Surface Apple Pay payment instrument name in responses

## 1.22.0
* Add error code constants
* Allow PayPal parameters inside of options.paypal

## 1.21.0
* Add risk_data to Transaction and Verification with Kount decision and id
* Add verification_amount an option when creating a credit card
* Add TravelCruise industry type to Transaction
* Add room_rate to Lodging industry type
* Add CreditCard#verification as the latest verification on that credit card
* Add ApplePay support to all endpoints that may return ApplePayCard objects
* Add prefix to sample Webhook to simulate webhook query params

## 1.20.0
* Allow descriptor to be passed in Funding Details options params for Merchant Account create and update.

## 1.19.0
* Add additional_processor_response to transaction

## 1.18.1
* Allow payee_email to be passed in options params for Transaction create

## 1.18.0
* Added paypal specific fields to transaction calls
* Added SettlementPending, SettlementDeclined transaction statuses

## 1.17.0
* Add descriptor url support

## 1.16.0
* Allow credit card verification options to be passed outside of the nonce for PaymentMethod.create
* Allow billing_address parameters and billing_address_id to be passed outside of the nonce for PaymentMethod.create
* Add Subscriptions to paypal accounts
* Add PaymentMethod.update
* Add fail_on_duplicate_payment_method option to PaymentMethod.create
* Add supoort for dispute webhooks

## 1.15.0
* Support for v.zero SDKs.

## 1.14.1

* Changed Braintree exceptions to Error objects (thanks Raynos)
* Make webhook parsing more robust with newlines
* Add messages to InvalidSignature exceptions

## 1.14.0

* Include Dispute information on Transaction
* Search for Transactions disputed on a certain date

## 1.13.0

* Disbursement Webhooks

## 1.12.0

* Expose constants for advanced search

## 1.11.2

* Adds ability to consume search results as a readable stream in node versions prior to 0.10

## 1.11.1

* Adds ability to consume credit card verification search results as a readable stream

## 1.11.0

* Adds ability to consume search results as a readable stream

## 1.10.0

* Merchant account find API

## 1.9.2
* Merchant account update API
* Merchant account create API v2

## 1.9.1
* Update configuration URLs

## 1.9.0
* Adds support for Partnerships

## 1.8.0

* Adds holdInEscrow method
* Add error codes for verification not supported error
* Supports company_name and tax_id on merchant account create
* Adds cancel_release method
* Adds release_from_escrow functionality
* Adds merchant account phone error code.

## 1.7.0

* Adds disbursement details to transactions.
* Adds image url to transactions.

## 1.6.0

* Adds channel field to transactions.

## 1.5.0

* Adds country of issuance and issuing bank

## 1.4.0

* Adds verification search

## 1.3.0

* Additional card information, such as prepaid, debit, commercial, Durbin regulated, healthcare, and payroll, are returned on credit card responses
* Allows transactions to be specified as recurring

## 1.2.0

* Add prepaid field to credit card (possible values include Yes, No, Unknown)

## 1.1.2
* Compatibility with Node 0.8.x

## 1.1.1
* Fix dateFormat bug with months after October in CreditCardGateway
* Fix TransparentRedirecteGateway url method to return full url (thanks to [sberryman](https://github.com/sberryman))

## 1.1.0

* Add webhook gateways for parsing, verifying, and testing incoming notifications
* Use util.log instead of sys.puts for logging
* Add underscore as a dependency
* Allow failing on credit card creation if a duplicate card already exists

## 1.0.0

* Add search functionality

## 0.5.1

* Exposes plan_id on transactions

## 0.5.0

* Update to be compatible with Node 0.6.6 and replace o3-xml with xml2js (special thanks to [thepatrick](https://github.com/thepatrick))
