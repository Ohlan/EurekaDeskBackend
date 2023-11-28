import express , { Application } from 'express';
import path from 'path';
import {AdminRoute, DeliveryRoute, VandorRoute} from '../routes'
import { CustomerRoute } from '../routes/CustomerRoute';
import { ShoppingRoute } from '../routes/ShoppingRoutes';
import cors from 'cors';
import { FRONTEND } from '../config';
 

export default async(app: Application) => {

    process.on('uncaughtException', function (error) {
        console.log(error.stack);
     });

    app.use(express.json());
    app.use(express.urlencoded({ extended: true}))
    
    var corsOptions = {
        origin: '*',
        optionsSuccessStatus: 200
    }

    app.use(cors(corsOptions))
 
    const imagePath = path.join(__dirname,'../../images');
    const qrCodeDirectory = path.join(__dirname, '../../qr-codes');
    
    app.use('/images', express.static(imagePath));
    app.use('/qr-codes', express.static(qrCodeDirectory));
    
    app.use('/admin', AdminRoute);
    app.use('/vendor', VandorRoute)
    app.use('/customer', CustomerRoute)
    app.use('/delivery', DeliveryRoute);
    app.use(ShoppingRoute);

    return app;

}

  