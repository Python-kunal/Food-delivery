// JavaScript for Cart Functionality
const cart = [];

// Add to Cart Button Click
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        const item = button.getAttribute('data-item');
        cart.push(item);
        updateCart();
        alert(`${item} added to cart!`);
    });
});

// Update Cart
function updateCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = ''; // Clear previous items
    cart.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        li.className = 'list-group-item';
        cartItems.appendChild(li);
    });

     // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
}
