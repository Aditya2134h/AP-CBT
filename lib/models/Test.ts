import mongoose, { Document, Schema } from 'mongoose';

export interface ITest extends Document {
  title: string;
  description: string;
  subject: string;
  instructor: mongoose.Types.ObjectId;
  duration: number; // in minutes
  passingScore: number; // percentage
  shuffleQuestions: boolean;
  allowReview: boolean;
  negativeMarking: boolean;
  negativeMarkingValue: number;
  maxAttempts: number;
  gracePeriod: number; // in minutes
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'published' | 'archived';
  questions: mongoose.Types.ObjectId[];
  classes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const TestSchema: Schema = new Schema({
  title: {
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
  duration: {
    type: Number,
    required: true,
    min: 1,
  },
  passingScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  shuffleQuestions: {
    type: Boolean,
    default: false,
  },
  allowReview: {
    type: Boolean,
    default: true,
  },
  negativeMarking: {
    type: Boolean,
    default: false,
  },
  negativeMarkingValue: {
    type: Number,
    default: 0,
    min: 0,
  },
  maxAttempts: {
    type: Number,
    default: 1,
    min: 1,
  },
  gracePeriod: {
    type: Number,
    default: 0,
    min: 0,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
  }],
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  }],
}, {
  timestamps: true,
});

const Test = mongoose.models.Test || mongoose.model<ITest>('Test', TestSchema);

export default Test;