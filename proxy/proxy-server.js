const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Proxy middleware configuration
const createProxy = (target) => {
    return createProxyMiddleware({
        target: target,
        changeOrigin: true,
        secure: true,
        followRedirects: true,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        onProxyReq: (proxyReq, req, res) => {
            // Forward cookies
            if (req.headers.cookie) {
                proxyReq.setHeader('Cookie', req.headers.cookie);
            }
        },
        onProxyRes: (proxyRes, req, res) => {
            // Add CORS headers
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Cookie';
            proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
        }
    });
};

// Main proxy route
app.use('/proxy/:url(*)', (req, res) => {
    const targetUrl = req.params.url;
    
    if (!targetUrl) {
        return res.status(400).send('No URL provided');
    }

    // Ensure URL has protocol
    let fullUrl = targetUrl;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        fullUrl = 'https://' + targetUrl;
    }

    try {
        const urlObj = new URL(fullUrl);
        const proxy = createProxy(fullUrl);
        
        // Modify request to remove /proxy prefix
        req.url = urlObj.pathname + urlObj.search;
        
        proxy(req, res);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).send('Proxy error: ' + error.message);
    }
});

// Handle preflight requests
app.options('*', cors());

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
    console.log(`Proxy URL: http://localhost:${PORT}/proxy/`);
});
