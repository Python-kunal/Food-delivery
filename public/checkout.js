// Mock Cart Data
const cart = JSON.parse(localStorage.getItem('cart')) || [];
const prices = { Pizza: 200, Burger: 150, Pasta: 180 };

// Populate Order Summary Table
const orderSummary = document.getElementById('order-summary');
let total = 0;
cart.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${item}</td><td>₹${prices[item]}</td>`;
    orderSummary.appendChild(row);
    total += prices[item];
});

// Update Total Price
document.getElementById('total-price').textContent = total;

// Confirm Order
document.getElementById('confirm-order').addEventListener('click', async () => {
    const name = document.getElementById('name').value;
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;

    if (!name || !address || !phone) {
        alert("Please fill in all customer details.");
        return;
    }

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart, total, name, address, phone }),
        });

        if (response.ok) {
            const data = await response.json();
            alert(`Order Confirmed! Your Order ID: ${data.orderId}`);
            localStorage.removeItem('cart');
            window.location.href = '/';
        } else {
            const error = await response.json();
            alert(`Order Failed: ${error.error}`);
        }
    } catch (err) {
        console.error('Error:', err);
        alert('Something went wrong. Try again later.');
    }
});
