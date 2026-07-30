const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { User, Exhibition, Customer, Event, Registration, sequelize } = require('./models');

const seedData = async () => {
  try {
    // 同步数据库
    await sequelize.sync({ force: true });
    console.log('✅ 数据库表已重建');

    // 创建默认管理员用户
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      username: 'admin',
      password: adminPassword,
      real_name: '系统管理员',
      email: 'admin@expo.com',
      phone: '13800000000',
      role: 'admin',
    });
    console.log('✅ 默认管理员创建成功: admin / admin123');

    // 创建测试展会
    const exhibition1 = await Exhibition.create({
      name: '2024 国际科技创新博览会',
      description: '汇聚全球前沿科技，展示人工智能、区块链、物联网等最新技术成果，搭建产学研合作平台。',
      location: '北京国家会议中心',
      start_date: '2024-09-15',
      end_date: '2024-09-18',
      organizer: '中国科技创新协会',
      contact_person: '张经理',
      contact_phone: '13900000001',
      status: 'ongoing',
      is_featured: true,
    });

    const exhibition2 = await Exhibition.create({
      name: '2024 华南智能制造展览会',
      description: '聚焦工业4.0与智能制造，展示工业机器人、自动化设备、数字化工厂解决方案。',
      location: '广州琶洲国际会展中心',
      start_date: '2024-10-20',
      end_date: '2024-10-23',
      organizer: '广东省工业和信息化厅',
      contact_person: '李经理',
      contact_phone: '13900000002',
      status: 'planning',
      is_featured: true,
    });

    const exhibition3 = await Exhibition.create({
      name: '2024 新能源与绿色科技展',
      description: '展示太阳能、风能、储能等新能源技术，推动绿色低碳发展。',
      location: '上海新国际博览中心',
      start_date: '2024-03-10',
      end_date: '2024-03-13',
      organizer: '中国能源研究会',
      contact_person: '王经理',
      contact_phone: '13900000003',
      status: 'completed',
      is_featured: false,
    });

    // 创建测试活动
    await Event.create({
      title: 'AI大模型创新应用论坛',
      type: 'forum',
      description: '探讨GPT等大模型在企业级应用中的实践与挑战，分享落地案例。',
      location: '北京国家会议中心 3F 报告厅',
      start_time: new Date('2024-09-15 09:00'),
      end_time: new Date('2024-09-15 12:00'),
      max_participants: 200,
      current_participants: 0,
      speaker: '陈教授 - 清华大学AI研究院',
      status: 'published',
      exhibition_id: exhibition1.id,
    });

    await Event.create({
      title: '智能机器人技术研讨会',
      type: 'workshop',
      description: '动手体验工业机器人编程，学习机器视觉与运动控制。',
      location: '广州琶洲国际会展中心 B区 工作坊',
      start_time: new Date('2024-10-20 14:00'),
      end_time: new Date('2024-10-20 17:00'),
      max_participants: 50,
      current_participants: 0,
      speaker: '刘博士 - 华南理工大学',
      status: 'published',
      exhibition_id: exhibition2.id,
    });

    await Event.create({
      title: '投融资对接会',
      type: 'matchmaking',
      description: '为参展企业和投资机构搭建一对一对接平台，促进科技成果转化。',
      location: '北京国家会议中心 1F 贵宾厅',
      start_time: new Date('2024-09-16 14:00'),
      end_time: new Date('2024-09-16 17:30'),
      max_participants: 100,
      current_participants: 0,
      speaker: '',
      status: 'published',
      exhibition_id: exhibition1.id,
    });

    // 创建测试客户
    await Customer.create({
      name: '深圳创新科技有限公司',
      contact_person: '赵总',
      phone: '13800138001',
      email: 'zhao@inovatect.com',
      company: '深圳创新科技有限公司',
      position: 'CEO',
      industry: '人工智能',
      address: '深圳市南山区科技园',
      level: 'VIP',
      source: '展会邀约',
      exhibition_id: exhibition1.id,
    });

    await Customer.create({
      name: '北京智能制造集团',
      contact_person: '钱经理',
      phone: '13800138002',
      email: 'qian@bjsmart.com',
      company: '北京智能制造集团',
      position: '技术总监',
      industry: '智能制造',
      address: '北京市海淀区中关村',
      level: 'important',
      source: '线上注册',
      exhibition_id: exhibition2.id,
    });

    await Customer.create({
      name: '上海新能源科技有限公司',
      contact_person: '孙工程师',
      phone: '13800138003',
      email: 'sun@shnewenergy.com',
      company: '上海新能源科技有限公司',
      position: '研发经理',
      industry: '新能源',
      level: 'normal',
      source: '合作伙伴推荐',
      exhibition_id: exhibition3.id,
    });

    console.log('✅ 测试数据创建完成');
    console.log('\n📋 登录信息:');
    console.log('   用户名: admin');
    console.log('   密码: admin123');
    console.log('\n🎯 默认创建了:');
    console.log('   - 1个管理员账号');
    console.log('   - 3个展会');
    console.log('   - 3个活动');
    console.log('   - 3个客户');

    process.exit(0);
  } catch (error) {
    console.error('❌ 数据初始化失败:', error);
    process.exit(1);
  }
};

seedData();
