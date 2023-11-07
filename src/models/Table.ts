import mongoose, { Schema, Document, Model } from 'mongoose';

interface TableDoc extends Document {

    vendorId: string;
    tableNumber: string;
    capacity: string;
    isFree: boolean;
    qr: string;
    tableUrl: string;
    currentOrder: any;
}


const TableSchema = new Schema({
    vendorId: {type: String, required: true},
    tableNumber:{ type: String, required: true},
    capacity: { type: String, required: true},
    isFree: { type: Boolean},
    qr: {type: String},
    tableUrl: {type: String},
    currentOrder: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'food'
    }]
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

const Table = mongoose.model<TableDoc>('Table', TableSchema);

export { Table }