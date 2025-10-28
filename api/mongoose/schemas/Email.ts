import mongoose from 'mongoose';

export const EmailSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  subject: { type: String, required: true },
  text: { type: String },
  html: { type: String },
  success: { type: Boolean, required: true },
}, { timestamps: true });

EmailSchema.pre('validate', function (next) {
  if (!this.text && !this.html) {
    return next(new Error('Text or HTML required'));
  }
  next();
});

const Email = mongoose.model('Email', EmailSchema);

export default Email;
