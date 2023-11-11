import { Length } from "class-validator";

export class CreateFeedbackInputs {

    @Length(1,500)
    tableNumber: string;

    @Length(1, 50)
    capacity: string;

    isFree: boolean;

    currentOrder: [any];
}

export class UpdateFeedbackInputs {

    @Length(1,100)
    tableNumber: string;

    isFree: boolean;

    currentOrder: [any];
}