const cds = require('@sap/cds');
const { v4: uuid } = require('uuid');

module.exports = async (srv) => {
    const db = cds.db;

    // Sample Business Partners
    const bpData = [
        {
            BP_ID: uuid(),
            FirstName: 'Charles',
            LastName: 'Dobbs',
            Email: 'charles.dobbs@otmail.com',
            Phone: '5022956334',
            Country: 'USA',
            CreatedAt: new Date('2025-07-23'),
            CreatedBy: 'SYSTEM',
            ModifiedAt: new Date('2025-07-23'),
            ModifiedBy: 'SYSTEM'
        },
        {
            BP_ID: uuid(),
            FirstName: 'Jimmy',
            LastName: 'Baird',
            Email: 'jbaird98@outlook.com',
            Phone: '5551234567',
            Country: 'USA',
            CreatedAt: new Date('2025-07-29'),
            CreatedBy: 'SYSTEM',
            ModifiedAt: new Date('2025-07-29'),
            ModifiedBy: 'SYSTEM'
        },
        {
            BP_ID: uuid(),
            FirstName: 'Christine',
            LastName: 'Mcconnell',
            Email: 'christy@christine.mcconnellcpa.com',
            Phone: '7243888394',
            Country: 'USA',
            CreatedAt: new Date('2025-06-26'),
            CreatedBy: 'SYSTEM',
            ModifiedAt: new Date('2025-06-26'),
            ModifiedBy: 'SYSTEM'
        },
        {
            BP_ID: uuid(),
            FirstName: 'Stephanie',
            LastName: 'Kelley',
            Email: 'stephanie.kelley@rayonier.com',
            Phone: '6174475104',
            Country: 'USA',
            CreatedAt: new Date('2025-08-11'),
            CreatedBy: 'SYSTEM',
            ModifiedAt: new Date('2025-08-11'),
            ModifiedBy: 'SYSTEM'
        },
        {
            BP_ID: uuid(),
            FirstName: 'Kelly',
            LastName: 'Ostrowski',
            Email: 'kellyo1075@yahoo.com',
            Phone: '7153210771',
            Country: 'USA',
            CreatedAt: new Date('2025-07-23'),
            CreatedBy: 'SYSTEM',
            ModifiedAt: new Date('2025-07-23'),
            ModifiedBy: 'SYSTEM'
        }
    ];

    const bp1Id = bpData[0].BP_ID;
    const bp2Id = bpData[1].BP_ID;
    const bp3Id = bpData[2].BP_ID;
    const bp4Id = bpData[3].BP_ID;
    const bp5Id = bpData[4].BP_ID;

    // Sample Orders
    const orderData = [
        {
            Order_ID: uuid(),
            OrderNumber: '0001549747',
            BP_ID: bp1Id,
            Country: 'USA',
            Model: 'LC3037C',
            Phone: '5022956334',
            Email: 'charles.dobbs@otmail.com',
            OrderStatus: 'Cancelled',
            Cancelled: true,
            CreatedOn: new Date('2025-07-23T05:30:00Z'),
            ChangedOn: new Date('2025-07-23T05:30:00Z'),
            CreatedBy: 'SYSTEM',
            ChangedBy: 'SYSTEM'
        },
        {
            Order_ID: uuid(),
            OrderNumber: '0001549748',
            BP_ID: bp1Id,
            Country: 'USA',
            Model: 'LC3037Y',
            Phone: '5022956334',
            Email: 'charles.dobbs@otmail.com',
            OrderStatus: 'Cancelled',
            Cancelled: true,
            CreatedOn: new Date('2025-07-23T05:30:00Z'),
            ChangedOn: new Date('2025-07-23T05:30:00Z'),
            CreatedBy: 'SYSTEM',
            ChangedBy: 'SYSTEM'
        },
        {
            Order_ID: uuid(),
            OrderNumber: '0001557765',
            BP_ID: bp2Id,
            Country: 'USA',
            Model: 'LC3013Y',
            Phone: '5551234567',
            Email: 'jbaird98@outlook.com',
            OrderStatus: 'Cancelled',
            Cancelled: true,
            CreatedOn: new Date('2025-07-29T05:30:00Z'),
            ChangedOn: new Date('2025-07-29T05:30:00Z'),
            CreatedBy: 'SYSTEM',
            ChangedBy: 'SYSTEM'
        },
        {
            Order_ID: uuid(),
            OrderNumber: '0001511753',
            BP_ID: bp3Id,
            Country: 'USA',
            Model: 'TN920UXXL',
            Phone: '7243888394',
            Email: 'christy@christine.mcconnellcpa.com',
            OrderStatus: 'Cancelled',
            Cancelled: true,
            CreatedOn: new Date('2025-06-26T05:30:00Z'),
            ChangedOn: new Date('2025-06-26T05:30:00Z'),
            CreatedBy: 'SYSTEM',
            ChangedBy: 'SYSTEM'
        },
        {
            Order_ID: uuid(),
            OrderNumber: '0001577889',
            BP_ID: bp4Id,
            Country: 'USA',
            Model: 'LC3035Y',
            Phone: '6174475104',
            Email: 'stephanie.kelley@rayonier.com',
            OrderStatus: 'Cancelled',
            Cancelled: true,
            CreatedOn: new Date('2025-08-11T09:30:00Z'),
            ChangedOn: new Date('2025-08-12T05:30:00Z'),
            CreatedBy: 'SYSTEM',
            ChangedBy: 'SYSTEM'
        },
        {
            Order_ID: uuid(),
            OrderNumber: '0001549511',
            BP_ID: bp5Id,
            Country: 'USA',
            Model: 'LC3033Y',
            Phone: '7153210771',
            Email: 'kellyo1075@yahoo.com',
            OrderStatus: 'Cancelled',
            Cancelled: true,
            CreatedOn: new Date('2025-07-23T05:30:00Z'),
            ChangedOn: new Date('2025-07-23T05:30:00Z'),
            CreatedBy: 'SYSTEM',
            ChangedBy: 'SYSTEM'
        },
        {
            Order_ID: uuid(),
            OrderNumber: '0001549750',
            BP_ID: bp1Id,
            Country: 'USA',
            Model: 'LC3037C',
            Phone: '5022956334',
            Email: 'charles.dobbs@otmail.com',
            OrderStatus: 'Active',
            Cancelled: false,
            CreatedOn: new Date('2025-06-15T10:00:00Z'),
            ChangedOn: new Date('2025-06-15T10:00:00Z'),
            CreatedBy: 'SYSTEM',
            ChangedBy: 'SYSTEM'
        },
        {
            Order_ID: uuid(),
            OrderNumber: '0001549751',
            BP_ID: bp2Id,
            Country: 'USA',
            Model: 'LC3013Y',
            Phone: '5551234567',
            Email: 'jbaird98@outlook.com',
            OrderStatus: 'Active',
            Cancelled: false,
            CreatedOn: new Date('2025-06-20T14:20:00Z'),
            ChangedOn: new Date('2025-06-20T14:20:00Z'),
            CreatedBy: 'SYSTEM',
            ChangedBy: 'SYSTEM'
        }
    ];

    const orderIds = orderData.map(o => o.Order_ID);

    // Sample Order Items
    const itemData = [
        { Item_ID: uuid(), Order_ID: orderIds[0], ItemNumber: '000010', ProductName: 'Brother LC3037C Ink Cartridge', Quantity: 2, UnitPrice: 25.50, Amount: 51.00 },
        { Item_ID: uuid(), Order_ID: orderIds[0], ItemNumber: '000020', ProductName: 'Toner Cartridge Set', Quantity: 1, UnitPrice: 99.99, Amount: 99.99 },
        { Item_ID: uuid(), Order_ID: orderIds[1], ItemNumber: '000010', ProductName: 'Brother LC3037Y Ink Cartridge', Quantity: 3, UnitPrice: 22.50, Amount: 67.50 },
        { Item_ID: uuid(), Order_ID: orderIds[2], ItemNumber: '000010', ProductName: 'Maintenance Kit', Quantity: 1, UnitPrice: 150.00, Amount: 150.00 },
        { Item_ID: uuid(), Order_ID: orderIds[3], ItemNumber: '000010', ProductName: 'Fuser Assembly', Quantity: 1, UnitPrice: 200.00, Amount: 200.00 },
        { Item_ID: uuid(), Order_ID: orderIds[4], ItemNumber: '000010', ProductName: 'Transfer Belt', Quantity: 1, UnitPrice: 180.00, Amount: 180.00 },
        { Item_ID: uuid(), Order_ID: orderIds[5], ItemNumber: '000010', ProductName: 'Developer Unit', Quantity: 2, UnitPrice: 120.00, Amount: 240.00 },
        { Item_ID: uuid(), Order_ID: orderIds[6], ItemNumber: '000010', ProductName: 'Ink Cartridge Bundle', Quantity: 4, UnitPrice: 25.00, Amount: 100.00 },
        { Item_ID: uuid(), Order_ID: orderIds[7], ItemNumber: '000010', ProductName: 'Printer Stand', Quantity: 1, UnitPrice: 75.00, Amount: 75.00 }
    ];

  try {
    console.log('🔄 Resetting data...');

    await db.run(DELETE.from('order.management.OrderItems'));
    await db.run(DELETE.from('order.management.Orders'));
    await db.run(DELETE.from('order.management.BusinessPartners'));

    console.log('📥 Inserting Business Partners...');
    await db.run(INSERT.into('order.management.BusinessPartners').entries(bpData));

    console.log('📥 Inserting Orders...');
    await db.run(INSERT.into('order.management.Orders').entries(orderData));

    console.log('📥 Inserting Order Items...');
    await db.run(INSERT.into('order.management.OrderItems').entries(itemData));

    console.log('✅ Sample data loaded successfully!');

} catch (error) {
    console.error('❌ Error loading sample data:', error);
}
};


//     try {
//         const existingBP = await db.run(SELECT.one.from('order.management.BusinessPartners'));

//         if (!existingBP) {
//             console.log('📥 Inserting sample Business Partners...');
//             await db.run(INSERT.into('order.management.BusinessPartners').entries(bpData));

//             console.log('📥 Inserting sample Orders...');
//             await db.run(INSERT.into('order.management.Orders').entries(orderData));

//             console.log('📥 Inserting sample Order Items...');
//             await db.run(INSERT.into('order.management.OrderItems').entries(itemData));

//             console.log('✅ Sample data loaded successfully!');
//         }
//     } catch (error) {
//         console.error('❌ Error loading sample data:', error);
//     }
// };