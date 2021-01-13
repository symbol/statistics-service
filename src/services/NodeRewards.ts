import { nodeRewards } from '@src/config';
import {
	NodeInfoDTO,
	TestResultDTO,
	TestResultInfoDTO,
	RewardProgramDTO
} from '@src/models/NodeRewards/gen-src'
import axios from 'axios';

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
		const nodeInfo: NodeInfoDTO = await axios
			.get(`${nodeRewards.CONTROLLER_ENDPOINT}/nodes/nodePublicKey/${nodePublicKey}`);
		return nodeInfo;
	}

	static async getTestResults(nodeId: string): Promise<TestResultDTO[]> {
		const testResults: TestResultDTO[] = await axios
			.get(`${nodeRewards.CONTROLLER_ENDPOINT}/testResults/nodeId/${nodeId}`);
		return testResults;
	}

	static async getTestResultInfo(nodeId: string, round: number): Promise<TestResultInfoDTO> {
		const testResultInfo: TestResultInfoDTO = await axios
			.get(`${nodeRewards.CONTROLLER_ENDPOINT}/testResultInfo/nodeId/${nodeId}/round/${round}`);
		return testResultInfo;
	}
}