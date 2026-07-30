const { Exhibition, Customer, Event, Registration } = require('../models');
const { Op } = require('sequelize');

// 仪表盘统计数据
exports.stats = async (req, res) => {
  try {
    const [
      totalExhibitions,
      ongoingExhibitions,
      totalCustomers,
      vipCustomers,
      totalEvents,
      todayEvents,
      totalRegistrations,
      todayRegistrations,
    ] = await Promise.all([
      Exhibition.count(),
      Exhibition.count({ where: { status: 'ongoing' } }),
      Customer.count(),
      Customer.count({ where: { level: 'VIP' } }),
      Event.count(),
      Event.count({
        where: {
          start_time: {
            [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
            [Op.lte]: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      Registration.count(),
      Registration.count({
        where: {
          createdAt: {
            [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
            [Op.lte]: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
    ]);

    // 近期展会
    const recentExhibitions = await Exhibition.findAll({
      order: [['start_date', 'DESC']],
      limit: 5,
      attributes: ['id', 'name', 'start_date', 'end_date', 'status'],
    });

    // 近期活动
    const recentEvents = await Event.findAll({
      where: { status: 'published' },
      order: [['start_time', 'ASC']],
      limit: 5,
      include: [
        { model: Exhibition, as: 'exhibition', attributes: ['id', 'name'] },
      ],
    });

    // 最近报名
    const recentRegistrations = await Registration.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [
        { model: Event, as: 'event', attributes: ['id', 'title'] },
      ],
    });

    res.json({
      code: 200,
      data: {
        counts: {
          totalExhibitions,
          ongoingExhibitions,
          totalCustomers,
          vipCustomers,
          totalEvents,
          todayEvents,
          totalRegistrations,
          todayRegistrations,
        },
        recentExhibitions,
        recentEvents,
        recentRegistrations,
      },
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取仪表盘数据失败: ' + error.message });
  }
};
