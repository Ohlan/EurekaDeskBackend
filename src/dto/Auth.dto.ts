import { VendorPayload } from './Vandor.dto'
import { CustomerPayload } from './Customer.dto';
import { EmployeePayload } from './Employee.dto';

export type AuthPayload = VendorPayload | CustomerPayload | EmployeePayload;