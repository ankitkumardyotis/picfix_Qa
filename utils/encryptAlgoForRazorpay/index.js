const crypto = require('crypto');

function encryptRazorpayPayment(body, razorpay_signature) {
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_TEST_KEY_SECRET).update(body.toString()).digest("hex");
    const isAuthentic = expectedSignature === razorpay_signature;
    // const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, IV); // Use AES-256 in CBC mode
    // let encrypted = cipher.update(sessionId.toString(), 'utf8', 'hex');
    // encrypted += cipher.final('hex');
    return isAuthentic;
}



module.exports = { encryptRazorpayPayment }