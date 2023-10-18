import { Length } from "class-validator";

export class CreateTableInputs {

    @Length(1,100)
    tableNumber: string;

    @Length(1, 50)
    capacity: string;

    isFree: boolean;

    currentOrder: [any];
}

export class UpdateTableInputs {

    @Length(1,100)
    tableNumber: string;

    isFree: boolean;

    currentOrder: [any];
}

