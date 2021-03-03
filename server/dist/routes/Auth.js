import { Router } from 'express';
import { findOneUser } from 'src/database';
import { JWTSecret } from 'src/keys/keys';
import { sign } from 'jsonwebtoken';
import { handleRouteErrors } from 'src/errorHandlers';
import { compare } from 'bcrypt';
const genToken = (user) => {
    const JWTPayload = {
        id: user.email,
    };
    return sign(JWTPayload, JWTSecret, {
        expiresIn: '1h',
    });
};
const router = Router();
router.get('login', async (req, res) => {
    try {
        if (!req.body.user?.email || !req.body.user.password)
            throw 'Not enough information to be able to log in';
        const user = await findOneUser({ email: req.body.user?.email });
        if (!user)
            throw `No user with email: ${req.body.user?.email} found.`;
        const isUser = await compare(req.body.user.password, user.hash);
        if (!isUser)
            throw 'Wrong email or password.';
        res.send({ token: genToken(user) });
    }
    catch (e) {
        handleRouteErrors(res, e);
    }
});
router.route('logout').get(async (req, res) => {
    try {
        if (!req.body.user?.email || !req.body.user.password)
            throw 'Not enough information to be able to log in';
        const user = await findOneUser({ email: req.body.user?.email });
        if (!user)
            throw `No user with email: ${req.body.user?.email} found.`;
        const isUser = await compare(req.body.user.password, user.hash);
        if (!isUser)
            throw 'Wrong email or password.';
        res.send({ token: genToken(user) });
    }
    catch (e) {
        handleRouteErrors(res, e);
    }
});
export default router;
//# sourceMappingURL=Auth.js.map