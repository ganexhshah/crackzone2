require('dotenv').config();
const pool = require('./config/database');

async function addSampleQRCodes() {
  try {
    console.log('Adding sample QR codes...');

    // Sample QR code URLs (you can replace these with actual QR code images)
    const sampleQRCodes = {
      esewa: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      khalti: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    };

    // Update eSewa with QR code
    await pool.query(
      `UPDATE manual_payment_methods 
       SET qr_code_url = $1 
       WHERE name = 'esewa'`,
      [sampleQRCodes.esewa]
    );

    // Update Khalti with QR code
    await pool.query(
      `UPDATE manual_payment_methods 
       SET qr_code_url = $1 
       WHERE name = 'khalti'`,
      [sampleQRCodes.khalti]
    );

    console.log('✓ Sample QR codes added successfully');
    console.log('Note: These are placeholder QR codes. Replace with actual QR codes in admin panel.');

  } catch (error) {
    console.error('Error adding QR codes:', error);
  } finally {
    await pool.end();
  }
}

addSampleQRCodes();