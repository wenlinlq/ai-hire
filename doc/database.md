# AI校园招新平台“AI招新助手”数据库字段设计

---

## 一、数据库设计概览

| 集合名称         | 中文名称   | 说明                 |
| :--------------- | :--------- | :------------------- |
| users            | 用户表     | 所有系统用户         |
| students         | 学生档案表 | 新生/报名者详细信息  |
| teams            | 团队表     | 社团/实验室信息      |
| positions        | 岗位表     | 招聘岗位/部门信息    |
| applications     | 报名表     | 学生报名记录         |
| resumes          | 简历表     | 学生简历及AI解析结果 |
| interviews       | 面试表     | 面试安排记录         |
| 笔试             | 笔试表     | 在线笔试记录         |
| messages         | 消息表     | 站内信通知           |
| ai_conversations | AI对话表   | AI问答机器人对话记录 |

---

## 二、详细字段设计

### 2.1 用户表 (users)

| 字段名    | 类型     | 必填 | 说明                       |
| :-------- | :------- | :--- | :------------------------- |
| \_id      | ObjectId | 是   | 主键，自动生成             |
| username  | String   | 是   | 用户名，唯一索引           |
| password  | String   | 是   | bcrypt加密密码             |
| email     | String   | 是   | 邮箱，唯一索引             |
| phone     | String   | 否   | 手机号                     |
| role      | String   | 是   | 角色：student / hr / admin |
| avatar    | String   | 否   | 头像URL                    |
| status    | String   | 是   | 状态：active / disabled    |
| lastLogin | Date     | 否   | 最后登录时间               |
| createdAt | Date     | 是   | 注册时间，默认Date.now     |
| updatedAt | Date     | 是   | 更新时间，自动更新         |

**索引设计**：

- `username` 唯一索引
- `email` 唯一索引
- `role` 普通索引

---

### 2.2 学生档案表 (students)

| 字段名    | 类型     | 必填 | 说明                                |
| :-------- | :------- | :--- | :---------------------------------- |
| \_id      | ObjectId | 是   | 主键                                |
| userId    | ObjectId | 是   | 关联users.\_id，唯一索引            |
| realName  | String   | 是   | 真实姓名                            |
| studentId | String   | 是   | 学号，唯一索引                      |
| college   | String   | 是   | 学院                                |
| major     | String   | 是   | 专业                                |
| grade     | String   | 是   | 年级（如2023级）                    |
| class     | String   | 否   | 班级                                |
| interests | [String] | 否   | 兴趣标签，如["前端","AI"]           |
| skills    | [String] | 否   | 技能标签，如["JavaScript","Python"] |
| gpa       | Number   | 否   | 绩点                                |
| createdAt | Date     | 是   | 创建时间                            |
| updatedAt | Date     | 是   | 更新时间                            |

**索引设计**：

- `userId` 唯一索引
- `studentId` 唯一索引
- `college` 普通索引
- `skills` 多键索引

---

### 2.3 团队表 (teams)

| 字段名           | 类型       | 必填 | 说明                               |
| :--------------- | :--------- | :--- | :--------------------------------- |
| \_id             | ObjectId   | 是   | 主键                               |
| name             | String     | 是   | 团队名称，唯一索引                 |
| department       | String     | 是   | 所属部门（技术部/宣传部/外联部等） |
| description      | String     | 是   | 团队介绍                           |
| logo             | String     | 否   | 团队Logo URL                       |
| leaderId         | ObjectId   | 是   | 负责人ID，关联users                |
| members          | [ObjectId] | 否   | 成员ID列表                         |
| contact          | Object     | 否   | 联系方式                           |
| contact.email    | String     | 否   | 联系邮箱                           |
| contact.phone    | String     | 否   | 联系电话                           |
| contact.location | String     | 否   | 办公地点                           |
| status           | String     | 是   | 状态：active / inactive            |
| createdAt        | Date       | 是   | 创建时间                           |

**索引设计**：

- `name` 唯一索引
- `department` 普通索引
- `leaderId` 普通索引

---

### 2.4 岗位表 (positions)

| 字段名                   | 类型     | 必填 | 说明                                 |
| :----------------------- | :------- | :--- | :----------------------------------- |
| \_id                     | ObjectId | 是   | 主键                                 |
| teamId                   | ObjectId | 是   | 所属团队ID，关联teams                |
| title                    | String   | 是   | 岗位名称（如"前端开发实习生"）       |
| type                     | String   | 是   | 类型：full-time / part-time / intern |
| department               | String   | 是   | 所属部门                             |
| quota                    | Number   | 是   | 招聘人数                             |
| requirements             | Object   | 是   | 岗位要求                             |
| requirements.skills      | [String] | 是   | 技能要求，如["Vue","React"]          |
| requirements.experience  | String   | 否   | 经验要求                             |
| requirements.education   | String   | 否   | 学历要求                             |
| requirements.description | String   | 是   | 详细描述                             |
| responsibilities         | [String] | 否   | 工作职责列表                         |
| benefits                 | [String] | 否   | 福利待遇列表                         |
| status                   | String   | 是   | 状态：open / closed                  |
| deadline                 | Date     | 是   | 报名截止时间                         |
| viewCount                | Number   | 是   | 浏览次数，默认0                      |
| applyCount               | Number   | 是   | 投递人数，默认0                      |
| createdBy                | ObjectId | 是   | 创建人ID（HR）                       |
| createdAt                | Date     | 是   | 创建时间                             |
| updatedAt                | Date     | 是   | 更新时间                             |

**索引设计**：

- `teamId` 普通索引
- `status` 普通索引
- `deadline` 普通索引
- `title` 全文索引（支持搜索）

---

### 2.5 报名表 (applications)

| 字段名                | 类型     | 必填 | 说明                                                     |
| :-------------------- | :------- | :--- | :------------------------------------------------------- |
| \_id                  | ObjectId | 是   | 主键                                                     |
| positionId            | ObjectId | 是   | 岗位ID，关联positions                                    |
| studentId             | ObjectId | 是   | 学生ID，关联users                                        |
| resumeId              | ObjectId | 是   | 简历ID，关联resumes                                      |
| status                | String   | 是   | 状态：pending / screening / interview / offer / rejected |
| aiScore               | Number   | 否   | AI匹配度评分（0-100）                                    |
| aiAnalysis            | Object   | 否   | AI分析结果                                               |
| aiAnalysis.strengths  | [String] | 否   | 优势项列表                                               |
| aiAnalysis.weaknesses | [String] | 否   | 待提升项列表                                             |
| aiAnalysis.summary    | String   | 否   | 综合评语                                                 |
| hrScore               | Number   | 否   | HR人工评分                                               |
| hrComment             | String   | 否   | HR评语                                                   |
| interviewId           | ObjectId | 否   | 面试ID，关联interviews                                   |
| appliedAt             | Date     | 是   | 报名时间，默认Date.now                                   |
| updatedAt             | Date     | 是   | 更新时间                                                 |

**索引设计**：

- `positionId` + `studentId` 复合唯一索引
- `status` 普通索引
- `aiScore` 普通索引（用于排序）

---

### 2.6 简历表 (resumes)

| 字段名                | 类型     | 必填 | 说明                               |
| :-------------------- | :------- | :--- | :--------------------------------- |
| \_id                  | ObjectId | 是   | 主键                               |
| studentId             | ObjectId | 是   | 学生ID，关联users                  |
| fileUrl               | String   | 否   | 简历文件URL                        |
| fileType              | String   | 否   | 文件类型：pdf / doc / docx / image |
| content               | String   | 否   | 简历原始文本（提取后）             |
| parsedData            | Object   | 否   | AI解析结果                         |
| parsedData.name       | String   | 否   | 姓名                               |
| parsedData.phone      | String   | 否   | 电话                               |
| parsedData.email      | String   | 否   | 邮箱                               |
| parsedData.education  | Object   | 否   | 教育背景                           |
| parsedData.skills     | [String] | 否   | 技能标签                           |
| parsedData.projects   | [Object] | 否   | 项目经历                           |
| parsedData.experience | [Object] | 否   | 实习/工作经历                      |
| parsedAt              | Date     | 否   | 解析时间                           |
| isActive              | Boolean  | 是   | 是否为当前简历，默认true           |
| createdAt             | Date     | 是   | 上传时间                           |
| updatedAt             | Date     | 是   | 更新时间                           |

**索引设计**：

- `studentId` 普通索引
- `isActive` 普通索引

---

### 2.7 面试表 (interviews)

| 字段名                   | 类型     | 必填 | 说明                                    |
| :----------------------- | :------- | :--- | :-------------------------------------- |
| \_id                     | ObjectId | 是   | 主键                                    |
| applicationId            | ObjectId | 是   | 报名ID，关联applications                |
| studentId                | ObjectId | 是   | 学生ID，关联users                       |
| interviewerId            | ObjectId | 是   | 面试官ID，关联users                     |
| round                    | Number   | 是   | 面试轮次（1/2/3）                       |
| scheduledTime            | Date     | 是   | 约定面试时间                            |
| duration                 | Number   | 否   | 面试时长（分钟）                        |
| type                     | String   | 是   | 面试方式：online / offline              |
| location                 | String   | 否   | 面试地点（线下）                        |
| meetingUrl               | String   | 否   | 会议链接（线上）                        |
| status                   | String   | 是   | 状态：scheduled / completed / cancelled |
| evaluation               | Object   | 否   | 面试评价                                |
| evaluation.technical     | Number   | 否   | 技术能力评分（1-10）                    |
| evaluation.communication | Number   | 否   | 沟通能力评分（1-10）                    |
| evaluation.attitude      | Number   | 否   | 态度评分（1-10）                        |
| evaluation.comment       | String   | 否   | 综合评价                                |
| aiFeedback               | Object   | 否   | AI辅助分析（可选）                      |
| result                   | String   | 否   | 结果：pass / fail / pending             |
| createdAt                | Date     | 是   | 创建时间                                |
| updatedAt                | Date     | 是   | 更新时间                                |

**索引设计**：

- `applicationId` 普通索引
- `studentId` 普通索引
- `status` 普通索引

---

### 2.8 笔试表 (exams)

| 字段名             | 类型     | 必填 | 说明                                              |
| :----------------- | :------- | :--- | :------------------------------------------------ |
| \_id               | ObjectId | 是   | 主键                                              |
| applicationId      | ObjectId | 是   | 报名ID，关联applications                          |
| positionId         | ObjectId | 是   | 岗位ID，关联positions                             |
| studentId          | ObjectId | 是   | 学生ID，关联users                                 |
| questions          | [Object] | 是   | 题目列表                                          |
| questions.type     | String   | 是   | 题型：choice / essay / code                       |
| questions.content  | String   | 是   | 题目内容                                          |
| questions.score    | Number   | 是   | 分值                                              |
| answers            | [Object] | 否   | 答案列表                                          |
| answers.questionId | ObjectId | 否   | 题目ID                                            |
| answers.content    | String   | 否   | 学生答案                                          |
| answers.score      | Number   | 否   | 得分                                              |
| totalScore         | Number   | 否   | 总分                                              |
| startTime          | Date     | 否   | 开始时间                                          |
| submitTime         | Date     | 否   | 提交时间                                          |
| duration           | Number   | 否   | 答题时长（秒）                                    |
| tabSwitchCount     | Number   | 否   | 切屏次数                                          |
| status             | String   | 是   | 状态：pending / in_progress / submitted / timeout |
| createdAt          | Date     | 是   | 创建时间                                          |

**索引设计**：

- `applicationId` 唯一索引
- `studentId` 普通索引
- `status` 普通索引

---

### 2.9 消息表 (messages)

| 字段名     | 类型     | 必填 | 说明                                           |
| :--------- | :------- | :--- | :--------------------------------------------- |
| \_id       | ObjectId | 是   | 主键                                           |
| fromUserId | ObjectId | 否   | 发送人ID（系统消息可为空）                     |
| toUserId   | ObjectId | 是   | 接收人ID                                       |
| type       | String   | 是   | 类型：email / in_app                           |
| title      | String   | 是   | 消息标题                                       |
| content    | String   | 是   | 消息内容                                       |
| template   | String   | 否   | 模板类型：interview_invite / offer / rejection |
| relatedId  | ObjectId | 否   | 关联ID（如applicationId）                      |
| isRead     | Boolean  | 是   | 是否已读，默认false                            |
| readAt     | Date     | 否   | 阅读时间                                       |
| sentAt     | Date     | 是   | 发送时间，默认Date.now                         |

**索引设计**：

- `toUserId` 普通索引
- `isRead` 普通索引
- `type` 普通索引

---

### 2.10 AI对话表 (ai_conversations)

| 字段名                | 类型     | 必填 | 说明                                 |
| :-------------------- | :------- | :--- | :----------------------------------- |
| \_id                  | ObjectId | 是   | 主键                                 |
| userId                | ObjectId | 是   | 用户ID，关联users                    |
| sessionId             | String   | 是   | 会话ID，用于区分对话                 |
| type                  | String   | 是   | 类型：qa / interview / resume_advice |
| context               | Object   | 否   | 上下文信息                           |
| context.positionId    | ObjectId | 否   | 关联岗位ID                           |
| context.applicationId | ObjectId | 否   | 关联报名ID                           |
| messages              | [Object] | 是   | 消息列表                             |
| messages.role         | String   | 是   | 角色：user / assistant               |
| messages.content      | String   | 是   | 消息内容                             |
| messages.timestamp    | Date     | 是   | 消息时间                             |
| summary               | String   | 否   | 对话总结（可选）                     |
| createdAt             | Date     | 是   | 创建时间                             |
| updatedAt             | Date     | 是   | 更新时间                             |

**索引设计**：

- `userId` + `sessionId` 复合索引
- `type` 普通索引
- `createdAt` 普通索引（用于清理过期数据）

---

### 2.11 面试题库表 (questionBanks)

| 字段名    | 类型     | 必填 | 说明                         |
| :-------- | :------- | :--- | :--------------------------- |
| id        | ObjectId | 是   | 主键                         |
| title     | String   | 是   | 题库名称                     |
| type      | String   | 是   | 题型：essay（简答题）        |
| category  | String   | 是   | 分类（如前端、后端、产品等） |
| teamId    | ObjectId | 是   | 所属团队ID，关联teams        |
| questions | [String] | 是   | 题目列表                     |
| createdAt | Date     | 是   | 创建时间，默认Date.now       |
| updatedAt | Date     | 是   | 更新时间，自动更新           |

**索引设计**：

- `teamId` 普通索引
- `category` 普通索引
- `title` 全文索引（支持搜索）

---

## 三、ER关系图（文字版）

```
users (用户)
  ├── students (学生档案)     1:1
  ├── applications (报名)     1:N
  ├── resumes (简历)          1:N
  ├── messages (消息)         1:N
  └── ai_conversations (AI对话) 1:N

teams (团队)
  ├── positions (岗位)        1:N
  ├── questionBanks (面试题库) 1:N
  └── users (负责人)          1:1

positions (岗位)
  └── applications (报名)     1:N

applications (报名)
  ├── interviews (面试)       1:N
  ├── exams (笔试)            1:1
  └── resumes (简历)          1:1
```

---

## 四、字段设计原则说明

| 原则             | 说明                                                       |
| :--------------- | :--------------------------------------------------------- |
| **唯一索引**     | username、email、studentId 等保证唯一性                    |
| **关联字段索引** | 所有外键字段都建立索引，提升查询效率                       |
| **嵌套文档**     | 合理使用嵌套结构（如requirements、evaluation），减少表关联 |
| **冗余字段**     | 适当冗余（如application中存studentId），减少联表查询       |
| **软删除**       | 不使用物理删除，通过status字段标记                         |
| **时间戳**       | 所有表都有createdAt、updatedAt，便于追踪                   |

---
