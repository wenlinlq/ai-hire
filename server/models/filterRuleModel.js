const { ObjectId } = require("mongodb");
const { getDB } = require("../db/db");

class FilterRuleModel {
  constructor() {
    this.collectionName = "filter_rules";
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

      // 创建 teamId 普通索引
      await collection.createIndex({ teamId: 1 }, { name: "idx_filter_rule_team_id" });

      // 创建 positionId 普通索引
      await collection.createIndex({ positionId: 1 }, { name: "idx_filter_rule_position_id" });

      // 创建 status 普通索引
      await collection.createIndex({ status: 1 }, { name: "idx_filter_rule_status" });

      console.log("Filter rule indexes initialized successfully");
    } catch (error) {
      console.error("Error initializing filter rule indexes:", error);
    }
  }

  // 创建筛选规则
  async createFilterRule(ruleData) {
    try {
      const collection = this.getCollection();

      // 构建筛选规则文档对象
      const rule = {
        // 团队ID
        teamId: new ObjectId(ruleData.teamId),
        // 关联岗位（可为空，表示团队默认规则）
        positionId: ruleData.positionId ? new ObjectId(ruleData.positionId) : null,
        // 规则名称
        name: ruleData.name || "",
        // 硬性条件
        requiredSkills: ruleData.requiredSkills || [],
        requiredMajor: ruleData.requiredMajor || [],
        requiredGrade: ruleData.requiredGrade || [],
        // 加分条件
        bonusSkills: ruleData.bonusSkills || [],
        bonusBehaviors: ruleData.bonusBehaviors || [],
        // 权重配置
        weightSkill: ruleData.weightSkill !== undefined ? ruleData.weightSkill : 40,
        weightWillingness: ruleData.weightWillingness !== undefined ? ruleData.weightWillingness : 30,
        weightExperience: ruleData.weightExperience !== undefined ? ruleData.weightExperience : 30,
        // 筛选策略
        mode: ruleData.mode || "balanced",
        minScore: ruleData.minScore !== undefined ? ruleData.minScore : 60,
        autoReject: ruleData.autoReject !== undefined ? ruleData.autoReject : true,
        // 状态
        status: ruleData.status || "active",
        // 创建时间
        createdAt: new Date(),
        // 更新时间
        updatedAt: new Date(),
      };

      // 向数据库插入规则文档
      const result = await collection.insertOne(rule);
      // 返回完整的规则对象，包含 MongoDB 自动生成的 _id
      return {
        ...rule,
        _id: result.insertedId,
      };
    } catch (error) {
      console.error("Error creating filter rule:", error);
      throw error;
    }
  }

  // 根据规则ID查找筛选规则
  async findFilterRuleById(ruleId) {
    try {
      const collection = this.getCollection();
      const rule = await collection.findOne({
        _id: new ObjectId(ruleId),
      });
      return rule;
    } catch (error) {
      console.error("Error finding filter rule by id:", error);
      throw error;
    }
  }

  // 根据团队ID查找筛选规则
  async findFilterRulesByTeamId(teamId) {
    try {
      const collection = this.getCollection();
      const rules = await collection
        .find({
          teamId: new ObjectId(teamId),
        })
        .toArray();
      return rules;
    } catch (error) {
      console.error("Error finding filter rules by team id:", error);
      throw error;
    }
  }

  // 根据岗位ID查找筛选规则
  async findFilterRuleByPositionId(positionId) {
    try {
      const collection = this.getCollection();
      const rule = await collection.findOne({
        positionId: new ObjectId(positionId),
      });
      return rule;
    } catch (error) {
      console.error("Error finding filter rule by position id:", error);
      throw error;
    }
  }

  // 获取团队的默认筛选规则
  async findDefaultRuleByTeamId(teamId) {
    try {
      const collection = this.getCollection();
      const rule = await collection.findOne({
        teamId: new ObjectId(teamId),
        positionId: null,
      });
      return rule;
    } catch (error) {
      console.error("Error finding default filter rule by team id:", error);
      throw error;
    }
  }

  // 更新筛选规则
  async updateFilterRule(ruleId, updateData) {
    try {
      const collection = this.getCollection();

      // 构建更新对象
      const update = {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      };

      // 如果更新数据中包含 ObjectId 类型的字段，需要转换
      if (updateData.teamId) {
        update.$set.teamId = new ObjectId(updateData.teamId);
      }
      if (updateData.positionId !== undefined) {
        update.$set.positionId = updateData.positionId ? new ObjectId(updateData.positionId) : null;
      }

      // 执行更新操作
      const result = await collection.updateOne(
        { _id: new ObjectId(ruleId) },
        update,
      );

      // 返回更新后的规则
      if (result.matchedCount > 0) {
        return await this.findFilterRuleById(ruleId);
      }
      return null;
    } catch (error) {
      console.error("Error updating filter rule:", error);
      throw error;
    }
  }

  // 删除筛选规则
  async deleteFilterRule(ruleId) {
    try {
      const collection = this.getCollection();
      const result = await collection.deleteOne({
        _id: new ObjectId(ruleId),
      });
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting filter rule:", error);
      throw error;
    }
  }

  // 获取所有筛选规则
  async findAllFilterRules() {
    try {
      const collection = this.getCollection();
      const rules = await collection.find({}).toArray();
      return rules;
    } catch (error) {
      console.error("Error finding all filter rules:", error);
      throw error;
    }
  }

  // 根据状态查找筛选规则
  async findFilterRulesByStatus(status) {
    try {
      const collection = this.getCollection();
      const rules = await collection
        .find({ status })
        .toArray();
      return rules;
    } catch (error) {
      console.error("Error finding filter rules by status:", error);
      throw error;
    }
  }

  // 启用/禁用筛选规则
  async toggleFilterRuleStatus(ruleId) {
    try {
      const collection = this.getCollection();
      const rule = await this.findFilterRuleById(ruleId);
      if (!rule) {
        return null;
      }
      const newStatus = rule.status === "active" ? "inactive" : "active";
      const result = await collection.updateOne(
        { _id: new ObjectId(ruleId) },
        { $set: { status: newStatus, updatedAt: new Date() } },
      );
      if (result.matchedCount > 0) {
        return await this.findFilterRuleById(ruleId);
      }
      return null;
    } catch (error) {
      console.error("Error toggling filter rule status:", error);
      throw error;
    }
  }
}

module.exports = new FilterRuleModel();