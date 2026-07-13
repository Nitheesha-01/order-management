const conversationHistory = new Map();
const cds = require('@sap/cds');
require('dotenv').config();

const OpenAI = require('openai');

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

const { v4: uuid } = require('uuid');

class OrderService extends cds.ApplicationService {

  async init() {

    // ✅ Entities
    const { Orders, OrderItems, BusinessPartners } =
      cds.entities('order.management');

    //////
    this.on('getAIAnalysis', async (req) => {

      const { question } = req.data;


      const sessionId =
        req.user?.id || "default-user";
      let history =
        conversationHistory.get(sessionId) || [];

      const normalizedQuestion =
        String(question || '').toUpperCase();

      console.log("QUESTION:", question);
      console.log("NORMALIZED QUESTION:", normalizedQuestion);

      try {

        const orders = await SELECT.from(Orders);

        const normalizedOrders = orders.map(order => ({
          ...order,

          OrderNumber: String(order.OrderNumber || '').toUpperCase(),
          Model: String(order.Model || '').toUpperCase(),
          Country: String(order.Country || '').toUpperCase(),
          Email: String(order.Email || '').toLowerCase(),
          BP_ID: String(order.BP_ID || '').toUpperCase(),
          OrderStatus: String(order.OrderStatus || '').toUpperCase(),
          Phone: String(order.Phone || '')
        }));

        const items = await SELECT.from(OrderItems);

        const bps = await SELECT.from(BusinessPartners);

        const normalizedBps = bps.map(bp => ({
          ...bp,

          BP_ID: String(bp.BP_ID || '').toUpperCase(),

          Email: String(bp.Email || '').toLowerCase()
        }));

        const totalOrders = orders.length;

        const activeOrders =
          orders.filter(o => !o.Cancelled).length;

        const cancelledOrders =
          orders.filter(o => o.Cancelled).length;

        const totalRevenue =
          items.reduce(
            (sum, item) =>
              sum + (parseFloat(item.Amount) || 0),
            0
          );

        const dataContext = `
BUSINESS SUMMARY

Total Orders: ${totalOrders}
Active Orders: ${activeOrders}
Cancelled Orders: ${cancelledOrders}
Total Revenue: $${totalRevenue}

ORDER DATA

${JSON.stringify(
          normalizedOrders.slice(0, 20),
          null,
          2
        )}
`;

        history.push({
          role: "user",
          content: normalizedQuestion
        });

        /////
        const isDetailRequest =
          normalizedQuestion.includes("DETAIL") ||
          normalizedQuestion.includes("DETAILS") ||
          normalizedQuestion.includes("FULL") ||
          normalizedQuestion.includes("COMPLETE");
        ///

        const completion = await groq.chat.completions.create({

          model: "llama-3.1-8b-instant",


          messages: [

            {
              role: "system",
              content: `
You are a professional Order Analytics Assistant.
Detail Mode: ${isDetailRequest ? "YES" : "NO"}
 If Detail Mode = NO:
 how only Order Number and Status.
 If Detail Mode = YES:
 show complete order details.


Rules:

1. Answer only from provided records.
2. Never invent information.
3. Keep responses concise.
4. Maximum 5-6 lines unless user asks for details.
5. Do not explain calculations.
6. Do not list every record.
7. Provide:

   - Answer
   - Supporting Value
   - Business Insight

8. Use previous conversation context.
9. Keep responses short and direct.
10. Give only the final answer unless the user explicitly asks for details.
11. Do not include sections such as:
    - Supporting Value
    - Supporting Numbers
    - ORDER DATA
12. Provide Business Insight only for summary or analytics questions.
13. If the user asks for cancelled orders, active orders, or orders,
        show only Order Number.
14. Show full details only when the user explicitly asks for:
       - details 
       - full details      
       - complete information  
       - order details

Examples:

Question:
Which customer generated the highest revenue?

Answer:

Top Customer

James

Revenue: $70

Insight:
James currently contributes the highest revenue.

Question:
Provide business summary

Answer:

Executive Summary

• Total Orders: 9
• Active Orders: 6
• Cancelled Orders: 3
• Revenue: $390

Insight:
Most orders are active and revenue is steady.
`
            },

            {
              role: "user",
              content: `
ORDER DATA

${dataContext}
`
            },

            ...history

          ],

          temperature: 0.2,
          max_tokens: 500

        });

        const answer =
          completion.choices[0]?.message?.content ||
          "No response generated.";

        history.push({
          role: "assistant",
          content: answer
        });

        if (history.length > 4) {
          history = history.slice(-4);
        }

        conversationHistory.set(
          sessionId,
          history
        );

        // Extract order number from question (simple example)
        // Extract order number from question (example: "003")
        const orderMatch = question.match(/\b\d{3}\b/);
        let matchedOrders = [];

        if (orderMatch) {
          matchedOrders = normalizedOrders.filter(o => o.OrderNumber === orderMatch[0]);
        }

        // Example: also handle BP name queries
        const bpNameMatch = question.match(/show\s+(\w+)\s+bp/i);
        if (bpNameMatch) {
          const name = bpNameMatch[1].toUpperCase();
          matchedOrders = normalizedOrders.filter(o =>
            o.FirstName?.toUpperCase() === name || o.LastName?.toUpperCase() === name
          );
        }
        ////

        if (
          question.toLowerCase().includes("download") ||
          question.toLowerCase().includes("export") ||
          question.toLowerCase().includes("excel")

        ) {
          matchedOrders = normalizedOrders;
        }
        /////
        // ✅ Add this block just before the return
        const activeOrdersList = normalizedOrders
          .filter(o => !o.Cancelled)
          .map(o => o.OrderNumber);

        const cancelledOrdersList = normalizedOrders
          .filter(o => o.Cancelled)
          .map(o => o.OrderNumber);

        const formatVertical = (label, list) =>
          `${label}: ${list[0]}\n               ${list.slice(1).join('\n               ')}`;
       
        // ✅ Final return object
        return {
          question,
          answer,
          matchedOrders,
          activeOrdersFormatted: formatVertical("Active Orders", activeOrdersList),
          cancelledOrdersFormatted: formatVertical("Cancelled Orders", cancelledOrdersList),
          orderCount: orders.length,
          activeCount: activeOrdersList.length,
          cancelledCount: cancelledOrdersList.length,
          totalAmount: items.reduce(
            (sum, i) => sum + (parseFloat(i.Amount) || 0),
            0
          )
        };


      } catch (error) {

        console.error("GROQ ERROR:", error);

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
    // ✅ GET FILTERED ORDERS (NEW)
    // ====================================================
    this.on('getFilteredOrders', async (req) => {

      console.log("FILTER:", req.data);

      let orders = await SELECT.from(Orders);

      const items = await SELECT.from(OrderItems);

      const bps = await SELECT.from(BusinessPartners);

      const bpMap = {}; bps.forEach(bp => { bpMap[bp.BP_ID] = bp; });

      const { status, country, startDate, endDate } = req.data;

      if (status === "Active") {
        orders = orders.filter(o => !o.Cancelled);
      }

      if (status === "Cancelled") {
        orders = orders.filter(o => o.Cancelled);
      }

      if (country) {
        orders = orders.filter(o => o.Country === country);
      }

      if (startDate) {
        orders = orders.filter(o =>
          new Date(o.CreatedOn) >= new Date(startDate)
        );
      }

      if (endDate) {
        orders = orders.filter(o =>
          new Date(o.CreatedOn) <= new Date(endDate + "T23:59:59")
        );
      }

      let totalAmount = 0;

      const resultOrders = orders.map(order => {


        const orderItems = items.filter(
          i => i.Order_ID === order.Order_ID
        );

        const amount = orderItems.reduce(
          (sum, i) => sum + (parseFloat(i.Amount) || 0),
          0
        );

        totalAmount += amount;

        const bp = bpMap[order.BP_ID] || {};

        return {
          OrderNumber: order.OrderNumber,
          Model: order.Model,
          CreatedOn: order.CreatedOn,
          BPNumber: order.BP_ID,
          FirstName: bp.FirstName || '-',
          LastName: bp.LastName || '-',

          // FirstName: "",
          // LastName: "",
          Email: order.Email,
          Phone: order.Phone,
          ItemNumber:
            orderItems.length > 0
              ? orderItems[0].ItemNumber
              : "-",
          CancelledDate:
            order.Cancelled
              ? order.CreatedOn
              : "-",
          OrderStatus: order.OrderStatus,
          Country: order.Country,
          Amount: amount.toFixed(2)
        };
      });

      return {
        totalOrders: resultOrders.length,
        activeOrders: resultOrders.filter(
          o => o.OrderStatus === "Active"
        ).length,
        cancelledOrders: resultOrders.filter(
          o => o.OrderStatus === "Cancelled"
        ).length,
        totalAmount,
        orders: resultOrders
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