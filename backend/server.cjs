const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const WebSocket = require("ws");
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_super_secret_key_123';
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, '.env') });
const app = express();
app.use(express.json());
app.use(cors());

const multer = require("multer");

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error("Error: Only images (jpeg, jpg, png, webp) are allowed!"));
};

const upload = multer({ storage, fileFilter });

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(upload.single('image')); // For single file upload

const wss = new WebSocket.Server({ port: 8080 });



// Twilio and Nodemailer dependencies removed

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Access Denied: No Token Provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid Token' });
    req.user = user;
    next();
  });
};

// Middleware to check admin role
const authenticateAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ success: false, message: 'Access Denied: Admins Only' });
    }
  });
};





const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "hotel_booking",
  });



db.connect(err => {
  if (err) {
    console.error("DATABASE CONNECTION FAILED:", err.message);
    console.error("Please check your database credentials in backend/.env");
    process.exit(1);
  } else {
    console.log("Database Connected");
  }
});

app.post('/register', async (req, res) => {
  const { name, username, email, phone, dob, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const role = "user";
  
  const sql = "INSERT INTO users (name, username, email, phone, dob, password, role) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.query(sql, [name, username, email, phone, dob, hashedPassword, role], (err, result) => {
    if (err) return res.json({ success: false, message: "User already exists" });
    res.json({ success: true });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM users WHERE username = ?";

  db.query(sql, [username], async (err, results) => {
    if (err || results.length === 0) return res.json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, results[0].password);
    if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });

    const role = results[0].role;
    const id = results[0].id;
    
    // Generate JWT token
    const token = jwt.sign({ id: id, role: role }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ 
      success: true, 
      token: token,
      role: role,
      id: id,
      message: `Login successful as ${role}` 
    });
    
  });
});


app.post('/check-username', (req, res) => {
    const { username } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
      if (err) {
        return res.json({ success: false, message: 'Database error' });
      }
      if (results.length > 0) {
        return res.json({ available: false });
      }
      return res.json({ available: true });
    });
  });



  app.get("/branches", (req, res) => {
    const sql = "SELECT * FROM branches"; 
    
    db.query(sql, (err, result) => {
      if (err) {
        console.error("Error fetching branches:", err); 
        return res.status(500).json({ message: "Internal Server Error" });
      }
  
      if (!result.length) {
        return res.status(404).json({ message: "No branches found" });
      }
  
      res.status(200).json(result); 
    });
  });
  






app.post("/branches", authenticateAdmin, upload.fields([
  { name: "home_img", maxCount: 1 },
  { name: "hotel_front_img", maxCount: 1 },
  { name: "hotel_img", maxCount: 1 },
  { name: "hotel_img2", maxCount: 1 },
]), (req, res) => {
  const { name, location, contactNo, description } = req.body;

  
  
  const home_img = req.files["home_img"] ? `/uploads/${req.files["home_img"][0].filename}` : null;
  const hotel_front_img = req.files["hotel_front_img"] ? `/uploads/${req.files["hotel_front_img"][0].filename}` : null;
  const hotel_img = req.files["hotel_img"] ? `/uploads/${req.files["hotel_img"][0].filename}` : null;
  const hotel_img2 = req.files["hotel_img2"] ? `/uploads/${req.files["hotel_img2"][0].filename}` : null;

  db.query(
    "INSERT INTO branches (name, location, contactNo, description, home_img, hotel_front_img, hotel_img, hotel_img2) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [name, location, contactNo, description, home_img, hotel_front_img, hotel_img, hotel_img2],
    (err, result) => {
      if (err){ 
        console.error("❌ Error while adding branch", err.message);
        return res.status(500).json(err);
      }
      res.json({ message: "Branch added successfully", id: result.insertId });
    }
  );
});

app.put("/branches/:id", authenticateAdmin, upload.fields([
  { name: "home_img", maxCount: 1 },
  { name: "hotel_front_img", maxCount: 1 },
  { name: "hotel_img", maxCount: 1 },
  { name: "hotel_img2", maxCount: 1 },
]), (req, res) => {
  const { name, location, contactNo, description } = req.body;
  const id = req.params.id;

  db.query("SELECT home_img, hotel_front_img, hotel_img, hotel_img2 FROM branches WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    let existingImages = result[0];

    const home_img = req.files["home_img"] ? `/uploads/${req.files["home_img"][0].filename}` : existingImages.home_img;
    const hotel_front_img = req.files["hotel_front_img"] ? `/uploads/${req.files["hotel_front_img"][0].filename}` : existingImages.hotel_front_img;
    const hotel_img = req.files["hotel_img"] ? `/uploads/${req.files["hotel_img"][0].filename}` : existingImages.hotel_img;
    const hotel_img2 = req.files["hotel_img2"] ? `/uploads/${req.files["hotel_img2"][0].filename}` : existingImages.hotel_img2;

    db.query(
      "UPDATE branches SET name=?, location=?, contactNo=?, description=?, home_img=?, hotel_front_img=?, hotel_img=?, hotel_img2=? WHERE id=?",
      [name, location, contactNo, description, home_img, hotel_front_img, hotel_img, hotel_img2, id],
      (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Branch updated successfully" });
      }
    );
  });
});



  
  // app.post("/branches", (req, res) => {
  //   const { name, location, contactNo, description  } = req.body;
  //   db.query("INSERT INTO branches (name, location, contactNo, description) VALUES (?, ?, ?, ?)", [name, location, contactNo, description], (err, result) => {
  //     if (err) return res.status(500).json(err);
  //     res.json({ success: true, message: "Branch added" });
  //   });
  // });
  
  // app.put("/branches/:id", (req, res) => {
  //   const { name, location, contactNo, description } = req.body;
  //   db.query(
  //     "UPDATE branches SET name = ?, location = ?, contactNo = ?, description = ? WHERE id = ?",
  //     [name, location, contactNo, description, req.params.id],
  //     (err, result) => {
  //       if (err) return res.status(500).json(err);
  //       res.json({ success: true, message: "Branch updated" });
  //     }
  //   );
  // });
  
  app.delete("/branches/:id", authenticateAdmin, (req, res) => {
    db.query("DELETE FROM branches WHERE id = ?", [req.params.id], (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true, message: "Branch deleted" });
    });
  });
  
  app.get("/tables", (req, res) => {
    const sql = `
   SELECT 
    tables.id, 
    tables.booked, 
    tables.table_name, 
    tables.table_type, 
    tables.branch_id, 
    tables.chairs_list,
    tables.price,
    branches.location AS branch_location
FROM tables
JOIN branches ON tables.branch_id = branches.id;
    `;
    db.query(sql, (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);

    });
  });



  app.get("/table/:id", (req, res) => {
    const { id } = req.params;

    // console.log("Fetching tables for branch_id:", id, "Type:", typeof id); // Log ID and type

    const query = "SELECT * FROM tables WHERE branch_id = ?";
    
    db.query(query, [parseInt(id)], (err, result) => { // Ensure ID is integer if needed
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database query failed", details: err });
        }

        // console.log("Executed Query:", query, "with ID:", id);
        // console.log("Query Result:", result);

        res.json(result);
    });
});


  
  
  app.get("/chairs", (req, res) => {
    db.query("SELECT * FROM chairs", (err, result) => {
      if (err) return res.status(500).send(err);
      res.json(result);
    });
  });
  



  app.post("/tables", authenticateAdmin, (req, res) => {
    const { branch_id, table_name, booked, table_type, chair_count, price } = req.body;

    if (!chair_count || chair_count < 1) {
        return res.status(400).json({ error: "Invalid chair count" });
    }

    // Insert Table
    const sql = "INSERT INTO tables (branch_id, table_name, booked, table_type, chair_count, price) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [branch_id, table_name, booked, table_type, chair_count, price], (err, result) => {
        if (err) return res.status(500).send(err);

        const table_id = result.insertId; // Get inserted table ID

        // Get the last chair number from DB
        const lastChairSql = "SELECT MAX(CAST(SUBSTRING_INDEX(chair_name, 'C', -1) AS UNSIGNED)) AS last_chair FROM chairs";
        db.query(lastChairSql, (err, chairResult) => {
            if (err) return res.status(500).send(err);

            let lastChairNumber = chairResult[0].last_chair ? parseInt(chairResult[0].last_chair) : 0;

            const chairInserts = [];
            for (let i = 1; i <= chair_count; i++) {
                lastChairNumber++; 
                chairInserts.push([table_id, `C${lastChairNumber}`]); 
            }


            const chairSql = "INSERT INTO chairs (table_id, chair_name) VALUES ?";
            db.query(chairSql, [chairInserts], (err) => {
                if (err) return res.status(500).send(err);
                res.json({ message: "Table and chairs added successfully" });
            });
        });
    });
});

  
  app.delete("/tables/:id", authenticateAdmin, (req, res) => {
    const tableId = req.params.id;
  
    db.query("DELETE FROM chairs WHERE table_id = ?", [tableId], (err) => {
      if (err) return res.status(500).send(err);
  
      db.query("DELETE FROM tables WHERE id = ?", [tableId], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Table and its chairs deleted" });
      });
    });
  });


  app.put("/tables/:id", authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const { table_name, booked } = req.body;
  
    db.query(
      "UPDATE tables SET table_name=?, booked=? WHERE id=?",
      [table_name, booked, id],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Table updated successfully" });
      }
    );
  });
  
 

  

  app.post("/bookings", authenticateToken, (req, res) => {
    const {
        user_id, hotel_id, table_id, date, time, email, phone, name, table_name,
        hotel_location, hotel_name, table_size, food_status, food_selection, total_price
    } = req.body;

    console.log("Body", req.body);

    if (!user_id || !hotel_id || !table_id || !date || !time) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const fullDateTime = `${time}:00`; // Time format for booking_time
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
    if (!/^\+\d{10,15}$/.test(formattedPhone)) {
        return res.status(400).json({ error: "Invalid phone number format" });
    }

    const guests = parseInt(table_size.split('_')[0]) || 2;

    const insertQuery = `
        INSERT INTO bookings 
        (user_id, branch_id, table_id, booking_date, booking_time, guests, name, phone, email, food_status, food_selection, total_amount) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const updateQuery = `UPDATE tables SET booked = 1 WHERE id = ?`;

    db.beginTransaction((err) => {
        if (err) {
            console.error("❌ Transaction Error:", err);
            return res.status(500).json({ error: "Transaction Error: " + err.message });
        }

        // Insert booking
        db.query(insertQuery, [user_id, hotel_id, table_id, date, fullDateTime, guests, name, formattedPhone, email, food_status, food_selection || null, total_price || 0.00], (err, result) => {
            if (err) {
                console.error("❌ Booking Insert Failed:", err);
                return db.rollback(() => {
                    res.status(500).json({ error: "Booking Failed: " + err.message });
                });
            }

            // Update table status
            db.query(updateQuery, [table_id], (err) => {
                if (err) {
                    console.error("❌ Table Update Failed:", err);
                    return db.rollback(() => {
                        res.status(500).json({ error: "Table Update Failed: " + err.message });
                    });
                }

                // Commit transaction
                db.commit((err) => {
                    if (err) {
                        console.error("❌ Commit Failed:", err);
                        return db.rollback(() => {
                            res.status(500).json({ error: "Commit Failed: " + err.message });
                        });
                    }

                    console.log("No", formattedPhone);
                    // Email and SMS notifications removed per user request

                    // **Format the Notification Messages**
                    const adminMessage = `New booking for Table ${table_name} in ${hotel_name} (${food_status})`;
                    const userMessage = `Your booking for Table ${table_name} at ${hotel_name} is confirmed!`;

                    // **Save Notification in the Database for Admin**
                    const notificationQuery = `INSERT INTO notifications (message) VALUES (?)`;
                    db.query(notificationQuery, [adminMessage], (err) => {
                        if (err) {
                            console.error("❌ Error saving admin notification:", err);
                        } else {
                            console.log("✅ Admin Notification saved to database");
                        }

                        // **Save Notification for User**
                        db.query("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, 'booking')", [user_id, userMessage], (err) => {
                            if (err) console.error("❌ Error saving user notification:", err);

                            // **Notify WebSocket Clients (Admin Dashboard)**
                            wss.clients.forEach((client) => {
                                if (client.readyState === WebSocket.OPEN) {
                                    client.send(JSON.stringify({ message: adminMessage }));
                                }
                            });

                            // ✅ **Final Response**
                            res.status(201).json({ success: true, message: "Booking successful! Notifications sent." });
                        });
                    });
                });
            });
        });
    });
});




app.get("/user_notifications/:userId", (req, res) => {
  const { userId } = req.params;
  const query = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC";
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch notifications" });
    }
    res.json(results);
  });
});

app.get("/notifications", authenticateAdmin, (req, res) => {
  // Admin notifications: only those without a specific user_id (broadcast/admin-level)
  const query = "SELECT * FROM notifications WHERE user_id IS NULL ORDER BY created_at DESC";
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch notifications" });
    }
    res.json(results);
  });
});

// API to delete a notification
app.delete("/notifications/:id", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM notifications WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Failed to delete notification" });
    }
    res.json({ success: true, message: "Notification deleted" });
  });
});



app.get("/my_bookings/:userId", authenticateToken, (req, res) => {
  const { userId } = req.params;
  const query = `
    SELECT b.id AS booking_id, b.user_id, b.booking_date, b.booking_time, b.table_id, b.food_selection, b.total_amount,
           h.name AS hotel_name, h.location, t.table_name 
    FROM bookings b
    JOIN branches h ON b.branch_id = h.id
    LEFT JOIN tables t ON b.table_id = t.id
    WHERE b.user_id = ?
    ORDER BY b.booking_date DESC, b.booking_time DESC`;

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});


app.delete("/cancel_booking/:bookingId", authenticateToken, (req, res) => {
  const { bookingId } = req.params;
  db.query("SELECT table_id, user_id, table_name FROM bookings b LEFT JOIN tables t ON b.table_id = t.id WHERE b.id = ?", [bookingId], (err, results) => {
    if (err || results.length === 0) return res.status(500).json({ error: "Booking not found" });
    const tableId = results[0].table_id;
    const userId = results[0].user_id;
    const tableName = results[0].table_name || "Unknown";
    
    db.query("DELETE FROM bookings WHERE id = ?", [bookingId], (err, result) => {
      if (err) return res.status(500).json({ error: "Error deleting booking" });
      
      if (tableId) {
        db.query("UPDATE tables SET booked = 0 WHERE id = ?", [tableId]);
      }

      if (userId) {
        const notifMsg = `Your booking for Table ${tableName} has been successfully cancelled.`;
        db.query("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, 'cancel')", [userId, notifMsg]);
      }

      res.json({ message: "History deleted successfully!" });
    });
  });
});




app.post('/create-coupon', authenticateAdmin, (req, res) => {
  const { user_id, coupon_code, discount, reason, expires_at } = req.body;

  const checkQuery = `SELECT * FROM coupons WHERE user_id = ?`;

  db.query(checkQuery, [user_id], (err, results) => {
    if (err) return res.status(500).send(err);

    if (results.length > 0) {
      return res.status(400).send('User already has an existing coupon!');
    }

    const query = `
      INSERT INTO coupons (user_id, coupon_code, discount, reason, expiry_date)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(query, [user_id, coupon_code, discount, reason, expires_at], (err) => {
      if (err) return res.status(500).send(err);
      res.send('Coupon created and sent successfully!');
    });
  });
});




const moment = require('moment');

app.post('/coupons/validate', (req, res) => {
    const { user_id, coupon_code } = req.body;
    console.log("Body", req.body);

    const couponQuery = `SELECT * FROM coupons WHERE coupon_code = ?`;
    db.query(couponQuery, [coupon_code], (err, results) => {
        if (err) {
            console.log("Error:", err.message);
            return res.status(500).send(err);
        }

        if (results.length === 0) return res.status(400).send('Invalid coupon.');

        const coupon = results[0];

        // Check if coupon is expired
        if (moment().isAfter(moment(coupon.expiry_date))) {
            console.log("Expired");
            return res.status(400).send('Coupon has expired.');
        }

        // Check if user has already used this coupon
        const usageQuery = `SELECT * FROM user_coupons WHERE user_id = ? AND coupon_code = ?`;
        db.query(usageQuery, [user_id, coupon_code], (err, usageResults) => {
            if (err) {
                console.log("Error:", err.message);
                return res.status(500).send(err);
            }

            if (usageResults.length > 0) return res.status(400).send('Coupon already used.');

            res.json({
                message: 'Coupon is valid!',
                discount: coupon.discount
            });
        });
    });
});


// Mark coupon as used
app.post('/coupons/use', authenticateToken, (req, res) => {
  const { user_id, coupon_code } = req.body;
  const query = `INSERT INTO user_coupons (user_id, coupon_code, used_at) VALUES (?, ?, NOW())`;

  db.query(query, [user_id, coupon_code], (err) => {
      if (err) return res.status(500).send(err);
      res.send('Coupon applied successfully!');
  });
});



app.get('/eligible-users', authenticateAdmin, (req, res) => {
  const query = `
      SELECT u.id, u.name, u.email, COUNT(b.user_id) AS booking_count
      FROM users u
      JOIN bookings b ON u.id = b.user_id
      GROUP BY u.id
      HAVING booking_count >= 5;
  `;

  db.query(query, (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
  });
});



app.post('/add-food', authenticateAdmin, upload.single('image'), (req, res) => {
  const { name, category, price, description, calories, proteins, fibers } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  const sql = 'INSERT INTO foods (name, category, price, description, calories, proteins, fibers, image ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [name, category, price, description, calories, proteins, fibers, image], (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to add food', details: err });
      res.status(201).json({ message: 'Food added successfully' });
  });
});

// 2️⃣ Get all foods
app.get('/get-foods', (req, res) => {
  const sql = 'SELECT * FROM foods';
  db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch foods', details: err });
      res.json(results);
  });
});


app.put('/update-food/:id', authenticateAdmin, (req, res) => {
  const { name, category, price, description, calories, proteins, fibers } = req.body;
  const { id } = req.params;

  console.log("Body", req.body);

  const query = 'UPDATE foods SET name = ?, category = ?, price = ?, description = ?, calories = ?, proteins = ?, fibers = ? WHERE id = ?';
  db.query(query, [name, category, price, description, calories, proteins, fibers, id], (err) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Failed to update food item' });
      }
      res.status(200).json({ message: 'Food item updated successfully' });
  });
});

// Delete food
app.delete('/delete-food/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM foods WHERE id = ?';
  db.query(query, [id], (err) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Failed to delete food item' });
      }
      res.status(200).json({ message: 'Food item deleted successfully' });
  });
});



app.get('/coupon/:code', async (req, res) => {
  const { code } = req.params;

  try {
      const [coupon] = await db.promise().query(
          'SELECT * FROM coupons WHERE coupon_code = ? AND expiry_date >= CURDATE()',
          [code]
      );

      if (coupon.length === 0) {
          return res.status(404).json({ message: 'Invalid or expired coupon' });
      }

      res.json(coupon[0]);
  } catch (error) {
      console.error('Error fetching coupon:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/coupons/:couponCode', authenticateAdmin, (req, res) => {
  const { couponCode } = req.params;

  const deleteQuery = 'DELETE FROM coupons WHERE coupon_code = ?';

  db.query(deleteQuery, [couponCode], (error, result) => {
      if (error) {
          console.error('❌ Error deleting coupon:', error);
          return res.status(500).send({ message: 'Failed to delete coupon' });
      }

      if (result.affectedRows === 0) {
          return res.status(404).send({ message: 'Coupon not found' });
      }

      res.status(200).send({ message: 'Coupon deleted successfully' });
  });
});




app.listen(5000, () => {
  console.log("Server running on port 5000");
});
