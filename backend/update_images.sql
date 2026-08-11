-- Script to update your database with 4 high-res local images

USE hotel_booking;

SET SQL_SAFE_UPDATES = 0;

UPDATE foods SET image = '/images/foods/samosa_chaat.jpg' WHERE name = 'Samosa Chaat';
UPDATE foods SET image = '/images/foods/chicken_tikka.jpg' WHERE name = 'Chicken Tikka';
UPDATE foods SET image = '/images/foods/aloo_tikki.jpg' WHERE name = 'Aloo Tikki';
UPDATE foods SET image = '/images/foods/tandoori_gobi.jpg' WHERE name = 'Tandoori Gobi';

SET SQL_SAFE_UPDATES = 1;
