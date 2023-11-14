import express from 'express';
import { GetAllCategories, GetAllFoods, GetAvailableOffers, GetFoodAvailability, GetFoodById, GetFoodsByCategory, GetFoodsIn30Min, GetTableUrls, GetTopRestaurants, RestaurantById, SearchFoods } from '../controllers';

const router = express.Router();

/* ------------------- Food Availability --------------------- */
router.get('/:pincode', GetFoodAvailability )

/* ------------------- Top Restaurant --------------------- */
router.get('/top-restaurant/:pincode', GetTopRestaurants)

/* ------------------- Food Available in 30 Minutes --------------------- */
router.get('/foods-in-30-min/:pincode', GetFoodsIn30Min)

/* ------------------- Search Foods --------------------- */
router.get('/search/:pincode', SearchFoods)


/* ------------------- Search Offers --------------------- */
router.get('/offers/:pincode', GetAvailableOffers)


/* ------------------- Find Restaurant by ID --------------------- */
router.get('/restaurant/:id', RestaurantById)

/* ------------------- Find Food by ID --------------------- */
router.get('/foods/:id/:foodId', GetFoodById)

/* ------------------- Get All food --------------------- */
router.get('/foods/:id', GetAllFoods)

/* ------------------- Get All Categories --------------------- */
router.get('/categories/:id', GetAllCategories)

/* ------------------- Get Food by Category Name --------------------- */
router.get('/categories/:id/:categoryId', GetFoodsByCategory)

/* ------------------- Get Table urls by table Name --------------------- */
router.get('/table/:id', GetTableUrls)

export { router as ShoppingRoute}