const Student = require('../models/Student');
const Drive = require('../models/Drive');
const VaccinationRecord = require('../models/VaccinationRecord');
const { parse } = require('csv-parse/sync');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const mongoose = require('mongoose');

exports.getRecords = async (req, res) => {
    const { vaccineName, page = 1, limit = 10 } = req.query;
  
    // 1) Build a lookup to fetch each student's latest record
    const pipeline = [
      {
        $lookup: {
          from: 'vaccinationrecords',
          let: { sid: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$student', '$$sid'] } } },
            { $sort: { vaccinatedAt: -1 } },
            { $limit: 1 }
          ],
          as: 'latestRecord'
        }
      },
      // 2) Lookup the drive info for that record
      {
        $lookup: {
          from: 'drives',
          localField: 'latestRecord.drive',
          foreignField: '_id',
          as: 'latestDrive'
        }
      },
      // 3) Flatten arrays & project
      {
        $project: {
          name: 1,
          class: 1,
          dateOfBirth: 1,
          vaccinated: { $gt: [ { $size: '$latestRecord' }, 0 ] },
          vaccinatedAt: { $arrayElemAt: ['$latestRecord.vaccinatedAt', 0] },
          vaccineName:  { $arrayElemAt: ['$latestDrive.vaccineName', 0] }
        }
      },
      // 4) Optional filter by vaccineName (only applies to those with a vaccineName)
      ...(vaccineName
        ? [{
            $match: {
              vaccineName: { $regex: vaccineName, $options: 'i' }
            }
          }]
        : []),
      // 5) Sort unvaccinated last, then newest vaccinated first
      { $sort: { vaccinated: -1, vaccinatedAt: -1 } },
      // 6) Facet for pagination + count
      {
        $facet: {
          data: [
            { $skip: (page - 1) * limit },
            { $limit: Number(limit) }
          ],
          total: [{ $count: 'count' }]
        }
      }
    ];
  
    const [ result ] = await Student.aggregate(pipeline);
    const data  = result.data;
    const total = result.total[0]?.count || 0;
  
    res.json({ data, total, page: Number(page), limit: Number(limit) });
  };
  exports.exportRecords = async (req, res) => {
    const { vaccineName, type = 'csv' } = req.query;
  
    // Reuse same initial stages, but without pagination
    const pipeline = [
      {
        $lookup: {
          from: 'vaccinationrecords',
          let: { sid: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$student', '$$sid'] } } },
            { $sort: { vaccinatedAt: -1 } },
            { $limit: 1 }
          ],
          as: 'latestRecord'
        }
      },
      {
        $lookup: {
          from: 'drives',
          localField: 'latestRecord.drive',
          foreignField: '_id',
          as: 'latestDrive'
        }
      },
      {
        $project: {
          name: 1,
          class: 1,
          dateOfBirth: 1,
          vaccinated: { $gt: [ { $size: '$latestRecord' }, 0 ] },
          vaccinatedAt: { $arrayElemAt: ['$latestRecord.vaccinatedAt', 0] },
          vaccineName:  { $arrayElemAt: ['$latestDrive.vaccineName', 0] }
        }
      },
      ...(vaccineName
        ? [{
            $match: {
              vaccineName: { $regex: vaccineName, $options: 'i' }
            }
          }]
        : []),
      { $sort: { vaccinated: -1, vaccinatedAt: -1 } }
    ];
  
    const records = await Student.aggregate(pipeline);
  
    // -- CSV Export --
    if (type === 'csv') {
      const fields = ['name','class','dateOfBirth','vaccinated','vaccinatedAt','vaccineName'];
      const parser = new Parser({ fields });
      const csv    = parser.parse(records);
      res.header('Content-Type','text/csv');
      res.attachment('vaccination_report.csv');
      return res.send(csv);
    }
  
    // -- Excel Export --
    if (type === 'excel') {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Report');
      ws.columns = [
        { header:'Name',        key:'name',        width:30 },
        { header:'Class',       key:'class',       width:10 },
        { header:'DOB',         key:'dateOfBirth', width:15 },
        { header:'Vaccinated',  key:'vaccinated',  width:12 },
        { header:'Vaccinated At', key:'vaccinatedAt', width:20 },
        { header:'Vaccine Name', key:'vaccineName', width:20 }
      ];
      records.forEach(r =>
        ws.addRow({
          ...r,
          dateOfBirth: new Date(r.dateOfBirth).toLocaleDateString(),
          vaccinatedAt: r.vaccinatedAt
            ? new Date(r.vaccinatedAt).toLocaleDateString()
            : ''
        })
      );
      res.header(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.attachment('vaccination_report.xlsx');
      return wb.xlsx.write(res).then(() => res.end());
    }
  
    // -- PDF Export --
    if (type === 'pdf') {
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      res.header('Content-Type','application/pdf');
      res.attachment('vaccination_report.pdf');
      doc.pipe(res);
  
      doc.fontSize(18).text('Vaccination Report', { align: 'center' }).moveDown();
  
      // Table header
      const startY = 80;
      const rowH   = 20;
      const cols   = [30, 120, 200, 260, 340, 440];
      ['Name','Class','DOB','Vaccinated','Vaccinated At','Vaccine'].forEach((h,i) =>
        doc.fontSize(10).text(h, cols[i], startY)
      );
  
      // Table rows
      records.forEach((r, idx) => {
        const y = startY + rowH * (idx + 1);
        doc.text(r.name, cols[0], y);
        doc.text(r.class, cols[1], y);
        doc.text(new Date(r.dateOfBirth).toLocaleDateString(), cols[2], y);
        doc.text(r.vaccinated ? 'Yes' : 'No', cols[3], y);
        doc.text(
          r.vaccinatedAt
            ? new Date(r.vaccinatedAt).toLocaleDateString()
            : '',
          cols[4], y
        );
        doc.text(r.vaccineName || '', cols[5], y);
      });
  
      doc.end();
      return;
    }
  
    return res.status(400).json({ message: 'Invalid export type' });
  };
  exports.metrics = async (req, res) => {
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
    // 1) Total students
    const total = await Student.countDocuments();
  
    // 2) Number of distinct students vaccinated
    const vaccinated = (await VaccinationRecord.distinct('student')).length;
  
    // 3) Percentage
    const percent = total ? Math.round((vaccinated / total) * 100) : 0;
  
    // 4) Upcoming drives within next 30 days
    const upcoming = await Drive.find({
      date: { $gte: now, $lte: in30 },
      status: 'scheduled'
    }).select('vaccineName date');
  
    res.json({ total, vaccinated, percent, upcoming });
  };
