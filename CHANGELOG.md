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
