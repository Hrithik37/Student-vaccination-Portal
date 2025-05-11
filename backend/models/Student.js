const { Schema, model } = require('mongoose');

const studentSchema = new Schema({
  name: { type: String, required: true },
  class: { type: String, required: true },
  dateOfBirth: { type: Date, required: true }
});

module.exports = model('Student', studentSchema);
