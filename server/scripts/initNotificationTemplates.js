const NotificationTemplate = require("../models/notificationTemplateModel");

const defaultTemplates = [
  {
    type: "resume_pass",
    name: "简历通过筛选通知",
    title: "{studentName}，您的{positionName}简历已通过初筛",
    content: `尊敬的{studentName}：

您好！您投递的{teamName}团队{positionName}岗位已通过简历初筛。

我们将尽快安排面试，请保持手机畅通，具体面试时间会另行通知。

感谢您对我们团队的关注与支持！`,
    variables: ["studentName", "positionName", "teamName"],
    isDefault: true,
    status: "active",
  },
  {
    type: "resume_reject",
    name: "简历未通过通知",
    title: "{studentName}，您的{positionName}简历筛选结果通知",
    content: `尊敬的{studentName}：

感谢您投递{teamName}团队的{positionName}岗位。

经过慎重评估，很遗憾地通知您，您的简历未能通过本次筛选。{rejectReason}

我们已将您的简历存入人才库，未来有合适岗位会优先考虑。感谢您的关注！`,
    variables: ["studentName", "positionName", "teamName", "rejectReason"],
    isDefault: true,
    status: "active",
  },
  {
    type: "interview_invite",
    name: "面试邀请通知",
    title: "{studentName}，邀请您参加{positionName}岗位面试",
    content: `尊敬的{studentName}：

恭喜您通过简历筛选！现邀请您参加{teamName}团队的{positionName}岗位面试。

面试时间：{interviewTime}
面试地点/链接：{interviewLocation}
面试官：{interviewerName}

请您提前10分钟到达/上线。如有问题请联系我们。

期待与您见面！`,
    variables: [
      "studentName",
      "positionName",
      "teamName",
      "interviewTime",
      "interviewLocation",
      "interviewerName",
    ],
    isDefault: true,
    status: "active",
  },
  {
    type: "interview_reminder",
    name: "面试提醒通知",
    title: "【提醒】{studentName}，您的面试即将开始",
    content: `尊敬的{studentName}：

温馨提示：您投递的{teamName}团队{positionName}岗位面试将在{interviewTime}开始。

面试地点/链接：{interviewLocation}

请提前做好准备，准时参加。祝您面试顺利！`,
    variables: [
      "studentName",
      "positionName",
      "teamName",
      "interviewTime",
      "interviewLocation",
    ],
    isDefault: true,
    status: "active",
  },
  {
    type: "interview_result",
    name: "面试结果通知",
    title: "{studentName}，您的{positionName}面试结果通知",
    content: `尊敬的{studentName}：

感谢您参加{teamName}团队的面试。经过综合评估，您的面试结果为：{interviewResult}。

{feedbackComment}

无论结果如何，感谢您对我们团队的认可与支持！`,
    variables: [
      "studentName",
      "positionName",
      "teamName",
      "interviewResult",
      "feedbackComment",
    ],
    isDefault: true,
    status: "active",
  },
  {
    type: "offer",
    name: "录用通知",
    title: "{studentName}，恭喜您被{positionName}岗位录取！",
    content: `尊敬的{studentName}：

非常荣幸地通知您，您已通过{teamName}团队的考核，正式被录取为{positionName}岗位成员！

入职信息如下：
报到时间：{onboardingTime}
报到地点：{onboardingLocation}
联系人：{contactPerson}

请回复确认是否接受录取。期待您的加入！`,
    variables: [
      "studentName",
      "positionName",
      "teamName",
      "onboardingTime",
      "onboardingLocation",
      "contactPerson",
    ],
    isDefault: true,
    status: "active",
  },
  {
    type: "rejection",
    name: "感谢信/拒绝信",
    title: "{studentName}，感谢您对{teamName}团队的关注",
    content: `尊敬的{studentName}：

感谢您参与{teamName}团队的整个招聘流程。您在各个环节都展现出了优秀的素质。

经过综合评估和名额限制，很遗憾我们暂无法与您达成合作。{rejectReason}

但您的表现给我们留下了深刻印象，我们已将您列入优秀人才库，未来有合适机会会优先联系您。

祝您学业进步，前程似锦！`,
    variables: ["studentName", "teamName", "rejectReason"],
    isDefault: true,
    status: "active",
  },
];

async function initNotificationTemplates() {
  try {
    for (const template of defaultTemplates) {
      // 检查是否已存在相同类型的默认模板
      const exists = await NotificationTemplate.findTemplateByTeamIdAndType(
        null,
        template.type,
      );
      if (exists === null || exists === undefined) {
        await NotificationTemplate.createTemplate(template);
        console.log(`✅ 插入模板：${template.name}`);
      } else {
        console.log(`⏭️ 模板已存在：${template.name}`);
      }
    }
    console.log("🎉 通知模板初始化完成！");
  } catch (error) {
    console.error("❌ 初始化失败：", error);
  }
}

module.exports = initNotificationTemplates;
