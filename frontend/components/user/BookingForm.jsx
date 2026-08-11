import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../src/config/api";
import { toast } from "react-toastify"; 
import { Modal, Button, Form , Table} from "react-bootstrap";
import { use } from "react";

const getLocalDateStr = (dateObj = new Date()) => {
  return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
};

const BookingForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    date: getLocalDateStr(),
    time: "",
    tableId: "",
    coupon: "",
  });
  
  const location = useLocation();
  const [selectedHotel, setSelectedHotel] = useState(location.state?.selectedHotel || null);
  const userId = localStorage.getItem('userId');
  const [tables, setTables] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [showTableModal, setShowTableModal] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  
  const [selectedTable, setSelectedTable] = useState({
    id: null,
    capacity: null,
    isAvailable: false,
    name: ""
  });
  // const [selectedFoods, setSelectedFoods] = useState([]);
  // const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showFoodModal, setShowFoodModal] = useState(false);
  
 
  const [foods, setFoods] = useState([]);
 


const [order, setOrder] = useState({
  starter: "",
  mainCourse: "",
  dessert: "",
  beverage: "",
  specialInstructions: ""
});



useEffect(() => {
    const fetchMenu = async () => {
        try {
            const response = await api.get("/get-foods");
            setFoods(response.data);
        } catch (error) {
            console.error("Failed to fetch menu:", error.message);
            toast.error("Failed to load menu options.");
        }
    };

    fetchMenu();
}, []);


const groupedFoods = foods.reduce((acc, food) => {
  if (!acc[food.category]) acc[food.category] = [];
  acc[food.category].push(food);
  return acc;
}, {});

const selectedMainCourse = groupedFoods["Main Course"]?.find(food => food.name === order.mainCourse);


const handleOrderChange = (e) => {
  const { name, value } = e.target;
  setOrder({ ...order, [name]: value });
};

  // Fetch the default hotel (Stay & Dine) if not passed via navigation state
  useEffect(() => {
    if (!selectedHotel) {
      api.get("/branches")
        .then(res => {
          if (res.data && res.data.length > 0) {
            setSelectedHotel(res.data[0]);
          }
        })
        .catch(err => console.error("Failed to fetch default hotel", err));
    }
  }, [selectedHotel]);

  useEffect(() => {
    let intervalId;
    if (selectedHotel && selectedHotel.id) {
      const fetchTables = () => {
        api.get(`/table/${selectedHotel.id}`)
          .then(response => {
            if (response.data && Array.isArray(response.data)) {
              // Transform API data to the format needed for the table layout
              const formattedTables = response.data.map((table, index) => ({
                id: table.id,
                name: table.table_name || `Table ${index + 1}`,
                capacity: getCapacityFromType(table.table_type),
                shape: getShapeFromType(table.table_type),
                position: getTablePosition(index), // Position tables in a grid
                isAvailable: table.booked === 0,
                price: table.price
              }));
              
              setTables(formattedTables);
            } else {
              console.error("Invalid table data format", response.data);
            }
          })
          .catch(error => {
            console.error("Error fetching tables:", error);
          });
      };
      
      fetchTables(); // Initial fetch
      intervalId = setInterval(fetchTables, 3000); // Poll every 3 seconds
    } else {
      console.error("No hotel selected or invalid hotel ID");
    }
    return () => clearInterval(intervalId);
  }, [selectedHotel]);

  // Helper function to determine capacity from table_type
  const getCapacityFromType = (tableType) => {
    if (!tableType) return 4;
    if (tableType.includes("10")) return 10;
    if (tableType.includes("8")) return 8;
    if (tableType.includes("4")) return 4;
    if (tableType.includes("2")) return 2;
    return 4;
  };

  // Helper function to determine shape from table_type
  const getShapeFromType = (tableType) => {
    if (!tableType) return "round";
    if (tableType.includes("10") || tableType.includes("8")) return "square";
    return "round";
  };

  // Helper function to position tables in a grid layout
  const getTablePosition = (index) => {
    const tablesPerRow = 3;
    const horizontalSpacing = 200;
    const verticalSpacing = 180;
    
    const row = Math.floor(index / tablesPerRow);
    const col = index % tablesPerRow;
    
    return {
      top: 50 + row * verticalSpacing,
      left: 50 + col * horizontalSpacing
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [e.target.name]: e.target.value });
    setOrder({ ...order, [name]: value });
  };

  const getSelectedFoodDetails = () => {
    const selectedFoods = [];

    if (order.starter) {
        const starter = groupedFoods.Starters.find(food => food.name === order.starter);
        if (starter) selectedFoods.push(starter);
    }

    if (order.mainCourse) {
        const mainCourse = groupedFoods["Main Course"].find(food => food.name === order.mainCourse);
        if (mainCourse) selectedFoods.push(mainCourse);
    }

    if (order.dessert) {
        const dessert = groupedFoods.Desserts.find(food => food.name === order.dessert);
        if (dessert) selectedFoods.push(dessert);
    }

    if (order.beverage) {
        const beverage = groupedFoods.Beverages.find(food => food.name === order.beverage);
        if (beverage) selectedFoods.push(beverage);
    }

    return selectedFoods;
};


  const handleTableClick = (table) => {
    if (table.isAvailable) {
      setSelectedTable({
        id: table.id,
        capacity: table.capacity,
        isAvailable: true,
        name: table.name, 
        price: table.price
      });
      
      // Update the form data
      setFormData({
        ...formData,
        tableId: table.id
      });
    } else {
      setSelectedTable({
        id: table.id,
        capacity: table.capacity,
        isAvailable: false,
        name: table.name
      });
    }
  };

  const confirmTableSelection = () => {
    if (selectedTable.isAvailable) {
      setShowTableModal(false);
    } else {
      toast.error("Please select an available table!");
    }
  };


  const handleBookingSubmit = async (event) => {
    event.preventDefault();

    if (!userId) {
        toast.error("You must be logged in to book a table!");
        return;
    }

    if (!formData.name || !formData.phone || !formData.email || !formData.date || !formData.time || !formData.tableId) {
        Swal.fire({
            title: "Error!",
            text: "Please fill in all required fields.",
            icon: "error",
            confirmButtonText: "OK"
        });
        return;
    }

    const selectedTableData = tables.find(table => table.id === parseInt(formData.tableId));

    if (!selectedTableData) {
        Swal.fire({
            title: "Error!",
            text: "Please select a valid table.",
            icon: "error",
            confirmButtonText: "OK"
        });
        return;
    }

    // If coupon is provided, validate it
    let discount = 0;
    let validatedCoupon = null;

    if (formData.coupon) {
        try {
            const couponResponse = await api.post("/coupons/validate", {
                user_id: userId,
                coupon_code: formData.coupon
            });

            validatedCoupon = couponResponse.data;
            discount = validatedCoupon.discount;

            Swal.fire({
                title: "Coupon Applied!",
                text: `${couponResponse.data.message} Discount: ${couponResponse.data.discount}%`,
                icon: "success",
                confirmButtonText: "OK"
            });

        } catch (error) {
            console.error("Coupon validation error:", error.response?.data || error.message);
            Swal.fire({
                title: "Invalid Coupon!",
                text: error.response?.data || "Failed to validate coupon.",
                icon: "error",
                confirmButtonText: "OK"
            });
            return; // Stop booking if coupon is invalid
        }
    }

    const bookingData = {
        user_id: userId,
        hotel_id: selectedHotel.id,
        table_id: formData.tableId,
        phone: formData.phone,
        email: formData.email,
        name: formData.name,
        date: formData.date,
        time: formData.time,
        table_name: selectedTableData.name,
        hotel_name: selectedHotel.name,
        hotel_location: selectedHotel.location,
        table_size: `${selectedTableData.capacity}_pair`,
        coupon: validatedCoupon ? formData.coupon : null,
        discount, // percentage discount from validated coupon
        price: selectedTable.price
    };

    console.log("Booking Data:", bookingData);
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData));

    // Open food selection modal
    setShowFoodModal(true);
};


// const handleConfirmFood = async () => {
//   const bookingData = {
//       user_id: userId,
//       hotel_id: selectedHotel.id,
//       table_id: formData.tableId,
//       phone: formData.phone,
//       email: formData.email,
//       name: formData.name,
//       date: formData.date,
//       time: formData.time,
//       table_name: selectedTable.name,
//       hotel_name: selectedHotel.name,
//       hotel_location: selectedHotel.location,
//       table_size: `${selectedTable.capacity}_pair`,
//       coupon: formData.coupon,
//       food_selection: order
//   };

//   try {
//       await api.post("/bookings", bookingData);
//       Swal.fire({
//           title: "Booking Confirmed!",
//           text: `Table booked for ${formData.date} at ${formData.time}.`,
//           icon: "success",
//           confirmButtonText: "OK"
//       });

//       setFormData({
//           name: "",
//           phone: "",
//           email: "",
//           date: "",
//           time: "",
//           tableId: "",
//           coupon: ""
//       });

//       setOrder({
//           appetizers: "",
//           mainCourse: "",
//           drinks: "",
//           specialInstructions: ""
//       });

//       setShowFoodModal(false);
//   } catch (error) {
//       Swal.fire({
//           title: "Booking Failed!",
//           text: "Something went wrong.",
//           icon: "error",
//           confirmButtonText: "OK"
//       });
//   }
// };





const handleConfirmFood = () => {
  const tableId = selectedTable.id;
  const tablePrice = selectedTable.price;
  const chairCount = selectedTable.capacity;
  

  const selectedFoods = getSelectedFoodDetails();

 

  const queryParams = new URLSearchParams({
      tableId,
      tablePrice,
      chairCount,
      foodCategories: JSON.stringify(selectedFoods), // Array of selected foods
      coupon: JSON.stringify(appliedCoupon) // Coupon from DB
    });

  window.location.href = `/order-summary?${queryParams.toString()}`;
};


const handleSkipFood = () => {
  const tableId = selectedTable.id;
  const tablePrice = selectedTable.price;
  const chairCount = selectedTable.capacity || 0;

  const queryParams = new URLSearchParams({
      tableId,
      tablePrice,
      chairCount,
      foodCategories: JSON.stringify([]), // Empty food selection
      coupon: null
  });

  window.location.href = `/order-summary?${queryParams.toString()}`;
};




  // const handleBookingSubmit = (event) => {
  //   event.preventDefault();

  //   if (!userId) {
  //     toast.error("You must be logged in to book a table!");   
  //     return;
  //   }

  //   if (!formData.name || !formData.phone || !formData.email || !formData.date || !formData.time || !formData.tableId) {
  //     Swal.fire({ title: "Error!", text: "Please fill in all required fields.", icon: "error", confirmButtonText: "OK" });
  //     return;
  //   }

  //   const selectedTableData = tables.find(table => table.id === parseInt(formData.tableId));
    
  //   if (!selectedTableData) {
  //     Swal.fire({ title: "Error!", text: "Please select a valid table.", icon: "error", confirmButtonText: "OK" });
  //     return;
  //   }
    
  //   const bookingData = {
  //     user_id: userId,
  //     hotel_id: selectedHotel.id,
  //     table_id: formData.tableId,
  //     phone: formData.phone,
  //     email: formData.email,
  //     name: formData.name,
  //     date: formData.date,
  //     time: formData.time,
  //     table_name: selectedTableData.name,
  //     hotel_name: selectedHotel.name,
  //     hotel_location: selectedHotel.location,
  //     table_size: `${selectedTableData.capacity}_pair`,
  //     coupon: formdata.coupon,
  //     total_price: selectedTableData.price
  //   }; 

    



  //   axios
  //     .post("http://localhost:5000/bookings", bookingData)
  //     .then((response) => {
  //       Swal.fire({
  //         title: "Booking Confirmed!",
  //         text: `Table booked for ${formData.date} at ${formData.time}.`,
  //         icon: "success",
  //         confirmButtonText: "OK",
  //       });

  //       setFormData({
  //         name: "",
  //         phone: "",
  //         email: "",
  //         date: "",
  //         time: "",
  //         tableId: "",
  //         coupon:""
  //       });
  //       setSelectedTable({
  //         id: null,
  //         capacity: null,
  //         isAvailable: false,
  //         name: ""
  //       });
  //     })
  //     .catch((error) => {
  //       console.error("Error submitting booking:", error);
  //       Swal.fire({ title: "Booking Failed!", text: "Something went wrong.", icon: "error", confirmButtonText: "OK" });
  //     });
  // };

  // Generate chair numbers based on table shape

  const renderChairNumbers = (shape, capacity) => {
    const chairs = [];
    
    for (let i = 1; i <= capacity; i++) {
      chairs.push(
        <span 
          key={i} 
          className="chair-2d"
          style={{
            ...(shape === 'square' 
              ? getSquareTableChairPosition(i, capacity) 
              : getRoundTableChairPosition(i, capacity))
          }}
        >
          {i}
        </span>
      );
    }
    
    return chairs;
  };
  
  // Square table chair positions
  const getSquareTableChairPosition = (index, capacity) => {
    if (capacity === 10) {
      switch(index) {
        case 1: return { top: '-30px', left: '-8px' }; 
        case 2: return { top: '-30px', left: '29px' }; 
        case 3: return { top: '-30px', left: '66px' }; 
        case 4: return { top: '8px', right: '-32px' }; 
        case 5: return { top: '50px', right: '-32px' }; 
        case 6: return { bottom: '-30px', right: '-8px' }; 
        case 7: return { bottom: '-30px', right: '29px' }; 
        case 8: return { bottom: '-30px', right: '66px' }; 
        case 9: return { top: '50px', left: '-32px' }; 
        case 10: return { top: '8px', left: '-32px' }; 
        default: return {};
      }
    } else if (capacity === 8) {
      switch(index) {
        case 1: return { top: '-30px', left: '8px' }; // Top left 
        case 2: return { top: '-30px', left: '50px' }; // Top right
        case 3: return { top: '8px', right: '-32px' }; // Right top
        case 4: return { top: '50px', right: '-32px' }; // Right bottom
        case 5: return { bottom: '-30px', right: '8px' }; // Bottom right
        case 6: return { bottom: '-30px', right: '50px' }; // Bottom left
        case 7: return { top: '50px', left: '-32px' }; // Left bottom
        case 8: return { top: '8px', left: '-32px' }; // Left top
        default: return {};
      }
    } else {
      switch(index) {
        case 1: return { top: '-30px', left: '8px' }; // Top left 
        case 2: return { top: '-30px', left: '50px' }; // Top right
        case 3: return { top: '29px', right: '-32px' }; // Right middle
        case 4: return { bottom: '-30px', right: '8px' }; // Bottom right
        case 5: return { bottom: '-30px', right: '50px' }; // Bottom left
        case 6: return { top: '29px', left: '-32px' }; // Left middle
        case 7: return { top: '50px', left: '-32px' }; 
        case 8: return { top: '8px', left: '-32px' }; 
        default: return {};
      }
    }
  };
  
  // Round table chair positions
  const getRoundTableChairPosition = (index, capacity) => {
    if (capacity === 2) {
      switch(index) {
        case 1: return { top: '-28px', left: '28px' }; // Top
        case 2: return { bottom: '-28px', left: '28px' }; // Bottom
        default: return {};
      }
    } else if (capacity === 4) {
      switch(index) {
        case 1: return { top: '-28px', left: '28px' }; // Top
        case 2: return { top: '28px', right: '-25px' }; // Right
        case 3: return { bottom: '-28px', left: '28px' }; // Bottom
        case 4: return { top: '28px', left: '-25px' }; // Left
        default: return {};
      }
    } else {
      switch(index) {
        case 1: return { top: '-28px', left: '28px' }; // Top
        case 2: return { top: '8px', right: '-25px' }; // Upper right
        case 3: return { top: '48px', right: '-25px' }; // Lower right
        case 4: return { bottom: '-28px', left: '28px' }; // Bottom
        case 5: return { top: '48px', left: '-25px' }; // Lower left
        case 6: return { top: '8px', left: '-25px' }; // Upper left
        default: return {};
      }
    }
  };

  const customStyles = `
    .custom-orange-card {
      border: none;
      border-top: 4px solid #ea580c;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(234, 88, 12, 0.15) !important;
      background: linear-gradient(to bottom, #ffffff, #fff7ed);
    }
    .custom-orange-card h4 {
      color: #ea580c;
    }
    .custom-orange-card label {
      color: #9a3412;
      font-weight: 600;
    }
    .custom-orange-card .form-control, .custom-orange-card .form-select {
      border: 1px solid #fed7aa;
      border-radius: 8px;
      background-color: #ffffff;
    }
    .custom-orange-card .form-control:focus, .custom-orange-card .form-select:focus {
      border-color: #ea580c;
      box-shadow: 0 0 0 0.25rem rgba(234, 88, 12, 0.25);
    }
    .btn-orange {
      background: linear-gradient(135deg, #f97316, #ea580c);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      padding: 12px;
      box-shadow: 0 4px 14px rgba(234, 88, 12, 0.3);
      transition: all 0.3s ease;
    }
    .btn-orange:hover {
      background: linear-gradient(135deg, #ea580c, #c2410c);
      color: white;
      transform: translateY(-2px);
    }
    .btn-outline-orange {
      color: #ea580c;
      border: 2px solid #ea580c;
      border-radius: 8px;
      background: transparent;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    .btn-outline-orange:hover {
      background: #ea580c;
      color: white;
    }
  `;

  return (
    <div className="container mt-4">
      <style>{customStyles}</style>
      <div className="row">
        {/* Booking Form - 2/3 of Page */}
        <div className="col-md-8">
          <form onSubmit={handleBookingSubmit} className="card p-4 custom-orange-card">
            <h4 className="fw-bold mb-4">Table Reservation</h4>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Phone Number</label>
                <input type="tel" className="form-control" name="phone" value={formData.phone} onChange={handleChange} required />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Date</label>
                <div style={{ position: 'relative' }}>
                  <div
                    className="form-control"
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    onClick={() => setShowCalendar(!showCalendar)}
                  >
                    <span style={{ color: formData.date ? '#1f2937' : '#9ca3af' }}>
                      {formData.date
                        ? new Date(formData.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
                        : 'Select a date'}
                    </span>
                    <span style={{ color: '#ea580c', fontSize: '1.1rem' }}>📅</span>
                  </div>
                  {showCalendar && (() => {
                    const today = new Date(); today.setHours(0,0,0,0);
                    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
                    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                    const dayNames = ['Su','Mo','Tu','We','Th','Fr','Sa'];
                    const cells = [];
                    for (let i = 0; i < firstDay; i++) cells.push(null);
                    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
                    const canGoPrev = calendarYear > today.getFullYear() || (calendarYear === today.getFullYear() && calendarMonth > today.getMonth());
                    return (
                      <div style={{
                        position: 'absolute', top: '100%', left: 0, zIndex: 1000, marginTop: '6px',
                        background: '#fff', borderRadius: '14px', boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                        border: '1px solid #fed7aa', padding: '16px', width: '300px', fontFamily: 'Inter, sans-serif'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                          <button type="button" onClick={() => { if (canGoPrev) { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); } else setCalendarMonth(m => m - 1); } }}
                            style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: canGoPrev ? 'pointer' : 'not-allowed', color: canGoPrev ? '#ea580c' : '#d1d5db', padding: '4px 8px', borderRadius: '6px' }}>◀</button>
                          <span style={{ fontWeight: 700, color: '#1f2937', fontSize: '0.95rem' }}>{monthNames[calendarMonth]} {calendarYear}</span>
                          <button type="button" onClick={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); } else setCalendarMonth(m => m + 1); }}
                            style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#ea580c', padding: '4px 8px', borderRadius: '6px' }}>▶</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
                          {dayNames.map(d => <div key={d} style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', padding: '4px 0' }}>{d}</div>)}
                          {cells.map((day, i) => {
                            if (!day) return <div key={`e-${i}`} />;
                            const dateObj = new Date(calendarYear, calendarMonth, day); dateObj.setHours(0,0,0,0);
                            const isPast = dateObj < today;
                            const dateStr = `${calendarYear}-${String(calendarMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                            const isSelected = formData.date === dateStr;
                            const isToday = dateObj.getTime() === today.getTime();
                            return (
                              <div key={day}
                                onClick={() => { if (!isPast) { setFormData(prev => ({ ...prev, date: dateStr })); setShowCalendar(false); } }}
                                style={{
                                  padding: '7px 0', borderRadius: '8px', fontSize: '0.85rem', fontWeight: isSelected ? 800 : 500,
                                  cursor: isPast ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
                                  background: isSelected ? 'linear-gradient(135deg, #f97316, #ea580c)' : isToday ? '#fff7ed' : 'transparent',
                                  color: isPast ? '#d1d5db' : isSelected ? '#fff' : isToday ? '#ea580c' : '#374151',
                                  border: isToday && !isSelected ? '1.5px solid #fb923c' : '1.5px solid transparent',
                                }}
                              >{day}</div>
                            );
                          })}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                          <button type="button" onClick={() => { setFormData(prev => ({ ...prev, date: '' })); }} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>Clear</button>
                          <button type="button" onClick={() => { const t = new Date(); setFormData(prev => ({ ...prev, date: getLocalDateStr(t) })); setCalendarMonth(t.getMonth()); setCalendarYear(t.getFullYear()); setShowCalendar(false); }} style={{ background: 'none', border: 'none', color: '#ea580c', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 700 }}>Today</button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <input type="hidden" name="date" value={formData.date} required />
              </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Time</label>
                  <select className="form-select form-control" name="time" value={formData.time} onChange={handleChange} required>
                    <option value="">Select Time</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="12:30">12:30 PM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="13:30">01:30 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="14:30">02:30 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="15:30">03:30 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="16:30">04:30 PM</option>
                    <option value="17:00">05:00 PM</option>
                    <option value="17:30">05:30 PM</option>
                    <option value="18:00">06:00 PM</option>
                    <option value="18:30">06:30 PM</option>
                    <option value="19:00">07:00 PM</option>
                    <option value="19:30">07:30 PM</option>
                    <option value="20:00">08:00 PM</option>
                    <option value="20:30">08:30 PM</option>
                    <option value="21:00">09:00 PM</option>
                    <option value="21:30">09:30 PM</option>
                    <option value="22:00">10:00 PM</option>
                    <option value="22:30">10:30 PM</option>
                    <option value="23:00">11:00 PM</option>
                  </select>
                </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Select Table</label>
                <div className="d-flex">
                  <button 
                    type="button" 
                    className="btn btn-outline-orange w-100"
                    onClick={() => setShowTableModal(true)}
                  >
                    {formData.tableId 
                      ? `Selected: ${tables.find(t => t.id === parseInt(formData.tableId))?.name || 'Table'} (${tables.find(t => t.id === parseInt(formData.tableId))?.capacity} chairs)` 
                      : tables.length === 0 
                        ? "No Tables are available or all are booked" 
                        : "Click to select tables"}
                  </button>
                </div>
              </div>              
            </div>
            <div className="row">
            <div className="col-md-6 mb-3">
                <label className="form-label">Coupon (If applicable)</label>
                <input type="text" className="form-control" name="coupon" value={formData.coupon} onChange={handleChange}/>
              </div>
                      
            </div>
            <button type="submit" className="btn btn-orange w-100 mt-2">Book Now</button>


          </form>

          <Modal show={showFoodModal} onHide={() => setShowFoodModal(false)}>
    <Modal.Header closeButton>
        <Modal.Title>🍽️ Customize Your Order</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        <Form>
            {/* Starter Selection */}
            <Form.Group className="mb-3">
                <Form.Label>🥢 Starter</Form.Label>
                <Form.Select name="starter" value={order.starter} onChange={handleChange}>
                    <option value="">Select a starter</option>
                    {groupedFoods.Starters?.map((food) => (
                        <option key={food.id} value={food.name}>
                            {food.name} - ₹{food.price}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            {/* Main Course Selection */}
            <Form.Group className="mb-3">
                <Form.Label>🍽️ Main Course</Form.Label>
                <Form.Select name="mainCourse" value={order.mainCourse} onChange={handleChange}>
                    <option value="">Select a main course</option>
                    {groupedFoods["Main Course"]?.map((food) => (
                        <option key={food.id} value={food.name}>
                            {food.name} - ₹{food.price}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            {/* Nutritional Details Table (Only Visible if a Main Course is Selected) */}
            {order.mainCourse && selectedMainCourse && (
                <div className="mt-3">
                    <h6>📊 Nutritional Information</h6>
                    <Table striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th>Nutrient</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Calories</td>
                                <td>{selectedMainCourse.calories || "N/A"} kcal</td>
                            </tr>
                            <tr>
                                <td>Proteins</td>
                                <td>{selectedMainCourse.proteins || "N/A"} g</td>
                            </tr>
                            <tr>
                                <td>Fibers</td>
                                <td>{selectedMainCourse.fibers || "N/A"} g</td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            )}

            {/* Dessert Selection */}
            <Form.Group className="mb-3">
                <Form.Label>🍰 Dessert</Form.Label>
                <Form.Select name="dessert" value={order.dessert} onChange={handleChange}>
                    <option value="">Select a dessert</option>
                    {groupedFoods.Desserts?.map((food) => (
                        <option key={food.id} value={food.name}>
                            {food.name} - ₹{food.price}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            {/* Beverage Selection */}
            <Form.Group className="mb-3">
                <Form.Label>🥤 Beverage</Form.Label>
                <Form.Select name="beverage" value={order.beverage} onChange={handleChange}>
                    <option value="">Select a beverage</option>
                    {groupedFoods.Beverages?.map((food) => (
                        <option key={food.id} value={food.name}>
                            {food.name} - ₹{food.price}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            {/* Special Instructions */}
            <Form.Group className="mb-3">
                <Form.Label>📝 Special Instructions</Form.Label>
                <Form.Control
                    as="textarea"
                    name="specialInstructions"
                    value={order.specialInstructions}
                    onChange={handleChange}
                    placeholder="E.g. Less spicy, no onions"
                />
            </Form.Group>
        </Form>
    </Modal.Body>

    <Modal.Footer>
        <Button variant="secondary" onClick={handleSkipFood}>
            Skip Food Selection
        </Button>
        <Button variant="success" onClick={handleConfirmFood}>
            Confirm Order & Book Table
        </Button>
    </Modal.Footer>
</Modal>

        </div>

        {/* Carousel Section - 1/3 of Page */}
        <div className="col-md-4">
          <div id="carouselExampleIndicators" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-indicators">
              <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" className="active"></button>
              <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1"></button>
              <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2"></button>
            </div>
              <div className="carousel-inner rounded">
                <div className="carousel-item active">
                  <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800" className="d-block w-100 rounded" style={{ objectFit: 'cover', height: '100%' }} alt="Restaurant Dining Area" />
                </div>
              </div>
          </div>
        </div>
      </div>

      {/* Table Selection Modal */}
      {showTableModal && (
        <div className="modal-backdrop fade show" style={{ opacity: 0.5 }}></div>
      )}
      
      <div className={`modal fade ${showTableModal ? 'show' : ''}`} 
           style={{ display: showTableModal ? 'block' : 'none' }}
           tabIndex="-1" 
           role="dialog" 
           aria-labelledby="tableModalLabel" 
           aria-hidden="true">
        <div className="modal-dialog" style={{ maxWidth: '800px' }}>
          <div className="modal-content" style={{ minHeight: '520px' }}>
            <div className="modal-header" style={{ borderBottom: 'none', padding: '24px 24px 0' }}>
              <h5 className="modal-title" id="tableModalLabel" style={{ fontWeight: 800, fontSize: '1.4rem', color: '#0f172a' }}>🗺️ Table selection</h5>
              <button 
                type="button" 
                className="close" 
                onClick={() => setShowTableModal(false)}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body" style={{ overflow: 'visible', padding: '24px' }}>
              <div className="mb-4 d-flex justify-content-center">
                <div className="d-flex align-items-center bg-white px-4 py-2 rounded-pill shadow-sm" style={{ gap: '20px' }}>
                  <div className="d-flex align-items-center">
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 8px #22c55e', marginRight: '8px' }}></span>
                    <span style={{ fontWeight: 600, color: '#334155' }}>Available</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', marginRight: '8px' }}></span>
                    <span style={{ fontWeight: 600, color: '#334155' }}>Booked</span>
                  </div>
                </div>
              </div>
              
              <div 
                className="restaurant-container floor-plan-container" 
                style={{
                  width: '750px',
                  height: '550px',
                  position: 'relative',
                  margin: '0 auto'
                }}
              >
                {tables.length > 0 ? (
                  tables.map((table) => (
                    <div 
                      key={table.id}
                      className={`table-2d table-2d-${table.shape} ${table.shape} ${table.isAvailable ? 'table-available' : 'table-booked'}`}
                      onClick={() => handleTableClick(table)}
                      style={{
                        top: `${table.position.top}px`,
                        left: `${table.position.left}px`,
                        width: '90px',
                        height: '90px',
                        /* Change selection ring to bright contrasting blue */
                        boxShadow: selectedTable.id === table.id ? '0 0 0 4px #2563eb, 0 15px 25px rgba(0,0,0,0.3)' : undefined
                      }}
                    >
                      <span style={{ zIndex: 10 }}>{table.name}</span>
                      {renderChairNumbers(table.shape, table.capacity)}
                    </div>
                    
                  ))
                ) : (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <p className="text-center">No tables available for this restaurant</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <div className="container-fluid">
                <div className="row">
                  <div className="col-md-6">
                    <div id="selectedTableInfo" style={{ fontWeight: 'bold', marginTop: '10px' }}>
                      Selected table: {' '}
                      <span>
                        {selectedTable.id 
                          ? (selectedTable.isAvailable 
                              ? `${selectedTable.name} (Capacity: ${selectedTable.capacity}) (Price: ${selectedTable.price})` 
                              : `Table ${selectedTable.name} is already booked`) 
                          : 'None'}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6 text-right d-flex gap-3">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowTableModal(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      disabled={!selectedTable.isAvailable}
                      onClick={confirmTableSelection}
                    >
                      Confirm Selection
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
