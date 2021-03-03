import { NextFunction, Request, Router } from 'express';
import { findOneUser } from 'src/database';
import { JWTSecret } from 'src/keys/keys';
import { sign } from 'jsonwebtoken';
import { UserData, UserRequest, UserRequestBody } from './User';
import { handleRouteErrors } from 'src/errorHandlers';
import { compare } from 'bcrypt';
import { Response } from 'express';

type TokenResponse = Response<{ token?: string }>;

type AuthRequest = Request<any, any, UserRequestBody>;
type LoginRequest = AuthRequest & { user?: UserData };

const genToken = (user: UserData) => {
	const JWTPayload = {
		id: user.email,
	};

	return sign(JWTPayload, JWTSecret, {
		expiresIn: '1h',
	});
};

const authenticate = async (req: LoginRequest, res: Request, next: NextFunction) => {
	if (req.user || !req.body.user?.email || !req.body.user.password) next();

	const user = await findOneUser({ email: req.body.user?.email });

	if (!user) return next();

	const isUser = await compare(req.body.user?.password, user.hash);

	if (!isUser) return next();

	req.user = user;

	next();
};

const router = Router();

router.get('login', async (req: LoginRequest, res: TokenResponse) => {
	try {
		if (req.user) throw 'You are already logged in - cannot log in twice';

		if (!req.body.user?.email || !req.body.user.password)
			throw 'Not enough information to be able to log in';
		res.send({ token: genToken(user) });
	} catch (e) {
		handleRouteErrors(res, e);
	}
});

router.route('logout').get(async (req: AuthRequest, res: TokenResponse) => {
	try {
		if (!req.body.user?.email || !req.body.user.password)
			throw 'Not enough information to be able to log in';

		const user = await findOneUser({ email: req.body.user?.email });

		if (!user) throw `No user with email: ${req.body.user?.email} found.`;

		const isUser = await compare(req.body.user.password, user.hash);

		if (!isUser) throw 'Wrong email or password.';

		res.send({ token: genToken(user) });
	} catch (e) {
		handleRouteErrors(res, e);
	}
});

export default router;
