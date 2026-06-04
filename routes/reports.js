const express = require('express');
const { all, get } = require('../database');
const router = express.Router();

// Dashboard stats
router.get('/dashboard', (req, res) => {
  try {
    const userId = req.user.userId;
    
    const totalCustomers = get('SELECT COUNT(*) as count FROM customers WHERE userId = ?', [userId]);
    const activeCustomers = get("SELECT COUNT(*) as count FROM customers WHERE userId = ? AND status = 'نشط'", [userId]);
    const totalDeals = get('SELECT COUNT(*) as count FROM deals WHERE userId = ?', [userId]);
    const wonDeals = get("SELECT COUNT(*) as count FROM deals WHERE userId = ? AND stage = 'مغلقة - ربح'", [userId]);
    const totalRevenue = get("SELECT COALESCE(SUM(value), 0) as total FROM deals WHERE userId = ? AND stage = 'مغلقة - ربح'", [userId]);
    const pendingTasks = get("SELECT COUNT(*) as count FROM tasks WHERE userId = ? AND status != 'مكتملة' AND status != 'ملغاة'", [userId]);
    const overdueTasks = get("SELECT COUNT(*) as count FROM tasks WHERE userId = ? AND status != 'مكتملة' AND dueDate < date('now')", [userId]);
    
    const recentActivities = all('SELECT * FROM activities WHERE userId = ? ORDER BY createdAt DESC LIMIT 10', [userId]);

    res.json({
      success: true,
      stats: {
        totalCustomers: totalCustomers.count,
        activeCustomers: activeCustomers.count,
        totalDeals: totalDeals.count,
        wonDeals: wonDeals.count,
        totalRevenue: totalRevenue.total,
        pendingTasks: pendingTasks.count,
        overdueTasks: overdueTasks.count,
        conversionRate: totalDeals.count > 0 ? Math.round((wonDeals.count / totalDeals.count) * 100) : 0
      },
      recentActivities
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sales report
router.get('/sales', (req, res) => {
  try {
    const userId = req.user.userId;
    const deals = all('SELECT * FROM deals WHERE userId = ? ORDER BY createdAt DESC', [userId]);
    
    const byStage = {};
    deals.forEach(d => {
      if (!byStage[d.stage]) byStage[d.stage] = { count: 0, value: 0 };
      byStage[d.stage].count++;
      byStage[d.stage].value += d.value || 0;
    });

    const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
    const wonValue = deals.filter(d => d.stage === 'مغلقة - ربح').reduce((sum, d) => sum + (d.value || 0), 0);

    res.json({
      success: true,
      report: {
        totalDeals: deals.length,
        totalValue,
        wonValue,
        avgDealValue: deals.length > 0 ? Math.round(totalValue / deals.length) : 0,
        byStage
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Customer report
router.get('/customers', (req, res) => {
  try {
    const userId = req.user.userId;
    const customers = all('SELECT * FROM customers WHERE userId = ?', [userId]);
    
    const byCategory = {};
    const byStatus = {};
    customers.forEach(c => {
      byCategory[c.category] = (byCategory[c.category] || 0) + 1;
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    });

    const totalValue = customers.reduce((sum, c) => sum + (c.value || 0), 0);

    res.json({
      success: true,
      report: {
        totalCustomers: customers.length,
        totalValue,
        avgCustomerValue: customers.length > 0 ? Math.round(totalValue / customers.length) : 0,
        byCategory,
        byStatus
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
