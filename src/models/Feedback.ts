import mongoose, { Schema, Document, Model } from 'mongoose';


interface FeedbackDoc extends Document {

    name: string;
    vendorId: string;
    type: string;
    question: string;
    description: string;
    showCommentBox: boolean;
    redirectionLink: string;
    acknowledgementMsg: [string];
    status: string;
    deliveryMethod: string;
    isActive: boolean;
    responses: any;
    sendNotification: any;
    notificationMethod: string;
}

const FeedbackSchema = new Schema({
    name: { type: String, required: true },
    vendorId: { type: String, required: true },
    type: { type: String, required: true },
    question: { type: String, required: true },
    description: { type: String },
    showCommentBox: { type: Boolean },
    redirectionLink: { type: String },
    acknowledgementMsg: { type: [String], required: true },
    status: { type: String, required: true },
    deliveryMethod: { type: String, required: true },
    isActive: { type: Boolean },
    sendNotification: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'employee'
    }],
    responses: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'response'
    }],
    notificationMethod: { type: String }
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.__v;
        }
    },
    timestamps: true
});

interface ResponseDoc extends Document {

    customerName: string;
    customerPhone: string;
    feedbackId: string;
    rating: string;
    comments: string;
}

const ResponseSchema = new Schema({
    customerName: { type: String },
    customerPhone: { type: String, required: true },
    feedbackId: { type: String },
    rating: { type: Number },
    comments: { type: String }
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.__v;
        }
    },
    timestamps: true
});


const Feedback = mongoose.model<FeedbackDoc>('feedback', FeedbackSchema);

const FeedbackResponse = mongoose.model<ResponseDoc>('response', ResponseSchema);

export { Feedback, FeedbackResponse }