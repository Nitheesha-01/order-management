namespace order.management;

type UUID : String(36);

entity BusinessPartners {
    key BP_ID      : UUID;
        FirstName  : String(50);
        LastName   : String(50);
        Email      : String(100);
        Phone      : String(20);
        Country    : String(3);
        CreatedAt  : DateTime;
        CreatedBy  : String(100);
        ModifiedAt : DateTime;
        ModifiedBy : String(100);
}

entity Orders {
    key Order_ID    : UUID;
        OrderNumber : String(10) @unique;
        BP_ID       : UUID;
        Country     : String(3);
        Model       : String(20);
        Phone       : String(20);
        Email       : String(100);
        OrderStatus : String(20) enum {
            Active;
            Cancelled;
            Completed;
        };
        Cancelled   : Boolean default false;
        CreatedOn   : DateTime;
        ChangedOn   : DateTime;
        CreatedBy   : String(100);
        ChangedBy   : String(100);
}

entity OrderItems {
    key Item_ID     : UUID;
        Order_ID    : UUID;
        ItemNumber  : String(6);
        ProductName : String(100);
        Quantity    : Decimal(10, 2);
        UnitPrice   : Decimal(15, 2);
        Amount      : Decimal(15, 2);
}
