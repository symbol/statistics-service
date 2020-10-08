import Axios from 'axios';

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
			console.error('Failed to get location', e);
			return {};
		}
	};
}
