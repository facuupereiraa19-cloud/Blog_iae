import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const PostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    image: { type: String, required: false },
    video: { type: String, required: false },
    filePath: { type: String, required: false },
    createdAt: { type: Date, required: true, default: Date.now },
    views: { type: Number, required: true, default: 0 },
    likes: { type: Number, required: true, default: 0 },
    size: { type: String, enum: ['large', 'medium', 'small'], default: 'medium' },
    userId: { type: Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default model('Post', PostSchema);
