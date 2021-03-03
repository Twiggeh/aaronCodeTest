import type { Response } from 'express';

type DefaultError = { type: 'failure'; message: string };

export const handleRouteErrors = (res: Response<DefaultError | any>, e: string) => {
	res.send({ type: 'failure', message: e });
};
