// Libraries
import express from 'express';
import cors from 'cors';
import { dirname } from 'path';
import { URL } from 'url';
const PORT = 5050;
// Routes
import UserRoute from './routes/User.js';
import AuthRoutes from './routes/Auth.js';
import ProfileRoutes from './routes/Profile.js';
const __dirname = decodeURI(dirname(new URL(import.meta.url).pathname));
const app = express();
// Configure CORS
const allowedOrigins = [
    'localhost',
    'localhost:5050',
    'http://localhost:5000',
    'http://127.0.0.1:5050',
    undefined,
];
app.use(cors({
    origin: (origin, cb) => {
        const allowedOriginIndex = allowedOrigins.indexOf(origin);
        if (allowedOriginIndex === -1) {
            return cb(`The CORS policy doesn't allow access from ${origin}.`, false);
        }
        // @ts-ignore
        return cb(null, allowedOrigins[allowedOriginIndex]);
    },
    credentials: true,
}));
// Body Parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Set secure headers
app.disable('x-powered-by');
app.use((req, res, next) => {
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('X-Frame-Options', 'deny');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('Access-Control-Allow-Credentials', 'true');
    // TODO : make depend on SERVER URL
    res.header('Access-Control-Allow-Origin', 'http://localhost:5000');
    next();
});
// Routes
app.use('/v1', UserRoute);
app.use('/v1', AuthRoutes);
app.use('/v1', ProfileRoutes);
// app.get('*', (req, res) => {
// 	res.sendFile(join(__dirname, '../../client/dist/index.html'));
// });
// Start Server
app.listen(PORT, () => {
    console.log(`Dev server is listening on port ${PORT}`);
});
//# sourceMappingURL=app.js.map