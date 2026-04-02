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

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/api/users");
var teamsRouter = require("./routes/api/teams");
var positionsRouter = require("./routes/api/positions");
var applicationsRouter = require("./routes/api/applications");

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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// 提供上传文件的静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/teams", teamsRouter);
app.use("/api/positions", positionsRouter);
app.use("/api/applications", applicationsRouter);

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

// 初始化数据库索引
async function initIndexes() {
  try {
    // 初始化用户模型索引
    // await userModel.initIndexes();
    // 初始化团队模型索引
    // await teamModel.initIndexes();
    // 初始化岗位模型索引
    // await positionModel.initIndexes();
    console.log("Database indexes initialized successfully");
  } catch (error) {
    console.error("Error initializing database indexes:", error);
  }
}

// 调用初始化函数
initIndexes();

module.exports = app;
