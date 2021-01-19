import { nodeRewards } from '@src/config';
import {
	NodeInfoDTO,
	TestResultDTO,
	TestResultInfoDTO,
	RewardProgramDTO,
	NodeStatusDTO
} from '@src/models/NodeRewards/gen-src'
import { HTTP } from '@src/services/HTTP';

export interface RewardProgram {
	name: RewardProgramDTO;
	passed: boolean;
};

export interface NodeRewardsInfo {
	round: number;
	nodeInfo: {
		friendlyName: string;
		host: string;
	};
	history: TestResultDTO[];
	testResultInfo: TestResultInfoDTO;
}

export class NodeRewards {
	static async getNodeRewardPrograms(nodePublicKey: string): Promise<RewardProgram[]> {
		const rewardPrograms: Array<RewardProgram> = [];
		
		try {
			const nodeInfo = await NodeRewards.getNodeInfo(nodePublicKey);
					
			rewardPrograms.push({
				name: nodeInfo.rewardProgram,
				passed: nodeInfo.status === 'OK'
			});
		}
		catch(e){}
		
		return rewardPrograms;
	}

	static async getNodeInfo(nodePublicKey: string): Promise<NodeInfoDTO> {
		const nodeInfo: NodeInfoDTO = (await HTTP
			.get(`${nodeRewards.CONTROLLER_ENDPOINT}/nodes/nodePublicKey/${nodePublicKey}`)).data;
		return nodeInfo;
	}

	static async getTestResults(nodeId: string): Promise<TestResultDTO[]> {
		const testResults: TestResultDTO[] = (await HTTP
			.get(`${nodeRewards.CONTROLLER_ENDPOINT}/testResults/nodeId/${nodeId}`)).data;
		return testResults;
	}

	static async getTestResultInfo(nodeId: string, round: number): Promise<TestResultInfoDTO> {
		const testResultInfo: TestResultInfoDTO = (await HTTP
			.get(`${nodeRewards.CONTROLLER_ENDPOINT}/testResultInfo/nodeId/${nodeId}/round/${round}`)).data;
		return testResultInfo;
	}


	// mocks

	static getNodeInfoMock = async (nodePublicKey: string): Promise<NodeInfoDTO> => {
		if(
			nodePublicKey !== 'DB82B0E82B5C61200184EDE335D0DE12D24BD87F49E29E8A56E9BE61396F8233'
			&& nodePublicKey !== 'CB079A9608C542C507419645EF59A32B34AEA4D03B2E9F21F98C1D7A7693260F'
		)
			throw Error('Not found');

		return {
			"id":"5ffd5f0984dc770379e2e2bb",
			"name":"supernode-fernando",
			"host":"54.155.40.57",
			"serverPort":7900,
			"agentPort":7880,
			"restGatewayUrl":"http://54.155.40.57:3000",
			"nodePublicKey":"DB82B0E82B5C61200184EDE335D0DE12D24BD87F49E29E8A56E9BE61396F8233",
			"mainPublicKey":"755CC25B3DDEC8E5445996CB9D847B593D988E263F85033419AF74F34DA10A52",
			"status": NodeStatusDTO.INITIAL,
			"rewardProgram": RewardProgramDTO.EarlyAdoption
		}
	}

	static getTestResultsMock = async (nodeId: string): Promise<TestResultDTO[]> => {
		return [
			{
				'id': "5ff6edb9354d0b2348dba81f",
				'nodeId': "5ff6edb9354d0b2348dba81f",
				'nodeVersionTestOk': true,
				'chainHeightTestOk': true,
				'chainPartTestOk': false,
				'responsivenessTestOk': true,
				'bandwidthTestOk': false,
				'computingPowerTestOk': true,
				'pingTestOk': true,
				'nodeBalanceTestOk': true,
				'round': 10,
				'createdAt': new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
			},
			{
				'id': "5ff6edb9354d0b2348dba81f",
				'nodeId': "5ff6edb9354d0b2348dba81f",
				'nodeVersionTestOk': true,
				'chainHeightTestOk': true,
				'chainPartTestOk': true,
				'responsivenessTestOk': true,
				'bandwidthTestOk': true,
				'computingPowerTestOk': true,
				'pingTestOk': true,
				'nodeBalanceTestOk': true,
				'round': 9,
				'createdAt': new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
			},
			{
				'id': "5ff6edb9354d0b2348dba81f",
				'nodeId': "5ff6edb9354d0b2348dba81f",
				'nodeVersionTestOk': true,
				'chainHeightTestOk': true,
				'chainPartTestOk': false,
				'responsivenessTestOk': true,
				'bandwidthTestOk': true,
				'computingPowerTestOk': true,
				'pingTestOk': true,
				'nodeBalanceTestOk': false,
				'round': 8,
				'createdAt': new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
			},
			{
				'id': "5ff6edb9354d0b2348dba81f",
				'nodeId': "5ff6edb9354d0b2348dba81f",
				'nodeVersionTestOk': true,
				'chainHeightTestOk': true,
				'chainPartTestOk': true,
				'responsivenessTestOk': true,
				'bandwidthTestOk': true,
				'computingPowerTestOk': true,
				'pingTestOk': true,
				'nodeBalanceTestOk': true,
				'round': 7,
				'createdAt': new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
			}
		]
	}
	
	static getTestResultInfoMock = async (nodeId: string, round: number): Promise<TestResultInfoDTO> => {
		return {
			'bandwidthResult': {
				'createdAt': new Date().toISOString(),
				"id": "5ff6edb9354d0b2348dba81f",
				"fromNodeId":"DB82B0E82B5C61200184EDE335D0DE12D24BD87F49E29E8A56E9BE61396F8233",
				"toNodeId":"DB82B0E82B5C61200184EDE335D0DE12D24BD87F49E29E8A56E9BE61396F8233",
				"entitySeed":"3F757F8D34BE670DB50DF4B440C79533FB855E0C7D338FD1C7DBA2736BC8BD94",
				"entityHash":"18C1006E0A09EF05D8A2DA2836CD4BF4050F3103E3B046C9FA7FFE2EEA0A54F3",
				"reportedHash":"18C1006E0A09EF05D8A2DA2836CD4BF4050F3103E3B046C9FA7FFE2EEA0A54F3",
				"iterations": 1000,
				"downloadTime": 111,
				"entityValid":false,
				"round": 10,
				speed: 4833.72972972973
			},
			'chainHeightResult': {
				'createdAt': new Date().toISOString(),
				"id":"5ff6eda9354d0b2348dba81a",
				"nodeId":"5ff6ea64a3317f22e2545414",
				"expectedHeight":286274,
				"reportedHeight":107854,
				"round":10,
				"resultValid":false
			},
			'chainPartResult': {
				'createdAt': new Date().toISOString(),
				"id": "5ff6edaa354d0b2348dba81d",
				"nodeId":"5ff6ea64a3317f22e2545414",
				"fromHeight":286204,
				"numBlocks":50,
				"expectedHash":"CBF0ED4CD361BDC8B67AD4C2DED870C581DC25BE8922A9EF99D6C7B69032F410",
				"reportedHash":"B764D8393D7741293F698E5FE32BB8FED438F36E9A7A450D172D019052D9A5A2",
				"round":10,
				"resultValid":false
			},
			'computingPowerResult': {
				'createdAt': new Date().toISOString(),
				"id": "5ff6edaa354d0b2348dba81d",
				"nodeId":"5ff6ea64a3317f22e2545414",
				"seed":"32A17A757EC4ABEA496D08C3C851E95FF76516077815C1D63A32AD8207148E9C",
				"reportedResult":"3F76A2320FA51117871BCDDB905CAACADC36BFF50EBA7DB3197BAD2885F9F83C",
				"expectedResult":"3F76A2320FA51117871BCDDB905CAACADC36BFF50EBA7DB3197BAD2885F9F83C",
				"timeNeeded": 4667,
				"iterations": 500,
				"round":10,
				"resultValid":false
			},
			'nodeBalanceResult': {
				'createdAt': new Date().toISOString(),
				"id": "5ffdb36984dc770379e2e2bd",
				"nodeId":"5ffd5f0984dc770379e2e2bb",
				"expectedMinBalance":1000000,
				"reportedBalance":8712496329.0,
				"round":10,
				"resultValid":true
			},
			'nodeVersionResult': {
				'createdAt': new Date().toISOString(),
				"id": "5ff6eda9354d0b2348dba81b",
				"nodeId":"5ff6ea64a3317f22e2545414",
				"expectedNodeVersion":655364,
				"reportedNodeVersion":655364,
				"round":10,
				"resultValid":true
			},
			'pingResult': {
				'createdAt': new Date().toISOString(),
				"id": "5ffdb36a84dc770379e2e2bf",
				"fromNodeId":"5ffd5f0984dc770379e2e2bb",
				"toNodeId":"5ffd5f0984dc770379e2e2bc",
				"sample1":85,
				"sample2":71,
				"sample3":65,
				"sample4":74,
				"sample5":77,
				"averageTime":74.4,
				"round":10,
				"resultValid":true
			},
			'responsivenessResult': {
				'createdAt': new Date().toISOString(),
				"id": "5ff6eda9354d0b2348dba81c",
				"nodeId":"5ff6ea64a3317f22e2545414",
				"numRequests":10,
				"numResponses":10,
				"totalTime":126,
				"round":10,
				"resultValid":true
			},
		}
	}
}

