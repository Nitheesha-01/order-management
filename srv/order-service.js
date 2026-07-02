const cds = require('@sap/cds');
const { v4: uuid } = require('uuid');

class OrderService extends cds.ApplicationService {

  async init() {

    // ✅ Entities
    const { Orders, OrderItems, BusinessPartners } =
      cds.entities('order.management');

    // ====================================================
    // ✅ AI ANALYSIS FUNCTION (UPDATED - FULL LOGIC)
    // ====================================================

    this.on('getAIAnalysis', async (req) => {

      const { question } = req.data;
      const q = (question || '').toLowerCase();

      try {

        const orders = await SELECT.from(Orders);
        const items = await SELECT.from(OrderItems);
        const bps = await SELECT.from(BusinessPartners);

        const totalOrders = orders.length;
        const cancelledCount = orders.filter(o => o.Cancelled).length;
        const activeCount = totalOrders - cancelledCount;

        const totalAmount = items.reduce((sum, item) => {
          return sum + (parseFloat(item.Amount) || 0);
        }, 0);

        let answer = '';

        // ==========================================
        // Active vs Cancelled Orders
        // ==========================================

        if (
          q.includes('active and cancelled') ||
          q.includes('active orders') && q.includes('cancelled orders')
        ) {

          const activeOrders = orders
            .filter(o => !o.Cancelled)
            .map(o => o.OrderNumber)
            .join(', ');

          const cancelledOrders = orders
            .filter(o => o.Cancelled)
            .map(o => o.OrderNumber)
            .join(', ');

          answer =
            `Order Status Summary

Total Orders     : ${totalOrders}
Active Orders    : ${activeCount}
Cancelled Orders : ${cancelledCount}

Active Order Numbers
${activeOrders}

Cancelled Order Numbers
${cancelledOrders}`;

        }

        // ==========================================
        // Cancelled Details
        // ==========================================

        else if (q.includes('cancelled details') || q.includes('details of cancelled')) {

          answer = orders
            .filter(o => o.Cancelled)
            .map(o =>
              `Order: ${o.OrderNumber}
Model: ${o.Model}
Country: ${o.Country}
Email: ${o.Email}`)
            .join('\n\n');
        }

        // ==========================================
        // Active Details
        // ==========================================

        else if (q.includes('details of active')) {

          answer = orders
            .filter(o => !o.Cancelled)
            .map(o =>

              `Order Number : ${o.OrderNumber}
Model        : ${o.Model}
Country      : ${o.Country}
Customer     : ${o.Email}
`)
            .join('\n\n');
        }

        // ==========================================
        // Search Model
        // ==========================================

        else if (q.includes('model')) {

          const match = orders.filter(o =>
            q.includes(o.Model.toLowerCase())
          );

          if (match.length > 0) {

            answer = match
              .map(o =>
                `Order Details

• Order Number : ${o.OrderNumber}
• Model        : ${o.Model}
• Country      : ${o.Country}
• Customer     : ${o.Email}
• Status       : ${o.OrderStatus}`)
              .join('\n\n');

          } else {

            answer = 'No matching model found.';
          }
        }

        // ==========================================
        // Highest Revenue Customer
        // ==========================================

        else if (q.includes('customer generated the highest revenue')) {

          const revenueByCustomer = {};

          orders.forEach(order => {

            const orderRevenue = items
              .filter(i => i.Order_ID === order.Order_ID)
              .reduce((sum, x) => sum + (parseFloat(x.Amount) || 0), 0);

            revenueByCustomer[order.Email] =
              (revenueByCustomer[order.Email] || 0) + orderRevenue;
          });

          const topCustomer =
            Object.entries(revenueByCustomer)
              .sort((a, b) => b[1] - a[1])[0];

          answer =
            `Customer Revenue Analysis

Highest Revenue Customer

Customer Email : ${topCustomer[0]}
Revenue        : $${topCustomer[1].toFixed(2)}
`;
        }

        // ==========================================
        // Country Revenue
        // ==========================================

        else if (q.includes('country has the highest revenue')) {

          const revenueMap = {};

          orders.forEach(order => {

            const revenue = items
              .filter(i => i.Order_ID === order.Order_ID)
              .reduce((sum, x) => sum + (parseFloat(x.Amount) || 0), 0);

            revenueMap[order.Country] =
              (revenueMap[order.Country] || 0) + revenue;
          });

          const topCountry =
            Object.entries(revenueMap)
              .sort((a, b) => b[1] - a[1])[0];

          answer =
            `Country With Highest Revenue

Country: ${topCountry[0]}
Revenue: $${topCountry[1].toFixed(2)}`;
        }

        // ==========================================
        // Average Order Value
        // ==========================================

        else if (q.includes('average order')) {

          const avg = totalAmount / totalOrders;

          answer =
            `Average Order Value

$${avg.toFixed(2)}`;
        }

        // ==========================================
        // Total Orders
        // ==========================================

        else if (q.includes('total order')) {

          answer =
            `There are ${totalOrders} total orders in the system.`;

        }

        // ==========================================
        // Revenue
        // ==========================================

        else if (q.includes('revenue')) {


          nswer = `Total revenue is $${totalAmount.toFixed(2)} across all orders.`;

        }

        else if (
          q.includes('overall business summary') ||
          q.includes('dashboard summary')
        ) {

          answer =
            `Executive Summary

Total Orders     : ${totalOrders}
Active Orders    : ${activeCount}
Cancelled Orders : ${cancelledCount}
Revenue          : $${totalAmount.toFixed(2)}

Key Insights

• Active Orders : ${activeCount}
• Cancelled Orders : ${cancelledCount}
• Average Order Value : $${(totalAmount / totalOrders).toFixed(2)}
`;


        }

        else {

          answer =
            `Summary

Total Orders: ${totalOrders}
Active Orders: ${activeCount}
Cancelled Orders: ${cancelledCount}
Revenue: $${totalAmount.toFixed(2)}`;
        }

        return {
          question,
          answer,
          orderCount: totalOrders,
          activeCount,
          cancelledCount,
          totalAmount
        };

      } catch (error) {

        console.error("AI ERROR:", error);

        return {
          question,
          answer: error.message,
          orderCount: 0,
          activeCount: 0,
          cancelledCount: 0,
          totalAmount: 0
        };
      }
    });

    
    //     this.on('getAIAnalysis', async (req) => {

    //       const { question } = req.data;
    //       const q = (question || '').toLowerCase();

    //       try {
    //         const orders = await SELECT.from(Orders);
    //         const items = await SELECT.from(OrderItems);

    //         // ✅ Basic Calculations
    //         const totalOrders = orders.length;
    //         const cancelledCount = orders.filter(o => o.Cancelled).length;
    //         const activeCount = totalOrders - cancelledCount;

    //         const totalAmount = items.reduce((sum, i) => {
    //           return sum + (parseFloat(i.Amount) || 0);
    //         }, 0);

    //         let answer = '';

    //         // ====================================================
    //         // ✅ SMART AI RESPONSES (NEW LOGIC)
    //         // ====================================================

    //         // ✅ 1. Total Orders
    //         if (q.includes('total order')) {
    //           answer = `📊 There are ${totalOrders} total orders in the system.`;
    //         }

    //         // ✅ 2. Revenue
    //         else if (q.includes('revenue') || q.includes('amount')) {
    //           answer = `💰 Total revenue is $${totalAmount.toFixed(2)} across all orders.`;
    //         }

    //         // ✅ 3. Active vs Cancelled
    //         else if (q.includes('active') || q.includes('cancel')) {
    //           answer = `📈 Out of ${totalOrders} orders:
    // • Active: ${activeCount}
    // • Cancelled: ${cancelledCount}`;
    //         }

    //         // ✅ 4. Country Breakdown
    //         else if (q.includes('country')) {
    //           const countryMap = {};
    //           orders.forEach(o => {
    //             countryMap[o.Country] = (countryMap[o.Country] || 0) + 1;
    //           });

    //           const breakdown = Object.entries(countryMap)
    //             .map(([c, v]) => `${c}: ${v}`)
    //             .join(', ');

    //           answer = `🌍 Orders by country → ${breakdown}`;
    //         }

    //         // ✅ 5. Top Country
    //         else if (q.includes('most orders')) {
    //           const countryMap = {};
    //           orders.forEach(o => {
    //             countryMap[o.Country] = (countryMap[o.Country] || 0) + 1;
    //           });

    //           const top = Object.entries(countryMap)
    //             .sort((a, b) => b[1] - a[1])[0];

    //           answer = `🏆 ${top[0]} has the most orders (${top[1]} orders).`;
    //         }

    //         // ✅ 6. Top Customer
    //         else if (q.includes('customer')) {
    //           const customerMap = {};
    //           orders.forEach(o => {
    //             customerMap[o.Email] = (customerMap[o.Email] || 0) + 1;
    //           });

    //           const top = Object.entries(customerMap)
    //             .sort((a, b) => b[1] - a[1])[0];

    //           answer = `👤 Top customer is ${top[0]} with ${top[1]} orders.`;
    //         }

    //         // ✅ 7. Models
    //         else if (q.includes('model') || q.includes('product')) {
    //           const modelMap = {};
    //           orders.forEach(o => {
    //             modelMap[o.Model] = (modelMap[o.Model] || 0) + 1;
    //           });

    //           const models = Object.entries(modelMap)
    //             .map(([m, c]) => `${m} (${c})`)
    //             .join(', ');

    //           answer = `📦 Ordered models → ${models}`;
    //         }

    //         // ✅ 8. Average Order Value
    //         else if (q.includes('average')) {
    //           const avg = totalAmount / totalOrders;
    //           answer = `📊 Average order value is $${avg.toFixed(2)}.`;
    //         }

    //         // ✅ 9. Cancelled Orders List
    //         else if (q.includes('which orders were cancelled')) {
    //           const cancelledList = orders
    //             .filter(o => o.Cancelled)
    //             .map(o => o.OrderNumber)
    //             .join(', ');

    //           answer = `❌ Cancelled orders: ${cancelledList}`;
    //         }

    //         // ✅ Default Response
    //         else {
    //           answer = `📊 Summary:
    // • Total Orders: ${totalOrders}
    // • Active: ${activeCount}
    // • Cancelled: ${cancelledCount}
    // • Revenue: $${totalAmount.toFixed(2)}`;
    //         }

    //         return {
    //           question,
    //           answer,
    //           orderCount: totalOrders,
    //           cancelledCount,
    //           activeCount,
    //           totalAmount
    //         };

    //       } catch (error) {
    //         console.error('AI Error:', error);

    //         return {
    //           question,
    //           answer: 'Error processing request',
    //           orderCount: 0,
    //           cancelledCount: 0,
    //           activeCount: 0,
    //           totalAmount: 0
    //         };
    //       }
    //     });

    // ====================================================
    // ✅ GET STATISTICS (NO CHANGE)
    // ====================================================
    this.on('getOrderStatistics', async () => {
      const orders = await SELECT.from(Orders);
      const items = await SELECT.from(OrderItems);

      return {
        totalOrders: orders.length,
        activeOrders: orders.filter(o => !o.Cancelled).length,
        cancelledOrders: orders.filter(o => o.Cancelled).length,
        totalAmount: items.reduce((sum, i) => sum + (i.Amount || 0), 0)
      };
    });

    // ====================================================
    // ✅ CREATE ORDER
    // ====================================================
    this.on('CREATE', 'Orders', async (req) => {

      req.data.Order_ID = uuid();
      req.data.CreatedOn = new Date().toISOString();

      if (!req.data.BP_ID) req.data.BP_ID = uuid();

      req.data.Cancelled = false;
      req.data.OrderStatus = 'Active';
    });

    await super.init();
  }
}

module.exports = OrderService;



// const cds = require('@sap/cds');
// const { v4: uuid } = require('uuid');

// class OrderService extends cds.ApplicationService {

//   async init() {

//     // ✅ Get Entities
//     const { Orders, OrderItems, BusinessPartners } = cds.entities('order.management');

//     // ====================================================
//     // ✅ AI ANALYSIS FUNCTION
//     // ====================================================
//     this.on('getAIAnalysis', async (req) => {
//       const { question } = req.data;

//       try {
//         const orders = await SELECT.from(Orders);
//         const items = await SELECT.from(OrderItems);

//         const totalOrders = orders.length;
//         const cancelledCount = orders.filter(o => o.Cancelled).length;
//         const activeCount = totalOrders - cancelledCount;

//         const totalAmount = items.reduce((sum, item) => {
//           return sum + (parseFloat(item.Amount) || 0);
//         }, 0);

//         let answer = '';

//         const q = (question || '').toLowerCase();

//         if (q.includes('total')) {
//           answer = `Total Orders: ${totalOrders}`;
//         } else if (q.includes('cancel')) {
//           answer = `Cancelled Orders: ${cancelledCount}`;
//         } else if (q.includes('active')) {
//           answer = `Active Orders: ${activeCount}`;
//         } else {
//           answer = `Orders: ${totalOrders}, Active: ${activeCount}, Cancelled: ${cancelledCount}`;
//         }

//         return {
//           question: question,
//           answer: answer,
//           orderCount: totalOrders,
//           cancelledCount: cancelledCount,
//           activeCount: activeCount,
//           totalAmount: parseFloat(totalAmount.toFixed(2)),
//           topCountries: []
//         };

//       } catch (error) {
//         console.error('❌ AI Error:', error);

//         return {
//           question: question,
//           answer: 'Error processing question',
//           orderCount: 0,
//           cancelledCount: 0,
//           activeCount: 0,
//           totalAmount: 0,
//           topCountries: []
//         };
//       }
//     });

//     // ====================================================
//     // ✅ STATISTICS FUNCTION (FOR CARDS)
//     // ====================================================
//     this.on('getOrderStatistics', async () => {

//       try {
//         const orders = await SELECT.from(Orders);
//         const items = await SELECT.from(OrderItems);

//         const totalOrders = orders.length;
//         const activeOrders = orders.filter(o => !o.Cancelled).length;
//         const cancelledOrders = orders.filter(o => o.Cancelled).length;

//         const totalAmount = items.reduce((sum, item) => {
//           return sum + (parseFloat(item.Amount) || 0);
//         }, 0);

//         return {
//           totalOrders,
//           activeOrders,
//           cancelledOrders,
//           totalAmount: parseFloat(totalAmount.toFixed(2))
//         };

//       } catch (error) {
//         console.error('❌ Stats Error:', error);

//         return {
//           totalOrders: 0,
//           activeOrders: 0,
//           cancelledOrders: 0,
//           totalAmount: 0
//         };
//       }
//     });

//     // ====================================================
//     // ✅ CREATE ORDER
//     // ====================================================
//     this.on('CREATE', 'Orders', async (req) => {

//       req.data.Order_ID = uuid();

//       // ✅ Fix missing fields
//       req.data.BP_ID = req.data.BP_ID || uuid();
//       req.data.Phone = req.data.Phone || '';

//       req.data.OrderStatus = 'Active';
//       req.data.Cancelled = false;

//       req.data.CreatedOn = new Date().toISOString();
//       req.data.ChangedOn = new Date().toISOString();

//       req.data.CreatedBy = 'SYSTEM';
//       req.data.ChangedBy = 'SYSTEM';
//     });

//     // ====================================================
//     // ✅ UPDATE ORDER
//     // ====================================================
//     this.on('UPDATE', 'Orders', async (req) => {
//       req.data.ChangedOn = new Date().toISOString();
//     });

//     // ====================================================
//     // ✅ DELETE ORDER + ITEMS
//     // ====================================================
//     this.on('DELETE', 'Orders', async (req) => {
//       await DELETE.from(OrderItems).where({ Order_ID: req.data.Order_ID });
//     });

//     // ====================================================
//     // ✅ CREATE BUSINESS PARTNER
//     // ====================================================
//     this.on('CREATE', 'BusinessPartners', async (req) => {
//       req.data.BP_ID = uuid();
//       req.data.CreatedAt = new Date().toISOString();
//       req.data.ModifiedAt = new Date().toISOString();
//     });

//     // ====================================================
//     // ✅ CREATE ORDER ITEMS
//     // ====================================================
//     this.on('CREATE', 'OrderItems', async (req) => {
//       req.data.Item_ID = uuid();

//       if (req.data.Quantity && req.data.UnitPrice) {
//         req.data.Amount =
//           parseFloat(req.data.Quantity) * parseFloat(req.data.UnitPrice);
//       }
//     });

//     // ====================================================
//     // ✅ DEBUG LOG
//     // ====================================================
//     this.after('READ', 'Orders', (data) => {
//       console.log("✅ Orders fetched:", data.length);
//     });

//     await super.init();
//   }
// }

// module.exports = OrderService;


// const cds = require('@sap/cds');
// const { v4: uuid } = require('uuid');

// class OrderService extends cds.ApplicationService {
//   async init() {

// const { Orders, OrderItems, BusinessPartners } = cds.entities('order.management');

//     // 🤖 AI ANALYSIS ACTION - Core Business Logic
//     this.on('getAIAnalysis', async (req) => {
//       const { question } = req.data;

//       try {
//         const db = cds.db;

//         // Fetch all data from database
//         const orders = await SELECT.from(Orders);
//         const items = await SELECT.from(OrderItems);
//         const bps = await SELECT.from(BusinessPartners);


//         // Calculate statistics
//         const totalOrders = orders.length;
//         const cancelledCount = orders.filter(o => o.Cancelled).length;
//         const activeCount = totalOrders - cancelledCount;
//         const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.Amount) || 0), 0);

//         // Group by country
//         const countryMap = {};
//         orders.forEach(order => {
//           const country = order.Country || 'Unknown';
//           countryMap[country] = (countryMap[country] || 0) + 1;
//         });

//         // Group by model
//         const modelMap = {};
//         orders.forEach(order => {
//           const model = order.Model || 'Unknown';
//           modelMap[model] = (modelMap[model] || 0) + 1;
//         });

//         const topCountries = Object.entries(countryMap)
//           .map(([country, count]) => ({ country, count }))
//           .sort((a, b) => b.count - a.count)
//           .slice(0, 5);

//         // 🎯 INTELLIGENT ANSWER GENERATION BASED ON SAMPLE DATA
//         let answer = '';
//         const lowerQuestion = question.toLowerCase();

//         if (lowerQuestion.includes('total order') || lowerQuestion.includes('how many order')) {
//           answer = `📊 There are **${totalOrders}** total orders in the system. Out of these, ${activeCount} are active and ${cancelledCount} have been cancelled.`;
//         }
//         else if (lowerQuestion.includes('cancelled')) {
//           const cancelPercentage = ((cancelledCount / totalOrders) * 100).toFixed(2);
//           answer = `❌ **${cancelledCount}** orders (${cancelPercentage}%) have been cancelled, while **${activeCount}** orders are still active.`;
//         }
//         else if (lowerQuestion.includes('active')) {
//           const activePercentage = ((activeCount / totalOrders) * 100).toFixed(2);
//           answer = `✅ Currently, there are **${activeCount}** active orders (${activePercentage}% of total).`;
//         }
//         else if (lowerQuestion.includes('country') || lowerQuestion.includes('location')) {
//           const countryList = topCountries.map(c => `${c.country} (${c.count} orders)`).join(', ');
//           answer = `🌍 Orders are distributed across: ${countryList}`;
//         }
//         else if (lowerQuestion.includes('revenue') || lowerQuestion.includes('amount') || lowerQuestion.includes('total')) {
//           const avgAmount = (totalAmount / totalOrders).toFixed(2);
//           answer = `💰 Total order amount: **$${totalAmount.toFixed(2)}**. Average per order: **$${avgAmount}**.`;
//         }
//         else if (lowerQuestion.includes('status') || lowerQuestion.includes('breakdown')) {
//           answer = `📈 Order Status Summary:\n• Active: ${activeCount}\n• Cancelled: ${cancelledCount}\n• Total: ${totalOrders}\n• Revenue: $${totalAmount.toFixed(2)}`;
//         }
//         else if (lowerQuestion.includes('model') || lowerQuestion.includes('product')) {
//           const modelList = Object.entries(modelMap)
//             .sort((a, b) => b[1] - a[1])
//             .slice(0, 5)
//             .map(([m, c]) => `${m} (${c})`)
//             .join(', ');
//           answer = `📦 Top models ordered: ${modelList}`;
//         }
//         else if (lowerQuestion.includes('customer') || lowerQuestion.includes('partner')) {
//           const topCustomers = orders.reduce((acc, ord) => {
//             const email = ord.Email || 'Unknown';
//             acc[email] = (acc[email] || 0) + 1;
//             return acc;
//           }, {});
//           const topCustList = Object.entries(topCustomers)
//             .sort((a, b) => b[1] - a[1])
//             .slice(0, 3)
//             .map(([email, count]) => `${email} (${count})`)
//             .join(', ');
//           answer = `👥 Top customers: ${topCustList}`;
//         }
//         else if (lowerQuestion.includes('recent')) {
//           const recent = orders.sort((a, b) => new Date(b.CreatedOn) - new Date(a.CreatedOn)).slice(0, 3);
//           const recentList = recent.map(o => `${o.OrderNumber} - ${o.Model}`).join(', ');
//           answer = `⏰ Recent orders: ${recentList}`;
//         }
//         else {
//           answer = `📊 **Order Management Analytics**\n• Total Orders: ${totalOrders}\n• Active: ${activeCount}\n• Cancelled: ${cancelledCount}\n• Total Revenue: $${totalAmount.toFixed(2)}\n• Top Country: ${topCountries[0]?.country || 'N/A'}`;
//         }

//         return {
//           question: question,
//           answer: answer,
//           orderCount: totalOrders,
//           cancelledCount: cancelledCount,
//           activeCount: activeCount,
//           totalAmount: parseFloat(totalAmount.toFixed(2)),
//           topCountries: topCountries
//         };
//       } catch (error) {
//         console.error('❌ Error in getAIAnalysis:', error);
//         return {
//           question: question,
//           answer: '⚠️ Error processing your question. Please try again.',
//           orderCount: 0,
//           cancelledCount: 0,
//           activeCount: 0,
//           totalAmount: 0,
//           topCountries: []
//         };
//       }
//     });

//     // 📊 ORDER STATISTICS FUNCTION


//   this.on('getOrderStatistics', async (req) => {
//     try {

//       const orders = await SELECT.from(Orders);
//       const items = await SELECT.from(OrderItems);

//       const totalOrders = orders.length;
//       const activeOrders = orders.filter(o => !o.Cancelled).length;
//       const cancelledOrders = orders.filter(o => o.Cancelled).length;

//       const totalAmount = items.reduce((sum, item) => {
//         return sum + (parseFloat(item.Amount) || 0);
//       }, 0);

//       return {
//         totalOrders,
//         activeOrders,
//         cancelledOrders,
//         totalAmount: parseFloat(totalAmount.toFixed(2))
//       };

//     } catch (error) {
//       console.error("Stats error:", error);
//       return {
//         totalOrders: 0,
//         activeOrders: 0,
//         cancelledOrders: 0,
//         totalAmount: 0
//       };
//     }
//   });



//     // this.on('getOrderStatistics', async (req) => {
//     //   try {

//     //     const orders = await SELECT.from(Orders);
//     //     const items = await SELECT.from(OrderItems);


//     //     const totalOrders = orders.length;
//     //     const activeOrders = orders.filter(o => !o.Cancelled).length;
//     //     const cancelledOrders = orders.filter(o => o.Cancelled).length;
//     //     const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.Amount) || 0), 0);

//     //     return {
//     //       totalOrders,
//     //       activeOrders,
//     //       cancelledOrders,
//     //       totalAmount: parseFloat(totalAmount.toFixed(2))
//     //     };
//     //   } catch (error) {
//     //     return {
//     //       totalOrders: 0,
//     //       activeOrders: 0,
//     //       cancelledOrders: 0,
//     //       totalAmount: 0
//     //     };
//     //   }
//     // });

//     // CREATE ORDERS
//     this.on('CREATE', 'Orders', async (req) => {
//       const { v4: uuid } = require('uuid');
//       req.data.Order_ID = uuid();
//       req.data.OrderStatus = 'Active';
//       req.data.Cancelled = false;
//       req.data.CreatedOn = new Date().toISOString();
//       req.data.ChangedOn = new Date().toISOString();
//       req.data.CreatedBy = req.user.id || 'SYSTEM';
//       req.data.ChangedBy = req.user.id || 'SYSTEM';
//     });

//     // UPDATE ORDERS
//     this.on('UPDATE', 'Orders', async (req) => {
//       req.data.ChangedOn = new Date().toISOString();
//       req.data.ChangedBy = req.user.id || 'SYSTEM';
//     });

//     // DELETE ORDERS
//     this.on('DELETE', 'Orders', async (req) => {
//       await cds.db.run(
//         DELETE.from(OrderItems)
//           .where({ Order_ID: req.data.Order_ID })
//       );
//     });

//     // CREATE BUSINESS PARTNERS
//     this.on('CREATE', 'BusinessPartners', async (req) => {
//       const { v4: uuid } = require('uuid');
//       req.data.BP_ID = uuid();
//       req.data.CreatedAt = new Date().toISOString();
//       req.data.CreatedBy = req.user.id || 'SYSTEM';
//       req.data.ModifiedAt = new Date().toISOString();
//       req.data.ModifiedBy = req.user.id || 'SYSTEM';
//     });

//     // CREATE ORDER ITEMS
//     this.on('CREATE', 'OrderItems', async (req) => {
//       const { v4: uuid } = require('uuid');
//       req.data.Item_ID = uuid();
//       if (req.data.Quantity && req.data.UnitPrice) {
//         req.data.Amount = parseFloat(req.data.Quantity) * parseFloat(req.data.UnitPrice);
//       }
//     });

//     this.after('READ', 'Orders', (data) => {
//       console.log("✅ Orders fetched:", data.length);
//     });


//     await super.init();
//   }
// }

// module.exports = OrderService;