import { Express, Request, Response } from 'express';
import { DataBase } from '@src/services/DataBase';
import { NodeRewards } from '@src/services/NodeRewards';
import { NotFoundError, InternalServerError, MissingParamError } from '@src/infrastructure/Error';
import { Pagination } from '@src/infrastructure/Pagination';
import { nodeRewards } from '@src/config';
import { HTTP } from '@src/services/HTTP';

export class Routes {
	static register = async (app: Express) => {
		app.get('/nodes', (req: Request, res: Response) => {
			//return DataBase.getNodeListWithCriteria(Pagination.reqToSearchCriteria(req))
			return DataBase.getNodeList()
				.then((nodes) => res.send(nodes))
				.catch((error) => InternalServerError.send(res, error));
		});

		app.get('/nodesHostDetail', (req: Request, res: Response) => {
			//return DataBase.getNodeListWithCriteria(Pagination.reqToSearchCriteria(req))
			return DataBase.getNodesHostDetail()
				.then((nodes) => res.send(nodes))
				.catch((error) => InternalServerError.send(res, error));
		});

		app.get('/nodes/:publicKey', (req: Request, res: Response) => {
			const publicKey = req.params.publicKey;

			return DataBase.getNodeByPublicKey(publicKey)
				.then((node) => {
					if (node) res.send(node);
					else NotFoundError.send(res, 'publicKey', publicKey);
				})
				.catch((error) => InternalServerError.send(res, error));
		});

		app.get('/nodeStats', (req: Request, res: Response) => {
			return DataBase.getNodesStats()
				.then((stats) => res.send(stats))
				.catch((error) => InternalServerError.send(res, error));
		});

		app.get('/nodeHeightStats', (req: Request, res: Response) => {
			return DataBase.getNodeHeightStats()
				.then((stats) => res.send(stats))
				.catch((error) => InternalServerError.send(res, error));
		});

		app.get('/nodeRewards/nodes/nodePublicKey/:nodePublicKey', async (req: Request, res: Response) => {
			try {
				const nodePublicKey = req.params.nodePublicKey;
				
				if(!nodePublicKey)
					return MissingParamError.send(res, 'nodePublicKey');
				
				const nodeInfo = await NodeRewards.getNodeInfo(nodePublicKey);
				const nodeId = nodeInfo.id;
				const testResults = await NodeRewards.getTestResults(nodeId);
				let testResultInfo;
				if(testResults.length) {
					const latestRound = testResults[0].round;
					testResultInfo = await NodeRewards.getTestResultInfo(nodeId, latestRound);
				}
				const nodeRewardsInfo = {
					nodeInfo,
					testResults,
					testResultInfo
				};

				res.send(nodeRewardsInfo);
			}
			catch(e) {
				const status = e.response
					? e.response.status
					: 502;
				const message = e.response
					? e.response.data
					: e.message;

				res.status(status).send(message);
			}
		});
	};
}
