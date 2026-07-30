const { Event, Exhibition, Registration } = require('../models');
const { Op } = require('sequelize');

// 获取活动列表（分页 + 搜索 + 筛选）
exports.list = async (req, res) => {
  try {
    const { page = 1, page_size = 10, keyword, type, status, exhibition_id } = req.query;
    const where = {};

    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { speaker: { [Op.like]: `%${keyword}%` } },
      ];
    }

    if (type) where.type = type;
    if (status) where.status = status;
    if (exhibition_id) where.exhibition_id = exhibition_id;

    const offset = (parseInt(page) - 1) * parseInt(page_size);
    const { count, rows } = await Event.findAndCountAll({
      where,
      include: [
        { model: Exhibition, as: 'exhibition', attributes: ['id', 'name'] },
      ],
      order: [['start_time', 'DESC']],
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
    res.status(500).json({ code: 500, message: '获取活动列表失败: ' + error.message });
  }
};

// 获取活动详情
exports.detail = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        { model: Exhibition, as: 'exhibition', attributes: ['id', 'name', 'location'] },
        {
          model: Registration,
          as: 'registrations',
          order: [['createdAt', 'DESC']],
          limit: 50,
        },
      ],
    });

    if (!event) {
      return res.status(404).json({ code: 404, message: '活动不存在' });
    }

    res.json({ code: 200, data: event });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取活动详情失败' });
  }
};

// 创建活动
exports.create = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json({ code: 200, message: '活动创建成功', data: event });
  } catch (error) {
    res.status(500).json({ code: 500, message: '创建活动失败: ' + error.message });
  }
};

// 更新活动
exports.update = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ code: 404, message: '活动不存在' });
    }

    await event.update(req.body);
    res.json({ code: 200, message: '活动更新成功', data: event });
  } catch (error) {
    res.status(500).json({ code: 500, message: '更新活动失败: ' + error.message });
  }
};

// 删除活动
exports.delete = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ code: 404, message: '活动不存在' });
    }

    await event.destroy();
    res.json({ code: 200, message: '活动删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '删除活动失败: ' + error.message });
  }
};

// 活动报名
exports.register = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ code: 404, message: '活动不存在' });
    }

    if (event.status !== 'published') {
      return res.status(400).json({ code: 400, message: '该活动暂未开放报名' });
    }

    if (event.max_participants > 0 && event.current_participants >= event.max_participants) {
      return res.status(400).json({ code: 400, message: '报名人数已满' });
    }

    const registration = await Registration.create({
      event_id: event.id,
      ...req.body,
    });

    // 更新当前报名人数
    event.current_participants = (event.current_participants || 0) + 1;
    await event.save();

    res.status(201).json({ code: 200, message: '报名成功', data: registration });
  } catch (error) {
    res.status(500).json({ code: 500, message: '报名失败: ' + error.message });
  }
};

// 获取报名列表
exports.registrationList = async (req, res) => {
  try {
    const { page = 1, page_size = 10, event_id, status } = req.query;
    const where = {};

    if (event_id) where.event_id = event_id;
    if (status) where.status = status;

    const offset = (parseInt(page) - 1) * parseInt(page_size);
    const { count, rows } = await Registration.findAndCountAll({
      where,
      include: [
        { model: Event, as: 'event', attributes: ['id', 'title'] },
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
    res.status(500).json({ code: 500, message: '获取报名列表失败' });
  }
};

// 更新报名状态
exports.updateRegistration = async (req, res) => {
  try {
    const registration = await Registration.findByPk(req.params.regId);
    if (!registration) {
      return res.status(404).json({ code: 404, message: '报名记录不存在' });
    }

    await registration.update({ status: req.body.status });
    res.json({ code: 200, message: '状态更新成功', data: registration });
  } catch (error) {
    res.status(500).json({ code: 500, message: '状态更新失败' });
  }
};

// 活动统计数据
exports.stats = async (req, res) => {
  try {
    const total = await Event.count();
    const published = await Event.count({ where: { status: 'published' } });
    const ended = await Event.count({ where: { status: 'ended' } });
    const totalRegistrations = await Registration.count();

    res.json({
      code: 200,
      data: { total, published, ended, totalRegistrations },
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取统计数据失败' });
  }
};
