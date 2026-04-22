var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

// 导入用户模型
const userModel = require("./models/userModel");
// 导入团队模型
const teamModel = require("./models/teamModel");
// 导入岗位模型
const positionModel = require("./models/positionModel");
// 导入报名模型
const applicationModel = require("./models/applicationModel");
// 导入收藏模型
const favoriteModel = require("./models/favoriteModel");
// 导入简历模型
const resumeModel = require("./models/resumeModel");
// 导入面试题库模型
const questionBankModel = require("./models/questionBankModel");
// 导入投递模型
const deliveryModel = require("./models/deliveryModel");
// 导入AI预面试模型
const aiPreInterviewModel = require("./models/aiPreInterviewModel");
// 导入面试邀请模型
const interviewInvitationModel = require("./models/interviewInvitationModel");
// 导入通知模型
const notificationModel = require("./models/notificationModel");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/api/users");
var teamsRouter = require("./routes/api/teams");
var positionsRouter = require("./routes/api/positions");
var applicationsRouter = require("./routes/api/applications");
var favoritesRouter = require("./routes/api/favorites");
var resumesRouter = require("./routes/api/resumes");
var questionBanksRouter = require("./routes/api/questionBanks");
var deliveriesRouter = require("./routes/api/deliveries");
var aiPreInterviewsRouter = require("./routes/api/aiPreInterviews");
var interviewInvitationsRouter = require("./routes/api/interviewInvitations");
var notificationsRouter = require("./routes/api/notifications");
var aiChatRouter = require("./routes/api/aiChat");

var app = express();

// 配置CORS中间件
app.use(
  cors({
    origin: "*", // 允许所有来源，生产环境中应该设置具体的前端域名
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// 提供上传文件的静态文件服务
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/teams", teamsRouter);
app.use("/api/positions", positionsRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/resumes", resumesRouter);
app.use("/api/questionBanks", questionBanksRouter);
app.use("/api/deliveries", deliveriesRouter);
app.use("/api/aiPreInterviews", aiPreInterviewsRouter);
app.use("/api/interviewInvitations", interviewInvitationsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/aiChat", aiChatRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
