import Axios from 'axios';
import * as winston from 'winston';
import { Coordinates } from '@src/models/Node';
import { basename } from '@src/utils';
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
	static getHostDetail = async (ip: string): Promise<HostDetail | null> => {
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
			return null;
		}
	};
}
