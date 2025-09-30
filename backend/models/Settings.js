import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const ColorsSchema = new Schema(
  {
    primary: { type: String, default: '#1976d2' },
    secondary: { type: String, default: '#26a69a' },
    accent: { type: String, default: '#9c27b0' },
    positive: { type: String, default: '#21ba45' },
    negative: { type: String, default: '#c10015' },
    info: { type: String, default: '#31ccec' },
    warning: { type: String, default: '#f2c037' },
  },
  { _id: false }
);

const SettingsSchema = new Schema(
  {
    featuredLayout: { type: Number, enum: [1, 2, 4], default: 2 },
    colors: { type: ColorsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default model('Settings', SettingsSchema);

