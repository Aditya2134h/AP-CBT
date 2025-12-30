import mongoose, { Document, Schema } from 'mongoose';

export interface ITestResult extends Document {
  testSession: mongoose.Types.ObjectId;
  test: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  totalScore: number;
  percentage: number;
  grade: string;
  status: 'pass' | 'fail';
  answers: mongoose.Types.ObjectId[];
  feedback?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TestResultSchema: Schema = new Schema({
  testSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestSession',
    required: true,
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  totalScore: {
    type: Number,
    required: true,
    min: 0,
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  grade: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pass', 'fail'],
    required: true,
  },
  answers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentAnswer',
  }],
  feedback: {
    type: String,
    trim: true,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

const TestResult = mongoose.models.TestResult || mongoose.model<ITestResult>('TestResult', TestResultSchema);

export default TestResult;