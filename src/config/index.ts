import * as config from './config.json'

export const network = {
    PORT: Number(process.env.PORT) || config.PORT
}

export const db = {
    MONGODB_ENDPOINT: process.env.MONGODB_ENDPOINT || config.MONGODB_ENDPOINT
}

export const symbol = {
    NODES: process.env.NODES || config.NODES,
}

export const monitor = {
    NODE_MONITOR_SCHEDULE_INTERVAL: process.env.NODE_MONITOR_SCHEDULE_INTERVAL || config.NODE_MONITOR_SCHEDULE_INTERVAL,
    API_NODE_PORT: process.env.API_NODE_PORT || config.API_NODE_PORT,
    PEER_NODE_PORT: process.env.PEER_NODE_PORT || config.PEER_NODE_PORT
}