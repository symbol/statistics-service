import { expect } from 'chai';
import { stub, restore } from 'sinon';
import { ApiNodeService } from '@src/services/ApiNodeService';

describe('ApiNodeService', () => {
	const host = 'localhost';
	const hostURL = `https://${host}:3001`;
	const webSocketStatus = { isAvailable: true, wss: true, url: `wss://${host}:3001` };
	const serverInfo = {
		restVersion: '2.4.0',
		sdkVersion: '2.4.1',
		deployment: {
			deploymentTool: 'symbol-bootstrap',
			deploymentToolVersion: '1.1.6',
			lastUpdatedDate: '2022-03-16',
		},
	};
	const chainInfo = {
		scoreHigh: '0',
		scoreLow: '3553661314979960997',
		height: '355232',
		latestFinalizedBlock: {
			finalizationEpoch: 495,
			finalizationPoint: 16,
			height: '355204',
			hash: 'ACE7C54D9DEB625151157D2E0A0EC4CD92235A95A0997FF87FA8DE743A2E46B8',
		},
	};

	afterEach(() => {
		restore();
	});

	it('getStatus returns data successfully', async () => {
		// Arrange:
		const nodeInfo = {
			version: 16777987,
			publicKey: '3460D29534CA997D6A74BEBB93F38356833B806E1A35F700EBE08D57FC8D3FED',
			networkGenerationHashSeed: '7FCCD304802016BEBBCD342A332F91FF1F3BB5E902988B352697BE245F48E836',
			roles: 3,
			port: 7900,
			networkIdentifier: 152,
			host: host,
			friendlyName: host,
			nodePublicKey: '7F95C44319D02FF33F852142D78D85679B1B82EB48194CCCFBB6749ED75653DC',
		};

		const nodeStatus = {
			apiNode: 'up',
			db: 'up',
		};

		const finalization = {
			height: Number.parseInt(chainInfo.latestFinalizedBlock.height),
			epoch: chainInfo.latestFinalizedBlock.finalizationEpoch,
			point: chainInfo.latestFinalizedBlock.finalizationPoint,
			hash: chainInfo.latestFinalizedBlock.hash,
		};

		stub(ApiNodeService, 'getNodeChainInfo').returns(Promise.resolve(chainInfo));
		stub(ApiNodeService, 'webSocketStatus').returns(Promise.resolve(webSocketStatus));
		stub(ApiNodeService, 'getNodeServer').returns(Promise.resolve(serverInfo));
		stub(ApiNodeService, 'getNodeInfo').returns(Promise.resolve(nodeInfo));
		stub(ApiNodeService, 'getNodeHealth').returns(Promise.resolve(nodeStatus));
		stub(ApiNodeService, 'isHttpsEnabled').returns(Promise.resolve(true));

		// Act:
		const apiStatus = await ApiNodeService.getStatus(hostURL);

		// Assert:
		expect(apiStatus.webSocket).to.be.deep.equal(webSocketStatus);
		expect(apiStatus.restGatewayUrl).to.be.equal(hostURL);
		expect(apiStatus.isAvailable).to.be.equal(true);
		expect(apiStatus.isHttpsEnabled).to.be.equal(true);
		expect(apiStatus.nodeStatus).to.be.deep.equal(nodeStatus);
		expect(apiStatus.chainHeight).to.equal(chainInfo.height);
		expect(apiStatus.finalization).to.be.deep.equal(finalization);
		expect(apiStatus.nodePublicKey).to.be.equal(nodeInfo.nodePublicKey);
		expect(apiStatus.restVersion).to.be.equal(serverInfo.restVersion);
		expect(apiStatus.lastStatusCheck).to.be.not.undefined;
	});

	it('getStatus proceeds even if some of the api calls hang', async () => {
		// Arrange:
		const webSocketStatus = { isAvailable: false, wss: false, url: undefined };

		stub(ApiNodeService, 'getNodeChainInfo').returns(Promise.resolve(chainInfo));
		stub(ApiNodeService, 'webSocketStatus').returns(Promise.resolve(webSocketStatus));

		const hangingMethods = ['getNodeInfo', 'getNodeHealth'];

		hangingMethods.map((method: any) =>
			stub(ApiNodeService, method).returns(
				new Promise((_, reject) => {
					setTimeout(() => {
						reject(Error('timeout'));
					}, 6_000);
				}),
			),
		);
		stub(ApiNodeService, 'getNodeServer').returns(Promise.resolve(serverInfo));

		// Act:
		const apiStatus = await ApiNodeService.getStatus(hostURL);

		// Assert:
		expect(apiStatus.nodePublicKey).to.be.undefined;
		expect(apiStatus.nodeStatus).to.be.undefined;
		expect(apiStatus.webSocket).to.be.deep.equal(webSocketStatus);
		expect(apiStatus.restVersion).to.be.equal(serverInfo.restVersion);
		expect(apiStatus.chainHeight).to.be.equal(chainInfo.height);
	}).timeout(10_000);
});
