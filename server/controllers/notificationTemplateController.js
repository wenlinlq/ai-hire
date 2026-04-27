const notificationTemplateModel = require("../models/notificationTemplateModel");

class NotificationTemplateController {
  // 获取团队的通知模板列表（包括系统默认模板和团队自定义模板）
  async getTeamTemplates(req, res) {
    try {
      const { teamId } = req.params;

      if (!teamId) {
        return res.status(400).json({ error: "Missing teamId" });
      }

      // 获取团队自定义模板
      const teamTemplates =
        await notificationTemplateModel.findTemplatesByTeamId(teamId);

      // 获取系统默认模板
      const defaultTemplates =
        await notificationTemplateModel.findDefaultTemplates();

      // 合并模板，优先使用团队自定义模板（如果类型相同）
      const templateMap = new Map();

      // 先添加默认模板
      defaultTemplates.forEach((template) => {
        templateMap.set(template.type, template);
      });

      // 然后用团队模板覆盖相同类型的默认模板
      teamTemplates.forEach((template) => {
        templateMap.set(template.type, template);
      });

      // 转换为数组
      const templates = Array.from(templateMap.values());

      res.status(200).json({ success: true, data: templates });
    } catch (error) {
      console.error("Error getting team templates:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 获取系统默认模板
  async getDefaultTemplates(req, res) {
    try {
      const templates = await notificationTemplateModel.findDefaultTemplates();
      res.status(200).json({ success: true, data: templates });
    } catch (error) {
      console.error("Error getting default templates:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 获取模板详情
  async getTemplateById(req, res) {
    try {
      const { templateId } = req.params;

      if (!templateId) {
        return res.status(400).json({ error: "Missing templateId" });
      }

      const template =
        await notificationTemplateModel.findTemplateById(templateId);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      res.status(200).json({ success: true, data: template });
    } catch (error) {
      console.error("Error getting template by id:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 创建新模板
  async createTemplate(req, res) {
    try {
      const {
        teamId,
        type,
        name,
        title,
        content,
        variables,
        status,
        createdBy,
      } = req.body;

      if (!teamId || !type || !name || !title || !content) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const templateData = {
        teamId,
        type,
        name,
        title,
        content,
        variables: variables || [],
        isDefault: false,
        status: status || "active",
        createdBy,
      };

      const newTemplate =
        await notificationTemplateModel.createTemplate(templateData);
      res.status(201).json({ success: true, data: newTemplate });
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 更新模板（系统默认模板会创建团队覆盖记录）
  async updateTemplate(req, res) {
    try {
      const { templateId } = req.params;
      const { teamId, name, title, content, variables, status } = req.body;

      if (!templateId || !teamId) {
        return res.status(400).json({ error: "Missing templateId or teamId" });
      }

      // 检查模板是否存在
      const template =
        await notificationTemplateModel.findTemplateById(templateId);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      // 如果是系统默认模板（teamId为null），则创建或更新团队覆盖记录
      if (template.isDefault && !template.teamId) {
        // 检查是否已存在团队覆盖记录
        const existingTeamTemplate =
          await notificationTemplateModel.findTemplateByTeamIdAndType(
            teamId,
            template.type,
          );

        if (existingTeamTemplate) {
          // 更新现有覆盖记录
          const updateData = {};
          if (name) updateData.name = name;
          if (title) updateData.title = title;
          if (content) updateData.content = content;
          if (variables) updateData.variables = variables;
          if (status) updateData.status = status;

          const success = await notificationTemplateModel.updateTemplate(
            existingTeamTemplate._id.toString(),
            updateData,
          );
          if (!success) {
            return res.status(404).json({ error: "Template not found" });
          }

          const updatedTemplate =
            await notificationTemplateModel.findTemplateById(
              existingTeamTemplate._id.toString(),
            );
          res.status(200).json({ success: true, data: updatedTemplate });
        } else {
          // 创建新的团队覆盖记录
          const teamTemplateData = {
            teamId,
            type: template.type,
            name: name || template.name,
            title: title || template.title,
            content: content || template.content,
            variables: variables || template.variables,
            status: status || template.status,
            isDefault: false, // 团队覆盖记录不是默认模板
            createdBy: req.user?.id, // 从请求中获取创建人ID
          };

          const newTemplate =
            await notificationTemplateModel.createTemplate(teamTemplateData);
          res.status(201).json({ success: true, data: newTemplate });
        }
      } else {
        // 检查模板是否属于当前团队
        if (template.teamId.toString() !== teamId) {
          return res
            .status(403)
            .json({ error: "Cannot update template from another team" });
        }

        // 更新团队自己的模板
        const updateData = {};
        if (name) updateData.name = name;
        if (title) updateData.title = title;
        if (content) updateData.content = content;
        if (variables) updateData.variables = variables;
        if (status) updateData.status = status;

        const success = await notificationTemplateModel.updateTemplate(
          templateId,
          updateData,
        );
        if (!success) {
          return res.status(404).json({ error: "Template not found" });
        }

        const updatedTemplate =
          await notificationTemplateModel.findTemplateById(templateId);
        res.status(200).json({ success: true, data: updatedTemplate });
      }
    } catch (error) {
      console.error("Error updating template:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 删除模板
  async deleteTemplate(req, res) {
    try {
      const { templateId } = req.params;
      const { teamId } = req.body;

      if (!templateId || !teamId) {
        return res.status(400).json({ error: "Missing templateId or teamId" });
      }

      // 检查模板是否存在
      const template =
        await notificationTemplateModel.findTemplateById(templateId);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      // 检查是否为系统默认模板
      if (template.isDefault) {
        return res
          .status(400)
          .json({ error: "Cannot delete default template" });
      }

      // 检查模板是否属于当前团队
      if (template.teamId.toString() !== teamId) {
        return res
          .status(403)
          .json({ error: "Cannot delete template from another team" });
      }

      const success =
        await notificationTemplateModel.deleteTemplate(templateId);
      if (!success) {
        return res.status(404).json({ error: "Template not found" });
      }

      res.status(200).json({ success: true, message: "Template deleted" });
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 获取特定类型的模板
  async getTemplateByType(req, res) {
    try {
      const { teamId, type } = req.params;

      if (!teamId || !type) {
        return res.status(400).json({ error: "Missing teamId or type" });
      }

      const template =
        await notificationTemplateModel.findTemplateByTeamIdAndType(
          teamId,
          type,
        );
      res.status(200).json({ success: true, data: template });
    } catch (error) {
      console.error("Error getting template by type:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = new NotificationTemplateController();
