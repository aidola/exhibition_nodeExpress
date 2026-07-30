const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// 用户注册
exports.register = async (req, res) => {
  try {
    const { username, password, real_name, email, phone } = req.body;

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ code: 400, message: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword,
      real_name,
      email,
      phone,
      role: 'staff',
    });

    const token = generateToken(user);
    const { password: _, ...userData } = user.toJSON();

    res.status(201).json({
      code: 200,
      message: '注册成功',
      data: { user: userData, token },
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '注册失败: ' + error.message });
  }
};

// 用户登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ code: 400, message: '用户名或密码错误' });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({ code: 403, message: '账户已被禁用，请联系管理员' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ code: 400, message: '用户名或密码错误' });
    }

    const token = generateToken(user);
    const { password: _, ...userData } = user.toJSON();

    res.json({
      code: 200,
      message: '登录成功',
      data: { user: userData, token },
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '登录失败: ' + error.message });
  }
};

// 获取当前用户信息
exports.getCurrentUser = async (req, res) => {
  try {
    const { password: _, ...userData } = req.user.toJSON();
    res.json({ code: 200, data: userData });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取用户信息失败' });
  }
};

// 修改密码
exports.changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    const user = req.user;

    const isPasswordValid = await bcrypt.compare(old_password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ code: 400, message: '原密码错误' });
    }

    user.password = await bcrypt.hash(new_password, 10);
    await user.save();

    res.json({ code: 200, message: '密码修改成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '密码修改失败' });
  }
};

// 生成 JWT Token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'exhibition_management_jwt_secret_key_2024',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}
