const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Company = require('./models/Company.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rize';

const LOGO_MAP = {
  'google': '/logos/google.svg',
  'microsoft': '/logos/microsoft.svg',
  'razorpay': '/logos/razorpay.svg',
  'zerodha': '/logos/zerodha.svg',
  'cred': '/logos/cred.svg',
  'phonepe': '/logos/phonepe.svg',
  'groww': '/logos/groww.svg',
  'flipkart': '/logos/flipkart.svg',
  'atlassian': '/logos/atlassian.svg',
  'browserstack': '/logos/browserstack.svg',
  'meesho': '/logos/meesho.svg',
  'amazon': '/logos/amazon.svg',
  'fundingpips': '/logos/fundingpips.svg',
  'legion': '/logos/legionfunding.svg',
  'fundedfirm': '/logos/fundedfirm.svg',
};

async function updateLogos() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const companies = await Company.find();
    console.log(`Found ${companies.length} companies to update`);

    for (const c of companies) {
      const nameLower = c.name.toLowerCase();
      let matchedLogo = null;

      for (const [key, path] of Object.entries(LOGO_MAP)) {
        if (nameLower.includes(key)) {
          matchedLogo = path;
          break;
        }
      }

      if (matchedLogo) {
        c.logoUrl = matchedLogo;
        await c.save();
        console.log(`✔ Updated ${c.name} -> ${matchedLogo}`);
      } else {
        console.log(`⚠ No match for ${c.name}, current: ${c.logoUrl}`);
      }
    }

    console.log('\nAll companies updated with local high-res vector logos!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating logos:', err);
    process.exit(1);
  }
}

updateLogos();
