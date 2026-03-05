// // ===================================================================
// // Medicine-Delivery API – Main Entry Point (index.js)
// // ===================================================================

// console.log("🚀 === MEDICINE DELIVERY API SERVER INITIALIZATION START ===");
// console.log("📅 Server startup time:", new Date().toISOString());
// console.log("🔧 Node.js version:", process.version);
// console.log("🔧 Platform:", process.platform);
// console.log("🔧 Architecture:", process.arch);

// console.log("📦 Loading environment variables...");
// require("dotenv").config();
// console.log("✅ Environment variables loaded");
// console.log("🌍 NODE_ENV:", process.env.NODE_ENV || 'development');
// console.log("🔗 MONGO_URI exists:", !!process.env.MONGO_URI);
// console.log("🔑 JWT_SECRET exists:", !!process.env.JWT_SECRET);

// console.log("📦 Loading core dependencies...");
// const express = require("express");
// console.log("✅ Express loaded");
// const cors = require("cors");
// console.log("✅ CORS loaded");
// const connectDB = require("./DB/conn");
// console.log("✅ Database connection module loaded");
// const http = require("http");
// console.log("✅ HTTP module loaded");
// const { Server } = require("socket.io");
// console.log("✅ Socket.IO loaded");

// // ---------- 1. App & Server Setup ----------
// console.log("\n📱 === STEP 1: APP & SERVER SETUP ===");
// console.log("🏗️ Creating Express application...");
// const app = express();
// console.log("✅ Express app created successfully");

// console.log("🏗️ Creating HTTP server...");
// const server = http.createServer(app);
// console.log("✅ HTTP server created successfully");

// console.log("🔍 Determining PORT...");
// const PORT = process.env.PORT || 3000;
// console.log("🌐 PORT determined:", PORT);
// console.log("🌐 PORT source:", process.env.PORT ? "Environment variable" : "Default (3000)");

// // ---------- 2. MongoDB ----------
// console.log("\n🗄️ === STEP 2: MONGODB CONNECTION ===");
// console.log("🔌 Attempting MongoDB connection...");
// connectDB()
//   .then(() => {
//     console.log("✅ MongoDB connected successfully");
//     console.log("🗄️ Database connection established");
//   })
//   .catch((err) => {
//     console.error("❌ MongoDB connection failed");
//     console.error("❌ MongoDB connection error:", err.message);
//     console.error("❌ Full error details:", JSON.stringify(err, null, 2));
//     console.error("💥 Exiting process due to database connection failure");
//     process.exit(1);
//   });

// // ---------- 3. Middleware ----------
// console.log("\n⚙️ === STEP 3: MIDDLEWARE SETUP ===");
// console.log("🔧 Configuring CORS options...");

// const corsOptions = {
//   origin: [
//     "http://localhost:8081",
//     "http://localhost:3001", 
//     "http://127.0.0.1:8081",
//     "http://localhost:3000",
//     "http://192.168.1.3:8081", // Replace with your actual IP address
//     "http://192.168.1.5:8081", // Replace with your actual IP address
//     "http://192.168.1.3:3000",
//     "http://192.168.1.5:3000",
//     "https://rambackend-1-qmpn.onrender.com" // Replace with your actual IP address
//   ],
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//   credentials: true,
//   allowedHeaders: ["Content-Type", "Authorization"]
// };


// console.log("🌍 CORS origins configured:", corsOptions.origin);
// console.log("📝 CORS methods allowed:", corsOptions.methods);
// console.log("🍪 CORS credentials enabled:", corsOptions.credentials);

// console.log("🔧 Applying CORS middleware...");
// app.use(cors(corsOptions));
// console.log("✅ CORS middleware applied");

// console.log("📝 Configuring JSON parser middleware...");
// console.log("📝 JSON payload limit: 50mb");
// app.use(express.json({ limit: "50mb" }));
// console.log("✅ JSON parser middleware applied");

// console.log("📝 Configuring URL-encoded parser middleware...");
// console.log("📝 URL-encoded payload limit: 50mb");
// console.log("📝 URL-encoded extended mode: true");
// app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// console.log("✅ URL-encoded parser middleware applied");

// console.log("📁 Configuring static file serving...");
// console.log("📁 Static directory: /Uploads");
// console.log("📁 Static route: /Uploads");
// app.use("/uploads", express.static("uploads"));
// console.log("✅ Static file middleware applied");

// // ---------- 4. Routes ----------
// console.log("\n🛣️ === STEP 4: ROUTES SETUP ===");
// console.log("📦 Loading route modules...");

// console.log("💊 Loading medicine routes...");
// const medicineRoutes = require("./Routes/MedicineRoutes");
// console.log("✅ Medicine routes loaded");

// console.log("🛒 Loading buyer routes...");
// const buyerRoutes = require("./Routes/UserRoutes");
// console.log("✅ Buyer routes loaded");

// console.log("📦 Loading order routes...");
// const orderRoutes = require("./Routes/orderRoutes");
// console.log("✅ Order routes loaded");

// console.log("👑 Loading admin seller routes...");
// const adminSellerRoutes = require("./Routes/adminSeller.Routes");
// console.log("✅ Admin seller routes loaded");

// console.log("\n🔗 Mounting routes to Express app...");

// // Admin Routes (unauthenticated, for seller management)
// console.log("👑 Mounting admin seller routes at /api/admin/sellers...");
// app.use("/api/admin/sellers", (req, res, next) => {
//   const timestamp = new Date().toISOString();
//   console.log(`[${timestamp}] 👑 Admin Seller API: ${req.method} ${req.originalUrl}`);
//   console.log(`[${timestamp}] 📍 Route: ${req.path}`);
//   console.log(`[${timestamp}] 🔍 Query params:`, JSON.stringify(req.query, null, 2));
//   // ✅ FIXED: Safe handling of req.body when it's undefined
//   console.log(`[${timestamp}] 📦 Request body size:`, req.body ? JSON.stringify(req.body).length : 0, 'characters');
//   console.log(`[${timestamp}] 🌍 Client IP:`, req.ip);
//   console.log(`[${timestamp}] 🔧 User-Agent:`, req.get('User-Agent'));
//   next();
// }, adminSellerRoutes);
// console.log("✅ Admin seller routes mounted successfully");

// console.log("🏪 Mounting seller routes at /api/seller...");
// app.use("/api/seller", (req, res, next) => {
//   const timestamp = new Date().toISOString();
//   console.log(`[${timestamp}] 🏪 Seller API: ${req.method} ${req.originalUrl}`);
//   console.log(`[${timestamp}] 📍 Route: ${req.path}`);
//   console.log(`[${timestamp}] 🔍 Query params:`, JSON.stringify(req.query, null, 2));
//   console.log(`[${timestamp}] 📦 Request body keys:`, Object.keys(req.body || {}));
//   console.log(`[${timestamp}] 🔐 Authorization header exists:`, !!req.get('Authorization'));
//   console.log(`[${timestamp}] 📱 Content-Type:`, req.get('Content-Type'));
//   next();
// }, adminSellerRoutes);
// console.log("✅ Seller routes mounted successfully");

// // Buyer Routes  
// console.log("🛒 Mounting buyer routes at /api/buyer...");
// app.use("/api/buyer", (req, res, next) => {
//   const timestamp = new Date().toISOString();
//   console.log(`[${timestamp}] 🛒 Buyer API: ${req.method} ${req.originalUrl}`);
//   console.log(`[${timestamp}] 📍 Route: ${req.path}`);
//   console.log(`[${timestamp}] 🔍 Query params:`, JSON.stringify(req.query, null, 2));
//   console.log(`[${timestamp}] 📦 Request body present:`, !!req.body && Object.keys(req.body).length > 0);
//   console.log(`[${timestamp}] 🌍 Client IP:`, req.ip);
//   next();
// }, buyerRoutes);
// console.log("✅ Buyer routes mounted successfully");

// // Medicine Routes
// console.log("💊 Mounting medicine routes at /api...");
// app.use("/api", (req, res, next) => {
//   const timestamp = new Date().toISOString();
//   console.log(`[${timestamp}] 💊 Medicine API: ${req.method} ${req.originalUrl}`);
//   console.log(`[${timestamp}] 📍 Route: ${req.path}`);
//   console.log(`[${timestamp}] 🔍 Query params:`, JSON.stringify(req.query, null, 2));
//   console.log(`[${timestamp}] 🌍 Client IP:`, req.ip);
//   next();
// }, medicineRoutes);
// console.log("✅ Medicine routes mounted successfully");

// // Orders Routes
// console.log("📦 Mounting order routes at /api/orders...");
// app.use("/api/orders", (req, res, next) => {
//   const timestamp = new Date().toISOString();
//   console.log(`[${timestamp}] 📦 Orders API: ${req.method} ${req.originalUrl}`);
//   console.log(`[${timestamp}] 📍 Route: ${req.path}`);
//   console.log(`[${timestamp}] 🔍 Query params:`, JSON.stringify(req.query, null, 2));
//   console.log(`[${timestamp}] 📦 Request body keys:`, Object.keys(req.body || {}));
//   console.log(`[${timestamp}] 🌍 Client IP:`, req.ip);
//   next();
// }, orderRoutes);
// console.log("✅ Order routes mounted successfully");

// console.log("🎯 All routes mounted successfully!");

// // ---------- 5. Test & Debug ----------
// console.log("\n🧪 === STEP 5: TEST & DEBUG ROUTES ===");

// console.log("🧪 Setting up test endpoint...");
// app.get("/api/test", (req, res) => {
//   const testData = {
//     success: true,
//     message: "Server is working!",
//     ip: req.ip,
//     ts: new Date().toISOString(),
//     uptime: process.uptime(),
//     memory: process.memoryUsage(),
//     env: process.env.NODE_ENV || 'development'
//   };
  
//   console.log("🧪 Test endpoint called:", testData);
//   res.json(testData);
// });
// console.log("✅ Test endpoint configured at /api/test");

// console.log("🔍 Setting up debug routes endpoint...");
// app.get("/api/debug/routes", (req, res) => {
//   console.log("🔍 Debug routes endpoint called");
//   const routes = [];
  
//   console.log("🔍 Analyzing Express router stack...");
//   app._router.stack.forEach((mw, index) => {
//     console.log(`🔍 Middleware ${index}:`, mw.regexp, mw.keys);
    
//     if (mw.route) {
//       const routeInfo = { 
//         path: mw.route.path, 
//         methods: Object.keys(mw.route.methods) 
//       };
//       routes.push(routeInfo);
//       console.log(`🔍 Direct route found:`, routeInfo);
//     } else if (mw.name === "router") {
//       console.log(`🔍 Router middleware found, analyzing nested routes...`);
//       mw.handle.stack.forEach((h, subIndex) => {
//         console.log(`🔍 Nested route ${subIndex}:`, h.route?.path);
//         if (h.route) {
//           const nestedRouteInfo = { 
//             path: h.route.path, 
//             methods: Object.keys(h.route.methods) 
//           };
//           routes.push(nestedRouteInfo);
//           console.log(`🔍 Nested route found:`, nestedRouteInfo);
//         }
//       });
//     }
//   });
  
//   console.log("🔍 Total routes found:", routes.length);
//   res.json({ routes, totalCount: routes.length });
// });
// console.log("✅ Debug routes endpoint configured at /api/debug/routes");

// // ---------- 6. Error Handling ----------
// console.log("\n🚨 === STEP 6: ERROR HANDLING SETUP ===");
// console.log("🚨 Setting up global error handler...");

// app.use((err, req, res, next) => {
//   const timestamp = new Date().toISOString();
//   const errorId = Math.random().toString(36).substring(7);
  
//   console.error(`[${timestamp}] 🚨 ERROR [ID: ${errorId}] ===`);
//   console.error(`[${timestamp}] 🚨 Error Name: ${err.name}`);
//   console.error(`[${timestamp}] 🚨 Error Message: ${err.message}`);
//   console.error(`[${timestamp}] 🚨 Request Method: ${req.method}`);
//   console.error(`[${timestamp}] 🚨 Request URL: ${req.originalUrl}`);
//   console.error(`[${timestamp}] 🚨 Request IP: ${req.ip}`);
//   console.error(`[${timestamp}] 🚨 User Agent: ${req.get('User-Agent')}`);
//   console.error(`[${timestamp}] 🚨 Stack Trace:`, err.stack);

//   let status = 500;
//   let body = { 
//     success: false, 
//     message: err.message,
//     errorId: errorId,
//     timestamp: timestamp
//   };

//   console.log(`[${timestamp}] 🔍 Determining error type...`);
  
//   if (err.name === "ValidationError") {
//     console.log(`[${timestamp}] ✅ Validation error detected`);
//     status = 400;
//     body.errors = Object.values(err.errors).map((e) => e.message);
//     console.log(`[${timestamp}] 📝 Validation errors:`, body.errors);
//   }
  
//   if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
//     console.log(`[${timestamp}] 🔐 JWT error detected:`, err.name);
//     status = 401;
//     body.message = err.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
//   }

//   console.log(`[${timestamp}] 📤 Sending error response - Status: ${status}`);
//   console.log(`[${timestamp}] 📤 Error response body:`, JSON.stringify(body, null, 2));
  
//   res.status(status).json(body);
// });

// console.log("✅ Global error handler configured");

// // ---------- 7. Socket.IO ----------
// console.log("\n⚡ === STEP 7: SOCKET.IO SETUP ===");
// console.log("⚡ Creating Socket.IO server...");

// const io = new Server(server, {
//   cors: {
//     origin: ["http://localhost:3000", "http://localhost:3001"],
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// console.log("✅ Socket.IO server created");
// console.log("⚡ Socket.IO CORS origins:", ["http://localhost:3000", "http://localhost:3001"]);

// console.log("⚡ Attaching Socket.IO to Express app...");
// app.set("io", io);
// console.log("✅ Socket.IO attached to Express app");

// console.log("⚡ Setting up Socket.IO connection handlers...");
// io.on("connection", (socket) => {
//   const timestamp = new Date().toISOString();
//   console.log(`[${timestamp}] ⚡ New socket connected: ${socket.id}`);
//   console.log(`[${timestamp}] ⚡ Socket handshake:`, JSON.stringify(socket.handshake.headers, null, 2));
//   console.log(`[${timestamp}] ⚡ Total connected clients:`, io.engine.clientsCount);

//   // Buyer joins room
//   socket.on("joinBuyer", (buyerId) => {
//     const joinTimestamp = new Date().toISOString();
//     console.log(`[${joinTimestamp}] 🛒 Buyer joining room: ${buyerId}`);
//     console.log(`[${joinTimestamp}] 🛒 Socket ID: ${socket.id}`);
    
//     socket.join(`buyer_${buyerId}`);
//     console.log(`[${joinTimestamp}] ✅ Buyer ${buyerId} joined room successfully`);
    
//     const roomSize = io.sockets.adapter.rooms.get(`buyer_${buyerId}`)?.size || 0;
//     console.log(`[${joinTimestamp}] 🛒 Room buyer_${buyerId} size: ${roomSize}`);
//   });

//   // Socket error handling
//   socket.on("error", (error) => {
//     const errorTimestamp = new Date().toISOString();
//     console.error(`[${errorTimestamp}] ❌ Socket error for ${socket.id}:`, error);
//   });

//   // Disconnect
//   socket.on("disconnect", (reason) => {
//     const disconnectTimestamp = new Date().toISOString();
//     console.log(`[${disconnectTimestamp}] ❌ Socket disconnected: ${socket.id}`);
//     console.log(`[${disconnectTimestamp}] ❌ Disconnect reason: ${reason}`);
//     console.log(`[${disconnectTimestamp}] ⚡ Remaining connected clients:`, io.engine.clientsCount - 1);
//   });
// });

// console.log("✅ Socket.IO connection handlers configured");

// // ---------- 8. Shutdown ----------
// console.log("\n⚠️ === STEP 8: GRACEFUL SHUTDOWN SETUP ===");

// console.log("⚠️ Setting up process signal handlers...");
// ["SIGTERM", "SIGINT"].forEach((sig) => {
//   console.log(`⚠️ Registering handler for signal: ${sig}`);
//   process.on(sig, () => {
//     const shutdownTimestamp = new Date().toISOString();
//     console.log(`[${shutdownTimestamp}] ⚠️ ${sig} received, initiating graceful shutdown...`);
//     console.log(`[${shutdownTimestamp}] ⚠️ Server uptime: ${process.uptime()} seconds`);
//     console.log(`[${shutdownTimestamp}] ⚠️ Memory usage:`, process.memoryUsage());
    
//     console.log(`[${shutdownTimestamp}] 🔌 Closing HTTP server...`);
//     server.close(() => {
//       console.log(`[${shutdownTimestamp}] ✅ HTTP server closed successfully`);
//       console.log(`[${shutdownTimestamp}] 🔌 Closing Socket.IO connections...`);
//       io.close();
//       console.log(`[${shutdownTimestamp}] ✅ Socket.IO closed successfully`);
//       console.log(`[${shutdownTimestamp}] 💯 Graceful shutdown complete`);
//       process.exit(0);
//     });
//   });
// });

// console.log("✅ Process signal handlers registered");

// console.log("⚠️ Setting up unhandled rejection handler...");
// process.on("unhandledRejection", (reason, promise) => {
//   const rejectionTimestamp = new Date().toISOString();
//   console.error(`[${rejectionTimestamp}] 🚨 Unhandled Rejection at:`, promise);
//   console.error(`[${rejectionTimestamp}] 🚨 Rejection reason:`, reason);
//   console.error(`[${rejectionTimestamp}] 💥 Exiting due to unhandled rejection...`);
//   process.exit(1);
// });

// console.log("✅ Unhandled rejection handler registered");

// console.log("⚠️ Setting up uncaught exception handler...");
// process.on("uncaughtException", (err) => {
//   const exceptionTimestamp = new Date().toISOString();
//   console.error(`[${exceptionTimestamp}] 🚨 Uncaught Exception:`, err.name);
//   console.error(`[${exceptionTimestamp}] 🚨 Exception message:`, err.message);
//   console.error(`[${exceptionTimestamp}] 🚨 Exception stack:`, err.stack);
//   console.error(`[${exceptionTimestamp}] 💥 Exiting due to uncaught exception...`);
//   process.exit(1);
// });

// console.log("✅ Uncaught exception handler registered");

// // ---------- 9. Start Server ----------
// console.log("\n🚀 === STEP 9: SERVER STARTUP ===");
// console.log("🚀 Starting HTTP server...");
// console.log("🌐 Binding to address: 0.0.0.0");
// console.log("🌐 Port:", PORT);

// server.listen(PORT, "0.0.0.0", (err) => {
//   const startupTimestamp = new Date().toISOString();
  
//   if (err) {
//     console.error(`[${startupTimestamp}] ❌ Server start error:`, err);
//     console.error(`[${startupTimestamp}] ❌ Error details:`, JSON.stringify(err, null, 2));
//     console.error(`[${startupTimestamp}] 💥 Exiting due to server start failure...`);
//     process.exit(1);
//   }
  
//   console.log(`[${startupTimestamp}] ✅ === SERVER SUCCESSFULLY STARTED ===`);
//   console.log(`[${startupTimestamp}] 🎉 SERVER RUNNING 🎉`);
//   console.log(`[${startupTimestamp}] 📍 Local:   http://localhost:${PORT}`);
//   console.log(`[${startupTimestamp}] 🌐 Network: http://0.0.0.0:${PORT}`);
//   console.log(`[${startupTimestamp}] ⏰ Started at: ${startupTimestamp}`);
//   console.log(`[${startupTimestamp}] 🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
//   console.log(`[${startupTimestamp}] 💾 Memory usage:`, process.memoryUsage());
//   console.log(`[${startupTimestamp}] 🎯 === READY TO ACCEPT CONNECTIONS ===`);
// });

// console.log("⏳ Server startup initiated...");
// console.log("🎯 === MEDICINE DELIVERY API INITIALIZATION COMPLETE ===\n");


// ===================================================================
// Medicine-Delivery API – Main Entry Point (index.js)
// ===================================================================

console.log("🚀 === MEDICINE DELIVERY API SERVER INITIALIZATION START ===");
console.log("📅 Server startup time:", new Date().toISOString());
console.log("🔧 Node.js version:", process.version);
console.log("🔧 Platform:", process.platform);
console.log("🔧 Architecture:", process.arch);

console.log("📦 Loading environment variables...");
require("dotenv").config();
console.log("✅ Environment variables loaded");
console.log("🌍 NODE_ENV:", process.env.NODE_ENV || 'development');
console.log("🔗 MONGO_URI exists:", !!process.env.MONGO_URI);
console.log("🔑 JWT_SECRET exists:", !!process.env.JWT_SECRET);

console.log("📦 Loading core dependencies...");
const express = require("express");
console.log("✅ Express loaded");
const cors = require("cors");
console.log("✅ CORS loaded");
const connectDB = require("./DB/conn");
console.log("✅ Database connection module loaded");
const http = require("http");
console.log("✅ HTTP module loaded");
const { Server } = require("socket.io");
console.log("✅ Socket.IO loaded");
const path = require("path");
console.log("✅ Path module loaded");

// ---------- 1. App & Server Setup ----------
console.log("\n📱 === STEP 1: APP & SERVER SETUP ===");
console.log("🏗️ Creating Express application...");
const app = express();
console.log("✅ Express app created successfully");

console.log("🏗️ Creating HTTP server...");
const server = http.createServer(app);
console.log("✅ HTTP server created successfully");

console.log("🔍 Determining PORT...");
const PORT = process.env.PORT || 3000;
console.log("🌐 PORT determined:", PORT);
console.log("🌐 PORT source:", process.env.PORT ? "Environment variable" : "Default (3000)");

// ---------- 2. MongoDB ----------
console.log("\n🗄️ === STEP 2: MONGODB CONNECTION ===");
console.log("🔌 Attempting MongoDB connection...");
connectDB()
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log("🗄️ Database connection established");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed");
    console.error("❌ MongoDB connection error:", err.message);
    console.error("❌ Full error details:", JSON.stringify(err, null, 2));
    console.error("💥 Exiting process due to database connection failure");
    process.exit(1);
  });

// ---------- 3. Middleware ----------
console.log("\n⚙️ === STEP 3: MIDDLEWARE SETUP ===");
console.log("🔧 Configuring CORS options...");

// ✅ CRITICAL FIX: Remove trailing spaces from CORS origins
const corsOptions = {
  origin: [
    "http://localhost:8081",
    "http://localhost:3001", 
    "http://127.0.0.1:8081",
    "http://localhost:3000",
    "http://192.168.1.3:8081",
    "http://192.168.1.5:8081",
    "http://192.168.1.9:8081",
    "http://192.168.1.3:3000",
    "http://192.168.1.5:3000",
    "http://192.168.1.9:3000",
    "https://rambackend-1-qmpn.onrender.com",
    // Add your production domain if different
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
};

console.log("🌍 CORS origins configured:", corsOptions.origin);
console.log("📝 CORS methods allowed:", corsOptions.methods);
console.log("🍪 CORS credentials enabled:", corsOptions.credentials);

console.log("🔧 Applying CORS middleware...");
app.use(cors(corsOptions));
console.log("✅ CORS middleware applied");

console.log("📝 Configuring JSON parser middleware...");
app.use(express.json({ limit: "50mb" }));
console.log("✅ JSON parser middleware applied");

console.log("📝 Configuring URL-encoded parser middleware...");
console.log("📝 URL-encoded payload limit: 50mb");
console.log("📝 URL-encoded extended mode: true");
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
console.log("✅ URL-encoded parser middleware applied");

// ✅ CRITICAL FIX: Static file serving - MUST be before routes
console.log("📁 Configuring static file serving...");
const uploadsPath = path.join(__dirname, "uploads");
console.log("📁 Uploads absolute path:", uploadsPath);
app.use("/uploads", express.static(uploadsPath));
console.log("✅ Static file middleware applied at:", uploadsPath);

// ---------- 4. Routes ----------
console.log("\n🛣️ === STEP 4: ROUTES SETUP ===");
console.log("📦 Loading route modules...");

console.log("💊 Loading medicine routes...");
const medicineRoutes = require("./Routes/MedicineRoutes");
console.log("✅ Medicine routes loaded");

console.log("🛒 Loading buyer routes...");
const buyerRoutes = require("./Routes/UserRoutes");
console.log("✅ Buyer routes loaded");

console.log("📦 Loading order routes...");
const orderRoutes = require("./Routes/orderRoutes");
console.log("✅ Order routes loaded");

console.log("👑 Loading admin seller routes...");
const adminSellerRoutes = require("./Routes/adminSeller.Routes");
console.log("✅ Admin seller routes loaded");

console.log("\n🔗 Mounting routes to Express app...");

// Admin Routes (unauthenticated, for seller management)
console.log("👑 Mounting admin seller routes at /api/admin/sellers...");
app.use("/api/admin/sellers", (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 👑 Admin Seller API: ${req.method} ${req.originalUrl}`);
  next();
}, adminSellerRoutes);
console.log("✅ Admin seller routes mounted successfully");

console.log("🏪 Mounting seller routes at /api/seller...");
app.use("/api/seller", (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🏪 Seller API: ${req.method} ${req.originalUrl}`);
  next();
}, adminSellerRoutes);
console.log("✅ Seller routes mounted successfully");

// Buyer Routes  
console.log("🛒 Mounting buyer routes at /api/buyer...");
app.use("/api/buyer", (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🛒 Buyer API: ${req.method} ${req.originalUrl}`);
  next();
}, buyerRoutes);
console.log("✅ Buyer routes mounted successfully");

// Medicine Routes
console.log("💊 Mounting medicine routes at /api...");
app.use("/api", (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 💊 Medicine API: ${req.method} ${req.originalUrl}`);
  next();
}, medicineRoutes);
console.log("✅ Medicine routes mounted successfully");

// Orders Routes
console.log("📦 Mounting order routes at /api/orders...");
app.use("/api/orders", (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 📦 Orders API: ${req.method} ${req.originalUrl}`);
  console.log(`[${timestamp}] 📸 Content-Type:`, req.get('Content-Type'));
  next();
}, orderRoutes);
console.log("✅ Order routes mounted successfully");

console.log("🎯 All routes mounted successfully!");

// ---------- 5. Test & Debug ----------
console.log("\n🧪 === STEP 5: TEST & DEBUG ROUTES ===");

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Server is working!",
    uploadsPath: uploadsPath,
    timestamp: new Date().toISOString()
  });
});

// ✅ DEBUG: Check if file exists
app.get("/api/debug/file/:filename", (req, res) => {
  const fs = require('fs');
  const filePath = path.join(uploadsPath, req.params.filename);
  console.log("🔍 Checking file:", filePath);
  
  if (fs.existsSync(filePath)) {
    res.json({ exists: true, path: filePath, size: fs.statSync(filePath).size });
  } else {
    res.status(404).json({ exists: false, path: filePath, message: "File not found" });
  }
});

console.log("✅ Test endpoints configured");

// ---------- 6. Error Handling ----------
console.log("\n🚨 === STEP 6: ERROR HANDLING SETUP ===");

app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const errorId = Math.random().toString(36).substring(7);
  
  console.error(`[${timestamp}] 🚨 ERROR [ID: ${errorId}] ===`);
  console.error(`[${timestamp}] 🚨 Error Name: ${err.name}`);
  console.error(`[${timestamp}] 🚨 Error Message: ${err.message}`);
  console.error(`[${timestamp}] 🚨 Request Method: ${req.method}`);
  console.error(`[${timestamp}] 🚨 Request URL: ${req.originalUrl}`);

  let status = 500;
  let body = { 
    success: false, 
    message: err.message,
    errorId: errorId,
    timestamp: timestamp
  };

  if (err.name === "ValidationError") {
    status = 400;
    body.errors = Object.values(err.errors).map((e) => e.message);
  }
  
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    status = 401;
    body.message = err.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
  }

  // ✅ Handle Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    status = 400;
    body.message = "File size too large. Maximum size is 5MB.";
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    status = 400;
    body.message = "Unexpected file field. Expected field name: prescriptionImage";
  }

  res.status(status).json(body);
});

console.log("✅ Global error handler configured");

// ---------- 7. Socket.IO ----------
console.log("\n⚡ === STEP 7: SOCKET.IO SETUP ===");

const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

console.log("✅ Socket.IO server created");

app.set("io", io);
console.log("✅ Socket.IO attached to Express app");

io.on("connection", (socket) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ⚡ New socket connected: ${socket.id}`);

  socket.on("joinBuyer", (buyerId) => {
    socket.join(`buyer_${buyerId}`);
    console.log(`✅ Buyer ${buyerId} joined room`);
  });

  socket.on("joinSeller", (sellerId) => {
    socket.join(`seller_${sellerId}`);
    console.log(`✅ Seller ${sellerId} joined room`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`❌ Socket disconnected: ${socket.id}, reason: ${reason}`);
  });
});

console.log("✅ Socket.IO connection handlers configured");

// ---------- 8. Shutdown ----------
console.log("\n⚠️ === STEP 8: GRACEFUL SHUTDOWN SETUP ===");

["SIGTERM", "SIGINT"].forEach((sig) => {
  process.on(sig, () => {
    console.log(`\n⚠️ ${sig} received, shutting down gracefully...`);
    server.close(() => {
      console.log("✅ HTTP server closed");
      io.close();
      console.log("✅ Socket.IO closed");
      process.exit(0);
    });
  });
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("🚨 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("🚨 Uncaught Exception:", err);
  process.exit(1);
});

console.log("✅ Process handlers registered");

// ---------- 9. Start Server ----------
console.log("\n🚀 === STEP 9: SERVER STARTUP ===");

server.listen(PORT, "0.0.0.0", (err) => {
  if (err) {
    console.error("❌ Server start error:", err);
    process.exit(1);
  }
  
  console.log(`🎉 SERVER RUNNING`);
  console.log(`📍 Local:   http://localhost:${PORT}`);
  console.log(`🌐 Network: http://0.0.0.0:${PORT}`);
  console.log(`📁 Uploads: ${uploadsPath}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

console.log("⏳ Server startup initiated...\n");