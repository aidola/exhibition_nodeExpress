const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// 用户模型
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  real_name: { type: DataTypes.STRING(50), allowNull: false, comment: '真实姓名' },
  email: { type: DataTypes.STRING(100), allowNull: true },
  phone: { type: DataTypes.STRING(20), allowNull: true },
  role: { type: DataTypes.ENUM('admin', 'manager', 'staff'), defaultValue: 'staff', comment: '角色' },
  avatar: { type: DataTypes.STRING(255), allowNull: true },
  status: { type: DataTypes.ENUM('active', 'disabled'), defaultValue: 'active' },
}, { tableName: 'users', comment: '系统用户表' });

// 展会模型
const Exhibition = sequelize.define('Exhibition', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(200), allowNull: false, comment: '展会名称' },
  cover_image: { type: DataTypes.STRING(500), allowNull: true, comment: '封面图' },
  description: { type: DataTypes.TEXT, allowNull: true, comment: '展会简介' },
  location: { type: DataTypes.STRING(300), allowNull: true, comment: '举办地点' },
  start_date: { type: DataTypes.DATEONLY, allowNull: false, comment: '开始日期' },
  end_date: { type: DataTypes.DATEONLY, allowNull: false, comment: '结束日期' },
  organizer: { type: DataTypes.STRING(200), allowNull: true, comment: '主办方' },
  contact_person: { type: DataTypes.STRING(50), allowNull: true },
  contact_phone: { type: DataTypes.STRING(20), allowNull: true },
  status: { type: DataTypes.ENUM('planning', 'ongoing', 'completed', 'cancelled'), defaultValue: 'planning', comment: '展会状态' },
  is_featured: { type: DataTypes.BOOLEAN, defaultValue: false, comment: '是否推荐' },
}, { tableName: 'exhibitions', comment: '展会信息表' });

// 客户模型
const Customer = sequelize.define('Customer', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false, comment: '客户名称/公司名' },
  contact_person: { type: DataTypes.STRING(50), allowNull: true, comment: '联系人' },
  phone: { type: DataTypes.STRING(20), allowNull: true },
  email: { type: DataTypes.STRING(100), allowNull: true },
  company: { type: DataTypes.STRING(200), allowNull: true, comment: '公司名称' },
  position: { type: DataTypes.STRING(100), allowNull: true, comment: '职位' },
  industry: { type: DataTypes.STRING(100), allowNull: true, comment: '所属行业' },
  address: { type: DataTypes.STRING(300), allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true, comment: '备注' },
  source: { type: DataTypes.STRING(100), allowNull: true, comment: '客户来源' },
  level: { type: DataTypes.ENUM('VIP', 'important', 'normal'), defaultValue: 'normal', comment: '客户等级' },
  status: { type: DataTypes.ENUM('active', 'inactive', 'lost'), defaultValue: 'active' },
  exhibition_id: { type: DataTypes.INTEGER, allowNull: true, comment: '关联展会ID' },
}, { tableName: 'customers', comment: '客户信息表' });

// 活动/事件模型
const Event = sequelize.define('Event', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(200), allowNull: false, comment: '活动标题' },
  type: { type: DataTypes.ENUM('forum', 'workshop', 'speech', 'matchmaking', 'other'), defaultValue: 'other', comment: '活动类型' },
  description: { type: DataTypes.TEXT, allowNull: true, comment: '活动描述' },
  location: { type: DataTypes.STRING(300), allowNull: true, comment: '活动地点' },
  start_time: { type: DataTypes.DATE, allowNull: false, comment: '开始时间' },
  end_time: { type: DataTypes.DATE, allowNull: false, comment: '结束时间' },
  max_participants: { type: DataTypes.INTEGER, defaultValue: 0, comment: '最大报名人数，0表示不限' },
  current_participants: { type: DataTypes.INTEGER, defaultValue: 0, comment: '当前报名人数' },
  speaker: { type: DataTypes.STRING(100), allowNull: true, comment: '主讲人/嘉宾' },
  cover_image: { type: DataTypes.STRING(500), allowNull: true, comment: '封面图' },
  status: { type: DataTypes.ENUM('draft', 'published', 'cancelled', 'ended'), defaultValue: 'draft' },
  exhibition_id: { type: DataTypes.INTEGER, allowNull: false, comment: '所属展会ID' },
}, { tableName: 'events', comment: '活动/事件表' });

// 报名记录模型
const Registration = sequelize.define('Registration', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  event_id: { type: DataTypes.INTEGER, allowNull: false, comment: '活动ID' },
  customer_id: { type: DataTypes.INTEGER, allowNull: true, comment: '客户ID（如果是已有客户）' },
  name: { type: DataTypes.STRING(100), allowNull: false, comment: '报名人姓名' },
  phone: { type: DataTypes.STRING(20), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: true },
  company: { type: DataTypes.STRING(200), allowNull: true },
  position: { type: DataTypes.STRING(100), allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true, comment: '备注' },
  status: { type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'), defaultValue: 'pending' },
}, { tableName: 'registrations', comment: '活动报名表' });

// 建立关联关系
Exhibition.hasMany(Event, { foreignKey: 'exhibition_id', as: 'events' });
Event.belongsTo(Exhibition, { foreignKey: 'exhibition_id', as: 'exhibition' });

Exhibition.hasMany(Customer, { foreignKey: 'exhibition_id', as: 'customers' });
Customer.belongsTo(Exhibition, { foreignKey: 'exhibition_id', as: 'exhibition' });

Event.hasMany(Registration, { foreignKey: 'event_id', as: 'registrations' });
Registration.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

Customer.hasMany(Registration, { foreignKey: 'customer_id', as: 'registrations' });
Registration.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

module.exports = { User, Exhibition, Customer, Event, Registration, sequelize };
