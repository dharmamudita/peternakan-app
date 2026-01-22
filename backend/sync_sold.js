const { db } = require('./src/config/firebase');
const { COLLECTIONS } = require('./src/config/constants');

async function sync() {
    console.log('Starting sync...');
    try {
        const ordersSnap = await db.collection(COLLECTIONS.ORDERS).get();
        const counts = {};

        console.log(`Found ${ordersSnap.size} orders.`);

        ordersSnap.forEach(doc => {
            const order = doc.data();
            // Count all orders (except cancelled)
            if (order.status !== 'cancelled') {
                if (order.items && Array.isArray(order.items)) {
                    order.items.forEach(item => {
                        if (item.productId && item.quantity) {
                            counts[item.productId] = (counts[item.productId] || 0) + item.quantity;
                        }
                    });
                }
            }
        });

        console.log('Counts calculated:', counts);

        for (const [pid, qty] of Object.entries(counts)) {
            try {
                await db.collection(COLLECTIONS.PRODUCTS).doc(pid).update({
                    totalSold: qty
                });
                console.log(`Updated product ${pid} -> ${qty} sold`);
            } catch (e) {
                console.log(`Failed update product ${pid}: ${e.message}`);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
    console.log('Done.');
    process.exit();
}

sync();
