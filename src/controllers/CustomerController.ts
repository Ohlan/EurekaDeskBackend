import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import { CartItem, EditCustomerProfileInput, OrderInputs, UserVerifyInput } from '../dto';
import { Customer, DeliveryUser, Food, Vendor } from '../models';
import { Offer } from '../models/Offer';
import { Order } from '../models/Order';
import { Transaction } from '../models/Transaction';
import { GenerateOtp, GenerateSignature, onRequestOTP } from '../utility';

export const CustomerSignUp = async (req: Request, res: Response, next: NextFunction) => {

    const { phone } = req.body;

    const { otp, expiry } = GenerateOtp();

    const existingCustomer =  await Customer.findOne({ phone: phone});
    
    if(!existingCustomer){
        await Customer.create({
            email: '',
            phone: phone,
            otp: otp,
            otp_expiry: expiry,
            firstName: '',
            lastName: '',
            address: '',
            verified: false,
            lat: 0,
            lng: 0,
            orders: []
        })
    }

    const result = await Customer.findOne({ phone: phone});

    if(result){
        result.otp = otp
        result.otp_expiry = expiry
        await result.save()

        // const signature = await GenerateSignature({
        //     _id: result._id,
        //     phone: result.phone,
        //     verified: result.verified
        // })
        // send OTP to customer
        await onRequestOTP(otp, phone);
        return res.status(201).json({phone: phone, verified: result.verified})
    }

    return res.status(400).json({ msg: 'Error while logging in'});

}

// export const CustomerLogin = async (req: Request, res: Response, next: NextFunction) => {

    
//     const customerInputs = plainToClass(UserLoginInput, req.body);

//     const validationError = await validate(customerInputs, {validationError: { target: true}})

//     if(validationError.length > 0){
//         return res.status(400).json(validationError);
//     }

//     const { email, password } = customerInputs;
//     const customer = await Customer.findOne({ email: email});
//     if(customer){
//         const validation = await ValidatePassword(password, customer.password, customer.salt);
        
//         if(validation){

//             const signature = GenerateSignature({
//                 _id: customer._id,
//                 email: customer.email,
//                 verified: customer.verified
//             })

//             return res.status(200).json({
//                 signature,
//                 email: customer.email,
//                 verified: customer.verified
//             })
//         }
//     }

//     return res.json({ msg: 'Error With login'});

// }

export const CustomerVerify = async (req: Request, res: Response, next: NextFunction) => {

    const customerInputs = plainToClass(UserVerifyInput, req.body);

    const validationError = await validate(customerInputs, {validationError: { target: true}})

    if(validationError.length > 0){
        return res.status(400).json(validationError);
    }
    // const customer = req.user;

    const {phone, otp} = customerInputs;

    // if(customer){
        const profile = await Customer.findOne({phone: phone});
        if(profile){
            if(profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()){
                profile.verified = true;

                const updatedCustomerResponse = await profile.save();

                const signature = await GenerateSignature({
                    _id: updatedCustomerResponse._id,
                    phone: updatedCustomerResponse.phone,
                    verified: updatedCustomerResponse.verified
                })

                return res.status(200).json({
                    signature,
                    phone: updatedCustomerResponse.phone,
                    verified: updatedCustomerResponse.verified
                })
            }
            
        }

    // }

    return res.status(400).json({ msg: 'Unable to verify Customer'});
}

export const RequestOtp = async (req: Request, res: Response, next: NextFunction) => {

    const {phone} = req.body;

    // if(customer){

        const profile = await Customer.findOne({phone: phone});

        if(profile){
            const { otp, expiry } = GenerateOtp();
            profile.otp = otp;
            profile.otp_expiry = expiry;

            await profile.save();
            const sendCode = await onRequestOTP(otp, profile.phone);

            if (!sendCode) {
                return res.status(400).json({ message: 'Failed to verify your phone number' })
            }

            return res.status(200).json({ message: 'OTP sent to your registered Mobile Number!'})

        }
    // }

    return res.status(400).json({ msg: 'Error with Requesting OTP'});
}

export const GetCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;
 
    if(customer){
        
        const profile =  await Customer.findById(customer._id);
        
        if(profile){
             
            return res.status(201).json(profile);
        }

        return res.status(400).json({ msg: 'Please login to view profile'});

    }
    return res.status(400).json({ msg: 'Error while Fetching Profile'});

}

export const EditCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {


    const customer = req.user;

    const customerInputs = plainToClass(EditCustomerProfileInput, req.body);

    const validationError = await validate(customerInputs, {validationError: { target: true}})

    if(validationError.length > 0){
        return res.status(400).json(validationError);
    }

    const { firstName, lastName, address, email } = customerInputs;

    if(customer){
        
        const profile =  await Customer.findById(customer._id);
        
        if(profile){
            profile.firstName = firstName;
            profile.lastName = lastName;
            profile.address = address;
            profile.email = email
            const result = await profile.save()
            
            return res.status(201).json(result);
        }

    }
    return res.status(400).json({ msg: 'Error while Updating Profile'});

}

/* ------------------- Delivery Notification --------------------- */

const assignOrderForDelivery = async(orderId: string, vendorId: string) => {

    // find the vendor
    const vendor = await Vendor.findById(vendorId);
    if(vendor){
        const areaCode = vendor.pincode;
        const vendorLat = vendor.lat;
        const vendorLng = vendor.lng;

        //find the available Delivery person
        const deliveryPerson = await DeliveryUser.find({ pincode: areaCode, verified: true, isAvailable: true});
        if(deliveryPerson){
            // Check the nearest delivery person and assign the order

            const currentOrder = await Order.findById(orderId);
            if(currentOrder){
                //update Delivery ID
                currentOrder.deliveryId = deliveryPerson[0]._id; 
                await currentOrder.save();

                //Notify to vendor for received new order firebase push notification
            }

        }


    }




    // Update Delivery ID

}


/* ------------------- Order Section --------------------- */

const validateTransaction = async(txnId: string) => {
    
    const currentTransaction = await Transaction.findById(txnId);

    if(currentTransaction){
        if(currentTransaction.status.toLowerCase() !== 'failed'){
            return {status: true, currentTransaction};
        }
    }
    return {status: false, currentTransaction};
}


export const CreateOrder = async (req: Request, res: Response, next: NextFunction) => {


    const customer = req.user;

     const { txnId, amount, items } = <OrderInputs>req.body;

    
    if(customer){

        const { status, currentTransaction } =  await validateTransaction(txnId);

        if(!status){
            return res.status(404).json({ message: 'Error while Creating Order!'})
        }

        const profile = await Customer.findById(customer._id);


        const orderId = `${Math.floor(Math.random() * 89999)+ 1000}`;

        const cart = <[CartItem]>req.body;

        let cartItems = Array();

        let netAmount = 0.0;

        let vendorId;

        const foods = await Food.find().where('_id').in(cart.map(item => item._id)).exec();

        foods.map(food => {
            cart.map(({ _id, unit}) => {
                if(food._id == _id){
                    vendorId = food.vendorId;
                    netAmount += (food.price * unit);
                    cartItems.push({ food, unit})
                }
            })
        })

        if(cartItems){

            const currentOrder = await Order.create({
                orderId: orderId,
                vendorId: vendorId,
                items: cartItems,
                totalAmount: netAmount,
                paidAmount: amount,
                orderDate: new Date(),
                orderStatus: 'Waiting',
                remarks: '',
                deliveryId: '',
                readyTime: 45
            })

            profile.cart = [] as any;
            profile.orders.push(currentOrder);
 

            currentTransaction.vendorId = vendorId;
            currentTransaction.orderId = orderId;
            currentTransaction.status = 'CONFIRMED'
            
            await currentTransaction.save();

            await assignOrderForDelivery(currentOrder._id, vendorId);

            const profileResponse =  await profile.save();

            return res.status(200).json(profileResponse);

        }

    }

    return res.status(400).json({ msg: 'Error while Creating Order'});
}

export const GetOrders = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;
    
    if(customer){

 
        const profile = await Customer.findById(customer._id).populate("orders");
        if(profile){
            return res.status(200).json(profile.orders);
        }

    }

    return res.status(400).json({ msg: 'Orders not found'});
}


export const GetOrderById = async (req: Request, res: Response, next: NextFunction) => {

    const orderId = req.params.id;
    
    
    if(orderId){

 
        const order = await Customer.findById(orderId).populate("items.food");
        
        if(order){
            return res.status(200).json(order);
        }

    }

    return res.status(400).json({ msg: 'Order not found'});
}

/* ------------------- Cart Section --------------------- */
export const AddToCart = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;
    
    if(customer){

        const profile = await Customer.findById(customer._id);
        let cartItems = Array();

        const { _id, unit } = <CartItem>req.body;

        const food = await Food.findById(_id);

        if(food){

            if(profile != null){
                cartItems = profile.cart;

                if(cartItems.length > 0){
                    // check and update
                    let existFoodItems = cartItems.filter((item) => item.food._id.toString() === _id);
                    if(existFoodItems.length > 0){
                        
                        const index = cartItems.indexOf(existFoodItems[0]);
                        
                        if(unit > 0){
                            cartItems[index] = { food, unit };
                        }else{
                            cartItems.splice(index, 1);
                        }

                    }else{
                        cartItems.push({ food, unit})
                    }

                }else{
                    // add new Item
                    cartItems.push({ food, unit });
                }

                if(cartItems){
                    profile.cart = cartItems as any;
                    const cartResult = await profile.save();
                    return res.status(200).json(cartResult.cart);
                }

            }
        }

    }

    return res.status(404).json({ msg: 'Unable to add to cart!'});
}

export const GetCart = async (req: Request, res: Response, next: NextFunction) => {

      
    const customer = req.user;
    
    if(customer){
        const profile = await Customer.findById(customer._id);

        if(profile){
            return res.status(200).json(profile.cart);
        }
    
    }

    return res.status(400).json({message: 'Cart is Empty!'})

}

export const DeleteCart = async (req: Request, res: Response, next: NextFunction) => {

   
    const customer = req.user;

    if(customer){

        const profile = await Customer.findById(customer._id).populate('cart.food').exec();

        if(profile != null){
            profile.cart = [] as any;
            const cartResult = await profile.save();

            return res.status(200).json(cartResult);
        }

    }

    return res.status(400).json({message: 'cart is Already Empty!'})

}



export const VerifyOffer = async (req: Request, res: Response, next: NextFunction) => {

    const offerId = req.params.id;
    const customer = req.user;
    
    if(customer){

        const appliedOffer = await Offer.findById(offerId);
        
        if(appliedOffer){
            if(appliedOffer.isActive){
                return res.status(200).json({ message: 'Offer is Valid', offer: appliedOffer});
            }
        }

    }

    return res.status(400).json({ msg: 'Offer is Not Valid'});
}


export const CreatePayment = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;

    const { amount, paymentMode, offerId} = req.body;

    let payableAmount = Number(amount);

    if(offerId){

        const appliedOffer = await Offer.findById(offerId);

        if(appliedOffer.isActive){
            payableAmount = (payableAmount - appliedOffer.offerAmount);
        }
    }
    // perform payment gateway charge api

    // create record on transaction
    const transaction = await Transaction.create({
        customer: customer._id,
        vendorId: '',
        orderId: '',
        orderValue: payableAmount,
        offerUsed: offerId || 'NA',
        status: 'OPEN',
        paymentMode: paymentMode,
        paymentResponse: 'Payment is cash on Delivery'
    })


    //return transaction
    return res.status(200).json(transaction);

}