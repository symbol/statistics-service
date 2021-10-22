import { Express, Request, Response } from 'express';
import { DataBase } from '@src/services/DataBase';
import { NotFoundError, InternalServerError, MissingParamError } from '@src/infrastructure/Error';
import { memoryCache } from '@src/services/MemoryCache';

export class Routes {
	static register = async (app: Express) => {
		app.get('/nodes', (req: Request, res: Response) => {
			const nodeList = memoryCache.get('nodeList');

			if (nodeList?.length) return res.send(nodeList);

			return DataBase.getNodeList()
				.then((nodes) => res.send(nodes))
				.catch((error) => InternalServerError.send(res, error));
		});

		app.get('/nodesHostDetail', (req: Request, res: Response) => {
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

		app.get('/timeSeries/nodeCount', async (req: Request, res: Response) => {
			return DataBase.getNodeCountSeries()
				.then((data) => res.send(data))
				.catch((error) => InternalServerError.send(res, error));
		});
	};
}
