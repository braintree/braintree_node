# Security Policy

This repository adheres to the [PayPal Vulnerability Reporting Policy](https://hackerone.com/paypal).

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public issues, discussions, or pull requests.**

Instead, report it using one of the following ways:

- Email the PayPal Security Team at [security@paypal.com](mailto:security@paypal.com)
- Submit through the [PayPal Bug Bounty Program](https://hackerone.com/paypal) on HackerOne

Please include the following in your report:

- A description of the vulnerability and its potential impact
- Steps to reproduce or a proof-of-concept
- The SDK version(s) affected
- Any suggested mitigations

You can expect an acknowledgement within 5 business days. We will work with you to understand and address the issue and will keep you informed of the remediation timeline.

## Supported Versions

We release security patches for the following versions of the Braintree Node.js library:

| Major version | Status   | Released       | Deprecated     | Unsupported    |
| ------------- | -------- | -------------- | -------------- | -------------- |
| 3.x.x         | Active   | September 2020 | TBA            | TBA            |
| 2.x.x         | Inactive | February 2017  | September 2022 | September 2023 |

Security patches are only applied to **Active** versions. We recommend upgrading to 3.x.x if you are on an older version.

## Disclosure Policy

We are committed to working with security researchers in good faith. To support responsible disclosure, our team will:

- Acknowledge your report in a timely manner
- Keep you informed of our progress toward a fix
- Notify you before any public disclosure

We ask that you:

- Do not publicly disclose the issue before it has been resolved
- Avoid accessing, modifying, or deleting data that does not belong to you
- Make a good faith effort to avoid disruption to production systems

We appreciate responsible disclosure and your efforts to keep Braintree SDK users safe.
