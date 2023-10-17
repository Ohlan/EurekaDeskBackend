export interface CreateFoodInput {
    name: string;
    description: string;
    category: string;
    foodType: string;
    readyTime: string;
    price: number;
}

export interface CreateCategoryInput {
    name: string;
    description: string;
    subCategories: any;
    allFoods: any;
}

export interface CreateSubCategoryInput {
    name: string;
    description: string;
    allFoods: any;
}