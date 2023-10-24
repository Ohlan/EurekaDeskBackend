import { IsEmail, Length } from "class-validator";

export class CreateVandorInput{

    @Length(4, 15)
    name: string;

    @Length(3, 15)
    ownerName: string;

    foodType: [string];

    pincode: string;

    address: string;

    @Length(10, 10)
    phone: string;

    @IsEmail()
    email: string;

    @Length(6, 15)
    password: string;
}

export class EditVendorInput{
    @Length(4, 15)
    name: string;

    address: string;

    @Length(10, 10)
    phone: string;

    foodType:[string]
}

export class VendorLoginInput {
    @IsEmail()
    email: string;

    @Length(6, 15)
    password: string;
}

export interface CreateOfferInputs {
    offerType: string;
    vendors: [any];
    title: string;
    description: string;
    minValue: number;
    offerAmount: number;
    startValidity: Date;
    endValidity: Date;
    promocode: string;
    promoType: string;
    bank: [any];
    bins: [any];
    pincode: string;
    isActive: boolean;
}