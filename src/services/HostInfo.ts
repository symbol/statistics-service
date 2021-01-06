import Axios from 'axios';
import * as winston from 'winston';
import { memoryCache } from '@src/services/MemoryCache';
import { Coordinates, INode } from '@src/models/Node';
import { basename, sleep } from '@src/utils';
import { Logger } from '@src/infrastructure';

const logger: winston.Logger = Logger.getLogger(basename(__filename));

export interface HostDetail {
	coordinates: Coordinates;
	location: string;
	ip: string;
	organization: string;
	as: string;
	continent: string;
	country: string;
	region: string;
	city: string;
	district: string;
	zip: string;
};

export class HostInfo {
	static getHostDetail = async (host: string): Promise<HostDetail | object> => {
		let coordinates: Coordinates;
		let location = '';


		try {
			const nodes = await memoryCache.get('nodeList');
			const cachedData = nodes.find((node: INode) => node.host === host);

			if(cachedData?.coordinates?.latitude) {
				return {
					coordinates: cachedData.coordinates,
					location: cachedData.location,
					ip: cachedData.ip,
					organization: cachedData.organization,
					as: cachedData.as,
					continent: cachedData.continent,
					country: cachedData.country,
					region: cachedData.region,
					city: cachedData.city,
					district: cachedData.district,
					zip: cachedData.zip,
				};
			}
			else throw Error();
		}
		catch(e){}

		try {
			const response = await Axios.get(`http://demo.ip-api.com/json/${host}?fields=33288191&lang=en`);
			await sleep(5000);
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
}
