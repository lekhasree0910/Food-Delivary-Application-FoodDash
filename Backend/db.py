import os
import sys
import pymongo

MONGO_URI = "mongodb+srv://23691a3330_db_user:AY6DDXlIamhNBvX6@cluster0.98u6vc0.mongodb.net/"

client = pymongo.MongoClient(MONGO_URI)

# Use isolated test database if executing Django tests or TESTING is set
is_testing = "test" in sys.argv or os.environ.get("TESTING") == "True"
db_name = "FoodDeliveryDB_test" if is_testing else "FoodDeliveryDB"
db = client[db_name]

customers_collection = db["customers"]
restaurants_collection = db["restaurants"]
foods_collection = db["foods"]
cart_collection = db["cart"]
orders_collection = db["orders"]
restaurant_owners_collection = db["restaurant_owners"]
admins_collection = db["admins"]
