import mongoose, { Document, Schema } from 'mongoose';

export type QuestionType = 'mcq' | 'essay' | 'matching' | 'fill-blank' | 'true-false' | 'image-recognition';

export interface IQuestion extends Document {
  text: string;
  type: QuestionType;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  section: string;
  hint?: string;
  explanation?: string;
  options?: string[]; // for MCQ
  correctAnswer?: string | string[]; // for MCQ, True/False, Fill-blank
  matchingPairs?: { left: string; right: string }[]; // for Matching
  imageUrl?: string; // for Image Recognition
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema: Schema = new Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['mcq', 'essay', 'matching', 'fill-blank', 'true-false', 'image-recognition'],
    required: true,
  },
  points: {
    type: Number,
    required: true,
    min: 1,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  section: {
    type: String,
    trim: true,
  },
  hint: {
    type: String,
    trim: true,
  },
  explanation: {
    type: String,
    trim: true,
  },
  options: {
    type: [String],
  },
  correctAnswer: {
    type: Schema.Types.Mixed,
  },
  matchingPairs: {
    type: [{
      left: String,
      right: String,
    }],
  },
  imageUrl: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

const Question = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);

export default Question;