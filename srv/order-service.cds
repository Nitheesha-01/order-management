using { order.management as db } from '../db/schema';

service OrderService {  

entity Orders as projection on db.Orders {
    *,
    CreatedOn,
    ChangedOn
};

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

    function getOrderStatistics()            returns {
        totalOrders     : Integer;
        activeOrders    : Integer;
        cancelledOrders : Integer;
        totalAmount     : Decimal;
    }; 
}
