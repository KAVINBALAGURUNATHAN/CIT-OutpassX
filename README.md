# CIT OutpassX

A hostel outpass management system with a multi-level approval workflow: **Student → Parent → Class Advisor → HOD → Floor In-charge**. Users log in with an email OTP.

> **Timeline:** I built this project on **14–15 December 2025**. It was uploaded to GitHub in October 2026. The commit dates match the original file modification timestamps from the project archive (`OPX-Project.zip`, created 19 Dec 2025).

## Features
- Passwordless login with email OTP for each role (student, parent, advisor, HOD, floor in-charge). OTPs expire after 5 minutes.
- Students submit outpass requests (dates and reason) and track their status
- Parents get an OTP by email and approve or reject their child's request
- Advisor, HOD and floor in-charge each have their own dashboard to approve or reject requests
- HOD and floor in-charge can bulk-approve requests

## Tech stack
- **Backend:** Node.js, Express, MySQL (`mysql2`), Nodemailer (Gmail SMTP)
- **Frontend:** HTML, CSS and JavaScript (one dashboard per role)

## Project structure
```
Backend/
  server.js          # Express app + route mounting
  db.js              # MySQL connection pool
  utils/mailer.js    # OTP email sender
  routes/            # auth, student, parent, advisor, hod, floor
Frontend/
  index.html         # Login
  dashboard_*.html   # Role dashboards
```

## Running locally
```bash
cd Backend
cp .env.example .env   # fill in MySQL + Gmail app password
npm install
node server.js         # http://localhost:3000
```
Then open `Frontend/index.html` in a browser.
