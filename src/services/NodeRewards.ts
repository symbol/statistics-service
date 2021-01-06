import { symbol, monitor } from '@src/config';

type RewardProgramName = 'supernode';

export interface RewardProgram {
	name: RewardProgramName;
	passed: boolean;
};

export class NodeRewards {
	static async getInfo(publicKey: string): Promise<RewardProgram[]> {
		const rewardPrograms: Array<RewardProgram> = [];
		
		const getBool = () => Math.random() < 0.5;
		if(true) {
			rewardPrograms.push({
				name: 'supernode',
				passed: getBool()
			});
		}

		return rewardPrograms;
	}
}