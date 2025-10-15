const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
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

module.exports = ReportSchema;
