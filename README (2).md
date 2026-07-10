# 🍔 FoodDeliveryApp

A full-stack **Food Delivery Application** inspired by platforms like Swiggy, Zomato, and Uber Eats — built with **HTML/CSS/JavaScript** on the frontend and **Django REST APIs** on the backend, with support for **SQLite, MySQL, or MongoDB Atlas** as the database layer.

Customers can browse restaurants, search food items, manage a cart, place orders, and track delivery status. Restaurant owners manage their menus, and administrators oversee the entire platform — each through their **own dedicated login and dashboard**.

---

## 📖 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [User Roles & Authentication](#-user-roles--authentication)
- [Database Design](#-database-design)
- [API Reference](#-api-reference)
- [Sample Test Data](#-sample-test-data)
- [Getting Started](#-getting-started)
- [Screenshots](#-screenshots)
- [Testing](#-testing)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## ✨ Features

### Core Functional Requirements
- Customer Registration & Login
- Restaurant Management (Owner Registration & Login)
- Food Menu Management
- Cart Management
- Order Placement & Order History
- Payment Status Management
- Search Restaurants
- Search Food Items

### Enhanced Features
| Feature | Description |
|---|---|
| 🔐 **Role-Based Login** | Separate login/authentication flows for **Customers**, **Restaurant Owners**, and **Admins**, each backed by its own database collection/table |
| 🔍 **Restaurant Search & Filter** | Filter restaurants by name, location, cuisine, and rating |
| 🍽️ **Food Category Filter** | Filter menu items by category (Starters, Main Course, Desserts, Beverages, etc.) |
| 🛒 **Live Cart Total Calculation** | Cart totals update in real time as items/quantities change, using the Fetch API |
| 📱 **Responsive Mobile Design** | Fully responsive layout using CSS media queries — works across desktop, tablet, and mobile |
| 🚚 **Order Tracking Status Timeline** | Visual step-by-step timeline: `Preparing → Out for Delivery → Delivered` (with `Cancelled` state handling) |

---

## 🛠️ Tech Stack

**Frontend**
- HTML5
- CSS3 (Responsive / Flexbox / Grid / Media Queries)
- JavaScript (ES6)
- Fetch API for all client–server communication

**Backend**
- Django
- Function-Based Views (FBVs)
- Django REST APIs

**Database** *(choose one)*
- SQLite (default, file-based)
- MySQL
- MongoDB Atlas (via PyMongo)

**Tools**
- Postman — API testing
- Git & GitHub — version control

---

## 📁 Folder Structure

> Folder structure is kept exactly as specified in the project requirements.

```
FoodDeliveryApp/
│── Backend/
│     db.py
│     views.py
│     urls.py
│
└── Frontend/
      index.html
      login.html
      register.html
      restaurants.html
      menu.html
      cart.html
      orders.html
      dashboard.html
      style.css
      script.js
```

**File responsibilities:**

| File | Responsibility |
|---|---|
| `Backend/db.py` | Database connection logic (SQLite / MySQL / MongoDB Atlas via PyMongo) |
| `Backend/views.py` | All Function-Based Views implementing the 20 CRUD REST API endpoints |
| `Backend/urls.py` | URL routing for all API endpoints |
| `Frontend/index.html` | Home page — navbar, restaurant listings, search bar, featured items |
| `Frontend/login.html` | Unified login page with role selector (Customer / Restaurant / Admin) |
| `Frontend/register.html` | Registration form for customers |
| `Frontend/restaurants.html` | Restaurant listing with search & filter |
| `Frontend/menu.html` | Food items for a selected restaurant with "Add to Cart" |
| `Frontend/cart.html` | Cart items, live total, checkout |
| `Frontend/orders.html` | Current orders + order history with tracking timeline |
| `Frontend/dashboard.html` | Role-based dashboard (Admin / Restaurant Owner) |
| `Frontend/style.css` | Global responsive styling |
| `Frontend/script.js` | Fetch API calls, cart logic, filters, auth handling |

---

## 🔐 User Roles & Authentication

The application supports **three distinct login flows**, each mapped to its own database collection/table:

| Role | Login Landing Page | Database Collection/Table | Capabilities |
|---|---|---|---|
| **Customer** | `login.html?role=customer` | `customers` | Browse, search, order, track, view order history |
| **Restaurant Owner** | `login.html?role=restaurant` | `restaurant_owners` | Manage own restaurant profile & menu, view incoming orders |
| **Admin** | `login.html?role=admin` | `admins` | Manage all customers, restaurants, food items, and orders |

**Design notes:**
- `login.html` presents a role selector (tabs or dropdown) so all three roles share one page but POST to different endpoints (`/auth/customer/login/`, `/auth/restaurant/login/`, `/auth/admin/login/`).
- On successful login, a session token/flag is stored (e.g., `localStorage`) along with the role, which `script.js` uses to redirect to the correct dashboard and gate UI elements.
- Passwords are stored hashed (Django's built-in hashing, or `bcrypt`/`hashlib` if using raw PyMongo without Django's auth system).

---

## 🗄️ Database Design

Data can be stored in **SQLite**, **MySQL**, or **MongoDB Atlas** — the schema below applies across all three (as tables in SQL, or collections in MongoDB).

### 1. Customer
| Field | Type |
|---|---|
| customer_id | Number |
| full_name | String |
| email | String |
| phone | String |
| address | String |
| city | String |
| password | String *(hashed)* |

### 2. Restaurant
| Field | Type |
|---|---|
| restaurant_id | Number |
| restaurant_name | String |
| owner_name | String |
| location | String |
| cuisine | String |
| rating | Number |
| password | String *(hashed, for owner login)* |

### 3. Food Item
| Field | Type |
|---|---|
| food_id | Number |
| restaurant_name | String |
| food_name | String |
| category | String |
| price | Number |
| availability | `Available` \| `Out of Stock` |

### 4. Cart
| Field | Type |
|---|---|
| cart_id | Number |
| customer_name | String |
| food_name | String |
| quantity | Number |
| price | Number |
| total_price | Number |

### 5. Order
| Field | Type |
|---|---|
| order_id | Number |
| customer_name | String |
| restaurant_name | String |
| order_items | String |
| total_amount | Number |
| payment_status | `Pending` \| `Paid` |
| delivery_status | `Preparing` \| `Out for Delivery` \| `Delivered` \| `Cancelled` |

### 6. Admin
| Field | Type |
|---|---|
| admin_id | Number |
| username | String |
| password | String *(hashed)* |

### Entity Relationship (simplified)
```
Customer (1) ──< places >── (M) Order
Restaurant (1) ──< has many >── (M) FoodItem
Customer (1) ──< builds >── (M) CartItem ──> references FoodItem
Order (1) ──< contains >── (M) OrderItems (derived from Cart at checkout)
Admin ──< manages >── Customers, Restaurants, FoodItems, Orders
```

---

## 🔌 API Reference

Base URL: `http://127.0.0.1:8000/`

### Customer Management
| Method | Endpoint | Description |
|---|---|---|
| POST | `/customers/add/` | Register a new customer |
| GET | `/customers/` | List all customers |
| PUT | `/customers/update/<id>/` | Update customer details |
| DELETE | `/customers/delete/<id>/` | Delete a customer |

### Restaurant Management
| Method | Endpoint | Description |
|---|---|---|
| POST | `/restaurants/add/` | Add a new restaurant |
| GET | `/restaurants/` | List all restaurants |
| PUT | `/restaurants/update/<id>/` | Update restaurant details |
| DELETE | `/restaurants/delete/<id>/` | Delete a restaurant |

### Food Menu Management
| Method | Endpoint | Description |
|---|---|---|
| POST | `/foods/add/` | Add a food item |
| GET | `/foods/` | List all food items |
| PUT | `/foods/update/<id>/` | Update a food item |
| DELETE | `/foods/delete/<id>/` | Delete a food item |

### Cart Management
| Method | Endpoint | Description |
|---|---|---|
| POST | `/cart/add/` | Add item to cart |
| GET | `/cart/` | View cart items |
| PUT | `/cart/update/<id>/` | Update cart item quantity |
| DELETE | `/cart/delete/<id>/` | Remove item from cart |

### Order Management
| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders/add/` | Place an order |
| GET | `/orders/` | List all orders |
| PUT | `/orders/update/<id>/` | Update order/delivery status |
| DELETE | `/orders/delete/<id>/` | Cancel/delete an order |

### Auth (role-based, added for multi-login support)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/customer/login/` | Customer login |
| POST | `/auth/restaurant/login/` | Restaurant owner login |
| POST | `/auth/admin/login/` | Admin login |

**Total CRUD APIs**

| Module | CRUD APIs |
|---|---|
| Customer | 4 |
| Restaurant | 4 |
| Food Menu | 4 |
| Cart | 4 |
| Order | 4 |
| **Total** | **20** |

---

## 🧪 Sample Test Data

**Customer**
```json
{
  "customer_id": 101,
  "full_name": "Rahul Sharma",
  "email": "rahul@gmail.com",
  "phone": "9876543210",
  "address": "KPHB Colony",
  "city": "Hyderabad"
}
```

**Restaurant**
```json
{
  "restaurant_id": 201,
  "restaurant_name": "Spicy Kitchen",
  "owner_name": "Kiran Kumar",
  "location": "Hyderabad",
  "cuisine": "South Indian",
  "rating": 4.6
}
```

**Food Item**
```json
{
  "food_id": 301,
  "restaurant_name": "Spicy Kitchen",
  "food_name": "Chicken Biryani",
  "category": "Main Course",
  "price": 299,
  "availability": "Available"
}
```

**Cart**
```json
{
  "cart_id": 401,
  "customer_name": "Rahul Sharma",
  "food_name": "Chicken Biryani",
  "quantity": 2,
  "price": 299,
  "total_price": 598
}
```

**Order**
```json
{
  "order_id": 501,
  "customer_name": "Rahul Sharma",
  "restaurant_name": "Spicy Kitchen",
  "order_items": "Chicken Biryani x2",
  "total_amount": 598,
  "payment_status": "Paid",
  "delivery_status": "Preparing"
}
```

> Additional sample records (extra customers, restaurants, and menu items across categories/cities) should be seeded to properly test search, filter, and multi-restaurant cart/order scenarios.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Django & Django REST Framework
- pip
- One of: SQLite (built-in), MySQL Server, or a MongoDB Atlas cluster

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd FoodDeliveryApp
```

### 2. Backend setup
```bash
cd Backend
python -m venv venv
source venv/bin/activate      # On Windows: venv\Scripts\activate
pip install django djangorestframework pymongo dnspython mysqlclient
```

### 3. Configure the database
Choose **one** in `db.py` / Django `settings.py`:

**SQLite (default)** — no extra config needed, Django creates `db.sqlite3` automatically.

**MySQL**
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'fooddelivery_db',
        'USER': 'root',
        'PASSWORD': 'yourpassword',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

**MongoDB Atlas (PyMongo)**
```python
from pymongo import MongoClient

client = MongoClient("<YOUR_MONGODB_CONNECTION_STRING>")
db = client["fooddelivery_db"]
```
> ⚠️ Keep your MongoDB Atlas connection string out of version control — store it in an environment variable (e.g., `.env` file with `python-decouple` or `os.environ`) rather than hardcoding it in `db.py`.

### 4. Run migrations (SQLite/MySQL) & start the server
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```
Backend will be live at `http://127.0.0.1:8000/`

### 5. Run the frontend
Open `Frontend/index.html` directly in a browser, or serve it with a lightweight server:
```bash
cd Frontend
python -m http.server 5500
```
Frontend will be live at `http://127.0.0.1:5500/`

> Ensure `script.js` points its Fetch API base URL to your backend (`http://127.0.0.1:8000/`) and that Django's `CORS` settings allow requests from the frontend origin.

---

## 📸 Screenshots

> Add your project screenshots below. Recommended image size: 800–1200px wide, PNG/JPG format. Store images in a `screenshots/` folder in the repo root and reference them using relative paths as shown.

### 🗃️ Database Screenshots

**SQLite**
<!-- ![SQLite Database](./screenshots/database/sqlite.png) -->
*(Add screenshot of DB Browser for SQLite showing tables and records)*

**MySQL**
<!-- ![MySQL Database](./screenshots/database/mysql.png) -->
*(Add screenshot of MySQL Workbench / phpMyAdmin showing tables and records)*

**MongoDB Atlas**
<!-- ![MongoDB Atlas](./screenshots/database/mongodb_atlas.png) -->
*(Add screenshot of MongoDB Atlas Collections view showing documents)*

---

### 📮 Postman API Testing Screenshots

| API | Screenshot |
|---|---|
| Customer APIs (POST/GET/PUT/DELETE) | <!-- ![Customer APIs](./screenshots/postman/customer_apis.png) --> *(Add screenshot)* |
| Restaurant APIs | <!-- ![Restaurant APIs](./screenshots/postman/restaurant_apis.png) --> *(Add screenshot)* |
| Food Menu APIs | <!-- ![Food APIs](./screenshots/postman/food_apis.png) --> *(Add screenshot)* |
| Cart APIs | <!-- ![Cart APIs](./screenshots/postman/cart_apis.png) --> *(Add screenshot)* |
| Order APIs | <!-- ![Order APIs](./screenshots/postman/order_apis.png) --> *(Add screenshot)* |
| Auth APIs (Customer/Restaurant/Admin login) | <!-- ![Auth APIs](./screenshots/postman/auth_apis.png) --> *(Add screenshot)* |

---

### 🖥️ Frontend Screenshots

| Page | Screenshot |
|---|---|
| Home Page | <!-- ![Home Page](./screenshots/frontend/home.png) --> *(Add screenshot)* |
| Login Page (role selector) | <!-- ![Login Page](./screenshots/frontend/login.png) --> *(Add screenshot)* |
| Register Page | <!-- ![Register Page](./screenshots/frontend/register.png) --> *(Add screenshot)* |
| Restaurants Listing (search & filter) | <!-- ![Restaurants Page](./screenshots/frontend/restaurants.png) --> *(Add screenshot)* |
| Menu Page (category filter) | <!-- ![Menu Page](./screenshots/frontend/menu.png) --> *(Add screenshot)* |
| Cart Page (live total) | <!-- ![Cart Page](./screenshots/frontend/cart.png) --> *(Add screenshot)* |
| Orders Page (tracking timeline) | <!-- ![Orders Page](./screenshots/frontend/orders.png) --> *(Add screenshot)* |
| Admin Dashboard | <!-- ![Admin Dashboard](./screenshots/frontend/dashboard_admin.png) --> *(Add screenshot)* |
| Restaurant Owner Dashboard | <!-- ![Restaurant Dashboard](./screenshots/frontend/dashboard_restaurant.png) --> *(Add screenshot)* |
| Mobile Responsive View | <!-- ![Mobile View](./screenshots/frontend/mobile_view.png) --> *(Add screenshot)* |

---

## ✅ Testing

- **API testing:** Use Postman to hit all 20+ CRUD endpoints with the sample data above; verify status codes (`200`, `201`, `400`, `404`) and response bodies.
- **Frontend testing:** Manually test each page's flow — registration → login (all 3 roles) → browse → add to cart → checkout → track order.
- **Cross-role testing:** Confirm a customer cannot access admin/restaurant dashboards and vice versa (route guarding via stored role/session).
- **Responsive testing:** Test on Chrome DevTools device toolbar (mobile/tablet breakpoints) and on an actual mobile device if possible.
- **Database testing:** Verify chosen database (SQLite/MySQL/MongoDB Atlas) persists data correctly across server restarts.

---

## 🗺️ Roadmap

- [ ] Add payment gateway integration (Razorpay/Stripe sandbox)
- [ ] Add real-time order status updates (WebSockets)
- [ ] Add restaurant rating & review system
- [ ] Add JWT-based authentication in place of session flags
- [ ] Dockerize backend + database for easier setup

---

## 📄 License

This project is developed for academic/learning purposes. Add a license (MIT, Apache 2.0, etc.) here if distributing publicly.
