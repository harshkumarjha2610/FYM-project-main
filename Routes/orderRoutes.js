// const express = require("express");
// console.log("✅ Express module imported successfully");

// const router = express.Router();
// console.log("🚀 Express router instance created");

// // ✅ CRITICAL FIX: Import authentication middleware
// const { verifySeller, verifyBuyer, verifyToken } = require("../Middleware/authmiddleware");
// console.log("🔐 Authentication middleware imported successfully");

// const orderController = require("../Controllers/order.controller");
// console.log("📦 Order controller imported successfully");
// console.log("🔍 Available controller methods:", Object.keys(orderController));

// // -------------------------------------------------------------------
// // ROUTES WITH PROPER AUTHENTICATION
// // -------------------------------------------------------------------

// // Create new order (requires buyer authentication)
// console.log("📝 Setting up POST / route with buyer auth...");
// router.post("/", verifyBuyer, orderController.createOrder);
// console.log("✅ POST / route registered successfully (🔐 buyer auth)");

// // Get ALL orders (requires seller authentication to see seller's orders)
// console.log("📝 Setting up GET / route with seller auth...");
// router.get("/", verifySeller, orderController.getOrders);
// console.log("✅ GET / route registered successfully (🔐 seller auth)");

// // Get orders by buyer ID (requires buyer authentication)
// console.log("📝 Setting up GET /buyer/:buyerId route with buyer auth...");
// router.get("/buyer/:buyerId", verifyBuyer, orderController.getOrdersByBuyer);
// console.log("✅ GET /buyer/:buyerId route registered successfully (🔐 buyer auth)");

// // Get single order by ID (requires authentication)
// console.log("📝 Setting up GET /:orderId route with auth...");
// router.get("/:orderId", verifyToken, orderController.getOrderById);
// console.log("✅ GET /:orderId route registered successfully (🔐 auth)");

// // ✅ CRITICAL FIX: Seller respond to order (accept/reject) - REQUIRES SELLER AUTH
// console.log("📝 Setting up PATCH /:orderId/respond route with seller auth...");
// router.patch("/:orderId/respond", verifySeller, orderController.sellerRespondToOrder);
// console.log("✅ PATCH /:orderId/respond route registered successfully (🔐 seller auth) ← FIXED!");

// console.log("🎯 All order routes configured successfully with authentication");
// console.log("📋 Route summary:");
// console.log("   ┌─────────────────────────────────────────────────────────┐");
// console.log("   │ POST   /                    (🔐 buyer auth)              │");
// console.log("   │ GET    /                    (🔐 seller auth)             │");
// console.log("   │ GET    /buyer/:buyerId      (🔐 buyer auth)             │");
// console.log("   │ GET    /:orderId            (🔐 token auth)             │");
// console.log("   │ PATCH  /:orderId/respond    (🔐 seller auth) ← FIXED!   │");
// console.log("   └─────────────────────────────────────────────────────────┘");

// module.exports = router;

// console.log("📤 Order router exported successfully");

const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

// ✅ CRITICAL FIX: Import authentication middleware
const { verifySeller, verifyBuyer, verifyToken } = require("../Middleware/authmiddleware");

const orderController = require("../Controllers/order.controller");

// ✅ CRITICAL FIX: Import and configure multer for file uploads
const multer = require("multer");

// ✅ CRITICAL FIX: Use absolute path for uploads directory (same as server.js)
const uploadDir = path.join(__dirname, "..", "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Created uploads directory:", uploadDir);
}

console.log("📁 Multer using upload directory:", uploadDir);

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("📁 Saving file to:", uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    const filename = "prescription-" + uniqueSuffix + ext;
    console.log("📝 Generated filename:", filename);
    cb(null, filename);
  },
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  console.log("🔍 Checking file type:", file.mimetype, file.originalname);
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"];
  if (allowedTypes.includes(file.mimetype)) {
    console.log("✅ File accepted");
    cb(null, true);
  } else {
    console.log("❌ File rejected - invalid type");
    cb(new Error("Invalid file type. Only JPEG, PNG, WebP and HEIC images are allowed."), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

console.log("✅ Multer configured successfully");

// -------------------------------------------------------------------
// ROUTES WITH PROPER AUTHENTICATION
// -------------------------------------------------------------------

// Create new order (requires buyer authentication) - WITH FILE UPLOAD
router.post("/", verifyBuyer, upload.single("prescriptionImage"), orderController.createOrder);
console.log("✅ POST / route registered (buyer auth + file upload)");

// Get ALL orders (requires seller authentication)
router.get("/", verifySeller, orderController.getOrders);
router.get("/accepted", verifySeller, orderController.getAcceptedOrders);
console.log("✅ GET / route registered (seller auth)");

// Get orders by buyer ID (requires buyer authentication)
router.get("/buyer/:buyerId", verifyBuyer, orderController.getOrdersByBuyer);
console.log("✅ GET /buyer/:buyerId route registered (buyer auth)");

// Get single order by ID (requires authentication)
router.get("/:orderId", verifyToken, orderController.getOrderById);
console.log("✅ GET /:orderId route registered (auth)");

// Get all scheduled orders (for sellers)
router.get("/scheduled", verifySeller, orderController.getScheduledOrders);
console.log("✅ GET /scheduled route registered (seller auth)");

// Cancel order (requires buyer authentication)
router.patch("/:orderId/cancel", verifyBuyer, orderController.cancelOrder);
console.log("✅ PATCH /:orderId/cancel route registered (buyer auth)");

// Schedule order for later (requires buyer authentication)
router.patch("/:orderId/schedule", verifyBuyer, orderController.scheduleOrder);
console.log("✅ PATCH /:orderId/schedule route registered (buyer auth)");

// Seller respond to order (accept/reject) - REQUIRES SELLER AUTH
router.patch("/:orderId/respond", verifySeller, orderController.sellerRespondToOrder);
console.log("✅ PATCH /:orderId/respond route registered (seller auth)");

console.log("🎯 All order routes configured");

module.exports = router;