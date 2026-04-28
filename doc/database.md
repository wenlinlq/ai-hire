# AI校园招新平台"AI招新助手"数据库字段设计

---

## 一、数据库设计概览

| 集合名称              | 中文名称   | 说明                 |
| :-------------------- | :--------- | :------------------- |
| users                 | 用户表     | 所有系统用户         |
| teams                 | 团队表     | 社团/实验室信息      |
| positions             | 岗位表     | 招聘岗位/部门信息    |
| deliveries            | 投递表     | 学生投递记录         |
| resumes               | 简历表     | 学生简历及AI解析结果 |
| favorites             | 收藏表     | 职位收藏记录         |
| notifications         | 通知表     | 用户通知消息         |
| interview_invitations | 面试邀请表 | 面试安排记录         |
| questionBanks         | 面试题库表 | 面试题目管理         |
| ai_pre_interviews     | AI预面试表 | AI模拟面试记录       |

---

## 二、详细字段设计

### 2.1 用户表 (users)

| 字段名    | 类型     | 必填 | 说明                             |
| :-------- | :------- | :--- | :------------------------------- |
| \_id      | ObjectId | 是   | 主键，自动生成                   |
| username  | String   | 是   | 用户名，唯一索引                 |
| password  | String   | 是   | bcrypt加密密码                   |
| email     | String   | 是   | 邮箱，唯一索引                   |
| phone     | String   | 否   | 手机号                           |
| role      | String   | 是   | 角色：admin / user / hr          |
| team      | ObjectId | 否   | 所属团队ID                       |
| avatar    | String   | 否   | 头像URL                          |
| status    | String   | 是   | 状态：active / inactive / banned |
| lastLogin | Date     | 否   | 最后登录时间                     |
| createdAt | Date     | 是   | 创建时间，默认Date.now           |
| updatedAt | Date     | 是   | 更新时间，自动更新               |

**索引设计**：

- `username` 唯一索引
- `email` 唯一索引
- `role` 普通索引

---

### 2.2 团队表 (teams)

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
| updatedAt        | Date       | 是   | 更新时间                           |

**索引设计**：

- `name` 唯一索引
- `department` 普通索引
- `leaderId` 普通索引

---

### 2.3 岗位表 (positions)

| 字段名                   | 类型     | 必填 | 说明                                 |
| :----------------------- | :------- | :--- | :----------------------------------- |
| \_id                     | ObjectId | 是   | 主键                                 |
| teamId                   | ObjectId | 是   | 所属团队ID，关联teams                |
| title                    | String   | 是   | 岗位名称（如"前端开发实习生"）       |
| type                     | String   | 是   | 类型：full-time / part-time / intern |
| department               | String   | 是   | 所属部门                             |
| quota                    | Number   | 是   | 招聘人数                             |
| salary                   | String   | 否   | 薪资待遇                             |
| interviewType            | String   | 否   | 面试方式：online / offline           |
| aiQuestionBankId         | ObjectId | 否   | AI试题库ID                           |
| aiPreInterview           | Boolean  | 否   | 是否开启AI预面试，默认false          |
| aiPreInterviewScore      | Number   | 否   | AI预面试最低分，默认60               |
| aiResumeFilter           | Boolean  | 否   | 是否开启AI简历筛选，默认false        |
| aiResumeFilterScore      | Number   | 否   | AI简历筛选最低分，默认60             |
| aiResumeFilterSkills     | [String] | 否   | AI简历筛选技能要求列表               |
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

### 2.4 投递表 (deliveries)

| 字段名            | 类型     | 必填 | 说明                                  |
| :---------------- | :------- | :--- | :------------------------------------ |
| \_id              | ObjectId | 是   | 主键                                  |
| userId            | ObjectId | 是   | 用户ID，关联users                     |
| jobId             | ObjectId | 是   | 岗位ID，关联positions                 |
| resumeId          | ObjectId | 是   | 简历ID，关联resumes                   |
| hasAiPreInterview | Boolean  | 否   | 是否有AI预面试，默认false             |
| status            | String   | 是   | 状态：pending_ai / pending / reviewed |
| aiScore           | Number   | 否   | AI评分（0-100）                       |
| createdAt         | Date     | 是   | 创建时间                              |
| updatedAt         | Date     | 是   | 更新时间                              |

**索引设计**：

- `userId + jobId` 复合索引
- `status` 普通索引

---

### 2.5 简历表 (resumes)

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

### 2.6 收藏表 (favorites)

| 字段名     | 类型     | 必填 | 说明                  |
| :--------- | :------- | :--- | :-------------------- |
| \_id       | ObjectId | 是   | 主键                  |
| userId     | ObjectId | 是   | 用户ID，关联users     |
| positionId | ObjectId | 是   | 职位ID，关联positions |
| createdAt  | Date     | 是   | 收藏时间              |

**索引设计**：

- `userId + positionId` 复合唯一索引

---

### 2.7 通知表 (notifications)

| 字段名    | 类型     | 必填 | 说明                         |
| :-------- | :------- | :--- | :--------------------------- |
| \_id      | ObjectId | 是   | 主键                         |
| userId    | ObjectId | 是   | 接收人ID，关联users          |
| type      | String   | 是   | 通知类型                     |
| title     | String   | 是   | 通知标题                     |
| content   | String   | 是   | 通知内容                     |
| relatedId | ObjectId | 否   | 关联ID（如投递ID、面试ID等） |
| isRead    | Boolean  | 是   | 是否已读，默认false          |
| teamName  | String   | 否   | 团队名称                     |
| createdAt | Date     | 是   | 创建时间                     |

**索引设计**：

- `userId + isRead` 复合索引

---

### 2.8 面试邀请表 (interview_invitations)

| 字段名        | 类型     | 必填 | 说明                                    |
| :------------ | :------- | :--- | :-------------------------------------- |
| \_id          | ObjectId | 是   | 主键                                    |
| deliveryId    | ObjectId | 是   | 投递ID，关联deliveries                  |
| userId        | ObjectId | 是   | 学生ID，关联users                       |
| interviewerId | ObjectId | 否   | 面试官ID，关联users                     |
| round         | Number   | 否   | 面试轮次（1/2/3），默认1                |
| type          | String   | 否   | 面试方式：online / offline，默认online  |
| scheduledTime | Date     | 是   | 约定面试时间                            |
| meetingUrl    | String   | 否   | 会议链接（线上）                        |
| location      | String   | 否   | 面试地点（线下）                        |
| status        | String   | 是   | 状态：pending / accepted / declined     |
| result        | String   | 否   | 结果：pending / pass / fail             |
| evaluation    | Object   | 否   | 面试评价                                |
| userFeedback  | String   | 否   | 用户反馈：pending / accepted / declined |
| createdAt     | Date     | 是   | 创建时间                                |
| updatedAt     | Date     | 是   | 更新时间                                |

**索引设计**：

- `userId + status` 复合索引
- `deliveryId` 普通索引

---

### 2.9 面试题库表 (questionBanks)

| 字段名    | 类型     | 必填 | 说明                        |
| :-------- | :------- | :--- | :-------------------------- |
| \_id      | ObjectId | 是   | 主键                        |
| title     | String   | 是   | 题库名称                    |
| type      | String   | 是   | 题型：essay / choice / code |
| category  | String   | 是   | 分类（如前端、后端、UI等）  |
| teamId    | ObjectId | 是   | 所属团队ID，关联teams       |
| questions | [String] | 是   | 题目列表                    |
| createdAt | Date     | 是   | 创建时间                    |
| updatedAt | Date     | 是   | 更新时间                    |

**索引设计**：

- `teamId` 普通索引
- `category` 普通索引
- `title` 全文索引（支持搜索）

---

### 2.10 AI预面试表 (ai_pre_interviews)

| 字段名      | 类型     | 必填 | 说明                                    |
| :---------- | :------- | :--- | :-------------------------------------- |
| \_id        | ObjectId | 是   | 主键                                    |
| deliveryId  | ObjectId | 是   | 投递ID，关联deliveries，唯一索引        |
| userId      | ObjectId | 是   | 用户ID，关联users                       |
| jobId       | ObjectId | 是   | 岗位ID，关联positions                   |
| status      | String   | 是   | 状态：pending / in_progress / completed |
| score       | Number   | 否   | AI预面试评分（0-100）                   |
| questions   | [String] | 否   | 面试问题列表                            |
| startedAt   | Date     | 否   | 开始时间                                |
| completedAt | Date     | 否   | 完成时间                                |
| expiresAt   | Date     | 否   | 过期时间                                |
| createdAt   | Date     | 是   | 创建时间                                |

**索引设计**：

- `userId` 普通索引
- `status + expiresAt` 复合索引
- `deliveryId` 唯一索引

---

## 三、ER关系图（文字版）

```
users (用户)
  ├── teams (团队)              N:1（负责人）
  ├── teams (团队)              N:N（成员）
  ├── positions (岗位)          1:N（创建）
  ├── deliveries (投递)         1:N
  ├── resumes (简历)            1:N
  ├── favorites (收藏)          1:N
  ├── notifications (通知)      1:N
  └── interview_invitations (面试邀请)  1:N

teams (团队)
  ├── positions (岗位)         1:N
  └── questionBanks (面试题库)  1:N

positions (岗位)
  └── deliveries (投递)        1:N

deliveries (投递)
  ├── resumes (简历)            1:1
  └── ai_pre_interviews (AI预面试)  1:1
```

---

## 四、字段设计原则说明

| 原则             | 说明                                                                |
| :--------------- | :------------------------------------------------------------------ |
| **唯一索引**     | username、email、deliveryId 等保证唯一性                            |
| **关联字段索引** | 所有外键字段都建立索引，提升查询效率                                |
| **嵌套文档**     | 合理使用嵌套结构（如requirements、evaluation、contact），减少表关联 |
| **复合索引**     | 常用查询条件建立复合索引，如 userId+positionId、userId+isRead       |
| **冗余字段**     | 适当冗余（如delivery中存userId），减少联表查询                      |
| **软删除**       | 不使用物理删除，通过status字段标记                                  |
| **时间戳**       | 所有表都有createdAt、updatedAt，便于追踪                            |
| **ObjectId转换** | 所有ID字段使用ObjectId类型，确保数据一致性                          |

---
