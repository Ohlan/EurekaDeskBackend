/* ------------------- Email --------------------- */

/* ------------------- Notification --------------------- */

/* ------------------- OTP --------------------- */

export const GenerateOtp = () => {

    const otp = Math.floor(10000 + Math.random() * 900000);
    let expiry = new Date()
    expiry.setTime(new Date().getTime() + (30 * 60 * 1000));

    return {otp, expiry};
}

export const onRequestOTP = async(otp: number, toPhoneNumber: string) => {

    try {
        const accountSid = 'ACe04da3ae5c68d0340f4cfdacaa89d804';
        const authToken = '4d6e161bfbfe1d5f338449bcfbf5747f';
        const client = require('twilio')(accountSid, authToken);
    
        const response = await client.messages.create({
            body: `Your OTP is ${otp}`,
            from: '+17853902317',
            to: `+91${toPhoneNumber}` // recipient phone number // Add country before the number
        })
    
        return response;
    } catch (error){
        return false
    }
    
}

/* ------------------- Payment --------------------- */