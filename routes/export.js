const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken } = require('../middleware/auth');
const ExcelJS = require('exceljs');

// Export customers to Excel
router.get('/customers/excel', verifyToken, async (req, res) => {
  try {
    const customers = await db.all(
      'SELECT * FROM customers WHERE user_id = ?',
      [req.user.id]
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Customers');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Company', key: 'company', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Created At', key: 'created_at', width: 20 }
    ];

    customers.forEach(customer => {
      worksheet.addRow(customer);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="customers.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export deals to Excel
router.get('/deals/excel', verifyToken, async (req, res) => {
  try {
    const deals = await db.all(
      'SELECT * FROM deals WHERE user_id = ?',
      [req.user.id]
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Deals');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Title', key: 'title', width: 20 },
      { header: 'Value', key: 'value', width: 15 },
      { header: 'Stage', key: 'stage', width: 15 },
      { header: 'Customer ID', key: 'customer_id', width: 12 },
      { header: 'Due Date', key: 'due_date', width: 15 },
      { header: 'Created At', key: 'created_at', width: 20 }
    ];

    deals.forEach(deal => {
      worksheet.addRow(deal);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="deals.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
