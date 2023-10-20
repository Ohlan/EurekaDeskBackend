import express, { Request, Response, NextFunction } from 'express';
import { AddCategory, AddFood, AddOffer, AddTable, EditOffer, GetCategories, GetFoods, GetOffers, GetOrderDetails, GetOrders, GetTables, GetVendorProfile, ProcessOrder, UpdateTable, UpdateVendorCoverImage, UpdateVendorProfile, UpdateVendorService, VendorLogin } from '../controllers';
import { Authenticate } from '../middleware';
import multer from 'multer';

const router = express.Router();

const imageStorage = multer.diskStorage({
    destination: function(req,file, cb){
        cb(null, 'images')
    },
    filename: function(req,file,cb){
        cb(null, new Date().toISOString()+'_'+file.originalname);
    }
})

const images = multer({ storage: imageStorage}).array('images', 10);


router.post('/login', VendorLogin);

router.use(Authenticate)
router.get('/profile', GetVendorProfile);
router.patch('/profile', UpdateVendorProfile);
router.patch('/coverimage', images, UpdateVendorCoverImage);
router.patch('/service', UpdateVendorService);

router.post('/category', images, AddCategory);
router.get('/category', GetCategories);
router.post('/food', images, AddFood);
router.get('/food', GetFoods)

router.post('/table', AddTable);
router.patch('/table', UpdateTable);
router.get('/table', GetTables)

router.get('/orders', GetOrders);
router.put('/order/:id/process', ProcessOrder);
router.get('/order/:id', GetOrderDetails)
 

//Offers
router.get('/offers', GetOffers);
router.post('/offer', AddOffer);
router.put('/offer/:id', EditOffer)
 


router.get('/', (req: Request, res: Response, next: NextFunction) => {
 
res.json({ message: "Hello from Vandor"})

})



export { router as VandorRoute };