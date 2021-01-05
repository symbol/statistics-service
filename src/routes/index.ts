import { Express, Request, Response } from 'express';
import { DataBase } from '@src/services/DataBase';
import { NotFoundError, InternalServerError } from '@src/infrastructure/Error';
import { Pagination } from '@src/infrastructure/Pagination';

export class Routes {
	static register = async (app: Express) => {
		app.get('/nodes', (req: Request, res: Response) => {
			return DataBase.getNodeListWithCriteria(Pagination.reqToSearchCriteria(req))
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
	};
}
