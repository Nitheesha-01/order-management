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

        const completion = await groq.chat.completions.create({

          model: "llama-3.1-8b-instant",


          messages: [

            {
              role: "system",
              content: `
You are a professional Order Analytics Assistant.

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

              //               content: `
              // You are a professional Order Analytics Assistant.

              // Your responsibilities:

              // - Analyze order data
              // - Generate business insights
              // - Provide executive summaries
              // - Provide customer, country, revenue and model analysis

              // Rules:

              // 1. Answer ONLY from provided records.
              // 2. Never invent information.
              // 3. Perform all matching case-insensitively.
              // 4. Do not dump raw JSON or raw database records.
              // 5. Present results in business-friendly language.
              // 6. When users ask for details, provide a readable summary.
              // 7. Always include insights whenever possible.
              // 8. Use previous conversation context when answering.
              // 9. Keep answers concise and executive-friendly.
              // 10. Do not explain calculations unless explicitly requested.
              // 11. Give the final result first.
              // 12. For ranking questions (highest revenue, top customer, top country), return only:
              //     - Name
              //     - Value
              //     - One-line insight
              // 13. Avoid listing all records unless the user asks for details.
              // `
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


////
return {
  question,
  answer,
  matchedOrders, // ✅ only exact records
  orderCount: orders.length,
  activeCount: orders.filter(o => !o.Cancelled).length,
  cancelledCount: orders.filter(o => o.Cancelled).length,
  totalAmount: items.reduce(
    (sum, i) => sum + (parseFloat(i.Amount) || 0),
    0
  )
};




        // return {
        //   question,
        //   answer,
        //   /////
        //   matchedOrders: normalizedOrders,  
        //   // matchedOrders: normalizedOrders.filter(o =>
        //   //   answer.includes(o.OrderNumber) ||
        //   //   answer.includes(o.Model) ||
        //   //   answer.includes(o.Country)
        //   // ),
        //   ////
        //   orderCount: orders.length,
        //   activeCount: orders.filter(o => !o.Cancelled).length,
        //   cancelledCount: orders.filter(o => o.Cancelled).length,
        //   totalAmount: items.reduce(
        //     (sum, i) => sum + (parseFloat(i.Amount) || 0),
        //     0
        //   )
        // };

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