const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { authenticate, authorize } = require('../middleware/auth');
const { User, Exhibition, Event } = require('../models');

// 确保 uploads 目录存在
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 允许的图片 MIME 类型
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
];

// 最大文件大小：10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// multer 配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：UUID + 原始扩展名
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const uniqueName = crypto.randomUUID() + ext;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${file.mimetype}，仅允许上传图片文件`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// POST /api/upload — 上传单张图片
router.post('/', (req, res) => {
  upload.single('file')(req, res, (err) => {
    // multer 错误处理
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ code: 400, message: '文件大小超过 10MB 限制' });
        }
        return res.status(400).json({ code: 400, message: `上传错误: ${err.message}` });
      }
      return res.status(400).json({ code: 400, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ code: 400, message: '请选择要上传的图片文件' });
    }

    const { filename, size, mimetype } = req.file;
    const url = `/uploads/${filename}`;

    res.json({
      code: 200,
      message: '上传成功',
      data: {
        filename,
        url,
        size,
        mimetype,
      },
    });
  });
});

// DELETE /api/upload/cleanup — 清理未使用的图片（仅管理员）
// ⚠️ 必须放在 /:filename 之前，否则 Express 会把 "cleanup" 当作文件名参数匹配
router.delete('/cleanup', authenticate, authorize('admin'), async (req, res) => {
  try {
    // 1. 收集数据库中所有引用的图片 URL
    const referencedUrls = new Set();

    // User.avatar
    const users = await User.findAll({ attributes: ['avatar'], where: { avatar: { [Op.ne]: null } } });
    users.forEach(u => { if (u.avatar) referencedUrls.add(u.avatar); });

    // Exhibition.cover_image
    const exhibitions = await Exhibition.findAll({ attributes: ['cover_image'], where: { cover_image: { [Op.ne]: null } } });
    exhibitions.forEach(e => { if (e.cover_image) referencedUrls.add(e.cover_image); });

    // Event.cover_image
    const events = await Event.findAll({ attributes: ['cover_image'], where: { cover_image: { [Op.ne]: null } } });
    events.forEach(e => { if (e.cover_image) referencedUrls.add(e.cover_image); });

    // 2. 从 URL 中提取文件名（URL 格式为 /uploads/xxx.png）
    const referencedFiles = new Set();
    for (const url of referencedUrls) {
      const filename = url.replace(/^\/uploads\//, '').split('?')[0]; // 去掉查询参数
      referencedFiles.add(filename);
    }

    // 3. 扫描 uploads 目录
    const allFiles = fs.readdirSync(uploadsDir).filter(f => f !== '.gitkeep');

    // 4. 找出未引用的文件并删除
    const deletedFiles = [];
    for (const file of allFiles) {
      if (!referencedFiles.has(file)) {
        const filePath = path.join(uploadsDir, file);
        try {
          fs.unlinkSync(filePath);
          deletedFiles.push(file);
        } catch (err) {
          console.error(`删除文件失败: ${file}`, err.message);
        }
      }
    }

    res.json({
      code: 200,
      message: `清理完成，共删除 ${deletedFiles.length} 个未使用的文件`,
      data: {
        total: allFiles.length,
        deleted: deletedFiles.length,
        kept: allFiles.length - deletedFiles.length,
        deletedFiles,
      },
    });
  } catch (error) {
    console.error('清理图片失败:', error);
    res.status(500).json({ code: 500, message: '清理图片失败: ' + error.message });
  }
});

// DELETE /api/upload/:filename — 删除已上传的文件
router.delete('/:filename', (req, res) => {
  const { filename } = req.params;

  // 防止路径穿越攻击
  if (filename.includes('..') || filename.includes('/')) {
    return res.status(400).json({ code: 400, message: '无效的文件名' });
  }

  const filePath = path.join(uploadsDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ code: 404, message: '文件不存在' });
  }

  fs.unlinkSync(filePath);
  res.json({ code: 200, message: '删除成功' });
});

module.exports = router;
