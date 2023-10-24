import { IsEmail, Length } from "class-validator";

export class CreateEmployeeInput {

    @Length(3, 20)
    name: string;

    @Length(7,12)
    phone: string;

    @IsEmail()
    email: string;

    role: any;
}

export interface EmployeeLoginInput {

    vendorId: string;
    
    phone: string;
}

export class EmployeeVerifyInput {
    @Length(10, 10)
    phone: string;
    
    otp: string;
}

export interface UpdateEmployeeInput {

    role: any;
}

export class CreateRoleInput {

    @Length(3, 10)
    roleName: string;

    permissions: any;
}

export interface EmployeePayload {
    _id: string;
    phone: string;
    verified: boolean;
    role: any;
}