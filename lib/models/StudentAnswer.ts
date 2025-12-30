import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentAnswer extends Document {
  testSession: mongoose.Types.ObjectId;
  question: mongoose.Types.ObjectId;
  answer: string | string[];
  isCorrect?: boolean;
  score?: number;
  feedback?: string;
  timeSpent: number; // in seconds
  markedForReview: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StudentAnswerSchema: Schema = new Schema({
  testSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestSession',
    required: true,
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  answer: {
    type: Schema.Types.Mixed,
    required: true,
  },
  isCorrect: {
    type: Boolean,
  },
  score: {
    type: Number,
    min: 0,
  },
  feedback: {
    type: String,
    trim: true,
  },
  timeSpent: {
    type: Number,
    default: 0,
  },
  markedForReview: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const StudentAnswer = mongoose.models.StudentAnswer || mongoose.model<IStudentAnswer>('StudentAnswer', StudentAnswerSchema);

export default StudentAnswer;