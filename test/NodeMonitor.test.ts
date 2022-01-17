import { monitor } from '@src/config';
import { Constants } from '@src/constants';
import { NodeMonitor } from '@src/services/NodeMonitor';
import { expect } from 'chai';
import { stub } from 'sinon';
import { RoleType } from 'symbol-sdk';

describe('NodeMonitor', () => {
	describe('removeStaleNodesAndUpdateLastAvailable when KEEP_STALE_NODES_FOR_HOURS is 3 days', () => {
		stub(NodeMonitor.prototype, 'cacheCollection' as any);
		stub(monitor, 'KEEP_STALE_NODES_FOR_HOURS').value(72); // 3 days

		const nodeMonitor = new NodeMonitor(0);

		it('should remove stale nodes and keep fresh ones', () => {
			const freshNodeLastAvailable = new Date(new Date().getTime() - 1 * Constants.TIME_UNIT_DAY);
			const nodes = [
				{
					publicKey: 'pkFresh',
					host: 'hostFresh',
					lastAvailable: freshNodeLastAvailable,
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
			const result = (nodeMonitor as any).removeStaleNodesAndUpdateLastAvailable(nodes);

			expect(result.length).to.be.equal(1);
			expect(result[0].publicKey).to.be.equal('pkFresh');
			expect(result[0].lastAvailable).to.be.eq(freshNodeLastAvailable);
		});

		it("dual node - should refresh the stale node if at least one of two(API, Peer)'s status is available else remove the node", () => {
			const getNode = (apiAvailable: boolean, peerAvailable: boolean) => [
				{
					publicKey: 'pkFresh',
					host: 'hostFresh',
					lastAvailable: new Date(new Date().getTime() - 4 * Constants.TIME_UNIT_DAY),
					roles: RoleType.ApiNode + RoleType.PeerNode,
					apiStatus: {
						isAvailable: apiAvailable,
					},
					peerStatus: {
						isAvailable: peerAvailable,
					},
				},
			];
			const resultApiOK_PeerNOT = (nodeMonitor as any).removeStaleNodesAndUpdateLastAvailable(getNode(true, false));

			expect(resultApiOK_PeerNOT.length).to.be.equal(1);
			expect(resultApiOK_PeerNOT[0].publicKey).to.be.equal('pkFresh');
			expect(resultApiOK_PeerNOT[0].lastAvailable).to.be.greaterThan(new Date(new Date().getTime() - 1 * Constants.TIME_UNIT_MINUTE));

			const resultApiNOT_PeerOK = (nodeMonitor as any).removeStaleNodesAndUpdateLastAvailable(getNode(false, true));

			expect(resultApiNOT_PeerOK.length).to.be.equal(1);
			expect(resultApiNOT_PeerOK[0].publicKey).to.be.equal('pkFresh');
			expect(resultApiNOT_PeerOK[0].lastAvailable).to.be.greaterThan(new Date(new Date().getTime() - 1 * Constants.TIME_UNIT_MINUTE));

			const resultApiOK_PeerOK = (nodeMonitor as any).removeStaleNodesAndUpdateLastAvailable(getNode(true, true));

			expect(resultApiOK_PeerOK.length).to.be.equal(1);
			expect(resultApiOK_PeerOK[0].publicKey).to.be.equal('pkFresh');
			expect(resultApiOK_PeerOK[0].lastAvailable).to.be.greaterThan(new Date(new Date().getTime() - 1 * Constants.TIME_UNIT_MINUTE));

			const resultApiNOT_PeerNOT = (nodeMonitor as any).removeStaleNodesAndUpdateLastAvailable(getNode(false, false));

			expect(resultApiNOT_PeerNOT.length).to.be.equal(0);
		});

		it('api only - should keep the node in the list when fresh and available', () => {
			const nodes = [
				{
					publicKey: 'pkApiOnly',
					host: 'apiOnly',
					lastAvailable: new Date(),
					roles: RoleType.ApiNode,
					apiStatus: {
						isAvailable: true,
					},
				},
			];
			const result = (nodeMonitor as any).removeStaleNodesAndUpdateLastAvailable(nodes);

			expect(result.length).to.be.equal(1);
			expect(result[0].publicKey).to.be.equal('pkApiOnly');
		});

		it('peer only - should keep the node in the list when fresh and available', () => {
			const nodes = [
				{
					publicKey: 'pkPeerOnly',
					host: 'peerOnly',
					lastAvailable: new Date(),
					roles: RoleType.PeerNode,
					peerStatus: {
						isAvailable: true,
					},
				},
			];
			const result = (nodeMonitor as any).removeStaleNodesAndUpdateLastAvailable(nodes);

			expect(result.length).to.be.equal(1);
			expect(result[0].publicKey).to.be.equal('pkPeerOnly');
		});

		it('voting only - should keep the node in the list', () => {
			const nodes = [
				{
					publicKey: 'pkVotingOnly',
					host: 'votingOnly',
					lastAvailable: new Date(new Date().getTime() - 3 * Constants.TIME_UNIT_DAY + 1 * Constants.TIME_UNIT_HOUR),
					roles: RoleType.VotingNode,
				},
			];
			const result = (nodeMonitor as any).removeStaleNodesAndUpdateLastAvailable(nodes);

			expect(result.length).to.be.equal(1);
			expect(result[0].publicKey).to.be.equal('pkVotingOnly');
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
			const result = (nodeMonitor as any).removeStaleNodesAndUpdateLastAvailable(nodes);

			expect(result.length).to.be.equal(1);
			expect(result[0].publicKey).to.be.equal('pkFresh');
		});
	});
});
