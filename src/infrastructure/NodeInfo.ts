import Axios from 'axios';
import * as tcpp from 'tcp-ping';
import * as winston from 'winston';
import { INode } from '@src/DataBase/models/Node';
import { sleep, isPeerRole, basename } from '@src/utils';
import { Logger } from '@src/infrastructure';

export interface Coordinates {
	latitude: number;
	longitude: number;
}

export interface Location {
	coordinates: Coordinates;
	location: string;
}

export interface PeerStatus {
	isAvailable: boolean;
	lastStatusCheck: number;
}

const logger: winston.Logger = Logger.getLogger(basename(__filename));

export class NodeInfo {
	static getHostInfo = async (ip: string): Promise<Location | object> => {
		let coordinates: Coordinates;
		let location = '';

		try {
			const response = await Axios.get(`http://demo.ip-api.com/json/${ip}?fields=33288191&lang=en`);
			const data = response.data;

			coordinates = {
				latitude: data.lat,
				longitude: data.lon,
			};
			location = data.city + ', ' + data.region + ', ' + data.country;

			return {
				coordinates,
				location,
				ip: data.query,
				organization: data.org,
				as: data.as,
				continent: data.continent,
				country: data.country,
				region: data.region,
				city: data.city,
				district: data.district,
				zip: data.zip,
			};
		} catch (e) {
			logger.error(`Failed to get host info ${e.message}`);
			return {};
		}
	};

	private static TCPprobe = (host: string, port: number): Promise<boolean> => {
		return new Promise((resolve) => {
			tcpp.probe(host, port, function (err, result) {
				if (err) resolve(false);
				resolve(result);
			});
		});
	};

	static getInfoForListOfNodes = async (nodes: INode[]): Promise<INode[]> => {
		const nodesWithLocation: INode[] = [];
		let counter = 0;

		for (let node of nodes) {
			counter++;
			logger.info(`getting info for: ${counter} ${node.host}`);

			let nodeWithLocation: INode = {
				...node,
				...(await NodeInfo.getHostInfo(node.host)),
			};

			if (isPeerRole(node.roles)) {
				nodeWithLocation.peerStatus = {
					isAvailable: await NodeInfo.TCPprobe(node.host, node.port),
					lastStatusCheck: Date.now(),
				};
			}

			nodesWithLocation.push(nodeWithLocation);
			await sleep(5000);
		}

		return nodesWithLocation;
	};
}
