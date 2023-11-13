import { Length } from "class-validator";

export class CreateFeedbackInput {

    @Length(5, 20)
    name: string;

    @Length(1, 20)
    type: string;

    @Length(1, 50)
    question: string;

    description: string;

    showCommentBox: boolean;

    redirectionLink: string;

    acknowledgementMsg: [string];

    status: string;

    deliveryMethod: string;

    isActive: boolean;
}

export class CreateResponseInput {

    @Length(1, 20)
    feedbackId: string;

    rating: number;

    @Length(0, 150)
    comments: string
}