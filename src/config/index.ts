import * as config from './config.json';
import * as utils from '@src/utils';

interface Network {
    PORT: number;
}

interface Db {
    MONGODB_ENDPOINT: string;
}

interface Symbol {
    NODES: Array<string>;
}

interface Monitor {
    NODE_MONITOR_SCHEDULE_INTERVAL: number;
    API_NODE_PORT: number;
    PEER_NODE_PORT: number;
}

export interface Config {
    network: Network;
    db: Db;
    symbol: Symbol
    monitor: Monitor;
}

export const network: Network = {
    PORT: Number(process.env.PORT) || config.PORT
}

export const db: Db = {
    MONGODB_ENDPOINT: process.env.MONGODB_ENDPOINT || config.MONGODB_ENDPOINT
}

export const symbol: Symbol = {
    NODES: utils.stringToArray(process.env.NODES) || config.NODES,
}

export const monitor: Monitor = {
    NODE_MONITOR_SCHEDULE_INTERVAL: Number(process.env.NODE_MONITOR_SCHEDULE_INTERVAL) || config.NODE_MONITOR_SCHEDULE_INTERVAL,
    API_NODE_PORT: Number(process.env.API_NODE_PORT) || config.API_NODE_PORT,
    PEER_NODE_PORT: Number(process.env.PEER_NODE_PORT) || config.PEER_NODE_PORT
}

export const verifyConfig = (cfg: Config): boolean => {
    let error: string | undefined = undefined;
    if(isNaN(cfg.network.PORT) || cfg.network.PORT <= 0 || cfg.network.PORT >= 10000)
        error = 'Invalid "PORT"';
    
    try { new URL(cfg.db.MONGODB_ENDPOINT); }
    catch(e) { error = 'Invalid "MONGODB_ENDPOINT"'; }

    try { cfg.symbol.NODES.forEach(nodeUrl => new URL(nodeUrl)); }
    catch(e) { error = 'Invalid "NODES"'; }

    if(isNaN(cfg.monitor.NODE_MONITOR_SCHEDULE_INTERVAL) || cfg.monitor.NODE_MONITOR_SCHEDULE_INTERVAL < 0)
        error = 'Invalid "NODE_MONITOR_SCHEDULE_INTERVAL"';
    
    if(isNaN(cfg.monitor.API_NODE_PORT) || cfg.monitor.API_NODE_PORT <= 0 || cfg.monitor.API_NODE_PORT >= 10000)
        error = 'Invalid "API_NODE_PORT"';

    if(isNaN(cfg.monitor.PEER_NODE_PORT) || cfg.monitor.PEER_NODE_PORT <= 0 || cfg.monitor.PEER_NODE_PORT >= 10000)
        error = 'Invalid "PEER_NODE_PORT"';
    
    if(error)
        throw('Invalid config. ' + error);
    return true;
}