import Axios from 'axios';
import { INode } from '@src/DataBase/models/Node';
import { getNodeURL, sleep } from '../utils';

export interface Coordinates {
	latitude: number;
	longitude: number;
}

export interface Location {
	coordinates: Coordinates;
	location: string;
}

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
			console.error('[NodeInfo] Failed to get host info', e.message);
			return {};
		}
	};

	static getInfoForListOfNodes = async (nodes: INode[]): Promise<INode[]> => {
		const nodesWithLocation: INode[] = [];
		let counter = 0;

		for (let node of nodes) {
			counter++;
			console.log('[NodeInfo] getting info for: ', counter, node.host);

			const nodeWithLocation: INode = {
				...node,
				...(await NodeInfo.getHostInfo(node.host)),
			};

			nodesWithLocation.push(nodeWithLocation);
			await sleep(5000);
		}

		return nodesWithLocation;
	};
}
