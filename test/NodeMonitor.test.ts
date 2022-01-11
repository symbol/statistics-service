import { Constants } from '@src/constants';
import { NodeMonitor } from '@src/services/NodeMonitor';
import { expect } from 'chai';
import { stub } from 'sinon';
import { RoleType } from 'symbol-sdk';

describe('NodeMonitor', () => {
	describe('removeUnavailableNodes', () => {
		stub(NodeMonitor.prototype, 'cacheCollection' as any);
		const nodeMonitor = new NodeMonitor(0);

		it('should remove stale nodes and keep fresh ones', () => {
			const nodes = [
				{
					publicKey: 'pkFresh',
					host: 'hostFresh',
					lastAvailable: new Date(new Date().getTime() - 1 * Constants.TIME_UNIT_DAY),
					roles: RoleType.ApiNode + RoleType.PeerNode,
					apiStatus: {
						isAvailable: false,
					},
				},
				{
					publicKey: 'pkStale',
					host: 'hostStale',
					lastAvailable: new Date(new Date().getTime() - 4 * Constants.TIME_UNIT_DAY),
					roles: RoleType.ApiNode + RoleType.PeerNode,
					apiStatus: {
						isAvailable: false,
					},
				},
			];
			const result = (nodeMonitor as any).removeUnavailableNodes(nodes);

			expect(result.length).to.be.equal(1);
			expect(result[0].publicKey).to.be.equal('pkFresh');
		});

		it('should keep a resurrecting node', () => {
			const nodes = [
				{
					publicKey: 'pkFresh',
					host: 'hostFresh',
					lastAvailable: new Date(new Date().getTime() - 3 * Constants.TIME_UNIT_DAY + 1 * Constants.TIME_UNIT_HOUR),
					roles: RoleType.ApiNode + RoleType.PeerNode,
					apiStatus: {
						isAvailable: true,
					},
				},
				{
					publicKey: 'pkStale',
					host: 'hostStale',
					lastAvailable: new Date(new Date().getTime() - 4 * Constants.TIME_UNIT_DAY),
					roles: RoleType.ApiNode + RoleType.PeerNode,
					apiStatus: {
						isAvailable: false,
					},
				},
			];
			const result = (nodeMonitor as any).removeUnavailableNodes(nodes);

			expect(result.length).to.be.equal(1);
			expect(result[0].publicKey).to.be.equal('pkFresh');
		});

		it('should keep peer nodes and remove stale api nodes', () => {
			const nodes = [
				{
					publicKey: 'pkPeer',
					host: 'hostPeer',
					lastAvailable: new Date(new Date().getTime() - 4 * Constants.TIME_UNIT_DAY),
					roles: RoleType.PeerNode,
					apiStatus: {
						isAvailable: false,
					},
				},
				{
					publicKey: 'pkApi',
					host: 'hostApi',
					lastAvailable: new Date(new Date().getTime() - 4 * Constants.TIME_UNIT_DAY),
					roles: RoleType.ApiNode + RoleType.PeerNode,
					apiStatus: {
						isAvailable: false,
					},
				},
			];
			const result = (nodeMonitor as any).removeUnavailableNodes(nodes);

			expect(result.length).to.be.equal(1);
			expect(result[0].publicKey).to.be.equal('pkPeer');
		});
	});
});
