import mongoose from 'mongoose';

const AdminKnowledgeSchema = new mongoose.Schema(
  {
    type: { type: String, default: 'global', index: true },
    content: { type: String, default: '' },
    source: { type: String, default: 'admin_upload' },
  },
  {
    collection: 'admin_knowledge',
    timestamps: true,
  }
);

export const AdminKnowledge =
  mongoose.models.AdminKnowledge || mongoose.model('AdminKnowledge', AdminKnowledgeSchema);
export default AdminKnowledge;
