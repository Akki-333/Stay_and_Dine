USE hotel_booking;

SET SQL_SAFE_UPDATES = 0;

-- 1. First, delete all foods EXCEPT the 23 items you specifically kept
DELETE FROM foods 
WHERE name NOT IN (
    'Aloo Tikki',
    'Badam Milk',
    'Butter Chicken',
    'Butter Milk',
    'Chana Masala',
    'Chicken Biryani',
    'Chicken Chettinad',
    'Chicken Tikka',
    'Dal Makhani',
    'Filter Coffee',
    'Gulab Jamun',
    'Jalebi',
    'Mango Lassi',
    'Mushroom Tikka',
    'Mutton Biryani',
    'Palak Paneer',
    'Paneer Butter Masala',
    'Paneer Tikka',
    'Rasmalai',
    'Rose Lassi',
    'Samosa Chaat',
    'Soan Papdi',
    'Tandoori Gobi'
);

-- 2. Rename Rose Lassi to Rose Milk to match your preference
UPDATE foods SET name = 'Rose Milk' WHERE name = 'Rose Lassi';

-- 3. Update the exact image paths for the remaining 23 items
UPDATE foods SET image = '/images/foods/aloo_tikki.jpg' WHERE name = 'Aloo Tikki';
UPDATE foods SET image = '/images/foods/badam_milk.jpg' WHERE name = 'Badam Milk';
UPDATE foods SET image = '/images/foods/butter_chicken.jpg' WHERE name = 'Butter Chicken';
UPDATE foods SET image = '/images/foods/butter_milk.jpg' WHERE name = 'Butter Milk';
UPDATE foods SET image = '/images/foods/chenna_masala.jpg' WHERE name = 'Chana Masala';
UPDATE foods SET image = '/images/foods/chicken_briyani.jpg' WHERE name = 'Chicken Biryani';
UPDATE foods SET image = '/images/foods/chicken_chettinad.jpg' WHERE name = 'Chicken Chettinad';
UPDATE foods SET image = '/images/foods/chicken_tikka.jpg' WHERE name = 'Chicken Tikka';
UPDATE foods SET image = '/images/foods/dal_makhini.jpg' WHERE name = 'Dal Makhani';
UPDATE foods SET image = '/images/foods/filter_coffee.jpg' WHERE name = 'Filter Coffee';
UPDATE foods SET image = '/images/foods/gulab_jamun.jpg' WHERE name = 'Gulab Jamun';
UPDATE foods SET image = '/images/foods/jalebi.jpg' WHERE name = 'Jalebi';
UPDATE foods SET image = '/images/foods/mango_lassi.jpg' WHERE name = 'Mango Lassi';
UPDATE foods SET image = '/images/foods/mushroom_tikka.jpg' WHERE name = 'Mushroom Tikka';
UPDATE foods SET image = '/images/foods/mutton_briyani.jpg' WHERE name = 'Mutton Biryani';
UPDATE foods SET image = '/images/foods/palak_paneer.jpg' WHERE name = 'Palak Paneer';
UPDATE foods SET image = '/images/foods/paneer_butter_masala.jpg' WHERE name = 'Paneer Butter Masala';
UPDATE foods SET image = '/images/foods/paneer_tikka.jpg' WHERE name = 'Paneer Tikka';
UPDATE foods SET image = '/images/foods/rasamalai.jpg' WHERE name = 'Rasmalai';
UPDATE foods SET image = '/images/foods/rose_milk.jpg' WHERE name = 'Rose Milk';
UPDATE foods SET image = '/images/foods/samosa_chat.jpg' WHERE name = 'Samosa Chaat';
UPDATE foods SET image = '/images/foods/soan_papudi.jpg' WHERE name = 'Soan Papdi';
UPDATE foods SET image = '/images/foods/tandoori_gobi.jpg' WHERE name = 'Tandoori Gobi';

SET SQL_SAFE_UPDATES = 1;
