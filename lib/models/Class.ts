import mongoose, { Document, Schema } from 'mongoose';

export interface IClass extends Document {
  name: string;
  description: string;
  subject: string;
  instructor: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[];
  schedule: string;
  status: 'active' | 'completed' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  schedule: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'pending'],
    default: 'active',
  },
}, {
  timestamps: true,
});

const Class = mongoose.models.Class || mongoose.model<IClass>('Class', ClassSchema);

export default Class;