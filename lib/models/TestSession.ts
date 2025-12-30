import mongoose, { Document, Schema } from 'mongoose';

export interface ITestSession extends Document {
  test: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  status: 'in-progress' | 'completed' | 'submitted' | 'expired';
  currentQuestion: number;
  answers: mongoose.Types.ObjectId[];
  attemptNumber: number;
  ipAddress: string;
  userAgent: string;
  securityEvents: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const TestSessionSchema: Schema = new Schema({
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
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'submitted', 'expired'],
    default: 'in-progress',
  },
  currentQuestion: {
    type: Number,
    default: 0,
  },
  answers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentAnswer',
  }],
  attemptNumber: {
    type: Number,
    default: 1,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  securityEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SecurityEvent',
  }],
}, {
  timestamps: true,
});

const TestSession = mongoose.models.TestSession || mongoose.model<ITestSession>('TestSession', TestSessionSchema);

export default TestSession;