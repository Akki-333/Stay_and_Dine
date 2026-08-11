-- Stay & Dine Seed Data

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE users;
TRUNCATE TABLE branches;
TRUNCATE TABLE tables;
TRUNCATE TABLE foods;
SET FOREIGN_KEY_CHECKS = 1;

-- ── USERS ──
-- password for both is 'password123'
INSERT INTO users (id, name, username, email, phone, password, role) VALUES 
(1, 'Admin User', 'admin', 'admin@stayanddine.com', '1234567890', '$2b$10$XFoSBhHyDmG0CGrTXxtmsuKhLCWjKOUM.7pG4WxSAvUgY.E8KNUUK', 'admin'),
(2, 'Test Guest', 'guest', 'guest@stayanddine.com', '0987654321', '$2b$10$XFoSBhHyDmG0CGrTXxtmsuKhLCWjKOUM.7pG4WxSAvUgY.E8KNUUK', 'user');

-- ── BRANCHES (HOTELS) ──
INSERT INTO branches (id, name, location, description, home_img) VALUES 
(1, 'Stay & Dine Grand', 'Downtown Metro', 'Our flagship luxury dining experience in the heart of the city.', 'https://images.unsplash.com/photo-1542314831-c6a4d14d7b32?w=600');

-- ── TABLES ──
INSERT INTO tables (branch_id, table_name, table_type, price, booked) VALUES 
(1, 'Golden Corner (Table 101)', '2-pair', 500.00, 0),
(1, 'Family Haven (Table 201)', '6-family', 1200.00, 0),
(1, 'Business Suite (Table 301)', '4-business', 800.00, 0),
(1, 'The Balcony (Table 401)', '2-pair', 600.00, 0),
(1, 'Royal Circle (Table 501)', '8+ group', 2000.00, 0);

-- ── FOODS ──
INSERT INTO foods (name, description, price, image, category) VALUES
('Crispy Truffle Arancini', 'Golden risotto balls infused with truffle oil and melting mozzarella heart.', 450, 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=600', 'Starters'),
('Zesty Lime Calamari', 'Tender squid rings with a spicy citrus glaze and roasted garlic aioli.', 550, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600', 'Starters'),
('Honey Glazed Wings', 'Slow-roasted chicken wings tossed in a secret honey-siracha reduction.', 480, 'https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?w=600', 'Starters'),
('Stuffed Portobello', 'Large mushrooms filled with spinach, pine nuts, and aged parmesan.', 420, 'https://images.unsplash.com/photo-1515443961218-152367888767?w=600', 'Starters'),
('Burrata Bliss', 'Creamy burrata served with heritage tomatoes and cold-pressed basil oil.', 520, 'https://images.unsplash.com/photo-1534422298391-e4f8c170db76?w=600', 'Starters'),
('Lobster Thermidor', 'Premium Atlantic lobster baked in a rich cognac and gruyere sauce.', 2800, 'https://images.unsplash.com/photo-1590759021051-020556fca411?w=600', 'Seafood'),
('Miso Glazed Salmon', 'Pan-seared salmon fillet with a sweet miso crust and baby bok choy.', 1450, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600', 'Seafood'),
('Garlic Butter Prawns', 'Jumbo prawns sautéed in wild garlic butter and parsley oil.', 1250, 'https://images.unsplash.com/photo-1559742811-822873691df8?w=600', 'Seafood'),
('Wagyu Ribeye Steak', 'Premium Marble Grade 7 steak with red wine reduction and mash.', 4500, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600', 'Main Course'),
('Wild Mushroom Risotto', 'Arborio rice slow-cooked with porcini and truffle shavings.', 1100, 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600', 'Main Course'),
('Braised Lamb Shank', '12-hour slow-cooked lamb in a rich tomato and rosemary gravy.', 1850, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600', 'Main Course'),
('Classic Tiramisu', 'Mascarpone cream layered with espresso-soaked ladyfingers.', 650, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600', 'Desserts'),
('Molten Lava Cake', 'Warm chocolate cake with a melting dark chocolate heart.', 680, 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600', 'Desserts'),
('New York Cheesecake', 'Rich and creamy cheesecake with a berry compote swirl.', 720, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600', 'Desserts'),
('Virgin Blue Mojito', 'Fresh mint, lime, and blueberries with a splash of soda.', 350, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', 'Beverages'),
('Passion Fruit Iced Tea', 'Premium black tea infused with tropical passion fruit pulp.', 290, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600', 'Beverages'),
('Espresso Martini (Mocktail)', 'Chilled double shot of espresso with vanilla bean pod.', 380, 'https://images.unsplash.com/photo-1545438102-799c39913b91?w=600', 'Beverages');
-- Clear existing foods
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE foods;
SET FOREIGN_KEY_CHECKS = 1;

-- ── STARTERS (15) ──
INSERT INTO foods (name, category, price, description, image) VALUES 
('Paneer Tikka', 'Starters', 250, 'Char-grilled cottage cheese marinated in spiced yogurt.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Samosa Chaat', 'Starters', 180, 'Crispy samosas crushed and topped with tangy tamarind and mint chutney.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Chicken Tikka', 'Starters', 350, 'Juicy chicken chunks marinated in aromatic Indian spices and grilled.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Aloo Tikki', 'Starters', 150, 'Crispy spiced potato patties served with green chutney.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Tandoori Gobi', 'Starters', 220, 'Cauliflower florets roasted in tandoor with tikka masala.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Hara Bhara Kebab', 'Starters', 240, 'Healthy patties made of spinach, peas, and potatoes.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Mutton Seekh Kebab', 'Starters', 450, 'Minced lamb skewers cooked in a traditional clay oven.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Fish Amritsari', 'Starters', 420, 'Gram flour coated crispy fried fish fillets.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Pani Puri', 'Starters', 120, 'Crispy hollow puris filled with spicy tangy water and potatoes.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Chilli Paneer', 'Starters', 280, 'Indo-Chinese style cottage cheese tossed in spicy soy sauce.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Chicken 65', 'Starters', 320, 'Spicy, deep-fried chicken bites from South India.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Onion Bhaji', 'Starters', 140, 'Crispy onion fritters with Indian spices.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Mushroom Tikka', 'Starters', 260, 'Stuffed mushrooms marinated and roasted in tandoor.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Dahi Puri', 'Starters', 160, 'Puris stuffed with potatoes and topped with sweet yogurt.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Tandoori Prawns', 'Starters', 550, 'Tiger prawns marinated in yogurt and Indian spices.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800');

-- ── MAIN COURSE (15) ──
INSERT INTO foods (name, category, price, description, image) VALUES 
('Butter Chicken', 'Main Course', 480, 'Classic creamy tomato curry with tender chicken chunks.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Paneer Butter Masala', 'Main Course', 380, 'Rich and creamy tomato gravy with soft cottage cheese cubes.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Dal Makhani', 'Main Course', 280, 'Slow-cooked black lentils simmered with butter and cream.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Mutton Rogan Josh', 'Main Course', 550, 'Aromatic Kashmiri lamb curry with robust spices.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Chicken Biryani', 'Main Course', 450, 'Fragrant basmati rice cooked with marinated chicken and saffron.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Mutton Biryani', 'Main Course', 580, 'Rich basmati rice preparation with tender lamb pieces.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Palak Paneer', 'Main Course', 350, 'Cottage cheese cubes in a thick paste of pureed spinach.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Malai Kofta', 'Main Course', 360, 'Potato and paneer balls in a rich, creamy cashew curry.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Goan Fish Curry', 'Main Course', 480, 'Tangy and spicy coconut-based fish curry.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Chicken Chettinad', 'Main Course', 460, 'Spicy, roasted coconut curry from Tamil Nadu.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Kadai Paneer', 'Main Course', 340, 'Paneer cooked with bell peppers and freshly ground spices.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Bhindi Masala', 'Main Course', 250, 'Stir-fried okra with onions and tomatoes.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Chana Masala', 'Main Course', 260, 'Spicy and tangy chickpea curry.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Egg Curry', 'Main Course', 280, 'Boiled eggs simmered in a spiced onion-tomato gravy.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Vegetable Pulao', 'Main Course', 220, 'Mildly spiced rice cooked with mixed vegetables.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800');

-- ── DESSERTS (15) ──
INSERT INTO foods (name, category, price, description, image) VALUES 
('Gulab Jamun', 'Desserts', 150, 'Deep-fried milk dumplings soaked in cardamom sugar syrup.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Rasmalai', 'Desserts', 180, 'Soft paneer discs soaked in sweetened, thickened milk.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Gajar Ka Halwa', 'Desserts', 160, 'Classic Indian carrot pudding cooked with ghee and milk.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Jalebi', 'Desserts', 120, 'Crispy, syrupy spirals served warm.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Kulfi Falooda', 'Desserts', 200, 'Traditional Indian ice cream topped with sweet vermicelli.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Rasgulla', 'Desserts', 140, 'Spongy cottage cheese balls cooked in light sugar syrup.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Mysore Pak', 'Desserts', 180, 'Rich and porous sweet made of gram flour and pure ghee.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Rice Kheer', 'Desserts', 150, 'Creamy Indian rice pudding flavored with cardamom and nuts.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Shahi Tukda', 'Desserts', 190, 'Fried bread soaked in saffron milk and garnished with nuts.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Soan Papdi', 'Desserts', 160, 'Flaky, melt-in-your-mouth Indian sweet.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Peda', 'Desserts', 140, 'Soft milk fudge infused with cardamom.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Kaju Katli', 'Desserts', 220, 'Premium diamond-shaped cashew fudge.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Rabri', 'Desserts', 170, 'Thickened sweetened milk with layers of malai.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Malpua', 'Desserts', 160, 'Indian sweet pancakes soaked in syrup.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Kalakand', 'Desserts', 190, 'Moist granular milk cake.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800');

-- ── BEVERAGES (15) ──
INSERT INTO foods (name, category, price, description, image) VALUES 
('Mango Lassi', 'Beverages', 120, 'Sweet yogurt drink blended with ripe mangoes.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Masala Chai', 'Beverages', 60, 'Traditional Indian tea brewed with spices and milk.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Sweet Lassi', 'Beverages', 90, 'Classic sweetened yogurt drink.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Salted Lassi', 'Beverages', 80, 'Yogurt drink flavored with roasted cumin and salt.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Filter Coffee', 'Beverages', 70, 'Strong South Indian coffee brewed with chicory.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Nimbu Pani', 'Beverages', 50, 'Refreshing Indian lemonade with a hint of spice.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Jal Jeera', 'Beverages', 60, 'Tangy and spicy cumin-infused chilled water.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Thandai', 'Beverages', 140, 'Milk-based drink flavored with almonds, fennel, and saffron.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Butter Milk (Chaas)', 'Beverages', 50, 'Spiced watery yogurt drink, perfect for digestion.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Badam Milk', 'Beverages', 130, 'Warm milk blended with crushed almonds and cardamom.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Rooh Afza Milk', 'Beverages', 90, 'Chilled milk flavored with rose syrup.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Kokum Sherbet', 'Beverages', 80, 'Tangy and sweet cooling drink made from Kokum.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Sugarcane Juice', 'Beverages', 70, 'Freshly pressed sugarcane juice with ginger and lime.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Rose Lassi', 'Beverages', 110, 'Yogurt drink infused with fragrant rose syrup.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'),
('Aam Panna', 'Beverages', 90, 'Tangy raw mango drink spiced with cumin and mint.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800');
