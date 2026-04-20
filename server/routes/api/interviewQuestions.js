const express = require('express');
const router = express.Router();
const aliyunBailianService = require('../../services/aliyunBailianService');

// 生成面试问题
router.post('/generate-questions', async (req, res) => {
  try {
    const { type, subType, count = 5 } = req.body;
    
    if (!type) {
      return res.status(400).json({ error: '面试类型不能为空' });
    }
    
    const result = await aliyunBailianService.generateInterviewQuestions(type, subType, count);
    res.json(result);
  } catch (error) {
    console.error('生成面试问题失败:', error);
    res.status(500).json({ error: '生成面试问题失败' });
  }
});

// 生成笔试题
router.post('/generate-written-test', async (req, res) => {
  try {
    const { type, count = 15 } = req.body;
    
    if (!type) {
      return res.status(400).json({ error: '面试类型不能为空' });
    }
    
    const result = await aliyunBailianService.generateWrittenTest(type, count);
    res.json(result);
  } catch (error) {
    console.error('生成笔试题失败:', error);
    res.status(500).json({ error: '生成笔试题失败' });
  }
});

module.exports = router;