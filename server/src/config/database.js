const { Sequelize } = require('sequelize');
// require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') });

const config = {
  dialect: process.env.DB_DIALECT || 'sqlite',
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
};

if (config.dialect === 'sqlite') {
  config.storage = process.env.DB_STORAGE || './database.sqlite';
} else {
  config.host = process.env.DB_HOST || 'localhost';
  config.port = process.env.DB_PORT || 3306;
  config.database = process.env.DB_NAME || 'exhibition_db';
  config.username = process.env.DB_USER || 'root';
  config.password = process.env.DB_PASSWORD || '';
}

const sequelize = new Sequelize(config);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
  }
};

module.exports = { sequelize, testConnection };
