const searchResultUrl = "https://clever-morning-ceiling.glitch.me/searchResult";
// https://glimmer-automatic-thrush.glitch.me/searchResult
const searchBar = document.getElementById("searchBar");
const resultsContainer = document.getElementById("results");

let originalData = [];

async function getData() {
    try {
        const response = await fetch(searchResultUrl);
        if (!response.ok) throw new Error("Failed to fetch data");
        originalData = await response.json();
        console.log("Fetched products:", originalData);
        localStorage.setItem("products", JSON.stringify(originalData));
        displayData(originalData);
    } catch (error) {
        console.error("Error fetching data:", error);
        resultsContainer.innerHTML = "<p>Failed to load products.</p>";
    }
}




function displayData(products) {

    
    if (!resultsContainer) {
        return };


    resultsContainer.innerHTML = "";
    if (products.length === 0) {
        resultsContainer.innerHTML = "<p>No products found.</p>";
        return;
    }

    const maxVisible = 8;
    const showMoreContainer = document.createElement("div");
    showMoreContainer.className = "see-more-container";

    products.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "product-card";
        if (index >= maxVisible) card.classList.add("hidden");

        let encoded = JSON.stringify(item).replace(/"/g, '&quot;');

        card.innerHTML = `
            <div class="product-image">
                <div class="image-loader"></div>
                <img src="${item.image}" alt="${item.title}" class="open-modal hidden" data-product="${encoded}" onerror="this.src='logo.jpg'">
                <button class="wishlist-btn"><span>♡</span></button>
            </div>
            <div class="product-info">
                <div class="product-brand">${item.brand || "Unknown"}</div>
                <div class="product-condition">${item.status || "Unknown"}</div>
                <div class="product-price">₹${item?.price?.amount?.amount || "N/A"}</div>
                <div class="product-discount">₹${item?.price?.totalAmount?.amount || "N/A"} incl.</div>
            </div>
        `;

        const img = card.querySelector("img");
        const loader = card.querySelector(".image-loader");

        img.onload = () => {
            loader.style.display = "none";
            img.classList.remove("hidden");
        };

        resultsContainer.appendChild(card);
    });

    if (products.length > maxVisible) {
        const seeMoreBtn = document.createElement("button");
        seeMoreBtn.textContent = "See More";
        seeMoreBtn.className = "see-more-btn";

        const seeLessBtn = document.createElement("button");
        seeLessBtn.textContent = "See Less";
        seeLessBtn.className = "see-less-btn hidden";

        seeMoreBtn.addEventListener("click", () => {
            document.querySelectorAll(".product-card.hidden").forEach(el => el.classList.remove("hidden"));
            seeMoreBtn.classList.add("hidden");
            seeLessBtn.classList.remove("hidden");
        });

        seeLessBtn.addEventListener("click", () => {
            document.querySelectorAll(".product-card").forEach((el, i) => {
                if (i >= maxVisible) el.classList.add("hidden");
            });
            seeMoreBtn.classList.remove("hidden");
            seeLessBtn.classList.add("hidden");
            resultsContainer.scrollIntoView({ behavior: "smooth" });
        });

        showMoreContainer.appendChild(seeMoreBtn);
        showMoreContainer.appendChild(seeLessBtn);
        resultsContainer.appendChild(showMoreContainer);
    }

    addModalEventListeners();
}

function addModalEventListeners() {
    document.querySelectorAll(".open-modal").forEach(img => {
        img.addEventListener("click", function () {
            const encodedData = this.dataset.product;
            try {
                const product = JSON.parse(encodedData.replace(/&quot;/g, '"'));// took chatgpt help
                localStorage.setItem("selectedProduct", JSON.stringify(product));
                const user = localStorage.getItem("loggedInUser");
                if (user || document.body.getAttribute("data-authenticated") === "true") {
                    window.location.href = "productdetails.html";
                } else {
                    localStorage.setItem("redirectAfterLogin", "productdetails.html");
                    window.location.href = "firebase.html";
                }
            } catch (error) {
                console.error("Failed to parse product:", error);
            }
        });
    });
}


function filterProducts(text) {
    const query = text.toLowerCase().trim();
    const filtered = originalData.filter(p => {
        return (p.title?.toLowerCase().includes(query) || 
                p.brand?.toLowerCase().includes(query) || 
                p.seller?.username?.toLowerCase().includes(query)||
                p.category?.toLowerCase().includes(query)
            );
    });
    displayData(filtered);
}

if (searchBar) {
    searchBar.addEventListener("input", e => filterProducts(e.target.value));
}


function updateCartCount() {
    const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
    const countEl = document.querySelector(".cart-count");
    if (countEl) countEl.textContent = cartItems.length;
}

function updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const countEl = document.querySelector(".wishlist-count");
    if (countEl) countEl.textContent = wishlist.length;
}


window.addEventListener("DOMContentLoaded", () => {
    getData();
    updateCartCount();
    updateWishlistCount();
});


document.getElementById("learnBtn")?.addEventListener("click", () => {
    window.location.href = "learn.html";
});
document.querySelector(".NewBtn")?.addEventListener("click", () => {
    window.location.href = "products.html";
});
document.getElementById("logout-btn")?.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("selectedProduct");
    Swal.fire({ toast: true, title: "Logged Out", timer: 2000, showConfirmButton: false });
    window.location.href = "firebase.html";
});
document.getElementById("lingerieBtn")?.addEventListener("click", () => {
    window.location.href = "lingerie.html";
});

document.getElementById("sneakersBtn")?.addEventListener("click", () => {
    const sneakersProducts = originalData.filter(product => product.category?.toLowerCase() === "sneakers");
    localStorage.setItem("filteredProducts", JSON.stringify(sneakersProducts));
    window.location.href = "sneakers.html";
});