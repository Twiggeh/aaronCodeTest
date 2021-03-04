import { NextFunction, Request, Router, Response } from 'express';
import { findOneUser } from '../database.js';
import { JWTSecret } from '../keys/keys.js';
import JWT from 'jsonwebtoken';
import { UserData, UserRequestBody } from './User.js';
import { handleRouteErrors } from '../errorHandlers.js';
import { compare } from 'bcrypt';

const TokenStore: Record<string, boolean> = {};

const asyncVerify = (token: string, secret = JWTSecret): Promise<DeserializedUser> =>
	new Promise(res =>
		JWT.verify(token, secret, (err, data) => {
			if (err) throw 'Forbidden';
			if (!data) throw 'empty token';
			res(data as DeserializedUser);
		})
	);

const genAccessToken = (email: string) => {
	const JWTPayload = {
		email,
	};

	return JWT.sign(JWTPayload, JWTSecret, {
		expiresIn: '10s',
	});
};

const genRefreshToken = (email: string) => {
	const JWTPayload = {
		email,
	};

	return JWT.sign(JWTPayload, JWTSecret);
};

const authenticate = async (req: ToAuthReq, res: Response<{}>, next: NextFunction) => {
	if (!req.body.user?.email || !req.body.user.password) return next();

	const user = await findOneUser({
		email: req.body.user.email,
		password: req.body.user.password,
	});

	if (!user) return next();

	const isUser = await compare(req.body.user.password, user.hash);

	if (!isUser) return next();

	req.user = user;

	next();
};

const router = Router();

router.post('/login', authenticate, (req: AuthedReq, res: LoginRes) => {
	if (!req.user) return handleRouteErrors(res, "Couldn't authenticate user");

	const refreshToken = genRefreshToken(req.user.email);

	TokenStore[refreshToken] = true;

	res.send({
		type: 'success',
		accessToken: genAccessToken(req.user.email),
		refreshToken,
	});
});

router.post('/logout', (req: LogoutReq, res: Response<BaseResponseData>) => {
	if (!req.body.refreshToken)
		return handleRouteErrors(res, "Can't logout without refreshToken.");

	if (TokenStore[req.body.refreshToken] === undefined)
		return handleRouteErrors(res, 'No user with such Refresh Token exists.');

	delete TokenStore[req.body.refreshToken];
	res.send({ type: 'success' });
});

router.post('/token', async (req: RefreshTokenReq, res: RefreshTokenRes) => {
	try {
		const refreshToken = req.body.token;

		if (!refreshToken) throw 'No token provided.';
		if (TokenStore[refreshToken] === undefined) throw "Token doesn't exist in the store.";

		const user = await asyncVerify(refreshToken);

		res.send({ type: 'success', accessToken: genRefreshToken(user.email) });
	} catch (e) {
		handleRouteErrors(res, e);
	}
});

// Keep everything after this in business logic server, rest above can be extracted into a separate Auth Server

export const authenticateToken = async (req: AuthedReq, res: Response) => {
	try {
		const authToken = req.headers.authorization?.split(' ')[1];
		if (!authToken) throw 'Can not authenticate token.';

		const { email } = await asyncVerify(authToken);

		const user = await findOneUser({ email });
		if (!user) throw 'No user';

		req.user = user;
	} catch (e) {
		handleRouteErrors(res, e);
	}
};

export default router;

type BaseResponseData = { type: 'success' } | { type: 'failure'; message: string };
export type BaseResponse<T = Record<string, unknown>> = Response<BaseResponseData & T>;

type LoginRes = Response<
	BaseResponseData & { accessToken: string; refreshToken: string }
>;
type RefreshTokenRes = Response<BaseResponseData & { accessToken: string }>;

type DeserializedUser = { email: string };

type ToAuthReq = Request<any, any, UserRequestBody> & { user?: UserData };
export type AuthedReq = Request & { user?: DeserializedUser };
type LogoutReq = Request<any, any, { refreshToken?: string }>;
type RefreshTokenReq = Request<any, any, { token?: string }>;
