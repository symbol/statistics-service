import * as tcpp from 'tcp-ping';
import * as winston from 'winston';
import { basename } from '@src/utils';
import { Logger } from '@src/infrastructure';
import { PeerStatus } from '@src/models/PeerStatus';

const logger: winston.Logger = Logger.getLogger(basename(__filename));

export class PeerNodeService {
	private static tcpProbe = (host: string, port: number): Promise<boolean> => {
		return new Promise((resolve) => {
			tcpp.probe(host, port, function (err, result) {
				if (err) {
					//logger.error(`TCP probe failed for: ${host}`);
					resolve(false);
				}
				resolve(result);
			});
		});
	};

	public static getStatus = async (host: string, port: number): Promise<PeerStatus> => {
		return {
			isAvailable: await PeerNodeService.tcpProbe(host, port),
			lastStatusCheck: Date.now(),
		};
	};
}
