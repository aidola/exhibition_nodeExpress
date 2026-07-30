const jwt = require('jsonwebtoken');
const { User } = require('../models');

// JWT 认证中间件
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ code: 401, message: '未提供认证令牌' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'exhibition_management_jwt_secret_key_2024');

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user || user.status === 'disabled') {
      return res.status(401).json({ code: 401, message: '用户不存在或已被禁用' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 401, message: '令牌已过期，请重新登录' });
    }
    return res.status(401).json({ code: 401, message: '无效的认证令牌' });
  }
};

// 角色权限中间件
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ code: 401, message: '请先登录' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ code: 403, message: '无权限执行此操作' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
