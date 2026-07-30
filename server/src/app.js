const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { sequelize, testConnection } = require('./config/database');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务（上传文件访问）
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API 路由
app.use('/api', routes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 生产环境下托管前端静态文件
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 处理
app.use((req, res) => {
  res.status(404).json({ code: 404, message: '请求的接口不存在' });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ code: 500, message: '服务器内部错误' });
});

// 启动服务
const startServer = async () => {
  try {
    // 测试数据库连接
    await testConnection();

    // 同步数据库模型（开发环境使用 force: true 会重建表）
    await sequelize.sync({ alter: true });
    console.log('✅ 数据库表同步完成');

    app.listen(PORT, () => {
      console.log(`🚀 服务已启动: http://localhost:${PORT}`);
      console.log(`📡 API 地址: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ 服务启动失败:', error);
    process.exit(1);
  }
};

startServer();
