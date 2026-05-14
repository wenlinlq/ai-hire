// 导入阿里云百炼服务
const aliyunBailianService = require('../services/aliyunBailianService');

class AIChatController {
  // 处理智能问答请求（非流式）
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

  // 处理智能问答请求（SSE 流式）
  async askQuestionStream(req, res) {
    try {
      const { question, context } = req.body;

      if (!question || question.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: '请提供问题内容',
        });
      }

      // 设置 SSE 响应头
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');

      // 调用流式问答服务
      await aliyunBailianService.askQuestionStream(question, context, (chunk) => {
        // 发送 SSE 数据
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      });

      // 发送结束信号
      res.write(`data: ${JSON.stringify({ content: '[DONE]' })}\n\n`);
      res.end();
    } catch (error) {
      console.error('Error in askQuestionStream:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: '处理问题时出错',
        });
      } else {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }
    }
  }
}

module.exports = new AIChatController();
