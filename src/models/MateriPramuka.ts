import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface IMateriPramuka extends Document {
  bab: number;
  title: string;
  content: string;
  imageUrl?: string;
  youtubeUrl?: string;
  quiz: IQuizQuestion[];
}

const QuizQuestionSchema = new Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswerIndex: { type: Number, required: true }
});

const MateriPramukaSchema: Schema = new Schema({
  bab: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  imageUrl: { type: String },
  youtubeUrl: { type: String },
  quiz: [QuizQuestionSchema]
}, {
  timestamps: true,
});

// Add index to speed up querying by bab
MateriPramukaSchema.index({ bab: 1 });

export default mongoose.models.MateriPramuka || mongoose.model<IMateriPramuka>('MateriPramuka', MateriPramukaSchema);
