import * as tcpp from 'tcp-ping';


export interface PeerStatus {
	isAvailable: boolean;
	lastStatusCheck: number;
}

export class PeerHealth {
	private static tcpProbe = (host: string, port: number): Promise<boolean> => {
		return new Promise((resolve) => {
			tcpp.probe(host, port, function (err, result) {
				if (err) resolve(false);
				resolve(result);
			});
		});
	};

	public static getStatus = async (host: string, port: number): Promise<PeerStatus> => {
		return {
			isAvailable: await PeerHealth.tcpProbe(host, port),
			lastStatusCheck: Date.now(),
		};
	};
}
