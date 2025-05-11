// backend/controllers/driveController.js
const Drive = require('../models/Drive');

// Utility to add 15 days
const MS_IN_DAY = 24*60*60*1000;

exports.getAll = async (req, res) => {
  // 1) Expire past drives
  await Drive.updateMany(
    { date: { $lt: new Date() }, status: 'scheduled' },
    { status: 'expired' }
  );

  // 2) Return all drives
  const drives = await Drive.find();
  res.json(drives);
};

exports.getOne = async (req, res) => {
  const drive = await Drive.findById(req.params.id);
  if (!drive) return res.status(404).json({ message: 'Drive not found' });
  // expire if needed
  if (drive.status === 'scheduled' && drive.date < new Date()) {
    drive.status = 'expired';
    await drive.save();
  }
  res.json(drive);
};

exports.create = async (req, res) => {
  const { date, vaccineName } = req.body;
  const driveDate = new Date(date);

  // Must be at least 15 days out
  if (driveDate < new Date(Date.now() + 15*MS_IN_DAY)) {
    return res.status(400).json({ message: 'Date must be ≥ 15 days from now' });
  }

  // Prevent two drives on the same date
  const conflict = await Drive.findOne({
    date: { $eq: driveDate },
    status: { $in: ['scheduled','completed'] }
  });
  if (conflict) {
    return res.status(400).json({ message: 'Another drive already scheduled on this date.' });
  }

  const d = await Drive.create(req.body);
  res.status(201).json(d);
};

exports.update = async (req, res) => {
  const { date } = req.body;
  if (date) {
    const driveDate = new Date(date);
    if (driveDate < new Date()) {
      return res.status(400).json({ message: 'Date must not be in the past' });
    }
    // Prevent changing to a date that conflicts
    const conflict = await Drive.findOne({
      _id: { $ne: req.params.id },
      date: { $eq: driveDate },
      status: { $in: ['scheduled','completed'] }
    });
    if (conflict) {
      return res.status(400).json({ message: 'Another drive already scheduled on this date.' });
    }
  }

  const d = await Drive.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(d);
};
