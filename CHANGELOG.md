# CHANGELOG
All notable changes to this project will be documented in this file.

The changelog format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [v1.1.6][v1.1.6] - 23-Mar-2022

Package  | Version | Link
---|---------|---
REST Core| v2.4.0  | [catapult-rest][catapult-rest@v2.4.0]
SDK Core| v2.0.0  | [symbol-sdk][symbol-sdk@v2.0.0]

- Migrate the CI from Travis to Jenkins [#139](https://github.com/symbol/statistics-service/pull/139)
- Upgrade the Symbol SDK to v2.0 [#140](https://github.com/symbol/statistics-service/pull/140)

## [v1.1.5][v1.1.5] - 24-Jan-2022

Package  | Version  | Link
---|---|---
REST Core| v2.4.0 | [catapult-rest][catapult-rest@v2.4.0]
SDK Core| v1.0.3 | [symbol-sdk][symbol-sdk@v1.0.3]

### Fix
- Fixed duplicate nodes and nodes from the wrong networks removal issue [#134](https://github.com/symbol/statistics-service/pull/134)

## [v1.1.4][v1.1.4] - 18-Jan-2022

Package  | Version  | Link
---|---|---
REST Core| v2.4.0 | [catapult-rest][catapult-rest@v2.4.0]
SDK Core| v1.0.3 | [symbol-sdk][symbol-sdk@v1.0.3]

### Fix
- `tsconfig.build.json` added to exclude test files from build but keep for tests [#128](https://github.com/symbol/statistics-service/pull/128)
- `Config.KEEP_STALE_NODES_FOR_HOURS` is added to clean up stale nodes from database [#127](https://github.com/symbol/statistics-service/pull/127)
- Preferred nodes filter fixed, `Config.PREFERRED_NODES` is now empty by default (will be set in the testnet/mainnet environment) [#126](https://github.com/symbol/statistics-service/pull/126)
- Node discovery extended, empty host info bug fixed, logging enhanced [#121](https://github.com/symbol/statistics-service/pull/121)

## [v1.1.3][v1.1.3] - 30-Nov-2021

Package  | Version  | Link
---|---|---
REST Core| v2.4.0 | [catapult-rest][catapult-rest@v2.4.0]
SDK Core| v1.0.3 | [symbol-sdk][symbol-sdk@v1.0.3]

### Add
- Add endpoint that will allow get node by nodePublicKey [#95](https://github.com/symbol/statistics-service/issues/95)
- Add web socket filter option in nodes. [#106](https://github.com/symbol/statistics-service/issues/106)
- Add typescript-fetch generated client [#107](https://github.com/symbol/statistics-service/pull/107)
- Add node version stats [#110](https://github.com/symbol/statistics-service/pull/110)
- Add node list ordering[random, natural] [#111](https://github.com/symbol/statistics-service/pull/111)
- Add symbol-sdk 1.0.3

### Fix
- Fix node mix from different network [#113](https://github.com/symbol/statistics-service/pull/113)

### Remove
- Remove default version filter [#109](https://github.com/symbol/statistics-service/pull/109)

## [v1.1.2][v1.1.2] - 5-Nov-2021

Package  | Version  | Link
---|---|---
REST Core| v2.3.7 | [catapult-rest][catapult-rest@v2.3.7]
SDK Core| v1.0.1 | [symbol-sdk][symbol-sdk@v1.0.1]

- Fix node list not being fully discovered [#91](https://github.com/symbol/statistics-service/issues/91)

## [v1.1.1][v1.1.1] - 31-Oct-2021

### Milestone: [catapult-server@v1.0.2.0][catapult-server@v1.0.2.0]

Package  | Version  | Link
---|---|---
REST Core| v2.3.7 | [catapult-rest][catapult-rest@v2.3.7]
SDK Core| v1.0.1 | [symbol-sdk][symbol-sdk@v1.0.1]

- Fix npm vulnerabilities [#87](https://github.com/symbol/statistics-service/pull/87)
- Fix chain height stat [#88](https://github.com/symbol/statistics-service/pull/88)

## [v1.1.0][v1.1.0] - 30-Oct-2021

### Milestone: [catapult-server@v1.0.2.0][catapult-server@v1.0.2.0]

Package  | Version  | Link
---|---|---
REST Core| v2.3.7 | [catapult-rest][catapult-rest@v2.3.7]
SDK Core| v1.0.1 | [symbol-sdk][symbol-sdk@v1.0.1]

- support https/http nodes. [#64](https://github.com/symbol/statistics-service/pull/64)
- Removed node rewards related source code. [#65](https://github.com/symbol/statistics-service/issues/65)
- Added new filter on nodes endpoint [#71](https://github.com/symbol/statistics-service/issues/71)

## [v1.0.1][v1.0.1] - 25-May-2021

### Milestone: [catapult-server@v1.0.0.0][catapult-server@v1.0.0.0]

Package  | Version  | Link
---|---|---
REST Core| v2.3.6 | [catapult-rest][catapult-rest@v2.3.6]
SDK Core| v1.0.1 | [symbol-sdk][symbol-sdk@v1.0.1]

- Added the network type check to the Node Monitor Service [#53](https://github.com/symbol/statistics-service/issues/53)
- Added version of REST to the Node List [#55](https://github.com/symbol/statistics-service/issues/53)
- Fixed the peer node status check issue [#58](https://github.com/symbol/statistics-service/pull/58)
- Improved DB collection store [#58](https://github.com/symbol/statistics-service/pull/58)
- Included the initial nodes from config to the list [#58](https://github.com/symbol/statistics-service/pull/58)
- Added missing utf8 dependency

## [v1.0.0][v1.0.0] - 14-Mar-2021

### Milestone: [catapult-server@v1.0.0.0][catapult-server@v1.0.0.0]

Package  | Version  | Link
---|---|---
REST Core| v2.3.4 | [catapult-rest][catapult-rest@v2.3.4]
SDK Core| v1.0.0 | [symbol-sdk][symbol-sdk@v1.0.0]

- Release for Symbol mainnet.

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

### Milestone: [catapult-server@v0.10.0.3](https://github.com/symbol/catapult-client/releases/tag/v0.10.0.3)

Package  | Version  | Link
---|---|---
REST Core| v2.1.0 | [catapult-rest](https://github.com/symbol/catapult-rest/releases/tag/v2.1.0)

### Added
- Support docker images build. [#2](https://github.com/symbol/statistics-service/issues/2)
- Support mongodb services. [#9](https://github.com/symbol/statistics-service/issues/9) [#3](https://github.com/symbol/statistics-service/issues/3)
- Support error handling. [#15](https://github.com/symbol/statistics-service/issues/15)
- Support route to get specific node infomation. [#14](https://github.com/symbol/statistics-service/issues/14)
- Support tcp port checking on node. [#7](https://github.com/symbol/statistics-service/issues/7)
- Support checking node location module. [#5](https://github.com/symbol/statistics-service/issues/5)
- Support node monitor module. [#1](https://github.com/symbol/statistics-service/issues/1) [#8](https://github.com/symbol/statistics-service/issues/8) [#6](https://github.com/symbol/statistics-service/issues/6)
- Support logger. [#4](https://github.com/symbol/statistics-service/issues/4)

### Fixes
- Cors error. [#13](https://github.com/symbol/statistics-service/issues/13)

[v1.1.6]: https://github.com/symbol/statistics-service/releases/tag/v1.1.6
[v1.1.5]: https://github.com/symbol/statistics-service/releases/tag/v1.1.5
[v1.1.4]: https://github.com/symbol/statistics-service/releases/tag/v1.1.4
[v1.1.3]: https://github.com/symbol/statistics-service/releases/tag/v1.1.3
[v1.1.2]: https://github.com/symbol/statistics-service/releases/tag/v1.1.2
[v1.1.1]: https://github.com/symbol/statistics-service/releases/tag/v1.1.1
[v1.1.0]: https://github.com/symbol/statistics-service/releases/tag/v1.1.0
[v1.1.1]: https://github.com/symbol/statistics-service/releases/tag/v1.1.1
[v1.1.2]: https://github.com/symbol/statistics-service/releases/tag/v1.1.2
[v1.1.3]: https://github.com/symbol/statistics-service/releases/tag/v1.1.3

[v1.0.1]: https://github.com/symbol/statistics-service/releases/tag/v1.0.1
[v1.0.0]: https://github.com/symbol/statistics-service/releases/tag/v1.0.0
[v0.3.0]: https://github.com/symbol/statistics-service/releases/tag/v0.3.0
[v0.2.0]: https://github.com/symbol/statistics-service/releases/tag/v0.2.0
[v0.1.0]: https://github.com/symbol/statistics-service/releases/tag/v0.1.0

[git s@v0.10.0.7]: https://github.com/symbol/catapult-client/releases/tag/v0.10.0.7
[catapult-server@v0.10.0.8]: https://github.com/symbol/catapult-client/releases/tag/v0.10.0.8
[catapult-server@v1.0.0.0]: https://github.com/symbol/catapult-client/releases/tag/v1.0.0.0

[symbol-sdk@v0.23.3-alpha]: https://www.npmjs.com/package/symbol-sdk/v/0.23.3-alpha-202102181227
[symbol-sdk@v0.23.3]: https://www.npmjs.com/package/symbol-sdk/v/0.23.3
[symbol-sdk@v1.0.0]: https://www.npmjs.com/package/symbol-sdk/v/1.0.0
[symbol-sdk@v1.0.1]: https://www.npmjs.com/package/symbol-sdk/v/1.0.1
[symbol-sdk@v1.0.3]: https://www.npmjs.com/package/symbol-sdk/v/1.0.3
[symbol-sdk@v2.0.0]: https://www.npmjs.com/package/symbol-sdk/v/2.0.0

[catapult-rest@v2.3.3]: https://github.com/symbol/catapult-rest/releases/tag/v2.3.3
[catapult-rest@v2.3.4]: https://github.com/symbol/catapult-rest/releases/tag/v2.3.4
[catapult-rest@v2.3.6]: https://github.com/symbol/catapult-rest/releases/tag/v2.3.6
[catapult-rest@v2.4.0]: https://github.com/symbol/catapult-rest/releases/tag/v2.4.0
