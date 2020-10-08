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

export class NodeLocation {
	static getLocationByIp = async (ip: string): Promise<Location | object> => {
		let coordinates: Coordinates;
		let location = '';

		try {
			const response = await Axios.get(`http://demo.ip-api.com/json/${ip}?fields=33288191&lang=en`);
            const data = response.data;
            console.log(`http://demo.ip-api.com/json/${ip}?fields=33288191&lang=en`, data)

			coordinates = {
				latitude: data.lat,
				longitude: data.lon,
			};
			location = data.city + ', ' + data.region + ', ' + data.country;

			return {
				coordinates,
				location,
			};
		} catch (e) {
			console.error('Failed to get location', e.message);
			return {};
		}
    };
    
    static getLocationForListOfNodes = async (nodes: INode[]): Promise<INode[]> => {
        const nodesWithLocation: INode[] = [];
        for(let node of nodes) {
            const nodeWithLocation: INode = {
                ...node,
                ...await NodeLocation.getLocationByIp(node.host)
            };
            console.log('[NodeLocation] location for "', nodeWithLocation.host , '" is', nodeWithLocation.location);
            nodesWithLocation.push(nodeWithLocation);
            await sleep(5000);
        }

        return nodesWithLocation;
    }
}
