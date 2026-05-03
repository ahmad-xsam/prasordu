import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion {
  type: 'QUIZ' | 'YES_NO' | 'FILL_BLANK' | 'ANAGRAMS' | 'OPEN_BOX' | 'MATCHING_PAIRS';
  question: string;
  imageUrl?: string;
  options: string[]; 
  answer: any; 
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
  type: { type: String, enum: ['QUIZ', 'YES_NO', 'FILL_BLANK', 'ANAGRAMS', 'OPEN_BOX', 'MATCHING_PAIRS'], required: true, default: 'QUIZ' },
  question: { type: String, required: true },
  imageUrl: { type: String },
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
