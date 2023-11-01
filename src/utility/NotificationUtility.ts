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
        const accountSid = 'AC6f77162e949ce6b8297887568e4608fe';
        const authToken = '57e0f30e9c6b4f8e32d893e9516b40e4';
        const client = require('twilio')(accountSid, authToken);
    
        const response = await client.messages.create({
            body: `Your OTP is ${otp}`,
            from: '+12563051632',
            to: `+91${toPhoneNumber}` // recipient phone number // Add country before the number
        })
    
        return response;
    } catch (error){
        return false
    }
    
}

/* ------------------- Payment --------------------- */