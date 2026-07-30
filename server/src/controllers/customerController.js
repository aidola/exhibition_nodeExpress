const { Customer, Exhibition, Registration } = require('../models');
const { Op } = require('sequelize');

// 获取客户列表（分页 + 搜索 + 筛选）
exports.list = async (req, res) => {
  try {
    const { page = 1, page_size = 10, keyword, level, status, source, exhibition_id } = req.query;
    const where = {};

    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { contact_person: { [Op.like]: `%${keyword}%` } },
        { company: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } },
      ];
    }

    if (level) where.level = level;
    if (status) where.status = status;
    if (source) where.source = source;
    if (exhibition_id) where.exhibition_id = exhibition_id;

    const offset = (parseInt(page) - 1) * parseInt(page_size);
    const { count, rows } = await Customer.findAndCountAll({
      where,
      include: [
        { model: Exhibition, as: 'exhibition', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(page_size),
    });

    res.json({
      code: 200,
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        page_size: parseInt(page_size),
      },
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取客户列表失败: ' + error.message });
  }
};

// 获取客户详情
exports.detail = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id, {
      include: [
        { model: Exhibition, as: 'exhibition', attributes: ['id', 'name'] },
        { model: Registration, as: 'registrations' },
      ],
    });

    if (!customer) {
      return res.status(404).json({ code: 404, message: '客户不存在' });
    }

    res.json({ code: 200, data: customer });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取客户详情失败' });
  }
};

// 创建客户
exports.create = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ code: 200, message: '客户创建成功', data: customer });
  } catch (error) {
    res.status(500).json({ code: 500, message: '创建客户失败: ' + error.message });
  }
};

// 更新客户
exports.update = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ code: 404, message: '客户不存在' });
    }

    await customer.update(req.body);
    res.json({ code: 200, message: '客户更新成功', data: customer });
  } catch (error) {
    res.status(500).json({ code: 500, message: '更新客户失败: ' + error.message });
  }
};

// 删除客户
exports.delete = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ code: 404, message: '客户不存在' });
    }

    await customer.destroy();
    res.json({ code: 200, message: '客户删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '删除客户失败: ' + error.message });
  }
};

// 导入客户（批量创建）
exports.batchImport = async (req, res) => {
  try {
    const { customers } = req.body;
    if (!customers || !Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({ code: 400, message: '请提供有效的客户数据' });
    }

    const createdCustomers = await Customer.bulkCreate(customers);
    res.status(201).json({
      code: 200,
      message: `成功导入 ${createdCustomers.length} 位客户`,
      data: createdCustomers,
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '批量导入失败: ' + error.message });
  }
};

// 客户统计数据
exports.stats = async (req, res) => {
  try {
    const total = await Customer.count();
    const active = await Customer.count({ where: { status: 'active' } });
    const inactive = await Customer.count({ where: { status: 'inactive' } });
    const vip = await Customer.count({ where: { level: 'VIP' } });
    const important = await Customer.count({ where: { level: 'important' } });

    res.json({
      code: 200,
      data: { total, active, inactive, vip, important },
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取统计数据失败' });
  }
};
