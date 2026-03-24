// JavaScript for Cart Functionality and Order Summary
const prices = { Pizza: 1200, Burger: 1590, Pasta: 1899, Noodles: 1270, Tacos: 1600, Biryani: 2250, Samosa: 920, Dosa: 9880, ChickenTikka: 2220, CholeBhature: 9100 };
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Define all menu items in a data structure with new items
const menuItems = [
    { name: 'Pizza', price: 1200, description: 'Cheesy and delicious.', image: 'images/pizza.jpg' },
    { name: 'Burger', price: 1590, description: 'Juicy and flavorful.', image: 'images/burger.jpg' },
    { name: 'Pasta', price: 1899, description: 'Creamy and tasty.', image: 'images/pasta.jpg' },
    { name: 'Noodles', price: 1270, description: 'Spicy and flavorful.', image: 'images/Noodles.jpg' },
    { name: 'Tacos', price: 1600, description: 'Crispy and delicious.', image: 'images/Tacos.jpg' },
    { name: 'Biryani', price: 2250, description: 'Aromatic and flavorful rice dish.', image: 'images/Biryani.jpg' },
    { name: 'Samosa', price: 920, description: 'Crispy fried pastry with savory filling.', image: 'images/Samosa.jpg' },
    { name: 'Dosa', price: 9880, description: 'Thin, crispy crepe made from fermented batter.', image: 'images/Dosa.jpg' },
    { name: 'ChickenTikka', price: 2220, description: 'Marinated chicken pieces, grilled to perfection.', image: 'images/chickentikka.jpg' },
    { name: 'CholeBhature', price: 9100, description: 'Spicy chickpeas with fluffy fried bread.', image: 'images/cholebhature.jpg' }
];

// Function to render menu items
function renderMenuItems(items) {
    const menuContainer = document.getElementById('menu-items-container');
    if (!menuContainer) return; // Exit if not on the menu page

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

// Function to remove an item from the cart
function removeCartItem(itemToRemove) {
    const index = cart.indexOf(itemToRemove);
    if (index > -1) {
        cart.splice(index, 1);
    }
    updateCart();
}

// Update Cart and Total Price and Item Count
function updateCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = ''; // Clear previous items

    let total = 0;
    cart.forEach(item => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            ${item} - ₹${prices[item]}
            <button class="btn btn-sm btn-danger remove-item" data-item="${item}">&times;</button>
        `;
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

    // Attach event listeners to the new remove buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemToRemove = e.target.getAttribute('data-item');
            removeCartItem(itemToRemove);
        });
    });

    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Handle search input
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredItems = menuItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm) || item.description.toLowerCase().includes(searchTerm)
        );
        renderMenuItems(filteredItems);
    });
}

// Initial load of menu items on menu page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('menu-items-container')) {
        renderMenuItems(menuItems);
    }
    updateCart();
});