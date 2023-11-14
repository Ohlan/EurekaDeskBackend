import { Request, Response, NextFunction } from 'express';
import { Category, Food, FoodDoc, Vendor } from '../models';
import { Offer } from '../models/Offer';
import { Table } from '../models/Table';

export const GetFoodAvailability = async (req: Request, res: Response, next: NextFunction) => {

    const pincode = req.params.pincode;
    
    const result = await Vendor.find({ pincode: pincode, serviceAvailable: true}).sort([['rating', 'descending']]).populate('foods')

    if(result.length > 0){
        return res.status(200).json(result);
    }

    return res.status(404).json({ msg: 'data Not found!'});

}

export const GetTopRestaurants = async (req: Request, res: Response, next: NextFunction) => {

    const pincode = req.params.pincode;
    
    const result = await Vendor.find({ pincode: pincode, serviceAvailable: true}).sort([['rating', 'descending']]).limit(10)

    if(result.length > 0){
        return res.status(200).json(result);
    }
    
    return res.status(404).json({ msg: 'data Not found!'});
}

export const GetFoodsIn30Min = async (req: Request, res: Response, next: NextFunction) => {

    const pincode = req.params.pincode;
    
    const result = await Vendor.find({ pincode: pincode, serviceAvailable: true}).sort([['rating', 'descending']]).populate('foods');
 
    if(result.length > 0){
        let foodResult: any = [];
        result.map(vendor => {
            const foods = vendor.foods as [FoodDoc];
            foodResult.push(...foods.filter(food => food.readyTime <= 30));
        })
        return res.status(200).json(foodResult);
    }
    
    return res.status(404).json({ msg: 'data Not found!'});
}

export const SearchFoods = async (req: Request, res: Response, next: NextFunction) => {

    const pincode = req.params.pincode;
    const result = await Vendor.find({ pincode: pincode, serviceAvailable: true})
    .populate('foods');
 
    if(result.length > 0){
        let foodResult: any = [];
        result.map(item => foodResult.push(...item.foods));
        return res.status(200).json(foodResult);
    }
    return res.status(404).json({ msg: 'data Not found!'});
}

export const RestaurantById = async (req: Request, res: Response, next: NextFunction) => {

    const id = req.params.id;
    
    const result = await Vendor.findById(id).populate('foods')
    
    if(result){
        return res.status(200).json(result);
    }

    return res.status(404).json({ msg: 'data Not found!'});
}


export const GetAvailableOffers = async (req: Request, res: Response, next: NextFunction) => {

    const pincode = req.params.pincode;

    const offers = await Offer.find({ pincode: pincode, isActive: true});

    if(offers){
        return res.status(200).json(offers);
    }
    
    return res.json({ message: 'Offers not Found!'});
}

export const GetAllFoods = async (req: Request, res: Response, next: NextFunction) => {

    const vendorId = req.params.id;
    
    const foods = await (await Vendor.findById(vendorId).populate('foods')).foods
 
    if(foods.length > 0){
        return res.status(200).json(foods);
    }
    return res.status(404).json({ msg: 'data Not found!'});
}

export const GetFoodById = async (req: Request, res: Response, next: NextFunction) => {

    const vendorId = req.params.id;
    const foodId = req.params.foodId;
    
    const food = await Food.findOne({vendorId: vendorId, _id: foodId})
 
    if(food != null){
        return res.status(200).json(food);
    }
    return res.status(404).json({ msg: 'data Not found!'});
}

export const GetAllCategories = async (req: Request, res: Response, next: NextFunction) => {

    const vendorId = req.params.id;
    
    const categories = await Category.find({vendorId: vendorId}).populate('allFoods');
 
    if(categories.length > 0) {
        return res.status(200).json(categories);
    }
    
    return res.status(404).json({ msg: 'data Not found!'});
}

export const GetFoodsByCategory = async (req: Request, res: Response, next: NextFunction) => {

    const vendorId = req.params.id;
    const categoryId = req.params.categoryId;
    
    const foods = await Category.find({vendorId: vendorId, id: categoryId}).populate('allFoods');
 
    if(foods != null){
        return res.status(200).json(foods);
    }
    return res.status(404).json({ msg: 'data Not found!'});
}

export const GetTableUrls = async (req: Request, res: Response, next: NextFunction) => {

    const vendorId = req.params.id;
    
    const tables = await Table.find({vendorId: vendorId});
 
    if(tables.length > 0) {
        let qrs: any = []
        for(var i = 0; i<tables.length; i++)
            qrs.push(tables[i].tableUrl)
        return res.status(200).json(qrs);
    }
    
    return res.status(404).json({ msg: 'data Not found!'});
}