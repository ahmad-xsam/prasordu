import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion {
  type: 'QUIZ' | 'MATCH_WORD' | 'OPEN_BOX';
  question: string;
  options: string[]; // For QUIZ: [A, B, C, D], For MATCH_WORD: pairs, For OPEN_BOX: items
  answer: number | string; // Index for QUIZ, matching string for others
  points: number;
}

export interface IGameLevel extends Document {
  levelNumber: number;
  title: string;
  description: string;
  type: string;
  requiredStars: number;
  questions: IQuestion[];
}

const QuestionSchema = new Schema<IQuestion>({
  type: { type: String, enum: ['QUIZ', 'MATCH_WORD', 'OPEN_BOX'], required: true, default: 'QUIZ' },
  question: { type: String, required: true },
  options: [{ type: String }],
  answer: { type: Schema.Types.Mixed, required: true },
  points: { type: Number, default: 100 }
});

const GameLevelSchema = new Schema<IGameLevel>({
  levelNumber: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, default: 'Adventure' },
  requiredStars: { type: Number, default: 0 },
  questions: [QuestionSchema]
}, { timestamps: true });

export default mongoose.models.GameLevel || mongoose.model<IGameLevel>("GameLevel", GameLevelSchema);
