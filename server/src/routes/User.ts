import { Request, Router } from 'express';
import {
	addOneUser,
	deleteOneUser,
	findOneUser,
	findOneUserAndUpdate,
} from '../database.js';
import { handleRouteErrors } from '../errorHandlers.js';
import type { NewData } from '../types.js';

export type UserResponseBody =
	| { type: 'failure'; message: string }
	| { type: 'success'; user?: { email: string } };

export type UserData = {
	email?: string;
	password?: string;
};

export type UserRequestBody = { user?: UserData };

export type UserRequest = Request<any, UserResponseBody, UserRequestBody>;

const router = Router();

router
	.route('user')
	.get(async (req: UserRequest, res) => {
		try {
			const user = await findOneUser({
				email: req.body.email,
				password: req.body.password,
			});
			if (!user) throw `Could not find a user with this email ${req.body.email}`;
			return res.send({ user: { email: user.email } });
		} catch (e) {
			handleRouteErrors(res, e);
		}
	})
	.put(
		async (
			req: Request<any, UserResponseBody, UserRequestBody & NewData<UserRequestBody>>,
			res
		) => {
			if (!req.body.user?.email && !req.body.user?.password)
				return res.send({
					type: 'failure',
					message: 'Not enough data has been provided',
				});

			try {
				const user = await findOneUserAndUpdate(
					{ email: req.body.user.email, password: req.body.user.email },
					{ newEmail: req.body.newUser?.email, newPassword: req.body.newUser?.password }
				);

				if (!user) throw `Couldn't update the user ${req.body.user.email}.`;

				res.send({ user: { email: user.email }, type: 'success' });
			} catch (e) {
				handleRouteErrors(res, e);
			}
		}
	)
	.post(async (req: UserRequest, res) => {
		if (!req.body.user?.email || !req.body.user?.password)
			return res.send({ type: 'failure', message: 'Not all data has been provided' });

		try {
			const user = await addOneUser({
				email: req.body.user.email,
				password: req.body.user.email,
			});
			res.send({ user: { email: user.email }, type: 'success' });
		} catch (e) {
			handleRouteErrors(res, e);
		}
	})
	.delete(async (req: UserRequest, res) => {
		if (!req.body.user?.email || !req.body.user?.password)
			return res.send({ type: 'failure', message: 'Not all data has been provided' });

		try {
			// TODO : check whether user owns account
			const isOwnerOfAccount = '';
			if (!isOwnerOfAccount)
				throw `User ${req.body.user?.email} doesn't own this account`;

			await deleteOneUser(req.body.user?.email);
			res.send({ type: 'success', user: { email: req.body.user?.email } });
		} catch (e) {
			handleRouteErrors(res, e);
		}
	});

export default router;
