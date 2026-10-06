# BizBooks – Small-Business Invoicing & Expense Workspace

BizBooks is a full-stack web application designed for small businesses to manage customers, invoices, invoice items, expenses, payments, reports, authentication, and currency exchange rates.

## Features

### Authentication & Roles
- User registration and login
- JWT-based authentication
- Role-based access control
- Supported roles:
  - OWNER
  - ACCOUNTANT
  - CUSTOMER
- BCrypt password hashing

### Customer Management
- Create customers
- View customers
- Update customers
- Delete customers
- Customer accounts can be linked with customer records

### Invoice Management
- Create invoices
- Add invoice items
- Calculate item amount using quantity × unit price
- Backend calculates invoice subtotal and total
- Invoice statuses:
  - DRAFT
  - ISSUED
  - PAID
  - OVERDUE
- Due-date based overdue handling
- View invoice details and invoice items
- Customers can view only their own invoices

### Expense Management
- Add expenses
- View expenses
- Track expense amount, category and date
- Expense data is stored persistently in MySQL

### Payment Workflow
- Mock payment workflow
- Mark an invoice as paid
- Payment record is stored in the database
- Paid invoices are updated to `PAID`
- Payment API is restricted to OWNER and ACCOUNTANT

### Reports & Dashboard
- Total invoices
- Issued invoices
- Paid invoices
- Overdue invoices
- Total invoice amount
- Total expenses
- Net amount
- Expense category summary

### Currency Exchange
- Currency conversion through the Frankfurter API
- Exchange-rate lookup is handled by the backend
- Original invoice currency is stored

---

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- HTML
- CSS

### Backend
- Java
- Spring Boot 3.5.6
- Spring Data JPA
- Spring Security
- JWT
- Maven

### Database
- MySQL
- Hibernate ORM

### External API
- Frankfurter Exchange Rate API

---

## Project Structure

```text
BizBooks/
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/bizbooks/
│   │       │   ├── controller/
│   │       │   ├── model/
│   │       │   ├── repository/
│   │       │   ├── service/
│   │       │   ├── security/
│   │       │   └── config/
│   │       └── resources/
│   │           └── application.properties
│   └── pom.xml
│
├── database/
│
└── README.md