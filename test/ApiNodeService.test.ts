import { expect } from 'chai';
import { stub } from 'sinon';
import { ApiNodeService } from '@src/services/ApiNodeService';

describe('ApiNodeService', () => {
	it('getStatus proceeds even some of the api calls hangs', async () => {
		// Arrange:
		const webSocketStatus = { isAvailable: false, wss: false, url: undefined };
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
			height: '1173781',
			scoreHigh: '6',
			scoreLow: '18350901762684228126',
			latestFinalizedBlock: {
				finalizationEpoch: 817,
				finalizationPoint: 8,
				height: '1173756',
				hash: '8B9CB1A0D275720AEA04B9CB373994F2CC3826256DECFC0DE999FE7ED42F3814',
			},
		};

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
		const apiStatus = await ApiNodeService.getStatus('http://localhost:3000');

		// Assert:
		expect(apiStatus.webSocket).to.be.eql(webSocketStatus);
		expect(apiStatus.restVersion).to.be.eq('2.4.0');
		expect(apiStatus.chainHeight).to.be.eq('1173781');
	}).timeout(10_000);
});
