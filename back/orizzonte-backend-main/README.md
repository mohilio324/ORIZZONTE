# 🚀 Orizzonte Backend API

## 📌 Overview

This project is a **Django REST API** that provides:

* 🔐 Authentication (JWT)
* 👥 Role-Based Access Control (RBAC)
* 👑 Boss / 👨‍💼 Employee / 👤 Client system

The API is designed to be used by a frontend (React / Flutter / etc.).

---

## ⚙️ Tech Stack

* Django
* Django REST Framework
* JWT Authentication (SimpleJWT)
* SQLite (dev)

---

## 🔐 Authentication Flow

### 1. Login

```http
POST /api/token/
```

**Body:**

```json
{
  "username": "your_username",
  "password": "your_password"
}
```

**Response:**

```json
{
  "id": 1,
  "username": "user",
  "email": "user@test.com",
  "role": "boss",
  "access": "JWT_ACCESS_TOKEN",
  "refresh": "JWT_REFRESH_TOKEN"
}
```

---

### 2. Use Token

Add this header to protected requests:

```
Authorization: Bearer ACCESS_TOKEN
```

---

### 3. Refresh Token

```http
POST /api/token/refresh/
```

```json
{
  "refresh": "REFRESH_TOKEN"
}
```

---

### 4. Logout

```http
POST /api/logout/
```

```json
{
  "refresh": "REFRESH_TOKEN"
}
```

---

## 👥 Roles

| Role     | Permissions                    |
| -------- | ------------------------------ |
| Boss     | Full access (manage employees) |
| Employee | Limited access                 |
| Client   | Basic access                   |

---

## 📡 API Endpoints

---

### 🔓 Public

#### Signup (Client only)

```http
POST /api/signup/
```

```json
{
  "username": "client1",
  "email": "client@test.com",
  "password": "test123456"
}
```

---

### 🔐 Authenticated

#### Get Current User

```http
GET /api/users/me/
```

**Response:**

```json
{
  "id": 1,
  "username": "user",
  "email": "user@test.com",
  "role": "client",
  "date_joined": "..."
}
```

---

## 👑 Boss Only Endpoints

mn9drch npuchi data base , tsema bh tkhdem boss wla admin account :
Create boss account manually:

1. python manage.py createsuperuser   

2. Go to admin panel   

3. Set role = Boss         

 // ida mfhmtch roh l chat chof kifeh dir run ll projet mb3d mdlo hed les ettapes li rani ketebhm y3tik les commandes exate li ts7a9hm bh tkhdm admin .

 }  

### Create Employee

```http
POST /api/users/employees/
```

```json
{
  "username": "emp1",
  "password": "test123456",
  "email": "emp@test.com"
}
```

---

### List Employees

```http
GET /api/users/employees/
```

---

### Get Employee Details

```http
GET /api/users/employees/<id>/
```

---

### Delete Employee

```http
DELETE /api/users/employees/<id>/
```

---

## 🚨 Security Rules

* ❌ Clients cannot access employee endpoints
* ❌ Employees cannot manage other employees
* ✔ Only Boss can manage employees
* ✔ Roles are assigned by backend (cannot be faked)

---

## 🧪 Testing

Recommended tool: **Postman**

### Test Flow:

1. Signup (client)
2. Login
3. Copy access token
4. Test `/me`
5. Test employee endpoints
6. Logout

---

## ⚠️ Common Errors

| Error            | Meaning                  |
| ---------------- | ------------------------ |
| 401 Unauthorized | Missing or invalid token |
| 403 Forbidden    | Not allowed (wrong role) |
| 400 Bad Request  | Invalid data             |

---

## 🧠 Notes for Frontend Developers

* Always store:

  * `access`
  * `refresh`
  * `role`
* Use `role` for routing (dashboard)
* Refresh token when access expires
* Handle 401 by redirecting to login

---

## 🏁 Status

✔ Authentication implemented
✔ Role-based access control working
✔ Employee management complete
✔ API tested and stable

---

## 👨‍💻 Author

Backend developed for Orizzonte project.
