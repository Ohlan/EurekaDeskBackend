import mongoose, { Schema, Document, Model } from 'mongoose';

interface TableDoc extends Document {

    tableNumber: string;
    capacity: string;
    isFree: boolean;
    currentOrder: any
}


const TableSchema = new Schema({
    tableNumber:{ type: String, required: true},
    capacity: { type: String, required: true},
    isFree: { type: Boolean},
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