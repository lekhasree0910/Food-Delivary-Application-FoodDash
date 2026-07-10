import json
from django.test import SimpleTestCase, Client
from bson import ObjectId
from Backend.db import (
    customers_collection,
    restaurants_collection,
    foods_collection,
    cart_collection,
    orders_collection,
)

class FoodDeliveryTests(SimpleTestCase):
    def setUp(self):
        self.client = Client()
        # Ensure collections are empty before each test
        customers_collection.delete_many({})
        restaurants_collection.delete_many({})
        foods_collection.delete_many({})
        cart_collection.delete_many({})
        orders_collection.delete_many({})

    def tearDown(self):
        # Clean up after each test
        customers_collection.delete_many({})
        restaurants_collection.delete_many({})
        foods_collection.delete_many({})
        cart_collection.delete_many({})
        orders_collection.delete_many({})

    # --- Customer Tests ---
    def test_customer_lifecycle(self):
        # 1. Register a new customer
        customer_data = {
            "full_name": "John Doe",
            "email": "john@example.com",
            "phone": "9876543210",
            "address": "123 Street",
            "city": "Metropolis",
            "password": "securepassword"
        }
        response = self.client.post(
            "/api/customers/add/",
            data=json.dumps(customer_data),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["message"], "Customer registered successfully")

        # 2. Register duplicate customer (should fail)
        response = self.client.post(
            "/api/customers/add/",
            data=json.dumps(customer_data),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["error"], "Email already registered")

        # 3. Retrieve all customers
        response = self.client.get("/api/customers/")
        self.assertEqual(response.status_code, 200)
        customers = response.json()
        self.assertEqual(len(customers), 1)
        customer_id = customers[0]["_id"]

        # 4. Get customer by ID
        response = self.client.get(f"/api/customers/{customer_id}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["full_name"], "John Doe")

        # 5. Customer Login
        login_data = {
            "email": "john@example.com",
            "password": "securepassword"
        }
        response = self.client.post(
            "/api/customers/login/",
            data=json.dumps(login_data),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["message"], "Login successful")
        self.assertEqual(response.json()["customer"]["full_name"], "John Doe")

        # 6. Customer Login with invalid credentials
        invalid_login = {
            "email": "john@example.com",
            "password": "wrongpassword"
        }
        response = self.client.post(
            "/api/customers/login/",
            data=json.dumps(invalid_login),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["error"], "Invalid credentials")

        # 7. Update customer profile
        update_data = {
            "phone": "9999999999",
            "city": "Gotham"
        }
        response = self.client.put(
            f"/api/customers/update/{customer_id}/",
            data=json.dumps(update_data),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["message"], "Customer updated successfully")

        # Verify update
        response = self.client.get(f"/api/customers/{customer_id}/")
        self.assertEqual(response.json()["phone"], "9999999999")
        self.assertEqual(response.json()["city"], "Gotham")

        # 8. Delete customer
        response = self.client.delete(f"/api/customers/delete/{customer_id}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["message"], "Customer deleted successfully")

        # Verify deletion
        response = self.client.get(f"/api/customers/{customer_id}/")
        self.assertEqual(response.status_code, 404)

    # --- Restaurant Tests ---
    def test_restaurant_lifecycle(self):
        restaurant_data = {
            "restaurant_name": "Pizza Palace",
            "owner_name": "Mario Rossi",
            "location": "Downtown",
            "cuisine": "Italian",
            "rating": 4.5
        }
        # 1. Add restaurant
        response = self.client.post(
            "/api/restaurants/add/",
            data=json.dumps(restaurant_data),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["message"], "Restaurant added successfully")

        # 2. Get restaurants (including search functionality)
        response = self.client.get("/api/restaurants/")
        self.assertEqual(response.status_code, 200)
        restaurants = response.json()
        self.assertEqual(len(restaurants), 1)
        res_id = restaurants[0]["_id"]

        # Search matching cuisine
        response = self.client.get("/api/restaurants/?search=Italian")
        self.assertEqual(len(response.json()), 1)

        # Search non-matching cuisine
        response = self.client.get("/api/restaurants/?search=Chinese")
        self.assertEqual(len(response.json()), 0)

        # 3. Update restaurant
        update_data = {"rating": 4.8}
        response = self.client.put(
            f"/api/restaurants/update/{res_id}/",
            data=json.dumps(update_data),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["message"], "Restaurant updated successfully")

        # 4. Delete restaurant
        response = self.client.delete(f"/api/restaurants/delete/{res_id}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["message"], "Restaurant deleted successfully")

    # --- Food Tests ---
    def test_food_lifecycle(self):
        food_data = {
            "restaurant_name": "Burger Barn",
            "food_name": "Cheeseburger",
            "category": "Fast Food",
            "price": 8.99,
            "availability": True
        }
        # 1. Add food item
        response = self.client.post(
            "/api/foods/add/",
            data=json.dumps(food_data),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["message"], "Food item added successfully")

        # 2. Get foods list (search and restaurant filters)
        response = self.client.get("/api/foods/")
        self.assertEqual(response.status_code, 200)
        foods = response.json()
        self.assertEqual(len(foods), 1)
        food_id = foods[0]["_id"]

        # Filter by restaurant
        response = self.client.get("/api/foods/?restaurant=Burger Barn")
        self.assertEqual(len(response.json()), 1)

        # Search food item
        response = self.client.get("/api/foods/?search=Cheeseburger")
        self.assertEqual(len(response.json()), 1)

        # 3. Update food item
        update_data = {"price": 9.99}
        response = self.client.put(
            f"/api/foods/update/{food_id}/",
            data=json.dumps(update_data),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["message"], "Food item updated successfully")

        # 4. Delete food item
        response = self.client.delete(f"/api/foods/delete/{food_id}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["message"], "Food item deleted successfully")

    # --- Cart Tests ---
    def test_cart_lifecycle(self):
        cart_item = {
            "customer_name": "Alice Smith",
            "food_name": "Tacos",
            "quantity": 3,
            "price": 2.50
        }
        # 1. Add to cart (should calculate total_price = price * quantity = 7.50)
        response = self.client.post(
            "/api/cart/add/",
            data=json.dumps(cart_item),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["message"], "Item added to cart")

        # 2. Get cart items for customer
        response = self.client.get("/api/cart/?customer_name=Alice Smith")
        self.assertEqual(response.status_code, 200)
        items = response.json()
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]["total_price"], 7.50)
        cart_id = items[0]["_id"]

        # 3. Update cart item quantity
        update_data = {
            "quantity": 5,
            "price": 2.50
        }
        response = self.client.put(
            f"/api/cart/update/{cart_id}/",
            data=json.dumps(update_data),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["message"], "Cart updated successfully")

        # Verify update and recalculation
        response = self.client.get("/api/cart/?customer_name=Alice Smith")
        self.assertEqual(response.json()[0]["total_price"], 12.50)

        # 4. Delete cart item
        response = self.client.delete(f"/api/cart/delete/{cart_id}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["message"], "Item removed from cart")

    # --- Order Tests ---
    def test_order_lifecycle(self):
        # Setup cart item first
        cart_item = {
            "customer_name": "Bob Green",
            "food_name": "Pasta",
            "quantity": 2,
            "price": 10.00
        }
        self.client.post(
            "/api/cart/add/",
            data=json.dumps(cart_item),
            content_type="application/json"
        )

        order_data = {
            "customer_name": "Bob Green",
            "restaurant_name": "Pasta House",
            "order_items": [{"food_name": "Pasta", "quantity": 2, "price": 10.00}],
            "total_amount": 20.00,
            "payment_status": "Paid",
            "delivery_status": "Pending"
        }

        # 1. Place order (should also clear cart for customer "Bob Green")
        response = self.client.post(
            "/api/orders/add/",
            data=json.dumps(order_data),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["message"], "Order placed successfully")

        # Verify cart is empty now for Bob
        response = self.client.get("/api/cart/?customer_name=Bob Green")
        self.assertEqual(len(response.json()), 0)

        # 2. Get customer orders
        response = self.client.get("/api/orders/?customer_name=Bob Green")
        self.assertEqual(response.status_code, 200)
        orders = response.json()
        self.assertEqual(len(orders), 1)
        order_id = orders[0]["_id"]

        # 3. Update order status
        update_data = {"delivery_status": "Delivered"}
        response = self.client.put(
            f"/api/orders/update/{order_id}/",
            data=json.dumps(update_data),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["message"], "Order updated successfully")

        # Verify update
        response = self.client.get("/api/orders/?customer_name=Bob Green")
        self.assertEqual(response.json()[0]["delivery_status"], "Delivered")

        # 4. Delete order
        response = self.client.delete(f"/api/orders/delete/{order_id}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["message"], "Order deleted successfully")
