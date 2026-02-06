import mongoose from 'mongoose';

const publicUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String }
}, { timestamps: true });

publicUserSchema.index({ email: 1 });

export default mongoose.model('PublicUser', publicUserSchema);


