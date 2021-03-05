import { Router } from 'express';
import { handleRouteErrors } from '../errorHandlers.js';
import { authenticateToken } from './Auth.js';
const superSecretData = {
    'email@email.com': {
        message: 'hello there :D ',
    },
};
const router = Router();
router.post('/profile', authenticateToken, (req, res) => {
    if (!req.user)
        return handleRouteErrors(res, "Can't show a profile to a non existing user");
    const { message } = superSecretData[req.user.email];
    res.send({
        type: 'success',
        message,
    });
});
export default router;
//# sourceMappingURL=Profile.js.map