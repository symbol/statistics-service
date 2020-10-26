# Symbol Statistics Service

[![Build Status](https://travis-ci.com/nemgrouplimited/symbol-statistics-service.svg?branch=main)](https://travis-ci.com/nemgrouplimited/symbol-statistics-service)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Symbol Statistics Service is an REST server application to monitor the Symbol blockchain network and generate useful statistics data.

## Requirements

- Node.js 10, 12

## Installation

1. Clone the project.

```
git clone https://github.com/nemgrouplimited/symbol-statistics-service.git
```

2. Install the required dependencies.

```
cd symbol-statistics-service
npm install
```

3. Setup .env in the root folder, you can make change to suit your need.

```
cp .env.sample .env
```

4. Run the REST server.

```
npm run dev
```

5. Endpoint.

Method  | Endpoint  | Description
---|---|---
GET| /nodes | views list of the nodes
GET| /nodes/:publicKey | views node infomation by given node publicKey

## Developer notes

If you are the first time setting up symbol-statistics-service, you won't immediately view data from the endpoint `/nodes` or `/nodes/:publicKey`, because it is required to take sometimes to crawl data from the network.

## Getting help

Use the following available resources to get help:

- [Symbol Documentation][docs]
- Join the community [slack group (#sig-client)][slack]
- If you found a bug, [open a new issue][issues]

## Contributing

Contributions are welcome and appreciated.
Check [CONTRIBUTING](CONTRIBUTING.md) for information on how to contribute.

## License

Copyright 2019-present NEM

Licensed under the [Apache License 2.0](LICENSE)

[self]: https://github.com/nemgrouplimited/symbol-statistics-service
[docs]: https://nemtech.github.io
[issues]: https://github.com/nemgrouplimited/symbol-statistics-service/issues
[slack]: https://join.slack.com/t/nem2/shared_invite/enQtMzY4MDc2NTg0ODgyLWZmZWRiMjViYTVhZjEzOTA0MzUyMTA1NTA5OWQ0MWUzNTA4NjM5OTJhOGViOTBhNjkxYWVhMWRiZDRkOTE0YmU
