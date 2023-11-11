
import { Request, Response, NextFunction } from 'express';
import { CreateCategoryInput, CreateFoodInput, CreateOfferInputs, CreateTaxInputs, EditVendorInput, OrderCheckout, VendorLoginInput } from '../dto'
import { Category, Customer, Food } from '../models';
import { Offer, Tax } from '../models/Offer';
import { Order } from '../models/Order';
import { GenerateOtp, GenerateSignature, Permissions, ValidatePassword, onRequestOTP } from '../utility';
import { FindVendor } from './AdminController';
import { CreateTableInputs, UpdateTableInputs } from '../dto/Table.dto';
import { Table } from '../models/Table';
import { CreateEmployeeInput, CreateRoleInput, EmployeeLoginInput, EmployeeVerifyInput } from '../dto/Employee.dto';
import { Employee, Role, RoleDoc } from '../models/Employee';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import path from 'path';
import fs from 'fs';
import qr from 'qrcode'

export const VendorLogin = async (req: Request, res: Response, next: NextFunction) => {

    const { email, password } = <VendorLoginInput>req.body;

    const currentVendor = await FindVendor('', email);

    if (currentVendor !== null) {

        const validation = await ValidatePassword(password, currentVendor.password, currentVendor.salt);
        if (validation) {

            const roleRef = (await Employee.findById(currentVendor.employee[0])).role
            const role = await Role.findById(roleRef)

            const signature = await GenerateSignature({
                _id: currentVendor.employee[0]._id,
                phone: currentVendor.phone,
                verified: false,
                role: role.roleName
            })
            return res.json({ signature: signature, role: role.permissions });
        }

        return res.json({ 'message': 'Login credential is not valid' })
    }

    return res.json({ 'message': 'Vendor with the given email doesn\'t exist' })

}

export const EmployeeLogin = async (req: Request, res: Response, next: NextFunction) => {

    const { vendorId, phone } = <EmployeeLoginInput>req.body;

    const currentEmployee = await Employee.findOne({ phone: phone });

    if (currentEmployee !== null) {
        const { otp, expiry } = GenerateOtp();
        currentEmployee.otp = otp
        currentEmployee.otp_expiry = expiry
        await currentEmployee.save()
        await onRequestOTP(otp, phone);
        return res.status(201).json({ phone: phone })
    }

    return res.json({ 'message': 'Employee doesn\'t exist with this phone number' })

}

export const EmployeeVerify = async (req: Request, res: Response, next: NextFunction) => {

    const customerInputs = plainToClass(EmployeeVerifyInput, req.body);

    const validationError = await validate(customerInputs, { validationError: { target: true } })

    if (validationError.length > 0) {
        return res.status(400).json(validationError);
    }
    // const customer = req.user;

    const { phone, otp } = customerInputs;

    // if(customer){
    const profile = await Employee.findOne({ phone: phone });
    const role = await Role.findById(profile.role)
    if (profile) {
        if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {

            const signature = await GenerateSignature({
                _id: profile._id,
                phone: profile.phone,
                verified: true,
                role: role.roleName
            })

            return res.status(200).json({
                signature,
                phone: profile.phone,
                role: role
            })
        }

    }

    // }

    return res.status(400).json({ msg: 'Unable to verify Customer' });
}

export const GetAllEmployee = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (user) {
        const currentEmployee = await Employee.findById(user._id);
        const employees = await Employee.find({ vendorId: currentEmployee.vendorId }).populate('role');

        if (employees !== null) {
            return res.json(employees);
        }

    }
    return res.json({ 'message': 'Employee not found!' })
}

export const GetVendorProfile = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if (user) {

        const existingVendor = await FindVendor(user._id);
        return res.json(existingVendor);
    }

    return res.json({ 'message': 'vendor Information Not Found' })
}



export const UpdateVendorProfile = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    const { foodType, name, address, phone } = <EditVendorInput>req.body;

    if (user) {

        const existingVendor = await FindVendor(user._id);

        if (existingVendor !== null) {

            existingVendor.name = name;
            existingVendor.address = address;
            existingVendor.phone = phone;
            existingVendor.foodType = foodType;
            const saveResult = await existingVendor.save();

            return res.json(saveResult);
        }

    }
    return res.json({ 'message': 'Unable to Update vendor profile ' })

}



export const UpdateVendorCoverImage = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if (user) {

        const vendor = await FindVendor(user._id);

        if (vendor !== null) {

            const files = req.files as [Express.Multer.File];

            const images = files.map((file: Express.Multer.File) => file.filename);

            vendor.coverImages.push(...images);

            const saveResult = await vendor.save();

            return res.json(saveResult);
        }

    }
    return res.json({ 'message': 'Unable to Update vendor profile ' })

}

export const UpdateVendorService = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    const { lat, lng } = req.body;

    if (user) {

        const existingVendor = await FindVendor(user._id);

        if (existingVendor !== null) {

            existingVendor.serviceAvailable = !existingVendor.serviceAvailable;
            if (lat && lng) {
                existingVendor.lat = lat;
                existingVendor.lng = lng;
            }
            const saveResult = await existingVendor.save();

            return res.json(saveResult);
        }

    }
    return res.json({ 'message': 'Unable to Update vendor profile ' })

}

export const AddCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;

        const { name, description } = <CreateCategoryInput>req.body;

        if (user) {

            const vendor = await FindVendor(user._id);

            if (vendor !== null) {

                const files = req.files as [Express.Multer.File];

                const images = files.map((file: Express.Multer.File) => file.filename);

                const category = await Category.create({
                    vendorId: vendor.id,
                    name: name,
                    description: description,
                    images: images
                })
                vendor.categories.push(category);
                const result = await vendor.save();
                return res.json(result);
            }

        }
        return res.json({ 'message': 'Unable to add category' })
    }
    catch (error) {
        return res.status(500).json(error.message);
    }
}

export const GetCategories = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if (user) {

        const vendor = await FindVendor(user._id)
        const categories = await Category.find({ vendorId: vendor.id });

        if (categories !== null) {
            return res.json(categories);
        }

    }
    return res.json({ 'message': 'Categories not found!' })
}

export const AddFood = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const user = req.user;

        const { name, description, category, foodType, readyTime, price } = <CreateFoodInput>req.body;

        if (user) {

            const vendor = await FindVendor(user._id);

            if (vendor !== null) {

                const files = req.files as [Express.Multer.File];

                const images = files.map((file: Express.Multer.File) => file.filename);

                const food = await Food.create({
                    vendorId: vendor.id,
                    name: name,
                    description: description,
                    category: category,
                    price: price,
                    rating: 0,
                    readyTime: readyTime,
                    images: images,
                    foodType: foodType
                })
                const categoryRef = await Category.findOne({ vendorId: vendor.id, name: category })
                categoryRef.allFoods.push(food)
                await categoryRef.save();
                vendor.foods.push(food);
                const result = await vendor.save();
                return res.json(result);
            }

        }
        return res.json({ 'message': 'Unable to Update vendor profile ' })
    }
    catch (error) {
        return res.status(500).json(error.message);
    }
}

export const DeleteFoodById = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const id = req.params.id;

    if (user) {
        const food = await Food.findById(id)
        if(food != null) {
            await Food.deleteOne({_id: id})
            return res.json('transaction successful')
        }
        return res.json("food not found")
    }
    return res.json({ 'message': 'not authorised!' })
}

export const GetFoods = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (user) {
        const vendor = await FindVendor(user._id)
        const foods = await Food.find({ vendorId: vendor.id });

        if (foods !== null) {
            return res.json(foods);
        }

    }
    return res.json({ 'message': 'Foods not found!' })
}


export const GetCurrentOrders = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if (user) {

        const orders = await Order.find({ vendorId: user._id }).populate('items.food');

        if (orders != null) {
            return res.status(200).json(orders);
        }
    }

    return res.json({ message: 'Orders Not found' });
}

export const GetOrderDetails = async (req: Request, res: Response, next: NextFunction) => {

    const orderId = req.params.id;

    if (orderId) {

        const order = await Order.findById(orderId).populate('items.food');

        if (order != null) {
            return res.status(200).json(order);
        }
    }

    return res.json({ message: 'Order Not found' });
}

export const ProcessOrder = async (req: Request, res: Response, next: NextFunction) => {

    const orderId = req.params.id;

    const { status, remarks, time } = req.body;


    if (orderId) {

        const order = await Order.findById(orderId).populate('food');

        order.orderStatus = status;
        order.remarks = remarks;
        if (time) {
            order.readyTime = time;
        }

        const orderResult = await order.save();

        if (orderResult != null) {
            return res.status(200).json(orderResult);
        }
    }

    return res.json({ message: 'Unable to process order' });
}

export const GetOffers = async (req: Request, res: Response, next: NextFunction) => {


    const user = req.user;

    if (user) {
        let currentOffer = Array();

        const offers = await Offer.find().populate('vendors');

        if (offers) {


            offers.map(item => {

                if (item.vendors) {
                    item.vendors.map(vendor => {
                        if (vendor._id.toString() === user._id) {
                            currentOffer.push(item);
                        }
                    })
                }

                if (item.offerType === "GENERIC") {
                    currentOffer.push(item)
                }

            })

        }

        return res.status(200).json(currentOffer);

    }

    return res.json({ message: 'Offers Not available' });
}


export const AddOffer = async (req: Request, res: Response, next: NextFunction) => {


    const user = req.user;

    if (user) {
        const { title, description, offerType, offerAmount, pincode,
            promocode, promoType, startValidity, endValidity, bank, bins, minValue, isActive } = <CreateOfferInputs>req.body;

        const vendor = await FindVendor(user._id);

        if (vendor) {

            const offer = await Offer.create({
                title,
                description,
                offerType,
                offerAmount,
                pincode,
                promoType,
                startValidity,
                endValidity,
                bank,
                isActive,
                minValue,
                vendor: [vendor]
            })

            console.log(offer);

            return res.status(200).json(offer);

        }

    }

    return res.json({ message: 'Unable to add Offer!' });

}

export const EditOffer = async (req: Request, res: Response, next: NextFunction) => {


    const user = req.user;
    const offerId = req.params.id;

    if (user) {
        const { title, description, offerType, offerAmount, pincode,
            promocode, promoType, startValidity, endValidity, bank, bins, minValue, isActive } = <CreateOfferInputs>req.body;

        const currentOffer = await Offer.findById(offerId);

        if (currentOffer) {

            const vendor = await FindVendor(user._id);

            if (vendor) {

                currentOffer.title = title,
                    currentOffer.description = description,
                    currentOffer.offerType = offerType,
                    currentOffer.offerAmount = offerAmount,
                    currentOffer.pincode = pincode,
                    currentOffer.promoType = promoType,
                    currentOffer.startValidity = startValidity,
                    currentOffer.endValidity = endValidity,
                    currentOffer.bank = bank,
                    currentOffer.isActive = isActive,
                    currentOffer.minValue = minValue;

                const result = await currentOffer.save();

                return res.status(200).json(result);
            }

        }

    }

    return res.json({ message: 'Unable to add Offer!' });

}

export const AddTable = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    const { tableNumber, capacity } = <CreateTableInputs>req.body;

    if (user) {

        const vendor = await FindVendor(user._id);

        if (vendor !== null) {

            const table = await Table.create({
                vendorId: vendor._id,
                tableNumber: tableNumber,
                capacity: capacity,
                isFree: true
            })

            const qrCodeDirectory = path.join(__dirname, '../../qr-codes');
            if (!fs.existsSync(qrCodeDirectory)) {
                fs.mkdirSync(qrCodeDirectory);
            }

            const url = `https://social.eurekadesk.in/dinein/${tableNumber}`; // Replace with your desired URL
            const qrCodeName = `${vendor._id}_${tableNumber}_qr-code.png`; // Specify a name for the QR code
            const outputPath = path.join(qrCodeDirectory, qrCodeName);

            qr.toFile(outputPath, url, (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to generate the QR code' });
                } else {
                    const publicURL = `${req.protocol}://${req.get('host')}/qr-codes/${qrCodeName}`;
                    table.qr = publicURL
                    table.tableUrl = url
                    table.save()
                    return res.json({ table: table });
                }
            })
        }

    }
    else {
        return res.json({ 'message': 'Unable to add table' })
    }
}

export const UpdateTable = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    const { tableNumber, isFree, currentOrder } = <UpdateTableInputs>req.body;

    if (user) {
        const vendor = await FindVendor(user._id)

        const requiredTable = await Table.findOne({ vendorId: vendor.id, tableNumber: tableNumber });

        if (requiredTable !== null) {

            requiredTable.isFree = isFree;
            requiredTable.currentOrder.push;

            for (var foodItem of currentOrder) {
                requiredTable.currentOrder.push(foodItem)
            }

            const saveResult = await requiredTable.save();

            return res.json(saveResult);
        }

    }
    return res.json({ 'message': 'Unable to update table details ' })
}

export const GetTables = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (user) {

        const vendor = await FindVendor(user._id)

        const tables = await Table.find({ vendorId: vendor.id });

        if (tables !== null) {
            return res.json(tables);
        }

    }
    return res.json({ 'message': 'not authorised' })
}

export const DeleteTableById = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const id = req.params.id;

    if (user) {
        const table = await Table.findById(id)
        if(table != null) {
            await Table.deleteOne({_id: id})
            return res.json('transaction successful')
        }
        return res.json("table not found")
    }
    return res.json({ 'message': 'Tables not found!' })
}

export const GetPermissions = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (user) {
        const permisions = Permissions
        return res.json({ permissions: permisions });
    }

    return res.json({ 'message': 'Permissions not found' })
}

export const AddRole = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (user) {

        const { roleName, permissions } = <CreateRoleInput>req.body

        if (await Role.findOne({ roleName: roleName }) != null) {
            return res.json('Role already exists');
        }

        const newRole = await Role.create({
            vendorId: user._id,
            roleName: roleName,
            permissions: permissions,
        });

        return res.json(newRole);
    }

    return res.json({ 'message': 'unable to add role' })
}

export const EditRole = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (user) {
        const vendor = await FindVendor(user._id)
        const { roleName, permissions } = <CreateRoleInput>req.body
        const role = await Role.findOne({ vendorId: vendor.id, roleName: roleName })
        if (role != null) {
            role.roleName = roleName
            role.permissions = permissions
            await role.save()
            return res.json(role);
        }

        return res.json({ 'message': 'role doesn\'t exist' });
    }

    return res.json({ 'message': 'unable to add role' })
}

export const GetRoles = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (user) {

        const vendor = await FindVendor(user._id)

        const roles = await Role.find({ vendorId: vendor.id });

        if (roles !== null) {
            return res.json(roles);
        }
    }
    return res.json({ 'message': 'not authorised' })
}

export const AddEmployee = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (user) {
        const vendor = await FindVendor(user._id)

        const { name, email, phone, role } = plainToClass(CreateEmployeeInput, req.body);
        const validationError = await validate(CreateEmployeeInput, { validationError: { target: true } })

        if (validationError.length > 0) {
            return res.status(400).json(validationError);
        }

        const roleRef = await Role.findOne({ roleName: role })

        if (await Employee.findOne({ phone: phone, vendorId: vendor.id }) != null) {
            return res.json('Employee with this phone no. already exists');
        }

        if (vendor != null && roleRef != null) {
            const employee = await Employee.create({
                vendorId: vendor.id,
                name: name,
                email: email,
                phone: phone,
                role: roleRef
            })
            vendor.employee.push(employee)
            await vendor.save();
            return res.json(vendor.employee)
        }
    }

    return res.json({ 'message': 'unable to add employee' })
}

export const UpdateEmployeeDetails = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (user) {

        const vendor = await FindVendor(user._id);

        const { name, email, phone, role } = plainToClass(CreateEmployeeInput, req.body);

        const validationError = await validate(CreateEmployeeInput, { validationError: { target: true } })

        if (validationError.length > 0) {
            return res.status(400).json(validationError);
        }

        const roleRef = await Role.findOne({ roleName: role })
        const employee = await Employee.findOne({ vendorId: vendor.id, phone: phone })
        if (employee != null) {
            employee.name = name,
                employee.email = email,
                employee.phone = phone,
                employee.role = roleRef
            await employee.save()
            return res.json(employee)
        }
        return res.json({ 'message': 'Employee with this phone no. doesn\'t exists' });
    }

    return res.json({ 'message': 'unable to update employee details' })
}

export const AddTax = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (user) {

        const { name, isApplicable, rate } = <CreateTaxInputs>req.body

        if (await Tax.findOne({ name: name }) != null) {
            return res.json('Tax already exists');
        }
        const vendor = await FindVendor(user._id)
        const newTax = await Tax.create({
            vendorId: vendor.id,
            name: name,
            isApplicable: isApplicable,
            rate: rate
        });

        return res.json(newTax);
    }

    return res.json({ 'message': 'unable to add tax' })
}

export const EditTax = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;
    const taxId = req.params.taxId;
    if (user) {
        const { name, isApplicable, rate } = <CreateTaxInputs>req.body

        const tax = await Tax.findById(taxId)
        if (tax != null) {
            tax.name = name
            tax.isApplicable = isApplicable
            tax.rate = rate
            await tax.save()
            return res.json(tax);
        }

        return res.json({ 'message': 'tax doesn\'t exist' });
    }

    return res.json({ 'message': 'unable to update tax' })

}

export const GetTaxes = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (user) {

        const vendor = await FindVendor(user._id)
        const taxes = await Tax.find({ vendorId: vendor.id });

        if (taxes !== null) {
            return res.json(taxes);
        }

    }
    return res.json({ 'message': 'Taxes not found!' })
}

export const CreateOrderAtCheckout = async (req: Request, res: Response, next: NextFunction) => {


    const employee = req.user;

     const { name, phone, amount, items } = <OrderCheckout>req.body;

    
    if(employee){

        const orderId = `${Math.floor(Math.random() * 89999)+ 1000}`;

        const cart = items;

        let cartItems = Array();

        let netAmount = 0.0;

        let vendorId: string;

        const foods = await Food.find().where('_id').in(cart.map(item => item._id)).exec();

        foods.map(food => {
            cart.map(({ _id, unit}) => {
                if(food._id == _id){
                    vendorId = food.vendorId;
                    netAmount += (food.price * unit);
                    cartItems.push({ food, unit})
                }
            })
        })

        if(cartItems){

            const currentOrder = await Order.create({
                orderId: orderId,
                vendorId: vendorId,
                items: cartItems,
                totalAmount: netAmount,
                paidAmount: amount,
                orderDate: new Date(),
                orderStatus: 'Waiting',
                remarks: '',
                deliveryId: '',
                readyTime: 45,
                orderType:"checkout",
                customerName: name,
                customerPhone: phone
            })

            return res.status(200).json(currentOrder);

        }

    }

    return res.status(400).json({ msg: 'Error while Creating Order'});
}

export const GetCustomers = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (user) {

        const vendor = await FindVendor(user._id)
        let customer:any  = []
        for(var i=0;i<vendor.customers.length;i++) {
            var obj = await Customer.findById(vendor.customers[i])
            customer.push(obj)
        }
        return res.json(customer)
    }
    return res.json({ 'message': 'not authorised' })
}

export const CreateFeedbackSurvey = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (user) {

        const vendor = await FindVendor(user._id)
        return res.json(vendor.customers)

    }
    return res.json({ 'message': 'not authorised' })
}
