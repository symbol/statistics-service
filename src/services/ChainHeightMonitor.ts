import * as winston from 'winston';
import { DataBase } from '@src/services/DataBase';
import { ApiNodeService } from '@src/services/ApiNodeService';
import { Logger } from '@src/infrastructure';

import { INode } from '@src/models/Node';
import { INodeHeightStats } from '@src/models/NodeHeightStats';
import { symbol } from '@src/config';
import { isAPIRole, basename, sleep } from '@src/utils';

const logger: winston.Logger = Logger.getLogger(basename(__filename));

export class ChainHeightMonitor {
	private nodeList: INode[];
	private isRunning: boolean;
	private interval: number;
	private heights: {
		[key: string]: number;
	};
	private finalizedHeights: {
		[key: string]: number;
	};

	constructor(_interval: number) {
		this.nodeList = [];
		this.isRunning = false;
		this.interval = _interval || 300000;
		this.heights = {};
		this.finalizedHeights = {};
	}

	public start = async () => {
		logger.info(`Start`);
		try {
			this.isRunning = true;
			this.clear();

			await this.getNodeList();
			await this.getNodeChainHeight();

			if (this.isRunning) {
				await this.updateCollection();
				await sleep(this.interval);
				this.start();
			}
		} catch (e) {
			logger.error(`Unhandled error during a loop. ${e.message}. Restarting Monitor..`);
			await sleep(this.interval);
			this.stop();
			this.start();
		}
	};

	public stop = () => {
		logger.info(`Stop`);
		this.isRunning = false;
		this.clear();
	};

	private getNodeList = async (): Promise<any> => {
		try {
			this.nodeList = (await DataBase.getNodeList()).filter((node) => isAPIRole(node.roles));
		} catch (e) {
			logger.error('Failed to get node list. Use nodes from config');
			for (const node of symbol.NODES) {
				const url = new URL(node);
				const nodeInfo = await ApiNodeService.getNodeInfo(url.host, Number(url.port), url.protocol);

				if (nodeInfo) {
					const status = await ApiNodeService.getStatus(nodeInfo.host);

					if (status.isAvailable) this.nodeList.push({ ...nodeInfo });
				}
			}
		}

		return Promise.resolve();
	};

	private getNodeChainHeight = async () => {
		logger.info(`Getting height stats for ${this.nodeList.length} nodes`);
		const nodes: INode[] = this.nodeList;
		const nodeChainInfoPromises = nodes.map((node) => {
			const isHttps = node.apiStatus?.isHttpsEnabled;
			const protocol = isHttps ? 'https:' : 'http:';
			const port = isHttps ? 3001 : 3000;

			return ApiNodeService.getNodeChainInfo(node.host, port, protocol);
		});
		const nodeChainInfoList = await Promise.all(nodeChainInfoPromises);

		for (let chainInfo of nodeChainInfoList) {
			try {
				if (chainInfo) {
					if (this.heights[chainInfo.height]) this.heights[chainInfo.height]++;
					else this.heights[chainInfo.height] = 1;

					if (this.finalizedHeights[chainInfo.latestFinalizedBlock.height])
						this.finalizedHeights[chainInfo.latestFinalizedBlock.height]++;
					else this.finalizedHeights[chainInfo.latestFinalizedBlock.height] = 1;
				}
			} catch (e) {
				logger.error(`Node chain height monitor failed. ${e.message}`);
			}
		}
	};

	private clear = () => {
		this.nodeList = [];
		this.heights = {};
		this.finalizedHeights = {};
	};

	private updateCollection = async (): Promise<any> => {
		logger.info(`Update collection`);
		const nodeHeightStats: INodeHeightStats = {
			height: Object.keys(this.heights).map((height) => ({
				value: height,
				count: this.heights[height],
			})),
			finalizedHeight: Object.keys(this.finalizedHeights).map((height) => ({
				value: height,
				count: this.finalizedHeights[height],
			})),
			date: new Date(),
		};

		if (nodeHeightStats.height.length > 0 || nodeHeightStats.finalizedHeight.length > 0) {
			await DataBase.updateNodeHeightStats(nodeHeightStats);
		} else {
			logger.error(`Failed to update collection. Collection length = ${this.nodeList.length}`);
		}
	};
}
