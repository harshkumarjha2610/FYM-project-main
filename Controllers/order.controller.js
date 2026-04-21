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

// const radius = [2000, 5000, 7000, 10000];

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

//       await new Promise(resolve => setTimeout(resolve, 60000));
//     }
//   } catch (err) {
//     console.error("Seller notify error:", err);
//   }
// }

const options = [
  { r: 2000, discount: [15, 20] },
  { r: 5000, discount: [15, 20] },
  { r: 2000, discount: [10, 12, 15, 20] },
  { r: 5000, discount: [10, 12, 15, 20] },
  { r: 7000, discount: [0] },
  { r: 200000, discount: [0, 5, 10, 12, 15, 20] },
];

// Interval (in ms) between each notifySellers tier
const TIER_INTERVAL_MS = 6000;

// Haversine formula: returns distance in meters between two lat/lng pairs
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}


async function notifySellers(order, longitude, latitude, io) {
  try {
    for (const option of options) {
      const freshOrder = await Order.findById(order._id);
      if (freshOrder.status === "accepted") break;

      const query = {
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [longitude, latitude] },
            $maxDistance: option.r,
          },
        },
      };

      if (!option.discount.includes(0)) {
        query.discount = { $in: option.discount };
      }

      const sellers = await Seller.find(query);
      console.log("Sellers found(number): ", sellers.length);

      const now = new Date();
      console.log(`Time: ${now}, Radius: ${option.r}m, Discounts: ${option.discount}`);
      for(const seller of sellers){
        console.log("Seller: ", { name: seller.pharmacyName, discount: seller.discount });
      }

      sellers.forEach(s => {
        io.to(`seller_${s._id}`).emit("newOrder", order);
      });

      await new Promise(resolve => setTimeout(resolve, 6000));
    }

    // ✅ AFTER ALL TIERS: If still pending, notify buyer
    const finalOrder = await Order.findById(order._id);
    if (finalOrder && finalOrder.status === 'pending') {
      console.log(`📡 SEARCH EXHAUSTED for order ${order._id}. Notifying buyer...`);
      io.to(`buyer_${order.buyerId}`).emit("order-unaccepted", {
        orderId: order._id,
        message: "No sellers found immediately. You can now schedule this order for later."
      });
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
// Get orders filtered by seller's radius & discount tier
// -------------------------------------------------------------------
exports.getOrders = async (req, res) => {
  try {
    const seller = req.sellerDocument; // full Seller document from verifySeller middleware

    if (!seller || !seller.location || !seller.location.coordinates) {
      console.error("❌ Seller location data missing");
      return res.status(400).json({ message: "Seller location not configured" });
    }

    const [sellerLng, sellerLat] = seller.location.coordinates;
    const sellerDiscount = seller.discount || 0;

    console.log(`📥 Fetching filtered orders for seller: ${seller.pharmacyName} (discount: ${sellerDiscount}%)`);

    // Fetch only pending orders from the last 10 minutes, excluding orders this seller already rejected
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const pendingOrders = await Order.find({
      status: "pending",
      createdAt: { $gte: tenMinutesAgo },
      rejectedBy: { $nin: [seller._id] },
    })
    .populate('buyerId', 'name mobile address')
    .sort({ createdAt: -1 });

    const now = Date.now();

    // Filter: an order is visible to this seller if they qualify under
    // any options tier that has been unlocked based on elapsed time
    const filtered = pendingOrders.filter((order) => {
      if (!order.location || !order.location.coordinates) return false;

      const [orderLng, orderLat] = order.location.coordinates;
      const dist = haversineDistance(orderLat, orderLng, sellerLat, sellerLng);

      const elapsed = now - new Date(order.createdAt).getTime();
      const tierIndex = Math.min(
        Math.floor(elapsed / TIER_INTERVAL_MS),
        options.length - 1
      );

      // Check all unlocked tiers (0 .. tierIndex)
      for (let i = 0; i <= tierIndex; i++) {
        const opt = options[i];

        // Distance check
        if (dist > opt.r) continue;

        // Discount check: discount [0] means "any discount" (no filter)
        if (opt.discount.includes(0) || opt.discount.includes(sellerDiscount)) {
          return true;
        }
      }
      return false;
    });

    console.log(`✅ ${filtered.length}/${pendingOrders.length} orders match seller's radius/discount`);
    res.status(200).json(filtered);
  } catch (error) {
    console.error("❌ Error in getOrders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAcceptedOrders = async (req, res) => {
  try {
    console.log("📥 Fetching accepted orders...");
    const orders = await Order.find({ status: "accepted", seller: req.seller.id })
      .populate('buyerId', 'name mobile address')
      .sort({ createdAt: -1 });
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
    const orders = await Order.find({ buyerId })
      .populate('seller', 'pharmacyName address phone ownerContact number email')
      .sort({ createdAt: -1 });
    console.log(`✅ Found ${orders.length} orders for buyer`);
    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Error in getOrdersByBuyer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// -------------------------------------------------------------------
// Cancel an order (for buyers)
// -------------------------------------------------------------------
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log(`📥 Cancelling order: ${orderId}`);
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      console.log("⚠️ Order not found");
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    
    if (order.status !== 'pending') {
      console.log(`❌ Cannot cancel order in ${order.status} status`);
      return res.status(400).json({ 
        success: false, 
        message: `Cannot cancel order in ${order.status} status` 
      });
    }
    
    order.status = 'cancelled';
    await order.save();
    
    console.log("✅ Order cancelled successfully");
    res.status(200).json({ 
      success: true, 
      message: "Order cancelled successfully", 
      order 
    });
  } catch (error) {
    console.error('❌ Error in cancelOrder:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
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
// Schedule an order for later
// -------------------------------------------------------------------
exports.scheduleOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log(`📥 Scheduling order: ${orderId}`);

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Order cannot be scheduled from ${order.status} status` 
      });
    }

    order.status = 'scheduled';
    order.scheduledAt = new Date();
    await order.save();

    console.log("✅ Order scheduled successfully");
    res.status(200).json({ 
      success: true, 
      message: "Order scheduled for later", 
      order 
    });
  } catch (error) {
    console.error('❌ Error in scheduleOrder:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// -------------------------------------------------------------------
// Get all scheduled orders (Publicly available to all sellers)
// -------------------------------------------------------------------
exports.getScheduledOrders = async (req, res) => {
  try {
    console.log("📥 Fetching all scheduled orders...");
    const orders = await Order.find({ status: "scheduled" })
      .populate('buyerId', 'name mobile address')
      .sort({ scheduledAt: -1 });
    
    console.log(`✅ Found ${orders.length} scheduled orders`);
    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Error in getScheduledOrders:", error);
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

    if (!['pending', 'scheduled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order is already ${order.status}. Cannot modify.`
      });
    }

    // Update order
    if (finalAction === "accept") {
      order.status = "accepted";
      order.sellerId = sellerId;
      order.seller = sellerId;
      order.respondedAt = new Date();
    } else {
      // Per-seller rejection: keep status "pending" so other sellers can still see it
      if (!order.rejectedBy) order.rejectedBy = [];
      order.rejectedBy.push(sellerId);
    }
    
    await order.save();

    console.log(`✅ Order ${orderId} ${finalAction === 'accept' ? 'accepted' : 'rejected by seller ' + sellerId}`);

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
      message: `Order ${finalAction === 'accept' ? 'accepted' : 'rejected'} successfully`, 
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