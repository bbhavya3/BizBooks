import { useEffect, useState } from "react";















function App() {







 // =========================







 // LOGIN / AUTHENTICATION







 // =========================















 const [loggedInUser, setLoggedInUser] = useState(() => {







  const savedUser = localStorage.getItem("bizbooksUser");















  try {







   return savedUser ? JSON.parse(savedUser) : null;







  } catch {







   return null;







  }







 });















 const [loginEmail, setLoginEmail] = useState("");







 const [loginPassword, setLoginPassword] = useState("");















 // =========================







 // MAIN DATA







 // =========================















 const [customers, setCustomers] = useState([]);







 const [invoices, setInvoices] = useState([]);







 const [expenses, setExpenses] = useState([]);















 // =========================







 // CUSTOMER







 // =========================















 const [name, setName] = useState("");







 const [email, setEmail] = useState("");







 const [phone, setPhone] = useState("");







 const [address, setAddress] = useState("");







 const [editingCustomerId, setEditingCustomerId] = useState(null);















 // =========================







 // CREATE INVOICE







 // =========================















 const [invoiceNumber, setInvoiceNumber] = useState("");







 const [selectedCustomer, setSelectedCustomer] = useState("");







 const [issueDate, setIssueDate] = useState("");







 const [dueDate, setDueDate] = useState("");







 const [invoiceStatus, setInvoiceStatus] = useState("DRAFT");







 const [invoiceCurrency, setInvoiceCurrency] = useState("INR");







 const [subtotal, setSubtotal] = useState("");







 const [tax, setTax] = useState("");







 const [invoiceItems, setInvoiceItems] = useState([







 {







  description: "",







  quantity: "",







  unitPrice: ""







 }







]);



  // INVOICE DETAILS

  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [selectedInvoiceItems, setSelectedInvoiceItems] = useState([]);

  const [invoiceDetailsLoading, setInvoiceDetailsLoading] = useState(false);

















 // =========================







 // CREATE EXPENSE







 // =========================















 const [expenseDescription, setExpenseDescription] = useState("");







 const [expenseAmount, setExpenseAmount] = useState("");







 const [expenseCategory, setExpenseCategory] = useState("");







 const [expenseDate, setExpenseDate] = useState("");















 // =========================







 // CURRENCY CONVERTER







 // =========================















 const [amount, setAmount] = useState("");







 const [fromCurrency, setFromCurrency] = useState("USD");







 const [toCurrency, setToCurrency] = useState("INR");







 const [exchangeRate, setExchangeRate] = useState(null);







 const [convertedAmount, setConvertedAmount] = useState(null);















 // =========================







 // ROLE







 // =========================















 const userRole = loggedInUser?.role;















 const isOwner = userRole === "OWNER";







 const isAccountant = userRole === "ACCOUNTANT";







 const isCustomer = userRole === "CUSTOMER";















 // =========================







 // LOGIN







 // =========================















 const handleLogin = async (event) => {







  event.preventDefault();















  if (!loginEmail || !loginPassword) {







   alert("Please enter email and password");







   return;







  }















  try {







   const response = await fetch(







    "http://localhost:8080/api/auth/login",







    {







     method: "POST",







     headers: {







      "Content-Type": "application/json",







     },







     body: JSON.stringify({







      email: loginEmail,







      password: loginPassword,







     }),







    }







   );















   if (!response.ok) {







 const errorText = await response.text();







 console.log("LOGIN STATUS:", response.status);







 console.log("LOGIN ERROR:", errorText);







 alert("Login failed: " + errorText);







 return;







}















   const user = await response.json();















   localStorage.setItem(







    "bizbooksUser",







    JSON.stringify(user)







   );







localStorage.setItem("bizbooksToken", user.token);







   setLoggedInUser(user);















   setLoginEmail("");







   setLoginPassword("");







  } catch (error) {







   console.error("Login error:", error);







   alert("Invalid email or password");







  }







 };















 // =========================







 // LOGOUT







 // =========================















 const handleLogout = () => {







  localStorage.removeItem("bizbooksUser");







  localStorage.removeItem("bizbooksToken");







  setLoggedInUser(null);







 };















 // =========================







 // FETCH CUSTOMERS







 // =========================







const authFetch = async (url, options = {}) => {







 const token = localStorage.getItem("bizbooksToken");















 const headers = {







  ...(options.headers || {}),







  ...(token ? { Authorization: `Bearer ${token}` } : {}),







 };















 const response = await fetch(url, {







  ...options,







  headers,







 });















 if (response.status === 401) {







 localStorage.removeItem("bizbooksUser");







 localStorage.removeItem("bizbooksToken");







 setLoggedInUser(null);















 throw new Error("Session expired. Please login again.");







}















return response;







};















 const fetchCustomers = () => {







  authFetch("http://localhost:8080/api/customers")







   .then((response) => response.json())







   .then((data) => {







    setCustomers(data);







   })







   .catch((error) => {







    console.error("Customer fetch error:", error);







   });







 };















 // =========================







 // FETCH INVOICES







 // =========================















 const fetchInvoices = () => {







  authFetch("http://localhost:8080/api/invoices")







   .then((response) => response.json())







   .then((data) => {







    setInvoices(data);







   })







   .catch((error) => {







    console.error("Invoice fetch error:", error);







   });







 };















 // =========================







 // FETCH EXPENSES







 // =========================















 const fetchExpenses = () => {







  authFetch("http://localhost:8080/api/expenses")







   .then((response) => response.json())







   .then((data) => {







    setExpenses(data);







   })







   .catch((error) => {







    console.error("Expense fetch error:", error);







   });







 };















 // =========================







 // LOAD DATA AFTER LOGIN







 // =========================















 useEffect(() => {







  if (!loggedInUser) {







   return;







  }















  fetchCustomers();







  fetchInvoices();







  fetchExpenses();







 }, [loggedInUser]);















 // =========================







 // ADD CUSTOMER







 // OWNER ONLY







 // =========================















 const addCustomer = (event) => {



 event.preventDefault();







 const customer = {



  name,



  email,



  phone,



  address,



 };







 authFetch("http://localhost:8080/api/customers", {



  method: "POST",



  headers: {



   "Content-Type": "application/json",



  },



  body: JSON.stringify(customer),



 })



  .then((response) => {



   if (!response.ok) throw new Error("Failed to create customer");



   return response.json();



  })



  .then(() => {



   alert("Customer added successfully");



   setName("");



   setEmail("");



   setPhone("");



   setAddress("");



   fetchCustomers();



  })



  .catch((error) => {



   console.error("Customer creation error:", error);



   alert("Unable to add customer");



  });



};







// =========================



// UPDATE CUSTOMER



// =========================







const updateCustomer = (event) => {



 event.preventDefault();







 const customer = { name, email, phone, address };







 authFetch(`http://localhost:8080/api/customers/${editingCustomerId}`, {



  method: "PUT",



  headers: { "Content-Type": "application/json" },



  body: JSON.stringify(customer),



 })



  .then((response) => {



   if (!response.ok) throw new Error("Failed to update customer");



   return response.json();



  })



  .then(() => {



   alert("Customer updated successfully");



   setName("");



   setEmail("");



   setPhone("");



   setAddress("");



   setEditingCustomerId(null);



   fetchCustomers();



  })



  .catch((error) => {



   console.error("Customer update error:", error);



   alert("Unable to update customer");



  });



};







// =========================



// DELETE CUSTOMER



// =========================







const deleteCustomer = (id) => {



 if (!window.confirm("Are you sure you want to delete this customer?")) return;







 authFetch(`http://localhost:8080/api/customers/${id}`, {



  method: "DELETE",



 })



  .then((response) => {



   if (!response.ok) throw new Error("Failed to delete customer");



   return response.text();



  })



  .then(() => {



   alert("Customer deleted successfully");



   fetchCustomers();



  })



  .catch((error) => {



   console.error("Customer deletion error:", error);



   alert("Unable to delete customer");



  });



};







// =========================



// START EDITING CUSTOMER



// =========================







const startEditCustomer = (customer) => {



 setEditingCustomerId(customer.id);



 setName(customer.name);



 setEmail(customer.email);



 setPhone(customer.phone);



 setAddress(customer.address);



};







// =========================



// INVOICE DETAILS

// =========================



  const viewInvoiceDetails = async (invoice) => {

    setSelectedInvoice(invoice);

    setSelectedInvoiceItems([]);

    setInvoiceDetailsLoading(true);



    try {

      const response = await authFetch(

        `http://localhost:8080/api/invoice-items/invoice/${invoice.id}`

      );



      if (!response.ok) {

        throw new Error("Failed to load invoice items");

      }



      const data = await response.json();

      setSelectedInvoiceItems(data);

    } catch (error) {

      console.error("Invoice details error:", error);

      alert("Unable to load invoice details");

    } finally {

      setInvoiceDetailsLoading(false);

    }

  };



  const closeInvoiceDetails = () => {

    setSelectedInvoice(null);

    setSelectedInvoiceItems([]);

  };



  const calculatedInvoiceSubtotal = invoiceItems.reduce(

    (sum, item) =>

      sum +

      (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),

    0

  );



  // =========================

  // CREATE INVOICE

  // OWNER + ACCOUNTANT

  // =========================



  const createInvoice = (event) => {







  event.preventDefault();















  if (!selectedCustomer) {







   alert("Please select a customer");







   return;







  }















  if (calculatedInvoiceSubtotal <= 0) {

      alert("Please add at least one invoice item with a valid quantity and unit price");

      return;

    }















  if (!tax || Number(tax) < 0) {







   alert("Please enter a valid tax");







   return;







  }















  const invoice = {







   invoiceNumber,















   customer: {







    id: Number(selectedCustomer),







   },















   issueDate,







   dueDate,







   status: invoiceStatus,







   currency: invoiceCurrency,







   subtotal: Number(calculatedInvoiceSubtotal.toFixed(2)),







   tax: Number(tax),







  };















  authFetch("http://localhost:8080/api/invoices", {







   method: "POST",







   headers: {







    "Content-Type": "application/json",







   },







   body: JSON.stringify(invoice),







  })







   .then((response) => {







    if (!response.ok) {







     throw new Error("Failed to create invoice");







    }















    return response.json();







   })







   .then(async (createdInvoice) => {







    for (const item of invoiceItems) {







 if (item.description && item.quantity && item.unitPrice) {







  await authFetch("http://localhost:8080/api/invoice-items", {







   method: "POST",







   headers: {







    "Content-Type": "application/json",







   },







   body: JSON.stringify({







    description: item.description,







    quantity: Number(item.quantity),







    unitPrice: Number(item.unitPrice),







    invoice: {







     id: createdInvoice.id







    }







   }),







  });







 }







}







    alert("Invoice created successfully");















    setInvoiceNumber("");







    setSelectedCustomer("");







    setIssueDate("");







    setDueDate("");







    setInvoiceStatus("DRAFT");







    setInvoiceCurrency("INR");

        setSubtotal("");

        setTax("");

        setInvoiceItems([

          {

            description: "",

            quantity: "",

            unitPrice: ""

          }

        ]);















    fetchInvoices();







   })







   .catch((error) => {







    console.error("Invoice creation error:", error);







    alert("Unable to create invoice");







   });







 };















 // =========================







 // ADD EXPENSE







 // OWNER + ACCOUNTANT







 // =========================















 const addExpense = (event) => {







  event.preventDefault();















  if (!expenseDescription.trim()) {







   alert("Please enter expense description");







   return;







  }















  if (!expenseAmount || Number(expenseAmount) <= 0) {







   alert("Please enter a valid expense amount");







   return;







  }















  if (!expenseCategory.trim()) {







   alert("Please enter expense category");







   return;







  }















  if (!expenseDate) {







   alert("Please select expense date");







   return;







  }















  const expense = {







   description: expenseDescription,







   amount: Number(expenseAmount),







   category: expenseCategory,







   expenseDate: expenseDate,







  };















  authFetch("http://localhost:8080/api/expenses", {







   method: "POST",







   headers: {







    "Content-Type": "application/json",







   },







   body: JSON.stringify(expense),







  })







   .then((response) => {







    if (!response.ok) {







     throw new Error("Failed to create expense");







    }















    return response.json();







   })







   .then(() => {







    alert("Expense added successfully");















    setExpenseDescription("");







    setExpenseAmount("");







    setExpenseCategory("");







    setExpenseDate("");















    fetchExpenses();







   })







   .catch((error) => {







    console.error("Expense creation error:", error);







    alert("Unable to add expense");







   });







 };















 // =========================







 // UPDATE INVOICE STATUS







 // OWNER + ACCOUNTANT







 // =========================















 const updateInvoiceStatus = (invoice, newStatus) => {







  const updatedInvoice = {







   invoiceNumber: invoice.invoiceNumber,















   customer: {







    id: invoice.customer.id,







   },















   issueDate: invoice.issueDate,







   dueDate: invoice.dueDate,







   status: newStatus,







   currency: invoice.currency,







   subtotal: invoice.subtotal,







   tax: invoice.tax,







  };















  authFetch(







   `http://localhost:8080/api/invoices/${invoice.id}`,







   {







    method: "PUT",







    headers: {







     "Content-Type": "application/json",







    },







    body: JSON.stringify(updatedInvoice),







   }







  )







   .then((response) => {







    if (!response.ok) {







     throw new Error("Failed to update invoice");







    }















    return response.json();







   })







   .then(() => {







    fetchInvoices();







   })







   .catch((error) => {







    console.error(







     "Invoice status update error:",







     error







    );















    alert("Unable to update invoice status");







   });







 };















 // =========================







 // MARK INVOICE AS PAID

 // OWNER + ACCOUNTANT

 // =========================



 const markInvoiceAsPaid = async (invoice) => {

  if (!window.confirm(`Mark ${invoice.invoiceNumber} as PAID?`)) return;



  try {

   const response = await authFetch("http://localhost:8080/api/payments", {

    method: "POST",

    headers: { "Content-Type": "application/json" },

    body: JSON.stringify({

     invoiceId: invoice.id,

     amount: Number(invoice.total || 0),

     paymentDate: new Date().toISOString().split("T")[0],

     status: "COMPLETED"

    })

   });



   if (!response.ok) throw new Error(await response.text());

   alert("Payment recorded successfully. Invoice marked as PAID.");

   fetchInvoices();

  } catch (error) {

   console.error("Payment error:", error);

   alert("Unable to record payment");

  }

 };



 // =========================

 // // CURRENCY CONVERSION







 // OWNER + ACCOUNTANT







 // =========================















 const convertCurrency = () => {







  if (!amount || Number(amount) <= 0) {







   alert("Please enter a valid amount");







   return;







  }















  if (fromCurrency === toCurrency) {







   setExchangeRate(1);







   setConvertedAmount(Number(amount));







   return;







  }















  authFetch(







   `http://localhost:8080/api/currency/rate?from=${fromCurrency}&to=${toCurrency}`







  )







   .then((response) => {







    if (!response.ok) {







     throw new Error("Failed to get exchange rate");







    }















    return response.json();







   })







   .then((data) => {







    const rate = Number(data.rate);















    setExchangeRate(rate);







    setConvertedAmount(Number(amount) * rate);







   })







   .catch((error) => {







    console.error(







     "Currency conversion error:",







     error







    );















    alert("Unable to get exchange rate");







   });







 };















 // =========================







 // DASHBOARD CALCULATIONS







 // =========================















 const totalInvoices = invoices.reduce(







  (sum, invoice) =>







   sum + Number(invoice.total || 0),







  0







 );















 const totalExpenses = expenses.reduce(







  (sum, expense) =>







   sum + Number(expense.amount || 0),







  0







 );















 const netAmount =







  totalInvoices - totalExpenses;















 const issuedInvoices = invoices.filter(







  (invoice) => invoice.status === "ISSUED"







 ).length;















 const paidInvoices = invoices.filter(







  (invoice) => invoice.status === "PAID"







 ).length;















 // =========================







 // LOGIN SCREEN







 // =========================















 if (!loggedInUser) {







  return (







   <div className="login-page">















    <div className="login-card">















     <h1>BizBooks</h1>















     <p>







      Small-Business Invoicing & Expense Workspace







     </p>















     <h2>Login</h2>















     <form onSubmit={handleLogin}>















      <input







       type="email"







       placeholder="Email"







       value={loginEmail}







       onChange={(e) =>







        setLoginEmail(e.target.value)







       }







       required







      />















      <input







       type="password"







       placeholder="Password"







       value={loginPassword}







       onChange={(e) =>







        setLoginPassword(e.target.value)







       }







       required







      />















      <button type="submit">







       Login







      </button>















     </form>















     <div className="demo-login">















      <p>Demo Accounts</p>















      <span>







       Owner: owner@gmail.com







      </span>















      <span>







       Accountant: accountant@gmail.com







      </span>















      <span>







       Customer: customer@gmail.com







      </span>















      <small>







       Password: 1234







      </small>















     </div>















    </div>















   </div>







  );







 }















 // =========================







 // MAIN APPLICATION







 // =========================















 return (







  <div className="app">















   {/* HEADER */}















   <div className="top-header">















    <div>







     <h1>BizBooks</h1>















     <p>







      Small-Business Invoicing & Expense Workspace







     </p>







    </div>















    <div className="user-bar">















     <div>







      <strong>







       {loggedInUser.name}







      </strong>















      <span>







       Role: {loggedInUser.role}







      </span>







     </div>















     <button onClick={handleLogout}>







      Logout







     </button>















    </div>















   </div>















   {/* =========================







     DASHBOARD







     ALL ROLES







     ========================= */}















   <h2>Dashboard</h2>















   <div className="dashboard-grid">















    {!isCustomer && (







 <div className="dashboard-card">







  <h3>Total Customers</h3>







  <p>{customers.length}</p>







 </div>







)}















    <div className="dashboard-card">







     <h3>Total Invoices</h3>







     <p>







      ₹{totalInvoices.toFixed(2)}







     </p>







    </div>















    {!isCustomer && (







     <div className="dashboard-card">







      <h3>Total Expenses</h3>







      <p>







       ₹{totalExpenses.toFixed(2)}







      </p>







     </div>







    )}















    {!isCustomer && (







     <div className="dashboard-card">







      <h3>Net Amount</h3>







      <p>







       ₹{netAmount.toFixed(2)}







      </p>







     </div>







    )}















    <div className="dashboard-card">







     <h3>Issued Invoices</h3>







     <p>{issuedInvoices}</p>







    </div>















    <div className="dashboard-card">







     <h3>Paid Invoices</h3>







     <p>{paidInvoices}</p>







    </div>















   </div>















   {/* =========================







     CUSTOMER MANAGEMENT







     OWNER ONLY







     ========================= */}















   {isOwner && (







    <>







     <h2>Add Customer</h2>















     <form onSubmit={editingCustomerId ? updateCustomer : addCustomer}>















      <input







       type="text"







       placeholder="Customer Name"







       value={name}







       onChange={(e) =>







        setName(e.target.value)







       }







       required







      />















      <input







       type="email"







       placeholder="Email"







       value={email}







       onChange={(e) =>







        setEmail(e.target.value)







       }







       required







      />















      <input







       type="text"







       placeholder="Phone"







       value={phone}







       onChange={(e) =>







        setPhone(e.target.value)







       }







       required







      />















      <input







       type="text"







       placeholder="Address"







       value={address}







       onChange={(e) =>







        setAddress(e.target.value)







       }







       required







      />















      <button type="submit">







 {editingCustomerId ? "Update Customer" : "Add Customer"}







</button>















{editingCustomerId && (







 <button







  type="button"







  onClick={() => {







   setEditingCustomerId(null);







   setName("");







   setEmail("");







   setPhone("");







   setAddress("");







  }}







 >







  Cancel







 </button>







)}















     </form>















     <h2>Customers</h2>















     {customers.length === 0 ? (







      <p>No customers found.</p>







     ) : (







      <ul>















      {customers.map((customer) => (







 <li key={customer.id}>







  <strong>







   {customer.name}







  </strong>















  {" - "}















  {customer.email}















  <button







   type="button"







   onClick={() => startEditCustomer(customer)}







  >







   Edit







  </button>















  <button







   type="button"







   onClick={() => deleteCustomer(customer.id)}







  >







   Delete







  </button>







 </li>







))}















      </ul>







     )}







    </>







   )}















   {/* =========================







     CUSTOMER VIEW







     CUSTOMER ONLY







     ========================= */}















   {isCustomer && (







    <>







     <h2>My Invoices</h2>















     {invoices.length === 0 ? (







      <p>







       No invoices available.







      </p>







     ) : (







      <div className="invoices-container">















       {invoices.map((invoice) => (















        <div







         className="invoice-card"







         key={invoice.id}







        >















         <h3>







          {invoice.invoiceNumber}







         </h3>















         <p>







          Customer:{" "}







          <strong>







           {invoice.customer?.name}







          </strong>







         </p>















         <p>







          Status:{" "}







          <strong>







           {invoice.status}







          </strong>







         </p>















         <p>







          Currency:{" "}







          {invoice.currency}







         </p>















         <p>







          Total:{" "}







          {invoice.currency}{" "}







          {invoice.total}







         </p>















         <p>







          Due Date:{" "}







          {invoice.dueDate}







         </p>



                  



                  <button

                    type="button"

                    onClick={() => viewInvoiceDetails(invoice)}

                  >

                    View Details

                  </button>















        </div>















       ))}















      </div>







     )}







    </>







   )}















   {/* =========================







     CREATE INVOICE







     OWNER + ACCOUNTANT







     ========================= */}















   {!isCustomer && (







    <>







     <h2>Create Invoice</h2>















     <form onSubmit={createInvoice}>















      <input







       type="text"







       placeholder="Invoice Number"







       value={invoiceNumber}







       onChange={(e) =>







        setInvoiceNumber(e.target.value)







       }







       required







      />















      <select







       value={selectedCustomer}







       onChange={(e) =>







        setSelectedCustomer(e.target.value)







       }







       required







      >







       <option value="">







        Select Customer







       </option>















       {customers.map((customer) => (















        <option







         key={customer.id}







         value={customer.id}







        >







         {customer.name}







        </option>















       ))}















      </select>















      <input







       type="date"







       value={issueDate}







       onChange={(e) =>







        setIssueDate(e.target.value)







       }







       required







      />















      <input







       type="date"







       value={dueDate}







       onChange={(e) =>







        setDueDate(e.target.value)







       }







       required







      />















      <select







       value={invoiceStatus}







       onChange={(e) =>







        setInvoiceStatus(e.target.value)







       }







      >







       <option value="DRAFT">







        DRAFT







       </option>















       <option value="ISSUED">







        ISSUED







       </option>















       <option value="PAID">







        PAID







       </option>















       <option value="OVERDUE">







        OVERDUE







       </option>







      </select>















      <select







       value={invoiceCurrency}







       onChange={(e) =>







        setInvoiceCurrency(e.target.value)







       }







      >







       <option value="INR">INR</option>







       <option value="USD">USD</option>







       <option value="EUR">EUR</option>







       <option value="GBP">GBP</option>







       <option value="AUD">AUD</option>







       <option value="CAD">CAD</option>







      </select>







<h3>Invoice Items</h3>















{invoiceItems.map((item, index) => (







 <div key={index}>







  <input







   type="text"







   placeholder="Item Description"







   value={item.description}







   onChange={(e) => {







    const updatedItems = [...invoiceItems];







    updatedItems[index].description = e.target.value;







    setInvoiceItems(updatedItems);







   }}







  />















  <input







   type="number"







   step="0.01"







   placeholder="Quantity"







   value={item.quantity}







   onChange={(e) => {







    const updatedItems = [...invoiceItems];







    updatedItems[index].quantity = e.target.value;







    setInvoiceItems(updatedItems);







   }}







  />















  <input







   type="number"







   step="0.01"







   placeholder="Unit Price"







   value={item.unitPrice}







   onChange={(e) => {







    const updatedItems = [...invoiceItems];







    updatedItems[index].unitPrice = e.target.value;







    setInvoiceItems(updatedItems);







   }}







  />







     <span>

      Amount: ₹

      {((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)).toFixed(2)}

    </span>



    {invoiceItems.length > 1 && (

      <button

        type="button"

        onClick={() => {

          setInvoiceItems(

            invoiceItems.filter((_, itemIndex) => itemIndex !== index)

          );

        }}

      >

        Remove

      </button>

    )}



</div>







))}















<button







 type="button"







 onClick={() => {







  setInvoiceItems([







   ...invoiceItems,







   {







    description: "",







    quantity: "",







    unitPrice: ""







   }







  ]);







 }}







>







 Add Item







</button>















      <input

                type="number"

                step="0.01"

                placeholder="Subtotal"

                value={calculatedInvoiceSubtotal.toFixed(2)}

                readOnly

              />















      <input







       type="number"







       step="0.01"







       placeholder="Tax"







       value={tax}







       onChange={(e) =>







        setTax(e.target.value)







       }







       required







      />















      <button type="submit">







       Create Invoice







      </button>















     </form>







    </>







   )}















   {/* =========================







     INVOICES







     OWNER + ACCOUNTANT







     ========================= */}















   {!isCustomer && (







    <>







     <h2>Invoices</h2>















     {invoices.length === 0 ? (







      <p>No invoices found.</p>







     ) : (







      <div className="invoices-container">















       {invoices.map((invoice) => (















        <div







         className="invoice-card"







         key={invoice.id}







        >















         <h3>







          {invoice.invoiceNumber}







         </h3>















         <p>







          Customer:{" "}







          <strong>







           {invoice.customer?.name}







          </strong>







         </p>















         <p>







          Status:{" "}







          <strong>







           {invoice.status}







          </strong>







         </p>















         <label>







          Change Status:{" "}















          <select







           value={invoice.status}







           onChange={(e) =>







            updateInvoiceStatus(







             invoice,







             e.target.value







            )







           }







          >







           <option value="DRAFT">







            DRAFT







           </option>















           <option value="ISSUED">







            ISSUED







           </option>















           <option value="PAID">







            PAID







           </option>















           <option value="OVERDUE">







            OVERDUE







           </option>















          </select>















         </label>















         <p>







          Currency:{" "}







          {invoice.currency}







         </p>















         <p>







          Subtotal:{" "}







          {invoice.currency}{" "}







          {invoice.subtotal}







         </p>















         <p>







          Tax:{" "}







          {invoice.currency}{" "}







          {invoice.tax}







         </p>















         <p className="invoice-total">







          Total:{" "}







          {invoice.currency}{" "}







          {invoice.total}







         </p>

















                  <div className="invoice-actions">

  {invoice.status !== "PAID" && (
    <button
      type="button"
      onClick={() => markInvoiceAsPaid(invoice)}
    >
      Mark as Paid
    </button>
  )}

  {invoice.status === "PAID" && (
    <span className="payment-completed">
      Payment Status: COMPLETED
    </span>
  )}

  <button
    type="button"
    onClick={() => viewInvoiceDetails(invoice)}
  >
    View Details
  </button>

</div>



</div>















       ))}















      </div>







     )}







    </>







   )}















         {/* =========================

          INVOICE DETAIL

          ALL ROLES

          ========================= */}



      {selectedInvoice && (

        <div

          style={{

            position: "fixed",

            inset: 0,

            backgroundColor: "rgba(0, 0, 0, 0.55)",

            display: "flex",

            justifyContent: "center",

            alignItems: "center",

            zIndex: 9999,

            padding: "20px",

          }}

        >

          <div

            style={{

              backgroundColor: "#ffffff",

              width: "100%",

              maxWidth: "750px",

              maxHeight: "90vh",

              overflowY: "auto",

              borderRadius: "12px",

              padding: "25px",

              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",

            }}

          >

            <div

              style={{

                display: "flex",

                justifyContent: "space-between",

                alignItems: "center",

                marginBottom: "20px",

              }}

            >

              <h2 style={{ margin: 0 }}>Invoice Details</h2>



              <button type="button" onClick={closeInvoiceDetails}>

                ✕ Close

              </button>

            </div>



            <p>

              <strong>Invoice:</strong> {selectedInvoice.invoiceNumber}

            </p>

            <p>

              <strong>Customer:</strong>{" "}

              {selectedInvoice.customer?.name || "Customer"}

            </p>

            <p>

              <strong>Status:</strong> {selectedInvoice.status}

            </p>

            <p>

              <strong>Issue Date:</strong> {selectedInvoice.issueDate}

            </p>

            <p>

              <strong>Due Date:</strong> {selectedInvoice.dueDate}

            </p>

            <p>

              <strong>Currency:</strong> {selectedInvoice.currency}

            </p>



            <hr />



            <h3>Invoice Items</h3>



            {invoiceDetailsLoading ? (

              <p>Loading invoice items...</p>

            ) : selectedInvoiceItems.length === 0 ? (

              <p>No invoice items found for this invoice.</p>

            ) : (

              <div>

                {selectedInvoiceItems.map((item) => (

                  <div

                    key={item.id}

                    style={{

                      border: "1px solid #ddd",

                      borderRadius: "8px",

                      padding: "12px",

                      marginBottom: "10px",

                    }}

                  >

                    <p>

                      <strong>{item.description}</strong>

                    </p>

                    <p>Quantity: {item.quantity}</p>

                    <p>

                      Unit Price: {selectedInvoice.currency}{" "}

                      {Number(item.unitPrice || 0).toFixed(2)}

                    </p>

                    <p>

                      Amount: {selectedInvoice.currency}{" "}

                      {Number(item.amount || 0).toFixed(2)}

                    </p>

                  </div>

                ))}

              </div>

            )}



            <hr />



            <p>

              <strong>Subtotal:</strong> {selectedInvoice.currency}{" "}

              {Number(selectedInvoice.subtotal || 0).toFixed(2)}

            </p>



            <p>

              <strong>Tax:</strong> {selectedInvoice.currency}{" "}

              {Number(selectedInvoice.tax || 0).toFixed(2)}

            </p>



            <p

              style={{

                fontSize: "20px",

                fontWeight: "bold",

              }}

            >

              Total: {selectedInvoice.currency}{" "}

              {Number(selectedInvoice.total || 0).toFixed(2)}

            </p>

          </div>

        </div>

      )}



{/* =========================



     REPORTS / SUMMARY



     OWNER + ACCOUNTANT



     ========================= */}



   {!isCustomer && (



    <>



     <h2>Reports / Summary</h2>



     <div

       style={{

         display: "grid",

         gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",

         gap: "15px",

         marginBottom: "25px",

       }}

     >



      <div className="dashboard-card">

       <h3>Total Invoices</h3>

       <p>{invoices.length}</p>

      </div>



      <div className="dashboard-card">

       <h3>Issued Invoices</h3>

       <p>{issuedInvoices}</p>

      </div>



      <div className="dashboard-card">

       <h3>Paid Invoices</h3>

       <p>{paidInvoices}</p>

      </div>



      <div className="dashboard-card">

       <h3>Overdue Invoices</h3>

       <p>

        {invoices.filter(

         (invoice) => invoice.status === "OVERDUE"

        ).length}

       </p>

      </div>



      <div className="dashboard-card">

       <h3>Total Invoice Amount</h3>

       <p>₹{totalInvoices.toFixed(2)}</p>

      </div>



      <div className="dashboard-card">

       <h3>Total Expenses</h3>

       <p>₹{totalExpenses.toFixed(2)}</p>

      </div>



      <div className="dashboard-card">

       <h3>Net Amount</h3>

       <p>₹{netAmount.toFixed(2)}</p>

      </div>



     </div>



     <div

       className="invoice-card"

       style={{ marginBottom: "30px" }}

     >

      <h3>Expense Category Summary</h3>



      {expenses.length === 0 ? (

       <p>No expenses available.</p>

      ) : (

       <div>

        {Object.entries(

         expenses.reduce((summary, expense) => {

          const category = expense.category || "Uncategorized";



          if (!summary[category]) {

           summary[category] = 0;

          }



          summary[category] += Number(expense.amount || 0);



          return summary;

         }, {})

        ).map(([category, total]) => (

         <p key={category}>

          <strong>{category}:</strong> ₹{total.toFixed(2)}

         </p>

        ))}

       </div>

      )}

     </div>



    </>



   )}



{/* =========================







     EXPENSES







     OWNER + ACCOUNTANT







     ========================= */}















   {!isCustomer && (







    <>







     <h2>Add Expense</h2>















     <form onSubmit={addExpense}>















      <input







       type="text"







       placeholder="Expense Description"







       value={expenseDescription}







       onChange={(e) =>







        setExpenseDescription(







         e.target.value







        )







       }







       required







      />















      <input







       type="number"







       step="0.01"







       placeholder="Amount"







       value={expenseAmount}







       onChange={(e) =>







        setExpenseAmount(







         e.target.value







        )







       }







       required







      />















      <input







       type="text"







       placeholder="Category"







       value={expenseCategory}







       onChange={(e) =>







        setExpenseCategory(







         e.target.value







        )







       }







       required







      />















      <input







       type="date"







       value={expenseDate}







       onChange={(e) =>







        setExpenseDate(







         e.target.value







        )







       }







       required







      />















      <button type="submit">







       Add Expense







      </button>















     </form>















     <h2>Expenses</h2>















     {expenses.length === 0 ? (







      <p>No expenses found.</p>







     ) : (







      <div className="invoices-container">















       {expenses.map((expense) => (















        <div







         className="invoice-card"







         key={expense.id}







        >















         <h3>







          {expense.description}







         </h3>















         <p>







          Category:{" "}







          <strong>







           {expense.category}







          </strong>







         </p>















         <p>







          Date:{" "}







          {expense.expenseDate}







         </p>















         <p className="invoice-total">







          Amount: ₹







          {expense.amount}







         </p>















        </div>















       ))}















      </div>







     )}







    </>







   )}















   {/* =========================







     CURRENCY CONVERTER







     OWNER + ACCOUNTANT







     ========================= */}















   {!isCustomer && (







    <>







     <h2>Currency Converter</h2>















     <div className="currency-card">















      <input







       type="number"







       step="0.01"







       placeholder="Enter Amount"







       value={amount}







       onChange={(e) =>







        setAmount(e.target.value)







       }







      />















      <select







       value={fromCurrency}







       onChange={(e) =>







        setFromCurrency(







         e.target.value







        )







       }







      >







       <option value="USD">







        USD







       </option>















       <option value="INR">







        INR







       </option>















       <option value="EUR">







        EUR







       </option>















       <option value="GBP">







        GBP







       </option>















       <option value="AUD">







        AUD







       </option>















       <option value="CAD">







        CAD







       </option>















      </select>















      <span className="currency-arrow">







       →







      </span>















      <select







       value={toCurrency}







       onChange={(e) =>







        setToCurrency(







         e.target.value







        )







       }







      >







       <option value="INR">







        INR







       </option>















       <option value="USD">







        USD







       </option>















       <option value="EUR">







        EUR







       </option>















       <option value="GBP">







        GBP







       </option>















       <option value="AUD">







        AUD







       </option>















       <option value="CAD">







        CAD







       </option>















      </select>















      <button







       onClick={convertCurrency}







      >







       Convert







      </button>















      {exchangeRate !== null && (







       <div className="conversion-result">















        <p>







         Exchange Rate: 1{" "}







         {fromCurrency} ={" "}







         {exchangeRate.toFixed(4)}{" "}







         {toCurrency}







        </p>















        <h3>







         {amount}{" "}







         {fromCurrency} ={" "}







         {convertedAmount.toFixed(2)}{" "}







         {toCurrency}







        </h3>















       </div>







      )}















     </div>







    </>







   )}















  </div>







 );







}















export default App;