# Symbol Statistics Service

It periodically collects information from the network's nodes and produces useful metrics and insights, such as the total number of nodes, their health or their geographical distribution.

## Architecture

The project uses Typescript, Node Express, and MongoDB as database.

```text
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
| | - Node Monitor              |   |
| |                             |   |   +------------------+
| | - Chain Height Monitor      +---+--->                  |
| |                             |   |   | Mongodb Database |
| | - Geolocation Monitor       <---+---+                  |
| |                             |   |   +------------------+
| +-----------------------------+   |
|                                   |
+-----------------------------------+
```

### Node Monitor Task

To discover nodes on the network, a request is made to the catapult-rest endpoint `/node/peer`. This returns the list of peers known to that node, which the task then explores recursively.

To start the process, the task uses the nodes maintained by NEM Group.

Once the whole list of nodes is known, additional information is gathered from each one of them such as `/node/info` and `/chain/info`.

When the search completes, all node information is updated on the `Node` collection.

### Chain Height Monitor Task

To prevent chain forks happening, the finalization height from each node is gathered and height statistics are produced.

### Geolocation Monitor Task

A 3rd party service (`ip-api.com`) is used to obtain geolocalization for each node.

### Source Code Structure

* `/src/config`: Statistics service configuration.
* `/src/routes`: REST endpoint routes.
* `/src/models`: Database collection and mongoose schema.
* `/src/service`: Service logic, such as requesting geolocation.
* `/src/infrastructure`: Logger and pagination component.

## Configuration

The default config file can be found at `src/config/config.json`.

If you want to overwrite the configuration you need to create an `.env` file in the root path.

## Installation

1. Clone the project.

   ```bash
   git clone https://github.com/symbol/symbol-statistics-service.git
   ```

2. Install the required dependencies.

   ```bash
   cd symbol-statistics-service
   npm install
   ```

3. Run the application in development mode.

   ```bash
   npm run dev
   ```

### Docker Setup

1. Build Docker image.

   ```bash
   docker build -t symbol-statistics-service .
   ```

2. Run the Docker image with the following Docker compose file.

   ```yaml
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

## Sample REST responses

### GET `/nodes`

```json
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

### GET `/nodes/:publicKey`

```json
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

### GET `/nodesHostDetail`

```json
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

### GET `/nodeStats`

```json
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

### GET `/nodeHeightStats`

```json
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

### GET `/timeSeries/nodeCount`

```json
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
