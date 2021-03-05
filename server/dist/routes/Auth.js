import { Router } from 'express';
import { findOneUser } from '../database.js';
import { JWTSecret } from '../keys/keys.js';
import JWT from 'jsonwebtoken';
import { handleRouteErrors } from '../errorHandlers.js';
import { compare } from 'bcrypt';
const TokenStore = {};
const asyncVerify = (token, secret = JWTSecret) => new Promise(res => JWT.verify(token, secret, (err, data) => {
    if (err)
        throw 'Forbidden';
    if (!data)
        throw 'empty token';
    res(data);
}));
const genAccessToken = (email) => {
    const JWTPayload = {
        email,
    };
    return JWT.sign(JWTPayload, JWTSecret, {
        expiresIn: '40s',
    });
};
const genRefreshToken = (email) => {
    const JWTPayload = {
        email,
    };
    return JWT.sign(JWTPayload, JWTSecret);
};
const authenticate = async (req, res, next) => {
    if (!req.body.user?.email || !req.body.user.password)
        return next();
    const user = await findOneUser({
        email: req.body.user.email,
        password: req.body.user.password,
    });
    if (!user)
        return next();
    const isUser = await compare(req.body.user.password, user.hash);
    if (!isUser)
        return next();
    req.user = user;
    next();
};
const router = Router();
router.post('/login', authenticate, (req, res) => {
    if (!req.user)
        return handleRouteErrors(res, "Couldn't authenticate user");
    const refreshToken = genRefreshToken(req.user.email);
    TokenStore[refreshToken] = true;
    res.send({
        type: 'success',
        accessToken: genAccessToken(req.user.email),
        refreshToken,
    });
});
router.post('/logout', (req, res) => {
    if (!req.body.refreshToken)
        return handleRouteErrors(res, "Can't logout without refreshToken.");
    if (TokenStore[req.body.refreshToken] === undefined)
        return handleRouteErrors(res, 'No user with such Refresh Token exists.');
    delete TokenStore[req.body.refreshToken];
    res.send({ type: 'success' });
});
router.post('/token', async (req, res) => {
    try {
        const refreshToken = req.body.token;
        if (!refreshToken)
            throw 'No token provided.';
        if (TokenStore[refreshToken] === undefined)
            throw "Token doesn't exist in the store.";
        const user = await asyncVerify(refreshToken);
        res.send({ type: 'success', accessToken: genAccessToken(user.email) });
    }
    catch (e) {
        handleRouteErrors(res, e);
    }
});
// Keep everything after this in business logic server, rest above can be extracted into a separate Auth Server
export const authenticateToken = async (req, res, next) => {
    try {
        const authToken = req.headers.authorization?.split(' ')[1];
        if (!authToken)
            throw 'Can not authenticate token.';
        const { email } = await asyncVerify(authToken);
        const user = await findOneUser({ email });
        if (!user)
            throw 'No user';
        req.user = user;
        next();
    }
    catch (e) {
        handleRouteErrors(res, e);
    }
};
export default router;
//# sourceMappingURL=Auth.js.map