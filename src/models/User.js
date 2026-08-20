import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, default: '' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    appId: { type: String, required: true, unique: true, index: true },
    role: { type: String, default: 'user' },
  },
  {
    collection: 'users',
    timestamps: true,
  }
);

export const User =
  mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
