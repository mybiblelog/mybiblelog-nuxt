import mongoose, { HydratedDocument, Document } from 'mongoose';
import type { IUser } from './schemas/User';

// Define document interfaces based on schemas
export interface IEmail extends Document {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  success: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPassage {
  startVerseId: number;
  endVerseId: number;
}

export interface ILogEntry extends Document {
  owner: mongoose.Types.ObjectId;
  date: string;
  startVerseId: number;
  endVerseId: number;
  toJSON(): { id: string; date: string; startVerseId: number; endVerseId: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface IPassageNote extends Document {
  owner: mongoose.Types.ObjectId;
  passages: IPassage[];
  content: string;
  tags: mongoose.Types.ObjectId[];
  toJSON(): { id: string; passages: IPassage[]; content: string; tags: mongoose.Types.ObjectId[] };
  createdAt: Date;
  updatedAt: Date;
}

export interface IPassageNoteTag extends Document {
  owner: mongoose.Types.ObjectId;
  label: string;
  color: string;
  description: string;
  noteCount?: number;
  toJSON(): { id: string; label: string; color: string; description: string; noteCount?: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface IDailyReminder extends Document {
  owner: mongoose.Types.ObjectId;
  hour: number;
  minute: number;
  timezoneOffset: number;
  active: boolean;
  unsubscribeCode: string;
  nextOccurrence: number;
  getNextOccurrence(): Date;
  toJSON(): { id: string; hour: number; minute: number; timezoneOffset: number; active: boolean };
  createdAt: Date;
  updatedAt: Date;
}

export interface IReport extends Document {
  type: 'user-engagement';
  data: Record<string, unknown>;
  owner?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFeedback extends Document {
  ip: string;
  owner: mongoose.Types.ObjectId | null;
  email: string;
  kind: 'bug' | 'feature' | 'comment';
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

type UserDoc = HydratedDocument<IUser>;
type EmailDoc = HydratedDocument<IEmail>;
type LogEntryDoc = HydratedDocument<ILogEntry>;
type PassageNoteDoc = HydratedDocument<IPassageNote>;
type PassageNoteTagDoc = HydratedDocument<IPassageNoteTag>;
type DailyReminderDoc = HydratedDocument<IDailyReminder>;
type ReportDoc = HydratedDocument<IReport>;
type FeedbackDoc = HydratedDocument<IFeedback>;

export type {
  UserDoc,
  EmailDoc,
  LogEntryDoc,
  PassageNoteDoc,
  PassageNoteTagDoc,
  DailyReminderDoc,
  ReportDoc,
  FeedbackDoc,
};
