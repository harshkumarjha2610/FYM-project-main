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
  { r: 2000, discount: [20] },
  { r: 2000, discount: [15, 20] },
  { r: 3000, discount: [10, 12, 15, 20] },
  { r: 5000, discount: [0, 5, 10, 12, 15, 20] },
  { r: 5000, discount: [10, 12, 15, 20] },
];

// Interval (in ms) between each notifySellers tier
const TIER_INTERVAL_MS = 60000;

// Buyer-side timeout (5 minutes) – sellers must see the same countdown
const BUYER_TIMEOUT_MS = 5 * 60 * 1000;

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
      if (!freshOrder || freshOrder.status === "accepted") break;

      // Calculate how much time the buyer still has left
      const elapsed = Date.now() - new Date(order.createdAt).getTime();
      if (elapsed >= BUYER_TIMEOUT_MS) {
        console.log(`⏱️ Order ${order._id} expired during notification loop.`);
        break;
      }
      const timeRemaining = Math.max(0, BUYER_TIMEOUT_MS - elapsed);
      console.log("timeRemaining: ", timeRemaining);

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
      for (const seller of sellers) {
        console.log("Seller: ", { name: seller.pharmacyName, discount: seller.discount });
      }

      // Filter out sellers who have already rejected this order
      const activeSellers = sellers.filter(s => {
        const rejectedBy = freshOrder.rejectedBy || [];
        return !rejectedBy.some(rejectedId => rejectedId.toString() === s._id.toString());
      });

      activeSellers.forEach(s => {
        io.to(`seller_${s._id}`).emit("newOrder", {
          ...order.toObject ? order.toObject() : order,
          timeRemaining,
        });
      });

      await new Promise(resolve => setTimeout(resolve, TIER_INTERVAL_MS));
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
  } : null);
  console.log("📸 req.files:", req.files ? req.files : "No files uploaded");
  console.log("📦 req.body:", req.body);

  try {
    const { totalAmount, deliveryAddress } = req.body;

    // ✅ Use authenticated buyer ID from middleware (fallback to body ID if absolutely necessary)
    const buyerId = req.buyer?.id || req.body.buyerId;
    console.log("👤 Resolved Buyer ID:", buyerId);

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

    // ✅ Support multiple prescription files
    const prescriptionFiles = [];

    if (req.files) {
      if (Array.isArray(req.files.prescriptionImages)) {
        prescriptionFiles.push(...req.files.prescriptionImages);
      }
      if (Array.isArray(req.files.prescriptionImage)) {
        prescriptionFiles.push(...req.files.prescriptionImage);
      }
    }

    if (req.file) {
      prescriptionFiles.push(req.file);
    }

    const prescriptionImageUrls = prescriptionFiles.map((file) => `/uploads/${file.filename}`);

    if (prescriptionImageUrls.length > 0) {
      console.log("🖼️ Prescription images stored as:", prescriptionImageUrls);
    } else {
      console.log("⚠️ No prescription image uploaded");
    }

    const [longitude, latitude] = location.coordinates;
    console.log("📍 Coordinates:", { longitude, latitude });

    const newOrder = new Order({
      buyerId,
      items,
      totalAmount: Number(totalAmount),
      prescriptionImage: prescriptionImageUrls[0] || null,
      prescriptionImages: prescriptionImageUrls,
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

    // Use buyer timeout + 1 min buffer for the DB query window
    const QUERY_WINDOW_MS = BUYER_TIMEOUT_MS + 60 * 1000;
    const queryWindowAgo = new Date(Date.now() - QUERY_WINDOW_MS);
    const pendingOrders = await Order.find({
      status: "pending",
      createdAt: { $gte: queryWindowAgo },
      rejectedBy: { $nin: [seller._id] },
    })
      .populate('buyerId', 'name mobile address')
      .sort({ createdAt: -1 });

    const now = Date.now();

    // Filter: an order is visible to this seller if they qualify under
    // any options tier that has been unlocked based on elapsed time
    const filtered = pendingOrders.filter((order) => {
      if (!order.location || !order.location.coordinates) return false;

      const elapsed = now - new Date(order.createdAt).getTime();
      if (elapsed >= BUYER_TIMEOUT_MS) return false; // Skip expired orders

      const [orderLng, orderLat] = order.location.coordinates;
      const dist = haversineDistance(orderLat, orderLng, sellerLat, sellerLng);

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

    // Attach timeRemaining so the seller frontend can sync with the buyer's countdown
    const withTimeRemaining = filtered.map((order) => {
      const elapsed = now - new Date(order.createdAt).getTime();
      const timeRemaining = Math.max(0, BUYER_TIMEOUT_MS - elapsed);
      const orderObj = order.toObject ? order.toObject() : order;
      return { ...orderObj, timeRemaining };
    });

    res.status(200).json(withTimeRemaining);
  } catch (error) {
    console.error("❌ Error in getOrders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAcceptedOrders = async (req, res) => {
  try {
    console.log("📥 Fetching accepted orders...");
    const orders = await Order.find({
      status: { $in: ["accepted", "packing", "waiting_for_rider", "shipped", "out_for_delivery"] },
      seller: req.seller.id
    })
      .populate('buyerId', 'name mobile address')
      .populate('seller', 'pharmacyName address phone ownerContact number email')
      .sort({ createdAt: -1 });
    console.log(`✅ Found ${orders.length} orders`);
    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Error in getAcceptedOrders:", error);
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

    const order = await Order.findById(orderId)
      .populate('buyerId', 'name mobile address')
      .populate('seller', 'pharmacyName address phone ownerContact number email');

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
    const order = await Order.findById(orderId)
      .populate('buyerId', 'name mobile address')
      .populate('seller', 'pharmacyName address phone ownerContact number email');

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
    const { scheduledFor } = req.body;
    console.log(`📥 Scheduling order: ${orderId}`, scheduledFor ? `for ${scheduledFor}` : 'immediately');

    const order = await Order.findById(orderId)
      .populate('buyerId', 'name mobile address')
      .populate('seller', 'pharmacyName address phone ownerContact number email');
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be scheduled from ${order.status} status`
      });
    }

    // Validate scheduledFor date if provided
    if (scheduledFor) {
      const scheduledDate = new Date(scheduledFor);
      const now = new Date();
      const maxDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      if (isNaN(scheduledDate.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid date format" });
      }
      if (scheduledDate < now) {
        return res.status(400).json({ success: false, message: "Scheduled date must be in the future" });
      }
      if (scheduledDate > maxDate) {
        return res.status(400).json({ success: false, message: "Cannot schedule more than 7 days in advance" });
      }

      order.scheduledFor = scheduledDate;
    }

    order.status = 'scheduled';
    order.scheduledAt = new Date();
    await order.save();

    console.log("✅ Order scheduled successfully", scheduledFor ? `for ${order.scheduledFor}` : '');
    res.status(200).json({
      success: true,
      message: scheduledFor ? `Order scheduled for ${new Date(scheduledFor).toLocaleString()}` : "Order scheduled for later",
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
// Seller updates delivery status after accepting an order
// -------------------------------------------------------------------
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const sellerId = req.seller?.sellerId || req.seller?.id;
    const io = req.app.get("io");

    const transitions = {
      accepted: ["packing"],
      packing: ["waiting_for_rider"],
      waiting_for_rider: ["out_for_delivery"],
      out_for_delivery: ["delivered"],
    };

    const validStatuses = ["packing", "waiting_for_rider", "out_for_delivery", "delivered"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status update" });
    }

    const order = await Order.findById(orderId)
      .populate('buyerId', 'name mobile address')
      .populate('seller', 'pharmacyName address phone ownerContact number email');
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const assignedSellerId = order.seller?._id?.toString() || order.seller?.toString();
    if (assignedSellerId !== sellerId && order.sellerId !== sellerId) {
      return res.status(403).json({
        success: false,
        message: "You can update only orders accepted by your pharmacy"
      });
    }

    const allowedNextStatuses = transitions[order.status] || [];
    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change order from ${order.status} to ${status}`
      });
    }

    order.status = status;
    await order.save();

    if (io) {
      const buyerId = order.buyerId?._id || order.buyerId;
      io.to(`buyer_${buyerId}`).emit("orderResponse", {
        orderId,
        status,
        sellerId,
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order
    });
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
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

    const order = await Order.findById(orderId)
      .populate('buyerId', 'name mobile address')
      .populate('seller', 'pharmacyName address phone ownerContact number email');

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
      const buyerId = order.buyerId?._id || order.buyerId || order.buyer;
      let pharmacyName = null;
      if (finalAction === "accept") {
        const sellerObj = await Seller.findById(sellerId);
        if (sellerObj) {
          pharmacyName = sellerObj.pharmacyName;
        }
      }
      io.to(`buyer_${buyerId}`).emit("orderResponse", {
        orderId,
        status: order.status,
        sellerId: sellerId,
        pharmacyName: pharmacyName,
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

// -------------------------------------------------------------------
// Get buyer order statistics (replaces mock stats in frontend)
// -------------------------------------------------------------------
exports.getBuyerOrderStats = async (req, res) => {
  try {
    const buyerId = req.params.buyerId;
    console.log(`Fetching order stats for buyer: ${buyerId}`);

    const mongoose = require('mongoose');
    const buyerObjectId = new mongoose.Types.ObjectId(buyerId);

    const stats = await Order.aggregate([
      { $match: { buyerId: buyerObjectId } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] }
          },
          pendingOrders: {
            $sum: {
              $cond: [
                { $in: ["$status", ["pending", "accepted", "packing", "waiting_for_rider", "out_for_delivery", "scheduled"]] },
                1,
                0
              ]
            }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $in: ["$status", ["cancelled", "rejected"]] }, 1, 0] }
          },
          totalSpent: {
            $sum: {
              $cond: [{ $eq: ["$status", "delivered"] }, "$totalAmount", 0]
            }
          }
        }
      }
    ]);

    const result = stats.length > 0
      ? stats[0]
      : { totalOrders: 0, completedOrders: 0, pendingOrders: 0, cancelledOrders: 0, totalSpent: 0 };

    delete result._id;

    console.log("Buyer stats:", result);
    res.status(200).json({ success: true, stats: result });
  } catch (error) {
    console.error("Error in getBuyerOrderStats:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getMatchingOptions = async (req, res) => {
  try {
    res.status(200).json({ success: true, options });
  } catch (error) {
    console.error("Error in getMatchingOptions:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};