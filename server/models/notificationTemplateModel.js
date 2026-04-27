const { ObjectId } = require("mongodb");
const { getDB } = require("../db/db");

class NotificationTemplateModel {
  constructor() {
    this.collectionName = "notification_templates";
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

      // 创建 teamId + type 复合索引
      await collection.createIndex(
        { teamId: 1, type: 1 },
        { name: "idx_team_type" },
      );

      console.log("NotificationTemplate indexes initialized successfully");
    } catch (error) {
      console.error("Error initializing notification template indexes:", error);
    }
  }

  // 创建新通知模板
  async createTemplate(templateData) {
    try {
      const collection = this.getCollection();

      // 构建模板文档对象
      const template = {
        teamId: templateData.teamId ? new ObjectId(templateData.teamId) : null,
        type: templateData.type,
        name: templateData.name,
        title: templateData.title,
        content: templateData.content,
        variables: templateData.variables || [],
        isDefault: templateData.isDefault || false,
        status: templateData.status || "active",
        createdBy: templateData.createdBy ? new ObjectId(templateData.createdBy) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // 向数据库插入模板文档
      const result = await collection.insertOne(template);
      return {
        ...template,
        _id: result.insertedId,
      };
    } catch (error) {
      console.error("Error creating notification template:", error);
      throw error;
    }
  }

  // 根据ID查找模板
  async findTemplateById(templateId) {
    try {
      const collection = this.getCollection();
      const template = await collection.findOne({
        _id: new ObjectId(templateId),
      });
      return template;
    } catch (error) {
      console.error("Error finding template by id:", error);
      throw error;
    }
  }

  // 根据团队ID和类型查找模板
  async findTemplateByTeamIdAndType(teamId, type) {
    try {
      const collection = this.getCollection();
      const template = await collection.findOne({
        teamId: new ObjectId(teamId),
        type: type,
      });
      return template;
    } catch (error) {
      console.error("Error finding template by team id and type:", error);
      throw error;
    }
  }

  // 查找团队的所有模板
  async findTemplatesByTeamId(teamId) {
    try {
      const collection = this.getCollection();
      const templates = await collection
        .find({
          teamId: new ObjectId(teamId),
        })
        .toArray();
      return templates;
    } catch (error) {
      console.error("Error finding templates by team id:", error);
      throw error;
    }
  }

  // 查找系统默认模板
  async findDefaultTemplates() {
    try {
      const collection = this.getCollection();
      const templates = await collection
        .find({
          isDefault: true,
        })
        .toArray();
      return templates;
    } catch (error) {
      console.error("Error finding default templates:", error);
      throw error;
    }
  }

  // 更新模板
  async updateTemplate(templateId, updateData) {
    try {
      const collection = this.getCollection();
      const result = await collection.updateOne(
        { _id: new ObjectId(templateId) },
        { 
          $set: {
            ...updateData,
            updatedAt: new Date(),
          }
        },
      );
      return result.matchedCount > 0;
    } catch (error) {
      console.error("Error updating template:", error);
      throw error;
    }
  }

  // 删除模板
  async deleteTemplate(templateId) {
    try {
      const collection = this.getCollection();
      const result = await collection.deleteOne({
        _id: new ObjectId(templateId),
      });
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting template:", error);
      throw error;
    }
  }
}

module.exports = new NotificationTemplateModel();