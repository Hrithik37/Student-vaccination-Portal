const Student = require('../models/Student');
const csv = require('csv-parse');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const VaccinationRecord = require('../models/VaccinationRecord');
// exports.getAll = async (req, res) => {
//   const { name, class: cls, id, status } = req.query;
//   const students = await Student.find();
//   res.json(students);
// };

exports.getAll = async (req, res) => {
    const { name, class: cls, id, status } = req.query;
  
    // Build aggregation pipeline
    const pipeline = [
      // 1) Lookup vaccination records
      {
        $lookup: {
          from: 'vaccinationrecords',
          localField: '_id',
          foreignField: 'student',
          as: 'records'
        }
      },
      // 2) Add boolean field "vaccinated"
      {
        $addFields: {
          vaccinated: { $gt: [ { $size: '$records' }, 0 ] }
        }
      }
    ];
  
    // 3) Match filters
    const match = {};
    if (name)    match.name = { $regex: name, $options: 'i' };
    if (cls)     match.class = cls;
    if (id && mongoose.Types.ObjectId.isValid(id)) match._id = mongoose.Types.ObjectId(id);
    if (status === 'vaccinated')   match.vaccinated = true;
    if (status === 'unvaccinated') match.vaccinated = false;
    if (Object.keys(match).length) pipeline.push({ $match: match });
  
    // 4) Project out the records array
    pipeline.push({ $project: { records: 0 } });
  
    const students = await Student.aggregate(pipeline);
    res.json(students);
  };

  exports.getOne = async (req, res) => {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
  
    // Fetch all vaccination records for this student
    const records = await VaccinationRecord
      .find({ student: student._id })
      .sort({ vaccinatedAt: -1 })
      .populate('drive', 'vaccineName');
  
    // Map to simple objects
    const vaccinations = records.map(rec => ({
      vaccineName: rec.drive.vaccineName,
      vaccinatedAt: rec.vaccinatedAt
    }));
  
    res.json({
      _id:           student._id,
      name:          student.name,
      class:         student.class,
      dateOfBirth:   student.dateOfBirth,
      vaccinations
    });
  };

exports.create = async (req, res) => {
  const s = await Student.create(req.body);
  res.status(201).json(s);
};

// exports.bulkCreate = async (req, res) => {
//   const { filePath } = req.body;
//   const records = [];
//   fs.createReadStream(filePath)
//     .pipe(csv({ columns: true }))
//     .on('data', row => records.push(row))
//     .on('end', async () => {
//       const created = await Student.insertMany(records);
//       res.json(created);
//     });
// };

exports.bulkCreate = async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No CSV file uploaded.' });
    }
    // Parse CSV from buffer
    let records;
    try {
      records = parse(req.file.buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
    } catch (err) {
      return res.status(400).json({ message: 'Invalid CSV format.' });
    }
  
    // InsertMany & return inserted docs
    const inserted = await Student.insertMany(records);
    res.status(201).json(inserted);
  };

exports.update = async (req, res) => {
  const s = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(s);
};
