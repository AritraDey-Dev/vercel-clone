//@ts-expect-error
import express from 'express';
import type { Request, Response } from 'express';
// @ts-expect-error
import httpProxy from 'http-proxy';

const app = express();
const PORT = 8000;

const BASE_PATH = 'https://vercel-clone-outputs-1.s3.ap-south-1.amazonaws.com/__outputs';
const proxy = httpProxy.createProxy();

app.use((req: Request, res: Response) => {
    const hostname = req.hostname;
    const subdomain = hostname.split('.')[0];

    // Future: Add DB lookup for subdomain
    const id = '12dfefb7-55dd-4fbf-9c4a-9fd5c0412328';
    const target = `${BASE_PATH}/${id}`;

    // Fix path if root
    if (req.url === '/') {
        req.url = '/index.html';
    }

    proxy.web(req, res, { target, changeOrigin: true });
});

proxy.on('error', (err:any, req: Request, res: Response) => {
    console.error('Proxy error:', err);
    if (res.writeHead) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
    }
    res.end('Proxy error occurred.');
});

app.listen(PORT, () => console.log(`Reverse Proxy Running on port ${PORT}`));
