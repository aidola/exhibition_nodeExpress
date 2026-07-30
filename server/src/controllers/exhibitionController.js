const { Exhibition, Event, Customer } = require('../models');
const { Op } = require('sequelize');

// 获取展会列表（分页 + 搜索 + 筛选）
exports.list = async (req, res) => {
  try {
    const { page = 1, page_size = 10, keyword, status, sort = 'createdAt', order = 'DESC' } = req.query;
    const where = {};

    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { organizer: { [Op.like]: `%${keyword}%` } },
        { location: { [Op.like]: `%${keyword}%` } },
      ];
    }

    if (status) where.status = status;

    const offset = (parseInt(page) - 1) * parseInt(page_size);
    const { count, rows } = await Exhibition.findAndCountAll({
      where,
      order: [[sort, order]],
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
    res.status(500).json({ code: 500, message: '获取展会列表失败: ' + error.message });
  }
};

// 获取所有展会（下拉选择用）
exports.all = async (req, res) => {
  try {
    const exhibitions = await Exhibition.findAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'name', 'start_date', 'end_date', 'status'],
    });
    res.json({ code: 200, data: exhibitions });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取展会列表失败' });
  }
};

// 获取展会详情
exports.detail = async (req, res) => {
  try {
    const exhibition = await Exhibition.findByPk(req.params.id, {
      include: [
        { model: Event, as: 'events', attributes: ['id', 'title', 'type', 'start_time', 'end_time', 'status'] },
        { model: Customer, as: 'customers', attributes: ['id', 'name', 'contact_person', 'level'] },
      ],
    });

    if (!exhibition) {
      return res.status(404).json({ code: 404, message: '展会不存在' });
    }

    res.json({ code: 200, data: exhibition });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取展会详情失败' });
  }
};

// 创建展会
exports.create = async (req, res) => {
  try {
    const exhibition = await Exhibition.create(req.body);
    res.status(201).json({ code: 200, message: '展会创建成功', data: exhibition });
  } catch (error) {
    res.status(500).json({ code: 500, message: '创建展会失败: ' + error.message });
  }
};

// 更新展会
exports.update = async (req, res) => {
  try {
    const exhibition = await Exhibition.findByPk(req.params.id);
    if (!exhibition) {
      return res.status(404).json({ code: 404, message: '展会不存在' });
    }

    await exhibition.update(req.body);
    res.json({ code: 200, message: '展会更新成功', data: exhibition });
  } catch (error) {
    res.status(500).json({ code: 500, message: '更新展会失败: ' + error.message });
  }
};

// 删除展会
exports.delete = async (req, res) => {
  try {
    const exhibition = await Exhibition.findByPk(req.params.id);
    if (!exhibition) {
      return res.status(404).json({ code: 404, message: '展会不存在' });
    }

    await exhibition.destroy();
    res.json({ code: 200, message: '展会删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '删除展会失败: ' + error.message });
  }
};

// 展会统计数据
exports.stats = async (req, res) => {
  try {
    const total = await Exhibition.count();
    const planning = await Exhibition.count({ where: { status: 'planning' } });
    const ongoing = await Exhibition.count({ where: { status: 'ongoing' } });
    const completed = await Exhibition.count({ where: { status: 'completed' } });

    res.json({
      code: 200,
      data: { total, planning, ongoing, completed },
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取统计数据失败' });
  }
};
