# PrintFlow — Printing Service System Management

**Course:** IMS566 — Advanced Web Design Development and Content Management  
**Project type:** Individual project prototype  
**Theme:** Green and white

## 1. Project description
PrintFlow is a responsive front-end web application prototype for a printing service business. It provides a single interface for viewing order statistics, reviewing and updating print orders, browsing printing services, and viewing customer records.

This project uses sample data and simulated authentication. It does not connect to a database or process real customer orders.

## 2. Features
- Open customer registration: anyone can create an account and sign in.
- Two roles: admin (full management) and customer (place and view own orders, browse services).
- Demo login screen with invalid-credential error feedback.
- Responsive sidebar navigation across Dashboard, Order Management, Service Management and Customers.
- Dashboard statistic cards for total, pending, in-progress and completed orders.
- Meaningful Chart.js bar chart showing orders by status.
- Recent orders table.
- Order search and status filter.
- Add new orders, update order status and delete orders during the current browser session.
- Service catalogue with illustrative prices and an add-service form.
- Customer directory with search.
- Responsive design for desktop, tablet and mobile screens.
- Structured page titles, descriptions, sections, labels and footer.

## 3. How to test the login
Use these demo credentials:
- **Username:** `admin`
- **Password:** `print123`
To test the customer role, open "Create an account", register, then sign in with the new details.

To test the error message, enter any other username or password.

## 4. Technologies used
- HTML5
- CSS3
- Bootstrap 5.3.3
- Bootstrap Icons
- JavaScript
- Chart.js 4.4.3

The Bootstrap and Chart.js libraries are loaded from CDNs, so an internet connection is needed for those assets when viewing the project.

## 5. Run locally
1. Extract the project folder.
2. Open `index.html` in Google Chrome.
3. Sign in with the demo credentials above.

For the best development workflow, open the folder in a code editor such as Visual Studio Code and use a local development server.

## 6. Publish using GitHub Pages
1. Create a new GitHub repository, for example `printing-service-system-management`.
2. Upload `index.html`, `css/style.css`, `js/app.js`, and `README.md` while keeping the folder structure.
3. In the repository, open **Settings → Pages**.
4. Under Build and deployment, select **Deploy from a branch**.
5. Select the `main` branch and `/ (root)` folder, then save.
6. Wait for GitHub Pages to publish the website. Copy the published URL for submission.
7. Submit both the GitHub Pages live link and the repository link as required by the assignment.

## 7. Limitations
- Login is a client-side demonstration, not secure production authentication.
- Data is stored in JavaScript arrays and resets when the page is refreshed.
- Prices and customer details are fictional examples for academic demonstration.
- There is no database, payment processing, file upload or real printing integration.
- Customer accounts are saved in the browser (localStorage) and are not secure; orders reset on refresh.

## 8. Suggested project title for submission
**Printing Service System Management: PrintFlow Web Application Prototype**
