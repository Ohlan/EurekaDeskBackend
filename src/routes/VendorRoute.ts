import express, { Request, Response, NextFunction } from 'express';
import { AddCategory, AddEmployee, AddFood, AddOffer, AddRole, AddTable, EditOffer, EmployeeLogin, EmployeeVerify, GetCategories, GetAllEmployee, GetFoods, GetOffers, GetOrderDetails, GetOrders, GetPermissions, GetTables, GetVendorProfile, ProcessOrder, UpdateTable, UpdateVendorCoverImage, UpdateVendorProfile, UpdateVendorService, VendorLogin, EditRole, UpdateEmployeeDetails, EditTax, AddTax, GetTaxes, DeleteTableById, DeleteFoodById, CreateOrder, CreateOrderAtCheckout, GetCustomers, GetRoles, CreateFeedbackSurvey, GetFeedbackSurvey, GetFeedbackResponse } from '../controllers';
import { Authenticate } from '../middleware';
import multer from 'multer';
import fs from 'fs';

const router = express.Router();

// multer configuration

const directory = 'images';

if (!fs.existsSync(directory)) {
  fs.mkdirSync(directory);
}

const imageStorage = multer.diskStorage(
    {
        destination: function(req, file, cb){
            cb(null, directory)
        },
        filename: function(req, file, cb){
            cb(null, new Date().toISOString().replace(/[-:T.]/g, '')+'_'+file.originalname);
        }
    }
)

const images = multer({ storage: imageStorage}).array('images', 10);


router.post('/login', VendorLogin);
router.post('/employee/login', EmployeeLogin)
router.patch('/employee/verify', EmployeeVerify)

router.use(Authenticate)

router.get('/profile', GetVendorProfile);
router.patch('/profile', UpdateVendorProfile);
router.patch('/coverimage', images, UpdateVendorCoverImage);
router.patch('/service', UpdateVendorService);

router.post('/category', images, AddCategory);
router.get('/category', GetCategories);
router.post('/food', images, AddFood);
router.get('/food', GetFoods)
router.delete('/food/:id', DeleteFoodById)

router.post('/table', AddTable);
router.patch('/table', UpdateTable);
router.get('/table', GetTables)
router.delete('/table/:id', DeleteTableById)

router.get('/orders', GetOrders);
router.put('/order/:id/process', ProcessOrder);
router.get('/order/:id', GetOrderDetails)

router.post('/employee/create', AddEmployee)
router.get('/employee', GetAllEmployee)
router.patch('/employee', UpdateEmployeeDetails)

router.post('/role', AddRole)
router.patch('/role', EditRole)
router.get('/roles', GetRoles)
router.get('/permissions', GetPermissions)

//Offers
router.get('/offers', GetOffers);
router.post('/offer', AddOffer);
router.put('/offer/:id', EditOffer)
 
router.get('/taxes', GetTaxes);
router.post('/tax', AddTax);
router.put('/tax/:taxId', EditTax)

router.post('/order', CreateOrderAtCheckout)

router.get('/customers', GetCustomers)

router.get('/feedback', GetFeedbackSurvey);
router.get('/response/:id', GetFeedbackResponse);
router.post('/feedback', CreateFeedbackSurvey);

router.get('/', (req: Request, res: Response, next: NextFunction) => {
 
res.json({ message: "Hello from Vandor"})

})



export { router as VandorRoute };