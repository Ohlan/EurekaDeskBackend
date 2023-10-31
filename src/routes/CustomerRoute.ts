import express from 'express';
import { AddToCart, CreateOrder, CreatePayment, CustomerSignUp, CustomerVerify, DeleteCart, EditCustomerProfile, GetCart, GetCustomerProfile, GetOrderById, GetOrders, RequestOtp, VerifyOffer, VerifyPayment } from '../controllers';
import { Authenticate } from '../middleware';

const router = express.Router();

/* ------------------- Suignup / Create Customer --------------------- */
router.post('/signup', CustomerSignUp)

/* ------------------- Login --------------------- */
// router.post('/login', CustomerLogin)

/* ------------------- OTP / request OTP --------------------- */
router.get('/otp', RequestOtp)

/* ------------------- Verify Customer Account --------------------- */
router.patch('/verify', CustomerVerify)

/* ------------------- Authentication --------------------- */
router.use(Authenticate);

/* ------------------- Profile --------------------- */
router.get('/profile', GetCustomerProfile)
router.patch('/profile', EditCustomerProfile)

//Cart
router.post('/cart', AddToCart)
router.get('/cart', GetCart)
router.delete('/cart', DeleteCart)


//Apply Offers
router.get('/offer/verify/:id', VerifyOffer);


//Payment
router.post('/create-payment', CreatePayment);
router.post('/verify-payment', VerifyPayment);


//Order
router.post('/create-order', CreateOrder);
router.get('/orders', GetOrders);
router.get('/order/:id', GetOrderById)

export { router as CustomerRoute}