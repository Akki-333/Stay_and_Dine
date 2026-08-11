USE hotel_booking;

SET SQL_SAFE_UPDATES = 0;

DELETE FROM foods WHERE name IN (
    'Gajar Ka Halwa',
    'Kulfi Falooda',
    'Rice Kheer',
    'Shahi Tukda',
    'Peda',
    'Kaju Katli',
    'Rabri',
    'Malpua',
    'Kalakand',
    'Salted Lassi',
    'Rooh Afza Milk',
    'Rooh Afza'
);

SET SQL_SAFE_UPDATES = 1;
