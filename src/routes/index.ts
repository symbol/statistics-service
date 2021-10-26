import { Express, Request, Response } from 'express';
import { DataBase } from '@src/services/DataBase';
import { NotFoundError, InternalServerError, UnsupportedFilterError } from '@src/infrastructure/Error';
import { symbol } from '@src/config';

enum nodeFilter {
	Preferred = 'preferred',
	Suggested = 'suggested',
}
export class Routes {
	static register = async (app: Express) => {
		app.get('/nodes', async (req: Request, res: Response) => {
			const { filter } = req.query;

			// if filter is empty, it will return full list
			if (!filter) {
				return DataBase.getNodeList()
					.then((nodes) => res.send(nodes))
					.catch((error) => InternalServerError.send(res, error));
			}

			// Return error message filter is not support
			if (!(filter === nodeFilter.Preferred || filter === nodeFilter.Suggested)) {
				return UnsupportedFilterError.send(res, filter as string);
			}

			// ?filter=preferred
			// return list config by admin.
			if (filter === nodeFilter.Preferred) {
				const nodeFilter = {
					host: { $in: symbol.PREFERRED_NODES.map((node) => new RegExp(`^.${node}`, 'i')) },
				};

				return DataBase.getNodeList(nodeFilter)
					.then((nodes) => res.send(nodes))
					.catch((error) => InternalServerError.send(res, error));
			}

			// ?filter=suggested
			// it filter health nodes
			if (filter === nodeFilter.Suggested) {
				const nodeFilter = {
					'apiStatus.isAvailable': true,
					'apiStatus.nodeStatus.apiNode': 'up',
					'apiStatus.nodeStatus.db': 'up',
				};

				return DataBase.getNodeList(nodeFilter)
					.then((nodes) => res.send(nodes))
					.catch((error) => InternalServerError.send(res, error));
			}
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
