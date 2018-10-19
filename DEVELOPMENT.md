# Braintree Node Development Notes

This document outlines best practices when developing this server SDK.

## Setup

There is a supplied Dockerfile for creating an environment to run this server SDK.

1. Verify Docker is installed and running.
1. `make` to start the docker container.
1. `rake test:unit` Inside the docker container to verify the unit tests pass
1. Write code!

## Code Best Practices

* Avoid creating objects to reference values.
  * JSON is a first class citizen in this server SDK so providing objects in place of that JSON can complicate the merchant code. 
  * Using the raw JSON also protects backward compability changes and referencing and object limits backward compatibility for older versions.
  * Documentation should exist for these values in the [Developer Docs Reference](https://developers.braintreepayments.com/reference/overview)
* The [Developer Docs Reference](https://developers.braintreepayments.com/reference/overview) is the source of truth for the current behavior of the server SDKs. Brief or minimal documentation should be provided in the library, but details should be provided in the deverloper doc reference. Open source contributors can leave code comments or a detailed pull request description for the Braintree team to provide in the developer docs.

## Code verification

1. `rake test` needs to pass
1. Add a changelog entry under the `unreleased` header
1. Open a PR
1. Ask a developer on your team for a review, modifying for an approval
1. Ask a Developer Experience developer for a review, modifying for an approval
