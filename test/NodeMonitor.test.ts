import { NodeMonitor } from '@src/services/NodeMonitor';
import { HostInfo } from '@src/services/HostInfo';
import { ApiNodeService } from '@src/services/ApiNodeService';
import { PeerNodeService } from '@src/services/PeerNodeService';
import { expect } from 'chai';
import { stub, restore, useFakeTimers } from 'sinon';

describe('NodeMonitor', () => {
	describe('removeUnavailableNodesAndUpdateLastAvailable', () => {
		let clock: sinon.SinonFakeTimers;
		let nodeMonitor: NodeMonitor;
		const mockFixedDate = new Date('2024-01-14T12:00:00Z');

		const createNode = (hostname: string, roles: number, apiAvailable?: any, peerAvailable?: any) =>
			({
				hostname,
				roles,
				...(apiAvailable !== undefined && {
					apiStatus: {
						isAvailable: apiAvailable,
						lastStatusCheck: 1000,
					},
				}),
				...(peerAvailable !== undefined && {
					peerStatus: {
						isAvailable: peerAvailable,
						lastStatusCheck: 1000,
					},
				}),
			} as any);

		beforeEach(() => {
			clock = useFakeTimers(mockFixedDate);
			nodeMonitor = new NodeMonitor(0);
		});

		afterEach(() => {
			clock.restore();
		});

		describe('API_PEER', () => {
			it('should keep API_PEER node when both API and peer are available', () => {
				const nodes = [createNode('API_PEER node', 3, true, true)];

				const result = (nodeMonitor as any).removeUnavailableNodesAndUpdateLastAvailable(nodes);

				expect(result).to.deep.equal([
					{
						...nodes[0],
						lastAvailable: mockFixedDate,
					},
				]);
			});

			it('should remove API_PEER node when API is not available', () => {
				const nodes = [createNode('API_PEER node', 3, false, true)];

				const result = (nodeMonitor as any).removeUnavailableNodesAndUpdateLastAvailable(nodes);

				expect(result).to.deep.equal([]);
			});

			it('should remove API_PEER node when Peer is not available', () => {
				const nodes = [createNode('API_PEER node', 3, true, false)];

				const result = (nodeMonitor as any).removeUnavailableNodesAndUpdateLastAvailable(nodes);

				expect(result).to.deep.equal([]);
			});
		});

		describe('API', () => {
			it('should keep API node when API is available', () => {
				const nodes = [createNode('API node', 2, true)];

				const result = (nodeMonitor as any).removeUnavailableNodesAndUpdateLastAvailable(nodes);

				expect(result).to.deep.equal([
					{
						...nodes[0],
						lastAvailable: mockFixedDate,
					},
				]);
			});

			it('should remove API node when API is not available', () => {
				const nodes = [createNode('API node', 2, false)];

				const result = (nodeMonitor as any).removeUnavailableNodesAndUpdateLastAvailable(nodes);

				expect(result).to.deep.equal([]);
			});
		});

		describe('PEER', () => {
			it('should keep PEER node when peer is available', () => {
				const nodes = [createNode('PEER node', 1, undefined, true)];

				const result = (nodeMonitor as any).removeUnavailableNodesAndUpdateLastAvailable(nodes);

				expect(result).to.deep.equal([
					{
						...nodes[0],
						lastAvailable: mockFixedDate,
					},
				]);
			});

			it('should remove PEER node when peer is not available', () => {
				const nodes = [createNode('PEER node', 1, undefined, undefined)];

				const result = (nodeMonitor as any).removeUnavailableNodesAndUpdateLastAvailable(nodes);

				expect(result).to.deep.equal([]);
			});
		});

		it('should handle empty node list', () => {
			const result = (nodeMonitor as any).removeUnavailableNodesAndUpdateLastAvailable([]);
			expect(result).to.deep.equal([]);
		});
	});

	describe('getNodeInfo', () => {
		const nodeMonitor = new NodeMonitor(0);
		const mockGeoInfo = {
			host: 'abc.com',
			coordinates: {
				latitude: 51.1878,
				longitude: 6.8607,
			},
			location: 'Düsseldorf, NW, Germany',
			ip: '127.0.1.10',
			organization: 'ABC Provider',
			as: 'ABC Provider',
			continent: 'Europe',
			country: 'Germany',
			region: 'NW',
			city: 'Düsseldorf',
			district: '',
			zip: '12345',
		};
		const mockNodeInfo = {
			friendlyName: 'node1',
			host: 'abc.com',
			networkGenerationHashSeed: '1234',
			networkIdentifier: 1,
			port: 3000,
			publicKey: 'publicKey',
			roles: 1,
			version: 1,
		};
		const mockPeerStatus = {
			isAvailable: true,
			lastStatusCheck: 1000,
		};
		const mockLightApiStatus = {
			restGatewayUrl: 'https://abc.com:3001',
			isAvailable: true,
			isHttpsEnabled: true,
			lastStatusCheck: 1000,
			nodePublicKey: 'node public key',
			chainHeight: 10,
			finalization: {
				height: 8,
				epoch: 1,
				point: 2,
				hash: 'hash',
			},
			restVersion: '1.0.0',
		};
		const mockFullApiStatus = {
			...mockLightApiStatus,
			nodeStatus: {
				apiNode: 'up',
				db: 'up',
			},
			webSocket: {
				isAvailable: true,
				wss: true,
				url: 'wss://abc.com:3001/ws',
			},
		};

		let stubHostDetailCached: any;
		let stubPeerStatus: any;
		let stubApiStatus: any;

		beforeEach(() => {
			stub(nodeMonitor, 'generationHashSeed' as any).value('1234');
			stub(nodeMonitor, 'networkIdentifier' as any).value(1);
			stub(ApiNodeService, 'buildHostUrl');

			stubHostDetailCached = stub(HostInfo, 'getHostDetailCached');
			stubPeerStatus = stub(PeerNodeService, 'getStatus');
			stubApiStatus = stub(ApiNodeService, 'getStatus');
		});

		afterEach(() => {
			restore();
		});

		it('returns undefined if node different network', async () => {
			// Arrange:
			stub(nodeMonitor, 'generationHashSeed' as any).value('5678');
			stub(nodeMonitor, 'networkIdentifier' as any).value(2);

			// Act:
			const result = await (nodeMonitor as any).getNodeInfo(mockNodeInfo);

			// Assert:
			expect(result).to.be.undefined;
		});

		it('returns node info without hostDetail', async () => {
			// Arrange:
			stubHostDetailCached.returns(Promise.resolve(null));
			stubPeerStatus.returns(Promise.resolve(mockPeerStatus));
			stubApiStatus.returns(Promise.resolve({ isAvailable: false }) as any);

			// Act:
			const result = await (nodeMonitor as any).getNodeInfo(mockNodeInfo);

			// Assert:
			expect(result.hostDetail).to.be.undefined;
		});

		it('returns peer node info', async () => {
			// Arrange:
			stubHostDetailCached.returns(Promise.resolve(mockGeoInfo));
			stubPeerStatus.returns(Promise.resolve(mockPeerStatus));
			stubApiStatus.returns(Promise.resolve({ isAvailable: false }) as any);

			// Act:
			const result = await (nodeMonitor as any).getNodeInfo(mockNodeInfo);

			// Assert:
			expect(result.apiStatus).to.be.undefined;
			expect(result).to.be.deep.equal({
				...mockNodeInfo,
				hostDetail: mockGeoInfo,
				peerStatus: mockPeerStatus,
			});
		});

		it('returns peer with light rest node info', async () => {
			// Arrange:
			stubHostDetailCached.returns(Promise.resolve(mockGeoInfo));
			stubPeerStatus.returns(Promise.resolve(mockPeerStatus));
			stubApiStatus.returns(Promise.resolve(mockLightApiStatus) as any);

			// Act:
			const result = await (nodeMonitor as any).getNodeInfo(mockNodeInfo);

			// Assert:
			expect(result).to.be.deep.equal({
				...mockNodeInfo,
				hostDetail: mockGeoInfo,
				peerStatus: mockPeerStatus,
				apiStatus: mockLightApiStatus,
			});
		});

		it('returns api node info', async () => {
			// Arrange:
			stubHostDetailCached.returns(Promise.resolve(mockGeoInfo));
			stubPeerStatus.returns(Promise.resolve(mockPeerStatus));
			stubApiStatus.returns(Promise.resolve(mockFullApiStatus) as any);

			// Act:
			const result = await (nodeMonitor as any).getNodeInfo(mockNodeInfo);

			// Assert:
			expect(result).to.be.deep.equal({
				...mockNodeInfo,
				hostDetail: mockGeoInfo,
				peerStatus: mockPeerStatus,
				apiStatus: mockFullApiStatus,
			});
		});
	});
});
