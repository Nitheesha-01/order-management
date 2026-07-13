using { order.management as db } from '../db/schema';

service OrderService {

  entity Orders as projection on db.Orders;

  entity BusinessPartners as projection on db.BusinessPartners;
  entity OrderItems       as projection on db.OrderItems;

  type AIResponse {
    question       : String;
    answer         : String;
    orderCount     : Integer;
    cancelledCount : Integer;
    activeCount    : Integer;
    totalAmount    : Decimal;
    topCountries   : array of {
      country : String;
      count   : Integer;
    };
  };

  action   getAIAnalysis(question: String) returns AIResponse;

  function getOrderStatistics() returns {
    totalOrders     : Integer;
    activeOrders    : Integer;
    cancelledOrders : Integer;
    totalAmount     : Decimal;
  };

  type OrderRow {
  OrderNumber   : String;
  Model         : String;
  CreatedOn     : DateTime;
  BPNumber      : String;
  FirstName     : String;
  LastName      : String;
  Email         : String;
  Phone         : String;
  ItemNumber    : String;
  CancelledDate : String;
  OrderStatus   : String;
  Country       : String;
  Amount        : String;
};

  action getFilteredOrders(
  status    : String,
  country   : String,
  startDate : Date,
  endDate   : Date
) returns {
  totalOrders     : Integer;
  activeOrders    : Integer;
  cancelledOrders : Integer;
  totalAmount     : Decimal;
  orders          : array of OrderRow;
};


}


// using { order.management as db } from '../db/schema';

// service OrderService {  

// entity Orders as projection on db.Orders {
//     *,
//     CreatedOn,
//     ChangedOn
// };

// entity BusinessPartners as projection on db.BusinessPartners;
// entity OrderItems       as projection on db.OrderItems;


//     type AIResponse {
//         question       : String;
//         answer         : String;
//         orderCount     : Integer;
//         cancelledCount : Integer;
//         activeCount    : Integer;
//         totalAmount    : Decimal;
//         topCountries   : array of {
//             country : String;
//             count   : Integer;
//         };
//     };


//     action   getAIAnalysis(question: String) returns AIResponse;

//     function getOrderStatistics()            returns {
//         totalOrders     : Integer;
//         activeOrders    : Integer;
//         cancelledOrders : Integer;
//         totalAmount     : Decimal;
//     }; 

//     action getFilteredOrders(
//   status: String,
//   country: String,
//   startDate: Date,
//   endDate: Date
// ) returns {
//   totalOrders: Integer;
//   activeOrders: Integer;
//   cancelledOrders: Integer;
//   orders: array of Orders;
// };
// }
