-- Demo users. Gmail plus-addresses deliver every OTP to one inbox.

INSERT INTO parents (name, email) VALUES ('Demo Parent', 'kavinbala2018+parent@gmail.com');
INSERT INTO advisors (name, email) VALUES ('Demo Advisor', 'kavinbala2018+advisor@gmail.com');
INSERT INTO hods (name, email) VALUES ('Demo HOD', 'kavinbala2018+hod@gmail.com');
INSERT INTO floor_incharges (name, email, hostel, floor) VALUES ('Demo Floor In-charge', 'kavinbala2018+floor@gmail.com', 'Hostel A', 1);

INSERT INTO students (name, email, register_no, hostel, floor, parent_id, advisor_id)
SELECT 'Demo Student', 'kavinbala2018+student@gmail.com', '2023CIT001', 'Hostel A', 1, p.id, a.id
FROM parents p, advisors a
WHERE p.email = 'kavinbala2018+parent@gmail.com' AND a.email = 'kavinbala2018+advisor@gmail.com';
