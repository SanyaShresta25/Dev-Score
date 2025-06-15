const { ReclaimProofRequest } = require('@reclaimprotocol/reclaim-sdk');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Route to generate proof request
app.post('/generate-proof', async (req, res) => {
    try {
        console.log('🔧 Generating new proof request...');
        
        const reclaimProofRequest = await ReclaimProofRequest.init(
            process.env.APP_ID,
            process.env.APP_SECRET,
            process.env.PROVIDER_ID
        );

        reclaimProofRequest.setAppCallbackUrl('https://api.reclaimprotocol.org/api/sdk/callback');

        const requestUrl = await reclaimProofRequest.getReclaimUrl();
        const statusUrl = reclaimProofRequest.getStatusUrl();

        console.log('✅ Proof request generated successfully!');
        console.log('🔗 Request URL:', requestUrl);
        console.log('📊 Status URL:', statusUrl);

        res.json({
            success: true,
            requestUrl: requestUrl,
            statusUrl: statusUrl,
            sessionId: reclaimProofRequest.sessionId
        });

    } catch (error) {
        console.error('❌ Error generating proof request:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Route to check proof status
app.get('/status/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const statusUrl = `https://api.reclaimprotocol.org/api/sdk/session/${sessionId}`;
        
        // You can add logic here to fetch the actual status
        res.json({
            success: true,
            statusUrl: statusUrl,
            sessionId: sessionId
        });

    } catch (error) {
        console.error('❌ Error checking status:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Route to handle proof completion webhook
app.post('/webhook/proof-complete', async (req, res) => {
    try {
        console.log('🔔 Proof completion webhook received:');
        console.log(JSON.stringify(req.body, null, 2));
        
        // Process the proof data here
        const proofData = req.body;
        
        // You can add your logic to handle the completed proof
        
        res.json({
            success: true,
            message: 'Proof received successfully'
        });

    } catch (error) {
        console.error('❌ Error processing webhook:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check route
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Reclaim Protocol Server is running',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 Reclaim Protocol Server started');
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log('🔧 Environment variables loaded:');
    console.log(`   APP_ID: ${process.env.APP_ID}`);
    console.log(`   APP_SECRET: ***HIDDEN***`);
    console.log(`   PROVIDER_ID: ${process.env.PROVIDER_ID}`);
    console.log('\n📋 Available endpoints:');
    console.log(`   POST /generate-proof - Generate new proof request`);
    console.log(`   GET  /status/:sessionId - Check proof status`);
    console.log(`   POST /webhook/proof-complete - Proof completion webhook`);
    console.log(`   GET  /health - Health check`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server gracefully...');
    process.exit(0);
});