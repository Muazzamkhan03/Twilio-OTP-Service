require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const { Twilio } = require('twilio');

const port = process.env.PORT || 5000;

const app = express();

app.use(bodyParser.json());

const client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.post('/send-otp', async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    const verification = await client.verify.v2.services(process.env.VERIFY_SERVICE_SID)
      .verifications
      .create({to: phoneNumber, channel: 'sms'});

      console.log(verification.sid);

    res.status(200).json({ message: 'OTP sent', status: verification.status });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/verify-otp', async (req, res) => {
  const { phoneNumber, code } = req.body;

  try {
    const verificationCheck = await client.verify.v2.services(process.env.VERIFY_SERVICE_SID)
      .verificationChecks
      .create({to: phoneNumber, code: code});

    if (verificationCheck.status === 'approved') {
      res.status(200).json({ message: 'OTP verified successfully' });
    } else {
      res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`);
})