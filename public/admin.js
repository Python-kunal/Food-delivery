// Fetch orders from backend
async function fetchOrders() {
    try {
        const response = await fetch('/api/orders');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const orders = await response.json();
        const ordersTable = document.getElementById('orders-table');
        ordersTable.innerHTML = ''; // Clear previous data

        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.items.join(', ')}</td>
                <td>₹${order.total}</td>
            `;
            ordersTable.appendChild(row);
        });
    } catch (err) {
        console.error('Error fetching orders:', err);
    }
}

// Fetch orders on page load
fetchOrders();
