import csv from 'csv-parser';
import fs from 'fs';
import xlsx from 'xlsx';
import path from 'path';

export const parseEmails = async (filePath) => {
  const emails = [];
  const fileExtension = path.extname(filePath).toLowerCase();

  return new Promise((resolve, reject) => {
    if (fileExtension === '.csv') {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          if (row.email) emails.push(row.email.trim());
        })
        .on('end', () => resolve(emails))
        .on('error', (err) => reject(err));
    } else if (fileExtension === '.txt') {
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) return reject(err);
        const lines = data.split('\n').filter((line) => line.trim() !== '');
        const trimmedEmails = lines.map((line) => line.trim());
        resolve(trimmedEmails);
      });
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      const workbook = xlsx.readFile(filePath);
      const sheetNames = workbook.SheetNames;

      // Loop through each sheet
      sheetNames.forEach((sheet) => {
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);
        data.forEach((row) => {
          if (row.email) emails.push(row.email.trim());
        });
      });

      resolve(emails);
    } else {
      reject(new Error('Unsupported file type'));
    }
  });
};
