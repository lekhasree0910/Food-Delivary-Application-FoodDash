from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from bson import ObjectId
from .db import (
    customers_collection,
    restaurants_collection,
    foods_collection,
    cart_collection,
    orders_collection,
    restaurant_owners_collection,
    admins_collection,
)


def json_serial(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    raise TypeError(f"Type {type(obj)} not serializable")


def parse_json(data):
    return json.loads(json.dumps(data, default=json_serial))


# ──────────────────── CUSTOMER MODULE ────────────────────


@csrf_exempt
@require_http_methods(["POST"])
def add_customer(request):
    try:
        data = json.loads(request.body)
        required = ["full_name", "email", "phone", "address", "city"]
        if not all(k in data for k in required):
            return JsonResponse({"error": "Missing required fields"}, status=400)

        existing = customers_collection.find_one({"email": data["email"]})
        if existing:
            return JsonResponse({"error": "Email already registered"}, status=400)

        customers_collection.insert_one(data)
        return JsonResponse({"message": "Customer registered successfully"}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_customers(request):
    try:
        customers = parse_json(list(customers_collection.find()))
        return JsonResponse(customers, safe=False, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_customer_by_id(request, id):
    try:
        customer = customers_collection.find_one({"_id": ObjectId(id)})
        if not customer:
            return JsonResponse({"error": "Customer not found"}, status=404)
        return JsonResponse(parse_json(customer), status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PUT"])
def update_customer(request, id):
    try:
        data = json.loads(request.body)
        result = customers_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": data}
        )
        if result.matched_count == 0:
            return JsonResponse({"error": "Customer not found"}, status=404)
        return JsonResponse({"message": "Customer updated successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_customer(request, id):
    try:
        result = customers_collection.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 0:
            return JsonResponse({"error": "Customer not found"}, status=404)
        return JsonResponse({"message": "Customer deleted successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def login_customer(request):
    try:
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")
        if not email or not password:
            return JsonResponse({"error": "Email and password required"}, status=400)
        customer = customers_collection.find_one(
            {"email": email, "password": password}
        )
        if not customer:
            return JsonResponse({"error": "Invalid credentials"}, status=401)
        return JsonResponse(
            {"message": "Login successful", "customer": parse_json(customer)},
            status=200,
        )
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ──────────────────── OWNER MODULE ────────────────────


@csrf_exempt
@require_http_methods(["POST"])
def add_owner(request):
    try:
        data = json.loads(request.body)
        required = ["owner_name", "email", "password", "phone", "restaurant_name", "cuisine", "location"]
        if not all(k in data for k in required):
            return JsonResponse({"error": "Missing required fields"}, status=400)

        existing = restaurant_owners_collection.find_one({"email": data["email"]})
        if existing:
            return JsonResponse({"error": "Email already registered"}, status=400)

        restaurant_owners_collection.insert_one(data)

        # Automatically insert the restaurant if not exists
        restaurant_existing = restaurants_collection.find_one({"restaurant_name": data["restaurant_name"]})
        if not restaurant_existing:
            restaurants_collection.insert_one({
                "restaurant_name": data["restaurant_name"],
                "owner_name": data["owner_name"],
                "location": data["location"],
                "cuisine": data["cuisine"],
                "rating": 4.0
            })

        return JsonResponse({"message": "Restaurant owner registered successfully"}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def login_owner(request):
    try:
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")
        if not email or not password:
            return JsonResponse({"error": "Email and password required"}, status=400)
        owner = restaurant_owners_collection.find_one(
            {"email": email, "password": password}
        )
        if not owner:
            return JsonResponse({"error": "Invalid credentials"}, status=401)
        return JsonResponse(
            {"message": "Login successful", "owner": parse_json(owner)},
            status=200,
        )
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ──────────────────── ADMIN MODULE ────────────────────


@csrf_exempt
@require_http_methods(["POST"])
def add_admin(request):
    try:
        data = json.loads(request.body)
        required = ["full_name", "email", "password", "phone"]
        if not all(k in data for k in required):
            return JsonResponse({"error": "Missing required fields"}, status=400)

        existing = admins_collection.find_one({"email": data["email"]})
        if existing:
            return JsonResponse({"error": "Email already registered"}, status=400)

        admins_collection.insert_one(data)
        return JsonResponse({"message": "Admin registered successfully"}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def login_admin(request):
    try:
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")
        if not email or not password:
            return JsonResponse({"error": "Email and password required"}, status=400)
        admin = admins_collection.find_one(
            {"email": email, "password": password}
        )
        if not admin:
            return JsonResponse({"error": "Invalid credentials"}, status=401)
        return JsonResponse(
            {"message": "Login successful", "admin": parse_json(admin)},
            status=200,
        )
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ──────────────────── RESTAURANT MODULE ────────────────────


@csrf_exempt
@require_http_methods(["POST"])
def add_restaurant(request):
    try:
        data = json.loads(request.body)
        required = ["restaurant_name", "owner_name", "location", "cuisine", "rating"]
        if not all(k in data for k in required):
            return JsonResponse({"error": "Missing required fields"}, status=400)
        restaurants_collection.insert_one(data)
        return JsonResponse({"message": "Restaurant added successfully"}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_restaurants(request):
    try:
        query = {}
        search = request.GET.get("search", "")
        if search:
            query["$or"] = [
                {"restaurant_name": {"$regex": search, "$options": "i"}},
                {"cuisine": {"$regex": search, "$options": "i"}},
                {"location": {"$regex": search, "$options": "i"}},
            ]
        restaurants = parse_json(list(restaurants_collection.find(query)))
        return JsonResponse(restaurants, safe=False, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PUT"])
def update_restaurant(request, id):
    try:
        data = json.loads(request.body)
        result = restaurants_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": data}
        )
        if result.matched_count == 0:
            return JsonResponse({"error": "Restaurant not found"}, status=404)
        return JsonResponse({"message": "Restaurant updated successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_restaurant(request, id):
    try:
        result = restaurants_collection.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 0:
            return JsonResponse({"error": "Restaurant not found"}, status=404)
        return JsonResponse({"message": "Restaurant deleted successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ──────────────────── FOOD MODULE ────────────────────


@csrf_exempt
@require_http_methods(["POST"])
def add_food(request):
    try:
        data = json.loads(request.body)
        required = [
            "restaurant_name",
            "food_name",
            "category",
            "price",
            "availability",
        ]
        if not all(k in data for k in required):
            return JsonResponse({"error": "Missing required fields"}, status=400)
        foods_collection.insert_one(data)
        return JsonResponse({"message": "Food item added successfully"}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_foods(request):
    try:
        query = {}
        search = request.GET.get("search", "")
        restaurant = request.GET.get("restaurant", "")
        if search:
            query["$or"] = [
                {"food_name": {"$regex": search, "$options": "i"}},
                {"category": {"$regex": search, "$options": "i"}},
                {"restaurant_name": {"$regex": search, "$options": "i"}},
            ]
        if restaurant:
            query["restaurant_name"] = restaurant
        foods = parse_json(list(foods_collection.find(query)))
        return JsonResponse(foods, safe=False, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PUT"])
def update_food(request, id):
    try:
        data = json.loads(request.body)
        result = foods_collection.update_one({"_id": ObjectId(id)}, {"$set": data})
        if result.matched_count == 0:
            return JsonResponse({"error": "Food item not found"}, status=404)
        return JsonResponse({"message": "Food item updated successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_food(request, id):
    try:
        result = foods_collection.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 0:
            return JsonResponse({"error": "Food item not found"}, status=404)
        return JsonResponse({"message": "Food item deleted successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ──────────────────── CART MODULE ────────────────────


@csrf_exempt
@require_http_methods(["POST"])
def add_to_cart(request):
    try:
        data = json.loads(request.body)
        required = ["customer_name", "food_name", "quantity", "price"]
        if not all(k in data for k in required):
            return JsonResponse({"error": "Missing required fields"}, status=400)
        data["total_price"] = data["price"] * data["quantity"]
        cart_collection.insert_one(data)
        return JsonResponse({"message": "Item added to cart"}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_cart(request):
    try:
        customer = request.GET.get("customer_name", "")
        query = {}
        if customer:
            query["customer_name"] = customer
        cart_items = parse_json(list(cart_collection.find(query)))
        return JsonResponse(cart_items, safe=False, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PUT"])
def update_cart(request, id):
    try:
        data = json.loads(request.body)
        if "quantity" in data and "price" in data:
            data["total_price"] = data["price"] * data["quantity"]
        result = cart_collection.update_one({"_id": ObjectId(id)}, {"$set": data})
        if result.matched_count == 0:
            return JsonResponse({"error": "Cart item not found"}, status=404)
        return JsonResponse({"message": "Cart updated successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_from_cart(request, id):
    try:
        result = cart_collection.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 0:
            return JsonResponse({"error": "Cart item not found"}, status=404)
        return JsonResponse({"message": "Item removed from cart"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ──────────────────── ORDER MODULE ────────────────────


@csrf_exempt
@require_http_methods(["POST"])
def add_order(request):
    try:
        data = json.loads(request.body)
        required = [
            "customer_name",
            "restaurant_name",
            "order_items",
            "total_amount",
            "payment_status",
            "delivery_status",
        ]
        if not all(k in data for k in required):
            return JsonResponse({"error": "Missing required fields"}, status=400)
        orders_collection.insert_one(data)

        cart_collection.delete_many({"customer_name": data["customer_name"]})

        return JsonResponse({"message": "Order placed successfully"}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_orders(request):
    try:
        customer = request.GET.get("customer_name", "")
        restaurant = request.GET.get("restaurant_name", "")
        query = {}
        if customer:
            query["customer_name"] = customer
        if restaurant:
            query["restaurant_name"] = restaurant
        orders = parse_json(list(orders_collection.find(query)))
        return JsonResponse(orders, safe=False, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PUT"])
def update_order(request, id):
    try:
        data = json.loads(request.body)
        result = orders_collection.update_one({"_id": ObjectId(id)}, {"$set": data})
        if result.matched_count == 0:
            return JsonResponse({"error": "Order not found"}, status=404)
        return JsonResponse({"message": "Order updated successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_order(request, id):
    try:
        result = orders_collection.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 0:
            return JsonResponse({"error": "Order not found"}, status=404)
        return JsonResponse({"message": "Order deleted successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
