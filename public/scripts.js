// JavaScript for Cart Functionality and Order Summary
const prices = { Pizza: 200, Burger: 150, Pasta: 180 };
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Define menu items in a data structure
const menuItems = [
    { name: 'Pizza', price: 200, description: 'Cheesy and delicious.', image: 'images/pizza.jpg' },
    { name: 'Burger', price: 150, description: 'Juicy and flavorful.', image: 'images/burger.jpg' },
    { name: 'Pasta', price: 180, description: 'Creamy and tasty.', image: 'images/pasta.jpg' }
];

// Function to render menu items
function renderMenuItems(items) {
    const menuContainer = document.getElementById('menu-items-container');
    menuContainer.innerHTML = ''; // Clear previous items

    items.forEach(item => {
        const itemHtml = `
            <div class="col-md-4">
                <div class="card">
                    <img src="${item.image}" class="card-img-top" alt="${item.name}">
                    <div class="card-body text-center">
                        <h5 class="card-title">${item.name}</h5>
                        <p class="card-text">${item.description}</p>
                        <span class="fw-bold">₹${item.price}</span>
                        <button class="btn btn-primary add-to-cart" data-item="${item.name}">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;
        menuContainer.innerHTML += itemHtml;
    });

    // Re-attach event listeners for "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCartHandler);
    });
}

// Function to handle "Add to Cart" button clicks
function addToCartHandler(event) {
    const item = event.target.getAttribute('data-item');
    cart.push(item);
    updateCart();
    alert(`${item} added to cart!`);
}

// Update Cart and Total Price and Item Count
function updateCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = ''; // Clear previous items

    let total = 0;
    cart.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item} - ₹${prices[item]}`;
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        cartItems.appendChild(li);
        total += prices[item];
    });

    // Update the total price in the modal
    const totalElement = document.getElementById('total-price');
    if (totalElement) {
        totalElement.textContent = total;
    }

    // Update the cart item count on the navbar
    const cartItemCount = document.getElementById('cart-item-count');
    if (cartItemCount) {
        cartItemCount.textContent = cart.length;
    }

    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Handle search input
document.getElementById('search-input').addEventListener('keyup', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm) || item.description.toLowerCase().includes(searchTerm)
    );
    renderMenuItems(filteredItems);
});

// Smooth scroll for "Explore Menu" button
document.querySelector('.scroll-to-menu').addEventListener('click', (e) => {
    e.preventDefault();
    const menuSection = document.getElementById('menu');
    menuSection.scrollIntoView({ behavior: 'smooth' });
});

// Initial load of menu items
document.addEventListener('DOMContentLoaded', () => {
    renderMenuItems(menuItems);
    updateCart();
});
