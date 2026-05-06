const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { verifySeller, verifyBuyer, verifyToken } = require("../Middleware/authmiddleware");
const orderController = require("../Controllers/order.controller");

const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, "prescription-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, WebP and HEIC images are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post("/", verifyBuyer, upload.single("prescriptionImage"), orderController.createOrder);

router.get("/", verifySeller, orderController.getOrders);
router.get("/accepted", verifySeller, orderController.getAcceptedOrders);
router.get("/buyer/:buyerId", verifyBuyer, orderController.getOrdersByBuyer);
router.get("/scheduled", verifySeller, orderController.getScheduledOrders);

router.patch("/:orderId/cancel", verifyBuyer, orderController.cancelOrder);
router.patch("/:orderId/schedule", verifyBuyer, orderController.scheduleOrder);
router.patch("/:orderId/respond", verifySeller, orderController.sellerRespondToOrder);
router.patch("/:orderId/status", verifySeller, orderController.updateOrderStatus);

router.get("/:orderId", verifyToken, orderController.getOrderById);

module.exports = router;
