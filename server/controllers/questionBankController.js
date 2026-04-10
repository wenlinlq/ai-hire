const QuestionBank = require("../models/questionBankModel");

// 获取所有面试题库
exports.getAllQuestionBanks = async (req, res) => {
  try {
    const questionBanks = await QuestionBank.getAllQuestionBanks();
    res.status(200).json({
      success: true,
      data: questionBanks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "获取面试题库失败",
      error: error.message,
    });
  }
};

// 根据ID获取面试题库
exports.getQuestionBankById = async (req, res) => {
  try {
    const questionBank = await QuestionBank.findQuestionBankById(req.params.id);
    if (!questionBank) {
      return res.status(404).json({
        success: false,
        message: "面试题库不存在",
      });
    }
    res.status(200).json({
      success: true,
      data: questionBank,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "获取面试题库失败",
      error: error.message,
    });
  }
};

// 创建面试题库
exports.createQuestionBank = async (req, res) => {
  try {
    const { title, type, category, teamId, questions } = req.body;

    const questionBank = await QuestionBank.createQuestionBank({
      title,
      type,
      category,
      teamId,
      questions,
    });

    res.status(201).json({
      success: true,
      message: "面试题库创建成功",
      data: questionBank,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "创建面试题库失败",
      error: error.message,
    });
  }
};

// 更新面试题库
exports.updateQuestionBank = async (req, res) => {
  try {
    const { title, type, category, teamId, questions } = req.body;

    const questionBank = await QuestionBank.updateQuestionBank(req.params.id, {
      title,
      type,
      category,
      teamId,
      questions,
    });

    if (!questionBank) {
      return res.status(404).json({
        success: false,
        message: "面试题库不存在",
      });
    }

    res.status(200).json({
      success: true,
      message: "面试题库更新成功",
      data: questionBank,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "更新面试题库失败",
      error: error.message,
    });
  }
};

// 删除面试题库
exports.deleteQuestionBank = async (req, res) => {
  try {
    const result = await QuestionBank.deleteQuestionBank(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "面试题库不存在",
      });
    }

    res.status(200).json({
      success: true,
      message: "面试题库删除成功",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "删除面试题库失败",
      error: error.message,
    });
  }
};

// 根据团队ID获取面试题库
exports.getQuestionBanksByTeamId = async (req, res) => {
  try {
    const questionBanks = await QuestionBank.getQuestionBanksByTeamId(
      req.params.teamId,
    );
    res.status(200).json({
      success: true,
      data: questionBanks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "获取面试题库失败",
      error: error.message,
    });
  }
};

// 根据分类获取面试题库
exports.getQuestionBanksByCategory = async (req, res) => {
  try {
    const questionBanks = await QuestionBank.getQuestionBanksByCategory(
      req.params.category,
    );
    res.status(200).json({
      success: true,
      data: questionBanks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "获取面试题库失败",
      error: error.message,
    });
  }
};

// 搜索面试题库
exports.searchQuestionBanks = async (req, res) => {
  try {
    const { keyword } = req.query;
    const questionBanks = await QuestionBank.searchQuestionBanks(keyword);
    res.status(200).json({
      success: true,
      data: questionBanks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "搜索面试题库失败",
      error: error.message,
    });
  }
};
