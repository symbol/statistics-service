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
	PREFERRED_NODES: Array<string>;
	MIN_PARTNER_NODE_VERSION: number;
}

interface Monitor {
	NODE_MONITOR_SCHEDULE_INTERVAL: number;
	NUMBER_OF_NODE_REQUEST_CHUNK: number;
	NODE_PEERS_REQUEST_CHUNK_SIZE: number;
	CHAIN_HEIGHT_REQUEST_CHUNK_SIZE: number;
	CHAIN_HEIGHT_MONITOR_SCHEDULE_INTERVAL: number;
	GEOLOCATION_MONITOR_SCHEDULE_INTERVAL: number;
	API_NODE_PORT: number;
	PEER_NODE_PORT: number;
	REQUEST_TIMEOUT: number;
}

export interface Config {
	network: Network;
	db: Db;
	symbol: Symbol;
	monitor: Monitor;
}

export const network: Network = {
	PORT: Number(process.env.PORT) || config.PORT,
};

export const db: Db = {
	MONGODB_ENDPOINT: process.env.MONGODB_ENDPOINT || config.MONGODB_ENDPOINT,
};

export const symbol: Symbol = {
	NODES: utils.stringToArray(process.env.NODES) || config.NODES,
	PREFERRED_NODES: utils.stringToArray(process.env.PREFERRED_NODES) || config.PREFERRED_NODES,
	MIN_PARTNER_NODE_VERSION: Number(process.env.MIN_PARTNER_NODE_VERSION) || config.MIN_PARTNER_NODE_VERSION,
};

export const monitor: Monitor = {
	NODE_MONITOR_SCHEDULE_INTERVAL: Number(process.env.NODE_MONITOR_SCHEDULE_INTERVAL) || config.NODE_MONITOR_SCHEDULE_INTERVAL,
	NUMBER_OF_NODE_REQUEST_CHUNK: Number(process.env.NUMBER_OF_NODE_REQUEST_CHUNK) || config.NUMBER_OF_NODE_REQUEST_CHUNK,
	NODE_PEERS_REQUEST_CHUNK_SIZE: Number(process.env.NODE_PEERS_REQUEST_CHUNK_SIZE) || config.NODE_PEERS_REQUEST_CHUNK_SIZE,
	CHAIN_HEIGHT_REQUEST_CHUNK_SIZE: Number(process.env.CHAIN_HEIGHT_REQUEST_CHUNK_SIZE) || config.CHAIN_HEIGHT_REQUEST_CHUNK_SIZE,
	CHAIN_HEIGHT_MONITOR_SCHEDULE_INTERVAL:
		Number(process.env.CHAIN_HEIGHT_MONITOR_SCHEDULE_INTERVAL) || config.CHAIN_HEIGHT_MONITOR_SCHEDULE_INTERVAL,
	GEOLOCATION_MONITOR_SCHEDULE_INTERVAL:
		Number(process.env.GEOLOCATION_MONITOR_SCHEDULE_INTERVAL) || config.GEOLOCATION_MONITOR_SCHEDULE_INTERVAL,
	API_NODE_PORT: Number(process.env.API_NODE_PORT) || config.API_NODE_PORT,
	PEER_NODE_PORT: Number(process.env.PEER_NODE_PORT) || config.PEER_NODE_PORT,
	REQUEST_TIMEOUT: Number(process.env.REQUEST_TIMEOUT) || config.REQUEST_TIMEOUT,
};

export const verifyConfig = (cfg: Config): boolean => {
	let error: string | undefined = undefined;

	if (isNaN(cfg.network.PORT) || cfg.network.PORT <= 0 || cfg.network.PORT >= 10000) error = 'Invalid "PORT"';

	try {
		new URL(cfg.db.MONGODB_ENDPOINT);
	} catch (e) {
		error = 'Invalid "MONGODB_ENDPOINT"';
	}

	if (cfg.symbol.NODES.length === 0) error = 'Invalid "NODES"';

	try {
		cfg.symbol.NODES.forEach((nodeUrl) => new URL(nodeUrl));
	} catch (e) {
		error = 'Invalid "NODES"';
	}

	if (isNaN(cfg.monitor.NODE_MONITOR_SCHEDULE_INTERVAL) || cfg.monitor.NODE_MONITOR_SCHEDULE_INTERVAL < 0)
		error = 'Invalid "NODE_MONITOR_SCHEDULE_INTERVAL"';

	if (isNaN(cfg.monitor.NUMBER_OF_NODE_REQUEST_CHUNK) || cfg.monitor.NUMBER_OF_NODE_REQUEST_CHUNK < 0)
		error = 'Invalid "NUMBER_OF_NODE_REQUEST_CHUNK"';

	if (isNaN(cfg.monitor.NODE_PEERS_REQUEST_CHUNK_SIZE) || cfg.monitor.NODE_PEERS_REQUEST_CHUNK_SIZE < 0)
		error = 'Invalid "NODE_PEERS_REQUEST_CHUNK_SIZE"';

	if (isNaN(cfg.monitor.CHAIN_HEIGHT_REQUEST_CHUNK_SIZE) || cfg.monitor.CHAIN_HEIGHT_REQUEST_CHUNK_SIZE < 0)
		error = 'Invalid "CHAIN_HEIGHT_REQUEST_CHUNK_SIZE"';

	if (isNaN(cfg.monitor.API_NODE_PORT) || cfg.monitor.API_NODE_PORT <= 0 || cfg.monitor.API_NODE_PORT >= 10000)
		error = 'Invalid "API_NODE_PORT"';

	if (isNaN(cfg.monitor.PEER_NODE_PORT) || cfg.monitor.PEER_NODE_PORT <= 0 || cfg.monitor.PEER_NODE_PORT >= 10000)
		error = 'Invalid "PEER_NODE_PORT"';

	if (isNaN(cfg.monitor.REQUEST_TIMEOUT) || cfg.monitor.REQUEST_TIMEOUT <= 0) error = 'Invalid "REQUEST_TIMEOUT"';

	if (error) throw 'Invalid config. ' + error;
	return true;
};
