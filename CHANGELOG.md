# CHANGELOG
All notable changes to this project will be documented in this file.

The changelog format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [v0.3.0][v0.3.0] - 12-Mar-2021

### Milestone: [catapult-server@v0.10.0.8][catapult-server@v0.10.0.8]

Package  | Version  | Link
---|---|---
REST Core| v2.3.3 | [catapult-rest][catapult-rest@v2.3.3]
SDK Core| v0.23.3 | [symbol-sdk][symbol-sdk@v0.23.3]

### Added
- TimeSeriesService
- Node cout over time statistic

### Fixed
- Use mainPublicKey to fetch Node Rewards info

## [v0.2.0][v0.2.0] - 24-Feb-2021

### Milestone: [catapult-server@v0.10.0.7][catapult-server@v0.10.0.7]

Package  | Version  | Link
---|---|---
REST Core| v2.3.0 | [catapult-rest][catapult-rest@v2.3.3]
SDK Core| v0.23.0 | [symbol-sdk][symbol-sdk@v0.23.3-alpha]

### Added
- Node Rewards Service
- Node Chain Height Monitor Service
- Geolocation Monitor Service
- Nodes Stats service
- Api Node Service
- Improved speed of getting a node list

### Fixed
- Code refactor

## [v0.1.0][v0.1.0] - 26-Oct-2020

### Milestone: [catapult-server@v0.10.0.3](https://github.com/nemtech/catapult-server/releases/tag/v0.10.0.3)

Package  | Version  | Link
---|---|---
REST Core| v2.1.0 | [catapult-rest](https://github.com/nemtech/catapult-rest/releases/tag/v2.1.0)

### Added
- Support docker images build. [#2](https://github.com/nemgrouplimited/symbol-statistics-service/issues/2)
- Support mongodb services. [#9](https://github.com/nemgrouplimited/symbol-statistics-service/issues/9) [#3](https://github.com/nemgrouplimited/symbol-statistics-service/issues/3)
- Support error handling. [#15](https://github.com/nemgrouplimited/symbol-statistics-service/issues/15)
- Support route to get specific node infomation. [#14](https://github.com/nemgrouplimited/symbol-statistics-service/issues/14)
- Support tcp port checking on node. [#7](https://github.com/nemgrouplimited/symbol-statistics-service/issues/7)
- Support checking node location module. [#5](https://github.com/nemgrouplimited/symbol-statistics-service/issues/5)
- Support node monitor module. [#1](https://github.com/nemgrouplimited/symbol-statistics-service/issues/1) [#8](https://github.com/nemgrouplimited/symbol-statistics-service/issues/8) [#6](https://github.com/nemgrouplimited/symbol-statistics-service/issues/6)
- Support logger. [#4](https://github.com/nemgrouplimited/symbol-statistics-service/issues/4)

### Fixes
- Cors error. [#13](https://github.com/nemgrouplimited/symbol-statistics-service/issues/13)


[v0.3.0]: https://github.com/nemfoundation/symbol-statistics-service/releases/tag/v0.3.0
[v0.2.0]: https://github.com/nemfoundation/symbol-statistics-service/releases/tag/v0.2.0
[v0.1.0]: https://github.com/nemfoundation/symbol-statistics-service/releases/tag/v0.1.0

[catapult-server@v0.10.0.7]: https://github.com/nemtech/catapult-server/releases/tag/v0.10.0.7
[symbol-sdk@v0.23.3-alpha]: https://www.npmjs.com/package/symbol-sdk/v/0.23.3-alpha-202102181227
[catapult-server@v0.10.0.8]: https://github.com/nemtech/catapult-server/releases/tag/v0.10.0.8
[symbol-sdk@v0.23.3]: https://www.npmjs.com/package/symbol-sdk/v/0.23.3
[catapult-rest@v2.3.3]: https://github.com/nemtech/catapult-rest/releases/tag/v2.3.3
