// Mock Cart Data
const cart = JSON.parse(localStorage.getItem('cart')) || [];
const prices = { Pizza: 1200, Burger: 1590, Pasta: 1899, Noodles: 1270, Tacos: 1600, Biryani: 2250, Samosa: 920, Dosa: 9880, ChickenTikka: 2220, CholeBhature: 9100 };
const userId = localStorage.getItem('userId');

function getApiBaseUrl() {
    const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);

    if (window.location.protocol === 'file:') {
        return 'http://localhost:3000';
    }

    if (isLocalhost && window.location.port && window.location.port !== '3000') {
        return `${window.location.protocol}//${window.location.hostname}:3000`;
    }

    return '';
}

const API_BASE_URL = getApiBaseUrl();

// Populate Order Summary Table
const orderSummary = document.getElementById('order-summary');
let total = 0;
cart.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${item}</td><td>₹${prices[item]}</td>`;
    orderSummary.appendChild(row);
    total += prices[item];
});

if (!cart.length) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="2">Your cart is empty. Add items from the menu before checkout.</td>';
    orderSummary.appendChild(row);
}

// Update Total Price
document.getElementById('total-price').textContent = total;

const confirmButton = document.getElementById('confirm-order');
if (!cart.length && confirmButton) {
    confirmButton.disabled = true;
    confirmButton.textContent = 'Add Items To Continue';
}

// Confirm Order
confirmButton.addEventListener('click', async () => {
    const name = document.getElementById('name').value;
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;

    if (!name || !address || !phone) {
        alert("Please fill in all customer details.");
        return;
    }

    if (!userId) {
        alert("Please log in to confirm your order.");
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart, total, name, address, phone, userId }),
        });

        if (response.ok) {
            const data = await response.json();
            alert(`Order Confirmed! Your Order ID: ${data.orderId}`);
            localStorage.removeItem('cart');
            window.location.href = 'index.html';
        } else {
            const contentType = response.headers.get('content-type') || '';
            const error = contentType.includes('application/json')
                ? await response.json()
                : { error: await response.text() };
            alert(`Order Failed: ${error.error || 'Could not process order.'}`);
        }
    } catch (err) {
        console.error('Error:', err);
        alert('Could not connect to server. Start backend with: node src/app.js');
    }
});