# Symbol Statistics Service

It collects network nodes' information time by time and uses it to turn data into useful metrics and insights, such as total nodes in the network, health of the network.

## Architecture

The project using Typescript, node express, and MongoDB as databases.
```
                       +---------------+
                       |  Application  |
                       +----+----^-----+
                            |    |
                            |    |
                            |    |  Request / Response
                            |    |
 Symbol Statistics Service  |    |
+---------------------------v----+--+
|                                   |
| +-Express Server--------+         |
| |                       |         |
| |                       |         |
| |     Task Manager      |         |
| |                       |         |
| |                       |         |
| +-----------+-----------+         |
|             |                     |
| +-Services--v-----------------+   |
| |                             |   |
| |- Node Monitor               |   |
| |                             |   |   +------------------+
| |- Chain Height Monitor       +---+--->                  |
| |                             |   |   | Mongodb Database |
| |- Geolocation Monitor        <---+---+                  |
| |                             |   |   +------------------+
| +-----------------------------+   |
|                                   |
+-----------------------------------+
```

### Task Node Monitor

To discover nodes on the network, we need to make a request to catapult-rest endpoint `/node/peer` to discover node peers on each of the API nodes.

To start, we picked the official node as a starting point and doing it recursively to each node on the network.

Once we gather nodes from the network, it will loop through nodes and gather node status data such as `node/info`, `chain/info` and etc.

When the completed query, all nodes will be updated on the `Node` collection.

### Task Chain Height Monitor

To prevent the chain fork happen, we need to gather chain/finalization height from each node and analysis to generate height stats data.

### Task Geolocation Monitor

To getting geolocation from the network node, we will request 3rd party endpoint `ip-api.com` to get coordinates.

### Structure

* `/src/config`: Handles the statistics service configuration.
* `/src/routes`: Handles the REST endpoint routes.
* `/src/models`: Handles database collection and mongoose schema.
* `/src/service`: Handles all the service logic, such as to request geolocation.
* `/src/infrastructure`: Handles logger and pagination component.

## Configuration

The default config file at `src/config/config.json`

If you like to overwrite the config, you need to create `.env` in the root path.

## Installation

1. Clone the project.

```
git clone https://github.com/symbol/symbol-statistics-service.git
```

2. Install the required dependencies.

```
cd symbol-statistics-service
npm install
```

3. Run the application in development.

```
npm run dev
```

### Docker
- Build docker image

```
docker build -t symbol-statistics-service .
```

- Run docker image with docker compose.

```
version: "3"
services:
    app:
        container_name: statistics-service
        restart: always
        build: .
        environment:
        - MONGODB_ENDPOINT=mongodb+srv://mongodbURI
        - NODES=["http://symbol-node-1.io:3000",http://symbol-node-2.io:3000"]
        - PORT=4001
        ports:
        - "3000:4001"
```

### REST Endpoint


```
# GET /nodes
# Sample response

[
    {
        "peerStatus": {
            "isAvailable": true,
            "lastStatusCheck": 1634218744831
        },
        "apiStatus": {
            "isAvailable": true,
            "chainHeight": 608863,
            "finalizationHeight": 608836,
            "nodePublicKey": "AA827C4E0F809AD586629AD341928336DCD62E7E09F73806886143CF0FB1E958",
            "restVersion": "2.3.6",
            "lastStatusCheck": 1634218747043
        },
        "_id": "6168330bad707a0012d8813c",
        "version": 16777728,
        "publicKey": "C7BEA9036ECFA79CB081184CFA0E524E7D567A5127C55360D9FF1D2FC1AC4FDD",
        "networkGenerationHashSeed": "57F7DA205008026C776CB6AED843393F04CD458E0AA2D9F1D5F31A402072B2D6",
        "roles": 7,
        "port": 7900,
        "networkIdentifier": 104,
        "host": "ngl-dual-001.symbolblockchain.io",
        "friendlyName": "ngl-dual-001",
        "rewardPrograms": [],
        "hostDetail": {
            "host": "ngl-dual-001.symbolblockchain.io",
            "coordinates": {
            "latitude": 39.0438,
            "longitude": -77.4874
            },
            "location": "Ashburn, VA, United States",
            "ip": "54.90.245.174",
            "organization": "AWS EC2 (us-east-1)",
            "as": "AS14618 Amazon.com, Inc.",
            "continent": "North America",
            "country": "United States",
            "region": "VA",
            "city": "Ashburn",
            "district": "",
            "zip": "20149"
        },
        "__v": 0
    },
    ...
]
```

```
# GET /nodes/:publicKey
# Sample response

{
  "peerStatus": {
    "isAvailable": true,
    "lastStatusCheck": 1634218925692
  },
  "apiStatus": {
    "isAvailable": true,
    "chainHeight": 608869,
    "finalizationHeight": 608836,
    "nodePublicKey": "AA827C4E0F809AD586629AD341928336DCD62E7E09F73806886143CF0FB1E958",
    "restVersion": "2.3.6",
    "lastStatusCheck": 1634218928668
  },
  "_id": "616833c0ad707a0012d8da7d",
  "version": 16777728,
  "publicKey": "C7BEA9036ECFA79CB081184CFA0E524E7D567A5127C55360D9FF1D2FC1AC4FDD",
  "networkGenerationHashSeed": "57F7DA205008026C776CB6AED843393F04CD458E0AA2D9F1D5F31A402072B2D6",
  "roles": 7,
  "port": 7900,
  "networkIdentifier": 104,
  "host": "ngl-dual-001.symbolblockchain.io",
  "friendlyName": "ngl-dual-001",
  "rewardPrograms": [],
  "hostDetail": {
    "host": "ngl-dual-001.symbolblockchain.io",
    "coordinates": {
      "latitude": 39.0438,
      "longitude": -77.4874
    },
    "location": "Ashburn, VA, United States",
    "ip": "54.90.245.174",
    "organization": "AWS EC2 (us-east-1)",
    "as": "AS14618 Amazon.com, Inc.",
    "continent": "North America",
    "country": "United States",
    "region": "VA",
    "city": "Ashburn",
    "district": "",
    "zip": "20149"
  },
  "__v": 0
}
```

```
# GET /nodesHostDetail
# Sample response

[
    {
        "_id": "60c022e6ad707a00129f00f9",
        "host": "ngl-dual-001.symbolblockchain.io",
        "coordinates": {
            "latitude": 39.0438,
            "longitude": -77.4874
        },
        "location": "Ashburn, VA, United States",
        "ip": "54.90.245.174",
        "organization": "AWS EC2 (us-east-1)",
        "as": "AS14618 Amazon.com, Inc.",
        "continent": "North America",
        "country": "United States",
        "region": "VA",
        "city": "Ashburn",
        "district": "",
        "zip": "20149",
        "__v": 0
    },
    ...
]

```

```
# GET /nodeStats
# Sample response

{
  "nodeTypes": {
    "0": 3,
    "1": 23,
    "2": 20,
    "3": 1200,
    "4": 13,
    "5": 26,
    "6": 0,
    "7": 231
  }
}
```

```
# GET /nodeHeightStats
# Sample response

{
  "height": [
    {
      "_id": "6168356fad707a0012d9acb1",
      "value": "608884",
      "count": 1335
    },
    ...
  ],
  "finalizedHeight": [
    {
      "_id": "6168356fad707a0012d9acbc",
      "value": "608856",
      "count": 1405
    },
    ...
  ],
  "date": "2021-10-14T13:49:35.294Z"
}
```

```
# /timeSeries/nodeCount
# Sample response

[
    {
        "_id": "60c15609ad707a0012480830",
        "date": "2021-06-09T23:59:31.594Z",
        "values": {
            "0": 2,
            "1": 20,
            "2": 20,
            "3": 1489,
            "4": 13,
            "5": 32,
            "6": 0,
            "7": 228,
            "total": 1803,
            "rand": 505
        },
        "__v": 0
    },
    ...
]
```