import { nodeRewards } from '@src/config';
import axios from 'axios';

type RewardProgramName = 'supernode';

export interface RewardProgram {
	name: RewardProgramName;
	passed: boolean;
};

export class NodeRewards {
	static async getInfo(publicKey: string): Promise<RewardProgram[]> {
		const rewardPrograms: Array<RewardProgram> = [];
		
		try {
			const nodeInfo = await axios.get(`${nodeRewards.CONTROLLER_ENDPOINT}/nodes/nodepublickey/${publicKey}`);
			const resultInfo = await axios.get(`${nodeRewards.CONTROLLER_ENDPOINT}/nodes/nodepublickey/${publicKey}`);
			
			rewardPrograms.push({
				name: nodeInfo.data.rewardProgram,
				passed: !resultInfo.data.passed
			});
		}
		catch(e){}
		
		return rewardPrograms;
	}
}