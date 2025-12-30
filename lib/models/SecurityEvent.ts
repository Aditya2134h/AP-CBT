import mongoose, { Document, Schema } from 'mongoose';

export type SecurityEventType = 
  'tab-switch' | 
  'copy-paste' | 
  'screenshot' | 
  'window-focus-loss' | 
  'multiple-tabs' | 
  'developer-tools' | 
  'face-not-detected' | 
  'suspicious-pattern' | 
  'ip-change' | 
  'unauthorized-access';

export interface ISecurityEvent extends Document {
  testSession: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  resolved: boolean;
  resolvedBy?: mongoose.Types.ObjectId;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SecurityEventSchema: Schema = new Schema({
  testSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestSession',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'tab-switch',
      'copy-paste',
      'screenshot',
      'window-focus-loss',
      'multiple-tabs',
      'developer-tools',
      'face-not-detected',
      'suspicious-pattern',
      'ip-change',
      'unauthorized-access',
    ],
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  resolved: {
    type: Boolean,
    default: false,
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  resolutionNotes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

const SecurityEvent = mongoose.models.SecurityEvent || mongoose.model<ISecurityEvent>('SecurityEvent', SecurityEventSchema);

export default SecurityEvent;