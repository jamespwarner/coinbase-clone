import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/StoreFront.css';

const StoreFront = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const products = [
    {
      id: 1,
      name: "Wireless Headphones",
      price: "£79.99",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
      category: "Electronics"
    },
    {
      id: 2,
      name: "Smart Watch",
      price: "£199.99",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
      category: "Electronics"
    },
    {
      id: 3,
      name: "Laptop Backpack",
      price: "£49.99",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
      category: "Accessories"
    },
    {
      id: 4,
      name: "Coffee Maker",
      price: "£89.99",
      image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400",
      category: "Home"
    },
    {
      id: 5,
      name: "Running Shoes",
      price: "£119.99",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
      category: "Sports"
    },
    {
      id: 6,
      name: "Sunglasses",
      price: "£59.99",
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
      category: "Accessories"
    },
    {
      id: 7,
      name: "Bluetooth Speaker",
      price: "£69.99",
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400",
      category: "Electronics"
    },
    {
      id: 8,
      name: "Yoga Mat",
      price: "£29.99",
      image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400",
      category: "Sports"
    }
  ];

  const categories = ["All", "Electronics", "Accessories", "Home", "Sports"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts = selectedCategory === "All" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="storefront">
      {/* Header */}
      <header className="store-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <h1>ShopHub</h1>
            </div>
            <nav className={`nav-menu ${menuOpen ? 'active' : ''}`}>
              <a href="#home">Home</a>
              <a href="#products">Products</a>
              <a href="#deals">Deals</a>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
            </nav>
            <div className="header-actions">
              <button className="icon-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
              </button>
              <button className="icon-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
              <button className="icon-btn cart-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                <span className="cart-badge">0</span>
              </button>
              <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="container">
          <div className="hero-content">
            <h1>Massive Black Friday Sale</h1>
            <p>Up to 70% off on selected items. Limited time offer!</p>
            <button className="cta-button">Shop Now</button>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="category-section">
        <div className="container">
          <div className="category-filter">
            {categories.map(cat => (
              <button 
                key={cat}
                className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="products-section">
        <div className="container">
          <h2 className="section-title">Featured Products</h2>
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                  <span className="product-badge">Sale</span>
                </div>
                <div className="product-info">
                  <span className="product-category">{product.category}</span>
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-footer">
                    <span className="product-price">{product.price}</span>
                    <button className="add-to-cart-btn">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="9" cy="21" r="1"/>
                        <circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🚚</div>
              <h3>Free Delivery</h3>
              <p>On orders over £50</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <h3>Secure Payment</h3>
              <p>100% secure transactions</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">↩️</div>
              <h3>Easy Returns</h3>
              <p>30-day return policy</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💬</div>
              <h3>24/7 Support</h3>
              <p>Dedicated customer service</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h2>Subscribe to our Newsletter</h2>
            <p>Get the latest updates on new products and exclusive offers!</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email" />
              <button>Subscribe</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="store-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <h3>ShopHub</h3>
              <p>Your one-stop shop for everything you need.</p>
              <div className="social-links">
                <a href="#facebook">Facebook</a>
                <a href="#twitter">Twitter</a>
                <a href="#instagram">Instagram</a>
              </div>
            </div>
            <div className="footer-col">
              <h4>Shop</h4>
              <a href="#electronics">Electronics</a>
              <a href="#accessories">Accessories</a>
              <a href="#home">Home & Living</a>
              <a href="#sports">Sports & Outdoors</a>
            </div>
            <div className="footer-col">
              <h4>Support</h4>
              <a href="#contact">Contact Us</a>
              <a href="#faq">FAQs</a>
              <a href="#shipping">Shipping Info</a>
              <a href="#returns">Returns</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#cookies">Cookie Policy</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 ShopHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StoreFront;
