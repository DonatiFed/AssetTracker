# AssetTracker  

A web-based asset tracking application built with Django, React, and Docker.  

##  Table of Contents  
- [Overview](#overview)  
- [Features](#features)  
- [User Roles & Permissions](#user-roles--permissions)  
- [Tech Stack](#tech-stack)  
- [Deployment](#deployment)  
- [Live Demo](#live-demo)    
- [Installation & Setup](#installation--setup) 
 

---

##  Overview  
**AssetTracker** is a web application designed to help users efficiently track and manage assets.  
- The backend is built with **Django + Django REST Framework**.  
- The frontend is a **React App** with a modern UI.  
- The system includes **user authentication with login and role management (Manager and User)**.  
- Initially built with PostgreSQL, it now uses a **managed database on Render**.    

---

## Features  
- **Login & Registration** with secure authentication  
- **Two user roles:** Manager and User  
- **Asset management** (create, edit, delete)  
- **Custom dashboard** based on user role  
- **Advanced search & filtering**  
- **Public REST API for integrations**  
- **Modern and responsive UI**
   
---
## 🔑 User Roles & Permissions  

| Role    | Main Permissions |
|---------|-----------------|
| **Manager** |  Can create, edit, and delete assets - Can view all assets - Has access to an advanced dashboard with statistics |
| **User** | - Can only view assigned assets and acquire them - Has access to a simplified dashboard |

Each role has a **dedicated interface** with different features for an optimized user experience.  

---

##  Tech Stack  

### **Backend**  
- Python (Django & Django REST Framework)  
- PostgreSQL *(local development, now using a managed DB)*  
- Docker *(for containerized deployment)*  

### **Frontend**  
- React.js  
- CSS  

## **Deployment**  
- Render *(for hosting the backend & frontend)*  

---

##  Live Demo  
  [Live Demo URL](#) *https://assettracker-frontend.onrender.com/*  

---

## Installation & Setup  

### **Prerequisites**  
- Python 3.x  
- Node.js & npm  
- Docker *(optional: if running in a containerized environment)*  

### **Backend Setup**  
1. Clone the repository:  
   ```bash
   git clone https://github.com/yourusername/AssetTracker.git
   cd AssetTracker/backend

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv  
   source venv/bin/activate  # On Windows use `venv\Scripts\activate
   
4. Install dependencies:
   ```bash
   pip install -r requirements.txt

5. Apply migrations and start the server:
   ```bash
   python manage.py migrate  
   python manage.py runserver 

### **Frontend Setup**  
1. Navigate to the frontend repository:
   ```bash
   cd ../frontend

3. Install dependencies:
   ```bash
   npm install

5. Start the React development server:
   ```bash
   npm start  





