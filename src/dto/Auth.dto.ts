import { CustomerPayload } from './Customer.dto';
import { EmployeePayload } from './Employee.dto';

export type AuthPayload = CustomerPayload | EmployeePayload;