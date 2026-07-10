# FoodDash - Online Food Delivery Application

A full-stack food delivery platform built with **Django REST APIs** (backend) and **HTML/CSS/JavaScript** (frontend) using **MongoDB Atlas** for data storage.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6), Fetch API |
| **Backend** | Django 4.x, Function-Based Views, REST APIs |
| **Database** | MongoDB Atlas (PyMongo) |
| **Design** | Glass Morphism, Responsive Mobile-First |

---

## ✨ Features

### Customer Module
- ✅ Registration & Login (localStorage session)
- ✅ Browse restaurants with search/filter
- ✅ View food menus by category
- ✅ Add/remove items from cart
- ✅ Live cart total calculation (subtotal + delivery)
- ✅ Checkout & order placement
- ✅ Order history with status timeline

### Restaurant Module
- ✅ Restaurant CRUD (admin)
- ✅ Rating, cuisine, location display

### Food Menu Module
- ✅ Food item CRUD (admin)
- ✅ Category filter (Starter, Main Course, Dessert, Beverage, Snack)
- ✅ Availability badges (Available / Out of Stock)

### Cart Module
- ✅ Quantity controls (+/-)
- ✅ Real-time total updates
- ✅ Persistent per-user cart

### Order Module
- ✅ Order placement with payment/delivery status
- ✅ Status timeline: Preparing → Out for Delivery → Delivered / Cancelled
- ✅ Admin can update delivery status via dropdown

### Admin Dashboard
- ✅ Manage Customers, Restaurants, Foods, Orders
- ✅ Modal-based Create/Edit/Delete
- ✅ Live order status updates

---

## 📁 Project Structure

```
FoodDeliveryApp/
│
├── Backend/
│   ├── db.py                    # MongoDB connection
│   ├── views.py                 # 20 API endpoints
│   ├── urls.py                  # API routing
│   ├── manage.py                # Django entry point
│   ├── requirements.txt         # Dependencies
│   └── FoodDelivery/
│       ├── settings.py          # Django config + CORS
│       ├── urls.py              # Root URL config
│       ├── wsgi.py              # WSGI entry
│       └── middleware.py        # Custom CORS middleware
│
└── Frontend/
    ├── index.html               # Home page
    ├── login.html               # Customer login
    ├── register.html            # Customer registration
    ├── restaurants.html         # Restaurant listings + search
    ├── menu.html                # Food menu + category filter
    ├── cart.html                # Shopping cart + live totals
    ├── orders.html              # Order history + status timeline
    ├── dashboard.html           # Admin panel (4 tabs)
    ├── style.css                # Glass morphism + responsive
    └── script.js                # Fetch API integration
```

---

## 🔧 API Endpoints (20 Total)

| Module | POST | GET | PUT | DELETE |
|--------|------|-----|-----|--------|
| **Customers** | `/customers/add/` | `/customers/` | `/customers/update/<id>/` | `/customers/delete/<id>/` |
| **Restaurants** | `/restaurants/add/` | `/restaurants/` | `/restaurants/update/<id>/` | `/restaurants/delete/<id>/` |
| **Foods** | `/foods/add/` | `/foods/` | `/foods/update/<id>/` | `/foods/delete/<id>/` |
| **Cart** | `/cart/add/` | `/cart/` | `/cart/update/<id>/` | `/cart/delete/<id>/` |
| **Orders** | `/orders/add/` | `/orders/` | `/orders/update/<id>/` | `/orders/delete/<id>/` |

*All prefixed with `/api/`*

---

## 🎨 UI Highlights

- **Glass Morphism** - Backdrop blur, semi-transparent cards
- **Gradient Accents** - Orange/blue theme throughout
- **Smooth Animations** - Fade-in, slide-up, hover effects
- **Responsive Breakpoints** - 768px (tablet), 480px (mobile)
- **Mobile Hamburger Menu** - Collapsible navigation
- **Toast Notifications** - Success/error/info feedback

---

## 📦 Installation & Run

### 1. Prerequisites
- Python 3.8+
- MongoDB Atlas account (free tier works)
- VS Code with **Live Server** extension (recommended)

### 2. Backend Setup
```bash
cd FoodDeliveryApp/Backend

# Edit MongoDB URI in db.py
# MONGO_URI = "mongodb+srv://<user>:<pass>@cluster0.mongodb.net/..."

pip install -r requirements.txt
python manage.py runserver
```
> Server runs at `http://127.0.0.1:8000/`

### 3. Frontend Setup
- Open `FoodDeliveryApp/Frontend/` in VS Code
- Right-click `index.html` → **"Open with Live Server"**
- Or use any static server (not `file://` protocol)

---

## 🧪 Test Flow

1. **Register** → Creates customer in MongoDB
2. **Login** → Stores session in localStorage
3. **Browse Restaurants** → Real-time search
4. **View Menu** → Filter by category
5. **Add to Cart** → Live total updates
6. **Checkout** → Creates order, clears cart
7. **Track Orders** → Status badges timeline
8. **Admin Dashboard** → Full CRUD + live status updates

---

## 📝 Sample Data (for testing)

```json
// Customer
{ "full_name": "Rahul Sharma", "email": "rahul@gmail.com", "phone": "9876543210", "address": "KPHB Colony", "city": "Hyderabad" }

// Restaurant
{ "restaurant_name": "Spicy Kitchen", "owner_name": "Kiran Kumar", "location": "Hyderabad", "cuisine": "South Indian", "rating": 4.6 }

// Food Item
{ "restaurant_name": "Spicy Kitchen", "food_name": "Chicken Biryani", "category": "Main Course", "price": 299, "availability": "Available" }
```

---

## 🛠 Customization

| File | Purpose |
|------|---------|
| `Backend/db.py` | MongoDB connection string |
| `Frontend/style.css` | Colors, spacing, animations |
| `Frontend/script.js` | API_BASE URL, business logic |

---

## 📄 License

MIT License - Free for educational and commercial use.

---

**Built with ❤️ for learning full-stack development**