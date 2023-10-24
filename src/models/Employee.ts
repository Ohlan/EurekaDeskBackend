import mongoose, { Schema } from "mongoose";

export interface EmployeeDoc extends Document {
    
    vendorId: string;
    name: string;
    phone: string;
    email: string;
    otp: number;
    otp_expiry: Date;
    role: any;
}

const EmployeeSchema = new Schema({

    vendorId: {type: String, required: true},
    name: {type: String, required: true},
    phone: {type: String, required: true},
    email: {type: String, required: true},
    otp: {type: Number},
    otp_expiry: {type: Date},
    role: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'role'
    }
},{
    toJSON: {
        transform(doc, ret){
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;

        }
    },
    timestamps: true
});

export interface RoleDoc extends Document {
    
    vendorId: string;
    roleName: string;
    permissions: any;
}

const RoleSchema = new Schema({

    vendorId: {type: String, required: true},
    roleName: {type: String, required: true},
    permissions: [{type: String}]
},{
    toJSON: {
        transform(doc, ret){
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;
        }
    },
    timestamps: true
});

const Employee = mongoose.model<EmployeeDoc>('employee', EmployeeSchema)

const Role = mongoose.model<RoleDoc>('role', RoleSchema)

export {Employee, Role}