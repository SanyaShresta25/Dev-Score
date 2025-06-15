require('dotenv').config();
const { ReclaimProofRequest } = require('@reclaimprotocol/js-sdk');

console.log('🔧 Loaded ENV values:');
console.log('APP_ID:', process.env.RECLAIM_APP_ID);
console.log('APP_SECRET:', process.env.RECLAIM_APP_SECRET ? '***HIDDEN***' : 'NOT SET');
console.log('PROVIDER_ID:', process.env.RECLAIM_PROVIDER_ID);

// Validate environment variables
if (!process.env.RECLAIM_APP_ID || !process.env.RECLAIM_APP_SECRET || !process.env.RECLAIM_PROVIDER_ID) {
  console.error('❌ Missing required environment variables!');
  console.error('Please ensure your .env file contains:');
  console.error('- RECLAIM_APP_ID');
  console.error('- RECLAIM_APP_SECRET');
  console.error('- RECLAIM_PROVIDER_ID');
  process.exit(1);
}

(async () => {
  try {
    console.log('\n🚀 Initializing Reclaim Proof Request...');
    
    // Initialize the Reclaim Proof Request
    const reclaimProofRequest = await ReclaimProofRequest.init(
      process.env.RECLAIM_APP_ID,
      process.env.RECLAIM_APP_SECRET,
      process.env.RECLAIM_PROVIDER_ID
    );

    console.log('✅ Reclaim Proof Request initialized successfully');

    // Optional: Add context to the proof request
    reclaimProofRequest.addContext('0x00000000000', 'Node.js backend verification');

    // Generate the request URL
    console.log('\n🔄 Generating request URL...');
    const requestUrl = await reclaimProofRequest.getRequestUrl();
    
    console.log('\n✅ Proof Request Generated Successfully!');
    console.log('🔗 Request URL:', requestUrl);
    
    // Get the status URL for tracking
    const statusUrl = reclaimProofRequest.getStatusUrl();
    console.log('📊 Status URL:', statusUrl);

    console.log('\n📱 Next steps:');
    console.log('1. Open the Request URL in a browser or scan it as QR code');
    console.log('2. Complete the verification process');
    console.log('3. Use the Status URL to check verification status');

    // Optional: Start a session to listen for proof completion
    console.log('\n👂 Setting up proof completion listener...');
    await reclaimProofRequest.startSession({
      onSuccess: (proofs) => {
        console.log('\n🎉 Verification successful!');
        if (proofs && typeof proofs === 'string') {
          console.log('SDK Message:', proofs);
        } else if (proofs && typeof proofs !== 'string') {
          if (Array.isArray(proofs)) {
            console.log('Multiple proofs received:');
            proofs.forEach((proof, index) => {
              console.log(`Proof ${index + 1}:`, proof.claimData.context);
            });
          } else {
            console.log('Proof received:', proofs?.claimData?.context);
            console.log('Full proof data:', JSON.stringify(proofs, null, 2));
          }
        }
      },
      onFailure: (error) => {
        console.error('❌ Verification failed:', error);
      }
    });

  } catch (error) {
    console.error('❌ Error occurred:');
    console.error('Message:', error.message);
    console.error('Details:', error);
    
    // Common error troubleshooting
    if (error.message.includes('Invalid provider')) {
      console.error('💡 Tip: Check if your PROVIDER_ID is correct and active');
    } else if (error.message.includes('authentication') || error.message.includes('unauthorized')) {
      console.error('💡 Tip: Verify your APP_ID and APP_SECRET are correct');
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      console.error('💡 Tip: Check your internet connection and firewall settings');
    }
  }
})();