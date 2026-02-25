// // ===================================================================
// // Order Controller (order.controller.js)
// // ===================================================================
// const Order = require("../Models/order.js");
// const Seller = require("../Models/seller.model.js");

// const radius = [2000, 5000, 7000, 10000, 100000, 100000];
// async function notifySellers(order, longitude, latitude, io) {
//   try {
//     for (const r of radius) {
//       const freshOrder = await Order.findById(order._id);
//       if (freshOrder.status === "accepted") break;

//       const sellers = await Seller.find({
//         location: {
//           $near: {
//             $geometry: { type: "Point", coordinates: [longitude, latitude] },
//             $maxDistance: r,
//           },
//         },
//       });

//       const now = new Date();
//       console.log("Time: ", now);
//       console.log("Sellers: ", sellers.length);

//       sellers.forEach(s => {
//         io.to(`seller_${s._id}`).emit("newOrder", order);
//       });

//       await new Promise(resolve => setTimeout(resolve, 10000));
//     }
//   } catch (err) {
//     console.error("Seller notify error:", err);
//   }
// }

// // -------------------------------------------------------------------
// // Create a new order
// // -------------------------------------------------------------------
// exports.createOrder = async (req, res) => {
//   console.log("🚀 Starting createOrder");
//   console.log("BODY:", req.body);
//   console.log("FILE:", req.file);

//   try {
//     const { buyerId, totalAmount, deliveryAddress } = req.body;

//     // ✅ items handling (JSON or FormData)
//     const items =
//       typeof req.body.items === "string"
//         ? JSON.parse(req.body.items)
//         : req.body.items || [];

//     // ✅ location handling
//     const location =
//       typeof req.body.location === "string"
//         ? JSON.parse(req.body.location)
//         : req.body.location;

//     let prescriptionImageUrl = null;

//     if (req.file) {
//       prescriptionImageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
//     }

//     console.log("🖼️ Prescription Image URL:", prescriptionImageUrl);

//     const [longitude, latitude] = location.coordinates;

//     const newOrder = new Order({
//       buyerId,
//       items,
//       totalAmount,
//       prescriptionImage: prescriptionImageUrl,
//       deliveryAddress,
//       location,
//       status: "pending",
//     });

//     await newOrder.save();

//     res.status(201).json({
//       message: "Order placed successfully",
//       order: newOrder,
//     });

//     const io = req.app.get("io");
//     process.nextTick(() =>
//       notifySellers(newOrder, longitude, latitude, io)
//     );

//   } catch (err) {
//     console.error("❌ createOrder error:", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// // -------------------------------------------------------------------
// // Get all orders (for debugging / admin use)
// // -------------------------------------------------------------------
// exports.getOrders = async (req, res) => {
//   try {
//     console.log("📥 Fetching all orders...");
//     const orders = await Order.find().sort({ createdAt: -1 });
//     console.log(`✅ Found ${orders.length} orders`);
//     res.status(200).json(orders);
//   } catch (error) {
//     console.error("❌ Error in getOrders:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// // -------------------------------------------------------------------
// // Get all orders by buyer
// // -------------------------------------------------------------------
// exports.getOrdersByBuyer = async (req, res) => {
//   try {
//     const buyerId = req.params.buyerId;
//     console.log(`📥 Fetching orders for buyer: ${buyerId}`);
//     const orders = await Order.find({ buyerId }).sort({ createdAt: -1 });
//     console.log(`✅ Found ${orders.length} orders for buyer`);
//     res.status(200).json(orders);
//   } catch (error) {
//     console.error("❌ Error in getOrdersByBuyer:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// // -------------------------------------------------------------------
// // Get single order
// // -------------------------------------------------------------------
// exports.getOrderById = async (req, res) => {
//   try {
//     const orderId = req.params.orderId;
//     console.log(`📥 Fetching order by ID: ${orderId}`);
//     const order = await Order.findById(orderId);

//     if (!order) {
//       console.log("⚠️ Order not found");
//       return res.status(404).json({ message: "Order not found" });
//     }
//     console.log("✅ Order found:", order._id);
//     res.status(200).json(order);
//   } catch (error) {
//     console.error("❌ Error in getOrderById:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// // -------------------------------------------------------------------
// // Seller responds to order (accept/reject)
// // -------------------------------------------------------------------
// exports.sellerRespondToOrder = async (req, res) => {
//   try {
//     console.log('\n📦 ========================================');
//     console.log('📦 SELLER RESPOND TO ORDER');
//     console.log('📦 ========================================');
//     console.log('⏰ Request time:', new Date().toISOString());
//     console.log('🆔 Order ID from params:', req.params.orderId);
//     console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
//     console.log('🔐 Authenticated seller from middleware:', req.seller);
//     console.log('📋 Request headers:', Object.keys(req.headers));

//     const { orderId } = req.params;
//     const { action, status } = req.body; // Accept both 'action' and 'status'
//     const io = req.app.get("io");

//     // ✅ Get seller ID from authenticated middleware (not from body)
//     const sellerId = req.seller?.sellerId || req.seller?.id || req.body.sellerId;
    
//     console.log('🔍 Seller ID resolved to:', sellerId);

//     // Validate seller authentication
//     if (!sellerId) {
//       console.log('❌ No seller ID found in request');
//       return res.status(401).json({ 
//         success: false,
//         message: "Authentication required - no seller ID" 
//       });
//     }

//     // Validate action
//     const finalAction = action || (status === 'accepted' ? 'accept' : status === 'rejected' ? 'reject' : null);
    
//     console.log('🔍 Action validation:', {
//       receivedAction: action,
//       receivedStatus: status,
//       finalAction: finalAction
//     });

//     if (!finalAction || !["accept", "reject"].includes(finalAction)) {
//       console.log('❌ Invalid action:', { action, status, finalAction });
//       return res.status(400).json({ 
//         success: false,
//         message: "Invalid action. Expected 'accept' or 'reject'" 
//       });
//     }

//     console.log(`📥 Seller ${sellerId} responding to order ${orderId} with action: ${finalAction}`);

//     // Find order
//     console.log('🔍 Finding order...');
//     const order = await Order.findById(orderId);
    
//     if (!order) {
//       console.log('❌ Order not found');
//       return res.status(404).json({ 
//         success: false,
//         message: "Order not found" 
//       });
//     }

//     console.log('✅ Order found:', {
//       orderId: order._id,
//       currentStatus: order.status,
//       buyer: order.buyerId || order.buyer,
//       currentSeller: order.sellerId || order.seller
//     });

//     // Check if order is still pending
//     if (order.status !== 'pending') {
//       console.log('❌ Order already processed:', order.status);
//       return res.status(400).json({
//         success: false,
//         message: `Order is already ${order.status}. Cannot modify.`
//       });
//     }

//     // Update order
//     const newStatus = finalAction === "accept" ? "accepted" : "rejected";
//     order.status = newStatus;
//     order.sellerId = sellerId;
//     order.seller = sellerId;
//     order.respondedAt = new Date();
    
//     await order.save();

//     console.log(`✅ Order ${orderId} updated to ${order.status}`);

//     // Notify buyer about decision via Socket.IO (if available)
//     if (io) {
//       const buyerId = order.buyerId || order.buyer;
//       console.log('📡 Emitting socket event to buyer:', buyerId);
      
//       io.to(`buyer_${buyerId}`).emit("orderResponse", {
//         orderId,
//         status: order.status,
//         sellerId: sellerId,
//         timestamp: new Date()
//       });
      
//       console.log('✅ Socket notification sent');
//     } else {
//       console.log('⚠️ Socket.IO not available, skipping real-time notification');
//     }

//     console.log('📤 Sending success response');
//     res.status(200).json({ 
//       success: true,
//       message: `Order ${newStatus} successfully`, 
//       order: order,
//       orderId: order._id,
//       status: order.status
//     });

//     console.log('📦 ========================================\n');

//   } catch (error) {
//     console.error('❌ ========================================');
//     console.error('❌ ERROR IN SELLER RESPOND TO ORDER');
//     console.error('❌ ========================================');
//     console.error('💥 Error name:', error.name);
//     console.error('💥 Error message:', error.message);
//     console.error('💥 Error stack:', error.stack);
    
//     res.status(500).json({ 
//       success: false,
//       message: "Internal server error",
//       error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
//     });
//   }
// };


// ===================================================================
// Order Controller (order.controller.js)
// ===================================================================
const Order = require("../Models/order.js");
const Seller = require("../Models/seller.model.js");

const radius = [2000, 5000, 7000, 10000, 100000, 100000];

async function notifySellers(order, longitude, latitude, io) {
  try {
    for (const r of radius) {
      const freshOrder = await Order.findById(order._id);
      if (freshOrder.status === "accepted") break;

      const sellers = await Seller.find({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [longitude, latitude] },
            $maxDistance: r,
          },
        },
      });

      const now = new Date();
      console.log("Time: ", now);
      console.log("Sellers: ", sellers.length);

      sellers.forEach(s => {
        io.to(`seller_${s._id}`).emit("newOrder", order);
      });

      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  } catch (err) {
    console.error("Seller notify error:", err);
  }
}

// -------------------------------------------------------------------
// Create a new order
// -------------------------------------------------------------------
exports.createOrder = async (req, res) => {
  console.log("🚀 Starting createOrder");
  console.log("📸 req.file:", req.file ? {
    filename: req.file.filename,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path
  } : "No file uploaded");
  console.log("📦 req.body:", req.body);

  try {
    const { buyerId, totalAmount, deliveryAddress } = req.body;

    // ✅ items handling (JSON or FormData)
    let items = [];
    try {
      items = typeof req.body.items === "string"
        ? JSON.parse(req.body.items)
        : req.body.items || [];
      console.log("✅ Parsed items:", items.length, "items");
    } catch (parseError) {
      console.error("❌ Error parsing items:", parseError);
      return res.status(400).json({ message: "Invalid items format" });
    }

    // ✅ location handling
    let location = null;
    try {
      location = typeof req.body.location === "string"
        ? JSON.parse(req.body.location)
        : req.body.location;
      console.log("✅ Parsed location:", location);
    } catch (parseError) {
      console.error("❌ Error parsing location:", parseError);
      return res.status(400).json({ message: "Invalid location format" });
    }

    if (!location || !location.coordinates) {
      console.error("❌ Missing location coordinates");
      return res.status(400).json({ message: "Location coordinates are required" });
    }

    // ✅ CRITICAL FIX: Construct proper URL for prescription image
    let prescriptionImageUrl = null;

    if (req.file) {
      // Store just the relative path - let frontend construct full URL
      prescriptionImageUrl = `/uploads/${req.file.filename}`;
      console.log("🖼️ Prescription Image stored as:", prescriptionImageUrl);
    } else {
      console.log("⚠️ No prescription image uploaded");
    }

    const [longitude, latitude] = location.coordinates;
    console.log("📍 Coordinates:", { longitude, latitude });

    const newOrder = new Order({
      buyerId,
      items,
      totalAmount: Number(totalAmount),
      prescriptionImage: prescriptionImageUrl,
      deliveryAddress: deliveryAddress || req.body.deliveryAddress,
      location: {
        type: "Point",
        coordinates: [longitude, latitude]
      },
      status: "pending",
    });

    console.log("💾 Saving order to database...");
    await newOrder.save();
    console.log("✅ Order saved successfully:", newOrder._id);

    // ✅ Return full order with populated fields if needed
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });

    const io = req.app.get("io");
    if (io) {
      console.log("📡 Starting seller notification process...");
      process.nextTick(() =>
        notifySellers(newOrder, longitude, latitude, io)
      );
    } else {
      console.log("⚠️ Socket.IO not available, skipping seller notifications");
    }

  } catch (err) {
    console.error("❌ createOrder error:", err);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// -------------------------------------------------------------------
// Get all orders (for debugging / admin use)
// -------------------------------------------------------------------
exports.getOrders = async (req, res) => {
  try {
    console.log("📥 Fetching all orders...");
    const orders = await Order.find().sort({ createdAt: -1 });
    console.log(`✅ Found ${orders.length} orders`);
    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Error in getOrders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// -------------------------------------------------------------------
// Get all orders by buyer
// -------------------------------------------------------------------
exports.getOrdersByBuyer = async (req, res) => {
  try {
    const buyerId = req.params.buyerId;
    console.log(`📥 Fetching orders for buyer: ${buyerId}`);
    const orders = await Order.find({ buyerId }).sort({ createdAt: -1 });
    console.log(`✅ Found ${orders.length} orders for buyer`);
    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Error in getOrdersByBuyer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// -------------------------------------------------------------------
// Get single order
// -------------------------------------------------------------------
exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    console.log(`📥 Fetching order by ID: ${orderId}`);
    const order = await Order.findById(orderId);

    if (!order) {
      console.log("⚠️ Order not found");
      return res.status(404).json({ message: "Order not found" });
    }
    console.log("✅ Order found:", order._id);
    res.status(200).json(order);
  } catch (error) {
    console.error("❌ Error in getOrderById:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// -------------------------------------------------------------------
// Seller responds to order (accept/reject)
// -------------------------------------------------------------------
exports.sellerRespondToOrder = async (req, res) => {
  try {
    console.log('\n📦 ========================================');
    console.log('📦 SELLER RESPOND TO ORDER');
    console.log('📦 ========================================');
    
    const { orderId } = req.params;
    const { action, status } = req.body;
    const io = req.app.get("io");

    const sellerId = req.seller?.sellerId || req.seller?.id || req.body.sellerId;
    
    console.log('🔍 Seller ID:', sellerId);

    if (!sellerId) {
      return res.status(401).json({ 
        success: false,
        message: "Authentication required - no seller ID" 
      });
    }

    const finalAction = action || (status === 'accepted' ? 'accept' : status === 'rejected' ? 'reject' : null);
    
    if (!finalAction || !["accept", "reject"].includes(finalAction)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid action. Expected 'accept' or 'reject'" 
      });
    }

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Order is already ${order.status}. Cannot modify.`
      });
    }

    // Update order
    const newStatus = finalAction === "accept" ? "accepted" : "rejected";
    order.status = newStatus;
    order.sellerId = sellerId;
    order.seller = sellerId;
    order.respondedAt = new Date();
    
    await order.save();

    console.log(`✅ Order ${orderId} updated to ${order.status}`);

    // Notify buyer
    if (io) {
      const buyerId = order.buyerId || order.buyer;
      io.to(`buyer_${buyerId}`).emit("orderResponse", {
        orderId,
        status: order.status,
        sellerId: sellerId,
        timestamp: new Date()
      });
    }

    res.status(200).json({ 
      success: true,
      message: `Order ${newStatus} successfully`, 
      order: order
    });

  } catch (error) {
    console.error('❌ ERROR IN SELLER RESPOND:', error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error"
    });
  }
};