// 导入阿里云百炼服务
const aliyunBailianService = require('../services/aliyunBailianService');

class AIChatController {
  // 处理智能问答请求
  async askQuestion(req, res) {
    try {
      const { question, context } = req.body;

      if (!question || question.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: '请提供问题内容',
        });
      }

      // 调用智能问答服务
      const answer = await aliyunBailianService.askQuestion(question, context);

      res.json({
        success: true,
        answer: answer,
      });
    } catch (error) {
      console.error('Error in askQuestion:', error);
      res.status(500).json({
        success: false,
        message: '处理问题时出错',
      });
    }
  }
}

module.exports = new AIChatController();
