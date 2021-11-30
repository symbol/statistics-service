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

The finalized height from each node is gathered and height statistics are produced. This can help monitoring chain forks, for example.

### Geolocation Monitor Task

A 3rd party service (`ip-api.com`) is used to obtain geolocalization for each node. This can be used by users to select a nearby access node, for example.

### Source Code Structure

* `/src/config`: Statistics service configuration.
* `/src/routes`: REST endpoint routes.
* `/src/models`: Database collection and mongoose schema.
* `/src/service`: Service logic, such as requesting geolocation.
* `/src/infrastructure`: Logger and pagination component.

## Reference Documentation
- [OpenApi docs](https://testnet.symbol.services/openapi/index.html)

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
