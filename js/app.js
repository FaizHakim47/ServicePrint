/* PrintFlow demo application logic.
   All data is sample data held in the browser. No backend/database is connected. */
"use strict";

const initialOrders = [
  {id:"PF-1008", customer:"Ali", email:"ali09@gmail.com", service:"Colour Printing", qty:120, date:"2026-10-12", status:"In Progress"},
  {id:"PF-1007", customer:"Maguire", email:"maguire88@gmail.com", service:"Document Binding", qty:4, date:"2026-10-12", status:"Pending"},
  {id:"PF-1006", customer:"Harry", email:"harry6@gmail.com", service:"Black & White Printing", qty:250, date:"2026-10-11", status:"Completed"},
  {id:"PF-1005", customer:"Onana", email:"onana2@gmail.com", service:"Laminating", qty:15, date:"2026-10-10", status:"In Progress"},
  {id:"PF-1004", customer:"Salah", email:"salah23@gmail.com", service:"Colour Printing", qty:80, date:"2026-10-09", status:"Pending"},
  {id:"PF-1003", customer:"Abu", email:"abu2@gmail.com", service:"Photocopy", qty:100, date:"2026-10-08", status:"Completed"},
  {id:"PF-1002", customer:"Siti", email:"siti33@gmail.cogmailm", service:"Document Binding", qty:3, date:"2026-10-07", status:"In Progress"},
  {id:"PF-1001", customer:"Jason", email:"jason7@gmail.com", service:"Black & White Printing", qty:60, date:"2026-10-06", status:"Completed"}
];
const services = [
  {name:"Black & White Printing", category:"PRINTING", description:"Affordable monochrome printing for notes, forms and documents.", price:0.15, unit:"per page", icon:"bi-file-earmark-text"},
  {name:"Colour Printing", category:"PRINTING", description:"Colour pages for presentations, assignments and promotional materials.", price:0.80, unit:"per page", icon:"bi-palette"},
  {name:"Photocopy", category:"COPYING", description:"Quick document duplication for personal or business use.", price:0.10, unit:"per page", icon:"bi-copy"},
  {name:"Document Binding", category:"FINISHING", description:"Neat binding for reports, project papers and other documents.", price:3.50, unit:"per document", icon:"bi-journal-bookmark"},
  {name:"Laminating", category:"FINISHING", description:"Protect important sheets, cards and notices with lamination.", price:2.00, unit:"per sheet", icon:"bi-card-image"},
  {name:"Poster Printing", category:"LARGE FORMAT", description:"Large-format prints for events, notices and display materials.", price:8.00, unit:"per poster", icon:"bi-easel"}
];
let orders = initialOrders.map(o => ({...o}));
let chartInstance = null;
let modalMode = "order";
let modalInstance = null;
let toastInstance = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function titleCaseInitials(name) {
  return name.split(/\s+/).slice(0,2).map(part => part[0] || "").join("").toUpperCase();
}
function formatDate(date) {
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString("en-MY",{day:"2-digit",month:"short",year:"numeric"});
}
function currency(value) {
  return new Intl.NumberFormat("en-MY",{style:"currency",currency:"MYR",minimumFractionDigits:2}).format(value);
}
function statusClass(status) {
  return status === "Pending" ? "status-pending" : status === "In Progress" ? "status-in-progress" : "status-completed";
}
function statusBadge(status) {
  return `<span class="status-badge ${statusClass(status)}">${escapeHTML(status)}</span>`;
}
function showToast(message) {
  $("#toastMessage").textContent = message;
  toastInstance.show();
}
function showPage(page) {
  const allowed = ["dashboard","orders","services","customers","myorders"];
if (currentUser && currentUser.role === "customer" && page !== "services") page = "myorders";
if (currentUser && currentUser.role === "admin" && page === "myorders") page = "dashboard";
  $$(".page-section").forEach(section => section.classList.add("d-none"));
  $(`#page-${page}`).classList.remove("d-none");
  $$(".side-nav .nav-link").forEach(link => link.classList.toggle("active", link.dataset.page === page));
  const names = {dashboard:"Dashboard",orders:"Order management",services:"Service management",customers:"Customers",myorders:"My orders"};
  $("#breadcrumbCurrent").textContent = names[page];
  closeSidebar();
  if (page === "dashboard") renderDashboard();
  if (page === "orders") renderOrders();
  if (page === "services") renderServices();
  if (page === "customers") renderCustomers();
  if (page === "myorders") renderMyOrders();
}
function openSidebar() {
  $("#sidebar").classList.add("sidebar-open");
  $("#sidebarScrim").classList.add("active");
}
function closeSidebar() {
  $("#sidebar").classList.remove("sidebar-open");
  $("#sidebarScrim").classList.remove("active");
}
function getCounts() {
  return {
    total:orders.length,
    pending:orders.filter(o=>o.status==="Pending").length,
    progress:orders.filter(o=>o.status==="In Progress").length,
    completed:orders.filter(o=>o.status==="Completed").length
  };
}
function renderStats() {
  const c = getCounts();
  $("#statTotal").textContent = c.total;
  $("#statPending").textContent = c.pending;
  $("#statProgress").textContent = c.progress;
  $("#statCompleted").textContent = c.completed;
  $("#navOrderCount").textContent = c.total;
  $("#orderTableCount").textContent = c.total;
}
function renderRecentOrders() {
  $("#recentOrdersBody").innerHTML = orders.slice(0,5).map(o => `
    <tr><td>${escapeHTML(o.id)}</td>
    <td><div class="customer-cell"><span class="customer-avatar">${titleCaseInitials(o.customer)}</span><div><strong>${escapeHTML(o.customer)}</strong><small>${escapeHTML(o.email)}</small></div></div></td>
    <td>${escapeHTML(o.service)}</td><td>${formatDate(o.date)}</td><td>${statusBadge(o.status)}</td></tr>`).join("");
}
function renderChart() {
  if (typeof Chart === "undefined") return;
  const c = getCounts();
  const canvas = $("#ordersChart");
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(canvas, {
    type:"bar",
    data:{labels:["Pending","In Progress","Completed"],datasets:[{label:"Number of orders",data:[c.pending,c.progress,c.completed],backgroundColor:["#f0c66e","#8db9ed","#65bd89"],borderRadius:7,borderSkipped:false,maxBarThickness:48}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:"#183c29",padding:11,displayColors:false,callbacks:{label:(context)=>`${context.raw} order(s)`}}},scales:{x:{grid:{display:false},border:{display:false},ticks:{color:"#8c9a90",font:{family:"Inter",size:10}}},y:{beginAtZero:true,ticks:{precision:0,stepSize:1,color:"#9aa69e",font:{family:"Inter",size:10}},grid:{color:"#eef3ef",drawTicks:false},border:{display:false}}}}
  });
}
function renderPopularServices() {
  $("#popularServices").innerHTML = services.slice(0,4).map(s=>`<div class="popular-service"><span class="service-mini-icon"><i class="bi ${s.icon}"></i></span><div><strong>${escapeHTML(s.name)}</strong><small>${escapeHTML(s.category.toLowerCase())}</small></div><span class="price">${currency(s.price)}</span></div>`).join("");
}
function renderDashboard() {
  renderStats(); renderRecentOrders(); renderPopularServices(); renderChart();
}
function renderOrders() {
  const query = ($("#orderSearch").value || "").trim().toLowerCase();
  const filter = $("#statusFilter").value;
  const filtered = orders.filter(o => (filter==="All" || o.status===filter) && [o.id,o.customer,o.service,o.status].some(v=>v.toLowerCase().includes(query)));
  $("#ordersTableBody").innerHTML = filtered.map(o=>`
    <tr><td>${escapeHTML(o.id)}</td>
    <td><div class="customer-cell"><span class="customer-avatar">${titleCaseInitials(o.customer)}</span><div><strong>${escapeHTML(o.customer)}</strong><small>${escapeHTML(o.email)}</small></div></div></td>
    <td>${escapeHTML(o.service)}</td><td>${o.qty}</td><td>${formatDate(o.date)}</td>
    <td><select class="action-select status-change" data-order-id="${escapeHTML(o.id)}" aria-label="Update status for ${escapeHTML(o.id)}"><option ${o.status==="Pending"?"selected":""}>Pending</option><option ${o.status==="In Progress"?"selected":""}>In Progress</option><option ${o.status==="Completed"?"selected":""}>Completed</option></select></td>
    <td><button class="icon-button delete-order" data-order-id="${escapeHTML(o.id)}" title="Delete order" aria-label="Delete ${escapeHTML(o.id)}"><i class="bi bi-trash3"></i></button></td></tr>`).join("");
  $("#emptyOrders").classList.toggle("d-none",filtered.length!==0);
  $("#orderTableCount").textContent = filtered.length === orders.length ? orders.length : `${filtered.length}/${orders.length}`;
  renderStats();
}
function renderServices() {
  $("#servicesGrid").innerHTML = services.map(s=>`
    <article class="service-card"><div class="service-card-top"><span class="service-card-icon"><i class="bi ${s.icon}"></i></span><span class="service-category">${escapeHTML(s.category)}</span></div>
    <h3>${escapeHTML(s.name)}</h3><p>${escapeHTML(s.description)}</p><div class="service-card-bottom"><span class="service-price">${currency(s.price)} <small>/ ${escapeHTML(s.unit.replace(/^per /,""))}</small></span><span class="badge rounded-pill text-bg-light">${escapeHTML(s.unit)}</span></div></article>`).join("");
  if (!services.length) $("#servicesGrid").innerHTML = `<div class="empty-state"><strong>No services yet</strong></div>`;
  renderPopularServices();
}
function customerRecords() {
  const map = new Map();
  orders.forEach(o=>{
    if (!map.has(o.customer)) map.set(o.customer,{name:o.customer,email:o.email,phone:phoneFor(o.customer),count:0,lastOrder:o.date});
    const c=map.get(o.customer); c.count += 1; if(o.date>c.lastOrder)c.lastOrder=o.date;
  });
  // Include a small set of sample customers even when they have no current order.
  [{name:"Farah Nabilah",email:"farah@example.com",phone:"+60 12-345 6789"},{name:"Arif Danish",email:"arif@example.com",phone:"+60 13-222 4455"}].forEach(c=>{if(!map.has(c.name))map.set(c.name,{...c,count:0,lastOrder:"—"});});
  return Array.from(map.values()).sort((a,b)=>a.name.localeCompare(b.name));
}
function phoneFor(name) {
  const phones = {"Aina Sofea":"+60 12-345 1008","Daniel Lee":"+60 12-345 1007","Nur Iman":"+60 12-345 1006","Haziq Rahman":"+60 12-345 1005","Mei Xin":"+60 12-345 1004","Amir Hakim":"+60 12-345 1003","Siti Aisyah":"+60 12-345 1002","Jason Tan":"+60 12-345 1001"};
  return phones[name] || "+60 12-000 0000";
}
function renderCustomers() {
  const q=($("#customerSearch").value||"").trim().toLowerCase();
  const filtered=customerRecords().filter(c=>[c.name,c.email,c.phone].some(v=>v.toLowerCase().includes(q)));
  $("#customersTableBody").innerHTML=filtered.map(c=>`<tr><td><div class="customer-cell"><span class="customer-avatar">${titleCaseInitials(c.name)}</span><div><strong>${escapeHTML(c.name)}</strong><small>Customer</small></div></div></td><td>${escapeHTML(c.email)}</td><td>${escapeHTML(c.phone)}</td><td><strong>${c.count}</strong></td><td>${c.lastOrder==="—"?"—":formatDate(c.lastOrder)}</td></tr>`).join("");
  $("#emptyCustomers").classList.toggle("d-none",filtered.length!==0);
  $("#customerCount").textContent=customerRecords().length;
}
function openRecordModal(mode) {
  modalMode=mode;
  $("#dataForm").reset();
  $("#dataModalTitle").textContent=mode==="order"?"Add new order":"Add new service";
  const fields=$("#dataFormFields");
  if(mode==="order"){
    fields.innerHTML=`
      <div class="mb-3"><label class="form-label" for="newCustomer">Customer name *</label><input class="form-control" id="newCustomer" required maxlength="80" placeholder="e.g. Nur Aisyah"></div>
      <div class="mb-3"><label class="form-label" for="newEmail">Email address *</label><input class="form-control" id="newEmail" type="email" required maxlength="120" placeholder="customer@example.com"></div>
      <div class="row g-3"><div class="col-12 col-md-7"><label class="form-label" for="newService">Printing service *</label><select class="form-select" id="newService" required>${services.map(s=>`<option>${escapeHTML(s.name)}</option>`).join("")}</select></div><div class="col-12 col-md-5"><label class="form-label" for="newQty">Quantity *</label><input class="form-control" id="newQty" type="number" min="1" max="100000" value="1" required></div></div>
      <div class="mt-3"><label class="form-label" for="newStatus">Initial status</label><select class="form-select" id="newStatus"><option>Pending</option><option>In Progress</option><option>Completed</option></select></div>`;
  } else {
    fields.innerHTML=`
      <div class="mb-3"><label class="form-label" for="newServiceName">Service name *</label><input class="form-control" id="newServiceName" required maxlength="80" placeholder="e.g. Sticker Printing"></div>
      <div class="mb-3"><label class="form-label" for="newCategory">Category *</label><select class="form-select" id="newCategory"><option>PRINTING</option><option>COPYING</option><option>FINISHING</option><option>LARGE FORMAT</option><option>OTHER</option></select></div>
      <div class="mb-3"><label class="form-label" for="newDescription">Description *</label><textarea class="form-control" id="newDescription" rows="3" required maxlength="180" placeholder="Briefly describe the service"></textarea></div>
      <div class="row g-3"><div class="col-7"><label class="form-label" for="newPrice">Price (RM) *</label><input class="form-control" id="newPrice" type="number" min="0" step="0.01" required placeholder="0.50"></div><div class="col-5"><label class="form-label" for="newUnit">Unit</label><select class="form-select" id="newUnit"><option>per page</option><option>per sheet</option><option>per document</option><option>per poster</option><option>per item</option></select></div></div>`;
  }
  modalInstance.show();
}
function addOrder(form) {
  const customer=$("#newCustomer").value.trim(), email=$("#newEmail").value.trim();
  const qty=Number($("#newQty").value);
  if(!customer || !email || !Number.isInteger(qty) || qty<1){showToast("Please check the order details.");return;}
  const nextNumber=Math.max(1000,...orders.map(o=>Number(o.id.split("-")[1])||1000))+1;
  const today=new Date(); const date=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  orders.unshift({id:`PF-${nextNumber}`,customer,email,service:$("#newService").value,qty,date,status:$("#newStatus").value});
  modalInstance.hide();renderAll();showPage("orders");showToast("New order added successfully.");
}
function addService() {
  const name=$("#newServiceName").value.trim(), description=$("#newDescription").value.trim(), price=Number($("#newPrice").value);
  if(!name||!description||!Number.isFinite(price)||price<0){showToast("Please check the service details.");return;}
  if(services.some(s=>s.name.toLowerCase()===name.toLowerCase())){showToast("A service with this name already exists.");return;}
  services.push({name,category:$("#newCategory").value,description,price,unit:$("#newUnit").value,icon:"bi-printer"});
  modalInstance.hide();renderServices();showToast("New service added successfully.");
}
function renderAll() {renderStats();renderRecentOrders();renderPopularServices();if(chartInstance)renderChart();}

document.addEventListener("DOMContentLoaded",()=>{
  modalInstance=new bootstrap.Modal($("#dataModal"));
  toastInstance=new bootstrap.Toast($("#appToast"),{delay:2600});
  $("#todayDate").textContent=new Date().toLocaleDateString("en-MY",{day:"numeric",month:"short",year:"numeric"});
  $("#dataForm").addEventListener("submit",event=>{event.preventDefault();if(modalMode==="order")addOrder(event.currentTarget);else if(modalMode==="myorder")addMyOrder();else addService();});
  $("#logoutButton").addEventListener("click",()=>{$("#appShell").classList.add("d-none");$("#loginScreen").classList.remove("d-none");$("#loginForm").reset();$("#loginAlert").classList.add("d-none");closeSidebar();});
  $$("[data-page]").forEach(el=>el.addEventListener("click",event=>{event.preventDefault();showPage(el.dataset.page);}));
  $("#openSidebar").addEventListener("click",openSidebar);$("#closeSidebar").addEventListener("click",closeSidebar);$("#sidebarScrim").addEventListener("click",closeSidebar);
  $("#orderSearch").addEventListener("input",renderOrders);$("#statusFilter").addEventListener("change",renderOrders);$("#customerSearch").addEventListener("input",renderCustomers);
  $("#addOrderButton").addEventListener("click",()=>openRecordModal("order"));$("#addServiceButton").addEventListener("click",()=>openRecordModal("service"));
  $("#dataForm").addEventListener("submit",event=>{event.preventDefault();if(modalMode==="order")addOrder(event.currentTarget);else addService();});
  $("#ordersTableBody").addEventListener("change",event=>{
    if(!event.target.classList.contains("status-change"))return;
    const order=orders.find(o=>o.id===event.target.dataset.orderId);
    if(order){order.status=event.target.value;renderOrders();renderAll();showToast(`${order.id} status updated to ${order.status}.`);}
  });
  $("#ordersTableBody").addEventListener("click",event=>{
    const button=event.target.closest(".delete-order");if(!button)return;
    const id=button.dataset.orderId;
    if(confirm(`Delete order ${id}? This action only affects this demo session.`)){orders=orders.filter(o=>o.id!==id);renderOrders();renderAll();showToast(`${id} deleted.`);}
  });
});
/* ---------- Register and user roles ---------- */
let currentUser = null;
let users = JSON.parse(localStorage.getItem("pf_users") || "[]");

function applyRole(user) {
  currentUser = user;
  const isAdmin = user.role === "admin";
  ["dashboard","orders","customers"].forEach(p => {
    $('.side-nav [data-page="' + p + '"]').classList.toggle("d-none", !isAdmin);
  });
  $('.side-nav [data-page="myorders"]').classList.toggle("d-none", isAdmin);
  $("#addServiceButton").classList.toggle("d-none", !isAdmin);
  $("#userAvatar").textContent = titleCaseInitials(user.name);
  $("#userName").textContent = user.name;
  $("#userRole").textContent = isAdmin ? "Administrator" : "Customer";
}

function renderMyOrders() {
  const mine = orders.filter(o => o.owner === currentUser.username);
  $("#myOrdersBody").innerHTML = mine.map(o =>
    "<tr><td>" + escapeHTML(o.id) + "</td><td>" + escapeHTML(o.service) + "</td><td>" + o.qty +
    "</td><td>" + formatDate(o.date) + "</td><td>" + statusBadge(o.status) + "</td></tr>").join("");
  $("#emptyMyOrders").classList.toggle("d-none", mine.length !== 0);
}

function openMyOrderModal() {
  modalMode = "myorder";
  $("#dataForm").reset();
  $("#dataModalTitle").textContent = "New order";
  $("#dataFormFields").innerHTML =
    '<div class="row g-3"><div class="col-12 col-md-7"><label class="form-label" for="myService">Printing service *</label>' +
    '<select class="form-select" id="myService" required>' +
    services.map(s => "<option>" + escapeHTML(s.name) + "</option>").join("") +
    '</select></div><div class="col-12 col-md-5"><label class="form-label" for="myQty">Quantity *</label>' +
    '<input class="form-control" id="myQty" type="number" min="1" max="100000" value="1" required></div></div>';
  modalInstance.show();
}

function addMyOrder() {
  const qty = Number($("#myQty").value);
  if (!Number.isInteger(qty) || qty < 1) { showToast("Please enter a valid quantity."); return; }
  const nextNumber = Math.max(1000, ...orders.map(o => Number(o.id.split("-")[1]) || 1000)) + 1;
  const t = new Date();
  const date = t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0");
  orders.unshift({id: "PF-" + nextNumber, customer: currentUser.name, email: currentUser.email,
    owner: currentUser.username, service: $("#myService").value, qty: qty, date: date, status: "Pending"});
  modalInstance.hide();
  renderAll();
  renderMyOrders();
  showToast("Your order has been placed.");
}

document.addEventListener("DOMContentLoaded", () => {
  // Login (admin account or any registered customer)
  $("#loginForm").addEventListener("submit", event => {
    event.preventDefault();
    const username = $("#username").value.trim();
    const password = $("#password").value;
    let user = null;
    if (username === "admin" && password === "print123") {
      user = {username: "admin", name: "Admin", email: "", role: "admin"};
    } else {
      const m = users.find(u => u.username === username && u.password === password);
      if (m) user = {username: m.username, name: m.name, email: m.email, role: "customer"};
    }
    if (user) {
      $("#loginAlert").classList.add("d-none");
      $("#loginScreen").classList.add("d-none");
      $("#appShell").classList.remove("d-none");
      applyRole(user);
      showPage(user.role === "admin" ? "dashboard" : "myorders");
      showToast("Welcome to PrintFlow.");
    } else {
      $("#loginAlert").classList.remove("d-none");
      $("#password").setAttribute("aria-invalid", "true");
    }
  });

  // Switch between sign in and register
  $("#showRegister").addEventListener("click", e => {
    e.preventDefault();
    $("#loginForm").classList.add("d-none");
    $("#registerForm").classList.remove("d-none");
  });
  $("#showLogin").addEventListener("click", e => {
    e.preventDefault();
    $("#registerForm").classList.add("d-none");
    $("#loginForm").classList.remove("d-none");
  });

  // Register a new customer account
  $("#registerForm").addEventListener("submit", event => {
    event.preventDefault();
    const name = $("#regName").value.trim();
    const email = $("#regEmail").value.trim();
    const username = $("#regUsername").value.trim();
    const pass = $("#regPassword").value;
    const pass2 = $("#regPassword2").value;
    const alertBox = $("#registerAlert");
    let problem = "";
    if (pass.length < 6) problem = "Password must be at least 6 characters.";
    else if (pass !== pass2) problem = "Passwords do not match.";
    else if (username.toLowerCase() === "admin" || users.some(u => u.username.toLowerCase() === username.toLowerCase())) problem = "That username is already taken.";
    if (problem) { alertBox.textContent = problem; alertBox.classList.remove("d-none"); return; }
    users.push({name: name, email: email, username: username, password: pass});
    localStorage.setItem("pf_users", JSON.stringify(users));
    alertBox.classList.add("d-none");
    $("#registerForm").reset();
    $("#registerForm").classList.add("d-none");
    $("#loginForm").classList.remove("d-none");
    $("#username").value = username;
    showToast("Account created. Please sign in.");
  });

  $("#addMyOrderButton").addEventListener("click", openMyOrderModal);
});