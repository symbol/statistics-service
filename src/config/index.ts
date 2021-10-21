import * as config from './config.json';
import * as utils from '@src/utils';
import { NetworkType } from 'symbol-sdk';

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
	NUMBER_OF_NODE_REQUEST_CHUNK: number;
	CHAIN_HEIGHT_MONITOR_SCHEDULE_INTERVAL: number;
	GEOLOCATION_MONITOR_SCHEDULE_INTERVAL: number;
	API_NODE_PORT: number;
	PEER_NODE_PORT: number;
	REQUEST_TIMEOUT: number;
	NETWORK_IDENTIFIER: NetworkType;
}

interface NodeRewardsConfig {
	CONTROLLER_ENDPOINT: string;
}

export interface Config {
	network: Network;
	db: Db;
	symbol: Symbol;
	monitor: Monitor;
	nodeRewards: NodeRewardsConfig;
}

export const network: Network = {
	PORT: Number(process.env.PORT) || config.PORT,
};

export const db: Db = {
	MONGODB_ENDPOINT: process.env.MONGODB_ENDPOINT || config.MONGODB_ENDPOINT,
};

export const symbol: Symbol = {
	NODES: utils.stringToArray(process.env.NODES) || config.NODES,
};

export const monitor: Monitor = {
	NODE_MONITOR_SCHEDULE_INTERVAL: Number(process.env.NODE_MONITOR_SCHEDULE_INTERVAL) || config.NODE_MONITOR_SCHEDULE_INTERVAL,
	NUMBER_OF_NODE_REQUEST_CHUNK: Number(process.env.NUMBER_OF_NODE_REQUEST_CHUNK) || config.NUMBER_OF_NODE_REQUEST_CHUNK,
	CHAIN_HEIGHT_MONITOR_SCHEDULE_INTERVAL:
		Number(process.env.CHAIN_HEIGHT_MONITOR_SCHEDULE_INTERVAL) || config.CHAIN_HEIGHT_MONITOR_SCHEDULE_INTERVAL,
	GEOLOCATION_MONITOR_SCHEDULE_INTERVAL:
		Number(process.env.GEOLOCATION_MONITOR_SCHEDULE_INTERVAL) || config.GEOLOCATION_MONITOR_SCHEDULE_INTERVAL,
	API_NODE_PORT: Number(process.env.API_NODE_PORT) || config.API_NODE_PORT,
	PEER_NODE_PORT: Number(process.env.PEER_NODE_PORT) || config.PEER_NODE_PORT,
	REQUEST_TIMEOUT: Number(process.env.REQUEST_TIMEOUT) || config.REQUEST_TIMEOUT,
	NETWORK_IDENTIFIER: Number(process.env.NETWORK_IDENTIFIER) || config.NETWORK_IDENTIFIER,
};

export const nodeRewards: NodeRewardsConfig = {
	CONTROLLER_ENDPOINT: process.env.CONTROLLER_ENDPOINT || config.CONTROLLER_ENDPOINT,
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

	if (isNaN(cfg.monitor.API_NODE_PORT) || cfg.monitor.API_NODE_PORT <= 0 || cfg.monitor.API_NODE_PORT >= 10000)
		error = 'Invalid "API_NODE_PORT"';

	if (isNaN(cfg.monitor.PEER_NODE_PORT) || cfg.monitor.PEER_NODE_PORT <= 0 || cfg.monitor.PEER_NODE_PORT >= 10000)
		error = 'Invalid "PEER_NODE_PORT"';

	if (isNaN(cfg.monitor.REQUEST_TIMEOUT) || cfg.monitor.REQUEST_TIMEOUT <= 0) error = 'Invalid "REQUEST_TIMEOUT"';

	if (isNaN(cfg.monitor.NETWORK_IDENTIFIER) || !Object.values(NetworkType).includes(cfg.monitor.NETWORK_IDENTIFIER))
		error = 'Invalid "NETWORK_IDENTIFIER"';

	if (error) throw 'Invalid config. ' + error;
	return true;
};
