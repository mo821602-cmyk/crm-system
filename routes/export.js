const express = require('express');
const { all } = require('../database');
const router = express.Router();

// Export customers as CSV
router.get('/customers/csv', (req, res) => {
  try {
    const customers = all('SELECT * FROM customers WHERE userId = ?', [req.user.userId]);
    
    const headers = ['الاسم', 'البريد', 'الهاتف', 'الشركة', 'التصنيف', 'الحالة', 'القيمة', 'تاريخ الإضافة'];
    const rows = customers.map(c => [
      c.name, c.email || '', c.phone || '', c.company || '',
      c.category, c.status, c.value || 0, c.createdAt
    ]);

    // BOM for Arabic support in Excel
    let csv = '\ufeff' + headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export deals as CSV
router.get('/deals/csv', (req, res) => {
  try {
    const deals = all(
      `SELECT d.*, c.name as customerName FROM deals d 
       LEFT JOIN customers c ON d.customerId = c.id 
       WHERE d.userId = ?`, [req.user.userId]
    );
    
    const headers = ['العنوان', 'العميل', 'القيمة', 'المرحلة', 'الاحتمالية', 'تاريخ الإغلاق', 'تاريخ الإنشاء'];
    const rows = deals.map(d => [
      d.title, d.customerName || '', d.value || 0, d.stage,
      d.probability || 0, d.expectedCloseDate || '', d.createdAt
    ]);

    let csv = '\ufeff' + headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=deals.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export tasks as CSV
router.get('/tasks/csv', (req, res) => {
  try {
    const tasks = all(
      `SELECT t.*, c.name as customerName FROM tasks t 
       LEFT JOIN customers c ON t.customerId = c.id 
       WHERE t.userId = ?`, [req.user.userId]
    );
    
    const headers = ['المهمة', 'الوصف', 'العميل', 'الأولوية', 'الحالة', 'الموعد', 'تاريخ الإنشاء'];
    const rows = tasks.map(t => [
      t.title, t.description || '', t.customerName || '',
      t.priority, t.status, t.dueDate || '', t.createdAt
    ]);

    let csv = '\ufeff' + headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=tasks.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export full report as JSON
router.get('/full-report', (req, res) => {
  try {
    const userId = req.user.userId;
    const customers = all('SELECT * FROM customers WHERE userId = ?', [userId]);
    const deals = all('SELECT * FROM deals WHERE userId = ?', [userId]);
    const tasks = all('SELECT * FROM tasks WHERE userId = ?', [userId]);
    const activities = all('SELECT * FROM activities WHERE userId = ? ORDER BY createdAt DESC LIMIT 100', [userId]);

    res.json({
      success: true,
      exportDate: new Date().toISOString(),
      report: {
        customers: { count: customers.length, data: customers },
        deals: { count: deals.length, data: deals },
        tasks: { count: tasks.length, data: tasks },
        activities: { count: activities.length, data: activities }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
