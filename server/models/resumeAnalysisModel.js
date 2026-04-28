const { ObjectId } = require("mongodb");
const { getDB } = require("../db/db");

class ResumeAnalysisModel {
  constructor() {
    this.collectionName = "resume_analysis";
  }

  // 获取集合
  getCollection() {
    if (!this.collection) {
      this.collection = getDB().collection(this.collectionName);
    }
    return this.collection;
  }

  // 初始化集合索引
  async initializeIndexes() {
    try {
      const collection = this.getCollection();

      // 创建 resumeId 普通索引
      await collection.createIndex({ resumeId: 1 }, { name: "idx_resume_analysis_resume_id" });

      // 创建 ruleId 普通索引
      await collection.createIndex({ ruleId: 1 }, { name: "idx_resume_analysis_rule_id" });

      // 创建 totalScore 普通索引
      await collection.createIndex({ totalScore: 1 }, { name: "idx_resume_analysis_total_score" });

      // 创建 recommendation 普通索引
      await collection.createIndex({ recommendation: 1 }, { name: "idx_resume_analysis_recommendation" });

      console.log("Resume analysis indexes initialized successfully");
    } catch (error) {
      console.error("Error initializing resume analysis indexes:", error);
    }
  }

  // 创建简历分析结果
  async createResumeAnalysis(analysisData) {
    try {
      const collection = this.getCollection();

      // 构建简历分析文档对象
      const analysis = {
        // 关联简历ID
        resumeId: new ObjectId(analysisData.resumeId),
        // 使用的规则ID
        ruleId: analysisData.ruleId ? new ObjectId(analysisData.ruleId) : null,
        // 分析结果
        skillMatchScore: analysisData.skillMatchScore || 0,
        willingnessScore: analysisData.willingnessScore || 0,
        experienceScore: analysisData.experienceScore || 0,
        totalScore: analysisData.totalScore || 0,
        matchedSkills: analysisData.matchedSkills || [],
        missingSkills: analysisData.missingSkills || [],
        bonusSignals: analysisData.bonusSignals || [],
        tags: analysisData.tags || [],
        recommendation: analysisData.recommendation || "consider",
        explanation: analysisData.explanation || "",
        // 创建时间
        createdAt: new Date(),
      };

      // 向数据库插入分析文档
      const result = await collection.insertOne(analysis);
      // 返回完整的分析对象，包含 MongoDB 自动生成的 _id
      return {
        ...analysis,
        _id: result.insertedId,
      };
    } catch (error) {
      console.error("Error creating resume analysis:", error);
      throw error;
    }
  }

  // 根据分析ID查找简历分析结果
  async findResumeAnalysisById(analysisId) {
    try {
      const collection = this.getCollection();
      const analysis = await collection.findOne({
        _id: new ObjectId(analysisId),
      });
      return analysis;
    } catch (error) {
      console.error("Error finding resume analysis by id:", error);
      throw error;
    }
  }

  // 根据简历ID查找简历分析结果
  async findResumeAnalysisByResumeId(resumeId) {
    try {
      const collection = this.getCollection();
      const analysis = await collection.findOne({
        resumeId: new ObjectId(resumeId),
      });
      return analysis;
    } catch (error) {
      console.error("Error finding resume analysis by resume id:", error);
      throw error;
    }
  }

  // 根据规则ID查找简历分析结果列表
  async findResumeAnalysesByRuleId(ruleId) {
    try {
      const collection = this.getCollection();
      const analyses = await collection
        .find({
          ruleId: new ObjectId(ruleId),
        })
        .toArray();
      return analyses;
    } catch (error) {
      console.error("Error finding resume analyses by rule id:", error);
      throw error;
    }
  }

  // 更新简历分析结果
  async updateResumeAnalysis(analysisId, updateData) {
    try {
      const collection = this.getCollection();

      // 构建更新对象
      const update = {
        $set: {
          ...updateData,
        },
      };

      // 如果更新数据中包含 ObjectId 类型的字段，需要转换
      if (updateData.resumeId) {
        update.$set.resumeId = new ObjectId(updateData.resumeId);
      }
      if (updateData.ruleId !== undefined) {
        update.$set.ruleId = updateData.ruleId ? new ObjectId(updateData.ruleId) : null;
      }

      // 执行更新操作
      const result = await collection.updateOne(
        { _id: new ObjectId(analysisId) },
        update,
      );

      // 返回更新后的分析结果
      if (result.matchedCount > 0) {
        return await this.findResumeAnalysisById(analysisId);
      }
      return null;
    } catch (error) {
      console.error("Error updating resume analysis:", error);
      throw error;
    }
  }

  // 删除简历分析结果
  async deleteResumeAnalysis(analysisId) {
    try {
      const collection = this.getCollection();
      const result = await collection.deleteOne({
        _id: new ObjectId(analysisId),
      });
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting resume analysis:", error);
      throw error;
    }
  }

  // 获取所有简历分析结果
  async findAllResumeAnalyses() {
    try {
      const collection = this.getCollection();
      const analyses = await collection.find({}).toArray();
      return analyses;
    } catch (error) {
      console.error("Error finding all resume analyses:", error);
      throw error;
    }
  }

  // 根据推荐意见查找简历分析结果
  async findResumeAnalysesByRecommendation(recommendation) {
    try {
      const collection = this.getCollection();
      const analyses = await collection
        .find({ recommendation })
        .toArray();
      return analyses;
    } catch (error) {
      console.error("Error finding resume analyses by recommendation:", error);
      throw error;
    }
  }

  // 按综合总分排序查找简历分析结果
  async findResumeAnalysesByTotalScoreDesc(ruleId) {
    try {
      const collection = this.getCollection();
      const analyses = await collection
        .find(ruleId ? { ruleId: new ObjectId(ruleId) } : {})
        .sort({ totalScore: -1 })
        .toArray();
      return analyses;
    } catch (error) {
      console.error("Error finding resume analyses by total score:", error);
      throw error;
    }
  }

  // 删除指定简历的分析结果
  async deleteResumeAnalysisByResumeId(resumeId) {
    try {
      const collection = this.getCollection();
      const result = await collection.deleteOne({
        resumeId: new ObjectId(resumeId),
      });
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting resume analysis by resume id:", error);
      throw error;
    }
  }
}

module.exports = new ResumeAnalysisModel();