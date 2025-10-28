import mongoose from 'mongoose';

export const ReportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['user-engagement'],
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
}, { timestamps: true });

const Report = mongoose.model('Report', ReportSchema);

export default Report;
