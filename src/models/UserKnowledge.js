import mongoose from 'mongoose';

const UserKnowledgeSchema = new mongoose.Schema(
  {
    appId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    content: { type: String, default: '' },
  },
  {
    collection: 'user_knowledge',
    timestamps: true,
  }
);

export const UserKnowledge =
  mongoose.models.UserKnowledge || mongoose.model('UserKnowledge', UserKnowledgeSchema);
export default UserKnowledge;
