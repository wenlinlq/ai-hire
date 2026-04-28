const express = require("express");
const router = express.Router();
const deliveryController = require("../../controllers/deliveryController");

// 创建投递记录
router.post("/", deliveryController.createDelivery.bind(deliveryController));

// 获取用户的投递记录
router.get("/user/:userId", deliveryController.getUserDeliveries);

// 获取投递记录详情
router.get("/:deliveryId", deliveryController.getDeliveryById);

// 更新投递记录状态
router.put("/:deliveryId/status", deliveryController.updateDeliveryStatus);

module.exports = router;
