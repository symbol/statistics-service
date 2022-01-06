import { HTTP } from '@src/services/Http';
import * as winston from 'winston';
import { memoryCache } from '@src/services/MemoryCache';
import { INode } from '@src/models/Node';
import { Coordinates, IHostDetail } from '@src/models/HostDetail';
import { basename, sleep } from '@src/utils';
import { Logger } from '@src/infrastructure';

const logger: winston.Logger = Logger.getLogger(basename(__filename));

export class HostInfo {
	static getHostDetail = async (host: string): Promise<IHostDetail | null> => {
		let coordinates: Coordinates;
		let location = '';

		const cachedHostdetail = await HostInfo.getHostDetailCached(host);

		if (cachedHostdetail) return cachedHostdetail;

		try {
			await sleep(5000);
			const response = await HTTP.get(`http://ip-api.com/json/${host}?fields=33288191&lang=en`);
			const data = response.data;

			coordinates = {
				latitude: data.lat,
				longitude: data.lon,
			};
			location = data.city + ', ' + data.region + ', ' + data.country;

			return {
				host,
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
			logger.error(`[getHostDetail] Failed to get host ${host} info ${e.message}`);
			return null;
		}
	};

	static getHostDetailCached = async (host: string): Promise<IHostDetail | null> => {
		try {
			const nodesHostDetailIndexes = await memoryCache.get('nodesHostDetailIndexes');

			if (!nodesHostDetailIndexes?.host) throw Error();
			const cachedData = nodesHostDetailIndexes.host[host];

			if (cachedData?.coordinates?.latitude) {
				return {
					host: cachedData.host,
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
			} else throw Error();
		} catch (e) {
			return null;
		}
	};
}
