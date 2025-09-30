import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    email: { type: String, unique: true, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, default: 'user' },
  },
  { timestamps: true }
);

export default model('User', UserSchema);

