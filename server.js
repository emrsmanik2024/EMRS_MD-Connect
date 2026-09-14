const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname, { index: 'home.html' }));

const MONGO_URI = 'mongodb+srv://manikdb:manik12345@manik.mqyqfep.mongodb.net/StudentHubDB?retryWrites=true&w=majority&appName=Manik';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Cloud Connected Successfully!'))
    .catch(err => console.log('❌ MongoDB Connection Error:', err));

// --- Database Schemas ---
const adminSchema = new mongoose.Schema({ email: String, password: String });
const Admin = mongoose.model('Admin', adminSchema);

const teacherSchema = new mongoose.Schema({
    name: String, email: String, subject: String, password: String, role: { type: String, default: 'teacher' }
});
const Teacher = mongoose.model('Teacher', teacherSchema);

const studentSchema = new mongoose.Schema({
    name: String, 
    email: String, 
    class: String, 
    roll: String, 
    section: String,       
    mobile: String,        
    fatherName: String,    
    password: String, 
    role: { type: String, default: 'student' }
});
const Student = mongoose.model('Student', studentSchema);

// NEW: Attendance Schema
const attendanceSchema = new mongoose.Schema({
    date: String,
    class: String,
    records: [{
        roll: String,
        name: String,
        status: String // 'Present' or 'Absent'
    }]
});
const Attendance = mongoose.model('Attendance', attendanceSchema);

// Initialize Admin
const initializeAdmin = async () => {
    const adminEmail = 'emrs.manik2024@gmail.com';
    const adminPassword = 'Manik_Admin';
    
    const adminExists = await Admin.findOne({ email: adminEmail });
    if (!adminExists) {
        await Admin.create({ email: adminEmail, password: adminPassword });
        console.log(`✅ Admin Created with email: ${adminEmail}`);
    }
};
initializeAdmin();

/// --- Nodemailer Setup (Brevo SMTP) ---
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
        user: 'b95622001@smtp-brevo.com', // Brevo থেকে পাওয়া Login আইডি
        pass: process.env.EMAIL_PASS       // Render-এ দেওয়া Brevo-এর লম্বা SMTP Key (xsmtpsib-...)
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

let otpStorage = {}; 

// --- APIs ---

// 1. Admin Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Admin.findOne({ email, password });
        if (user) { res.json({ success: true, message: 'Login successful', token: 'admin_token' }); }
        else { res.status(401).json({ success: false, message: 'Invalid email or password' }); }
    } catch (err) { res.status(500).json({ success: false, message: 'Database error' }); }
});

// 2. Teacher Login
app.post('/api/teacher-login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const teacher = await Teacher.findOne({ email, password });
        if (teacher) { res.json({ success: true, message: 'Teacher login successful', token: 'teacher_token', name: teacher.name, subject: teacher.subject }); }
        else { res.status(401).json({ success: false, message: 'Invalid email or password' }); }
    } catch (err) { res.status(500).json({ success: false, message: 'Database error' }); }
});

// 3. Student Login
app.post('/api/student-login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const student = await Student.findOne({ email, password });
        if (student) { res.json({ success: true, message: 'Student login successful', token: 'student_token', name: student.name, class: student.class }); }
        else { res.status(401).json({ success: false, message: 'Record not found.' }); }
    } catch (err) { res.status(500).json({ success: false, message: 'Database error' }); }
});

// 4. Add Teacher
app.post('/api/add-teacher', async (req, res) => {
    const { name, email, subject, password } = req.body;
    try {
        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) { return res.status(400).json({ success: false, message: 'Teacher email already exists!' }); }
        await Teacher.create({ name, email, subject, password });
        res.json({ success: true, message: 'Teacher added successfully!' });
    } catch (err) { res.status(500).json({ success: false, message: 'Error adding teacher' }); }
});

// 5. Send OTP via Email 
app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
    try {
        let user = await Admin.findOne({ email });
        if (!user) user = await Teacher.findOne({ email });
        if (!user) user = await Student.findOne({ email });

        if (user) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            otpStorage[email] = otp;
            
            const mailOptions = {
                from: '"EMRS MD-Connect" <emrs.manik2024@gmail.com>', 
                to: email, 
                subject: 'Password Recovery OTP - EMRS MD-Connect',
                html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #4F46E5;">Password Reset Request</h2>
                    <p>Hello,</p>
                    <p>We received a request to reset your password for your <strong>EMRS MD-Connect</strong> account.</p>
                    <p>Your One-Time Password (OTP) is:</p>
                    <h1 style="background: #F3F4F6; padding: 10px; text-align: center; letter-spacing: 5px; color: #111827; border-radius: 6px;">${otp}</h1>
                    <p style="font-size: 13px; color: #6B7280;">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
                    <br>
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                    <p style="margin-bottom: 5px;">Thanks,</p>
                    <p style="margin: 0; font-weight: bold; font-size: 16px;">Manik</p>
                    <p style="margin: 0; color: #4B5563;">PGT Maths</p>
                    <p style="margin: 0; font-size: 12px; color: #9CA3AF;">EMRS MD-Connect System</p>
                </div>
                `
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('❌ Error sending email:', error);
                    return res.status(500).json({ success: false, message: 'Failed to send OTP via email' });
                }
                res.json({ success: true, message: 'OTP sent to your email successfully!' });
            });

        } else {
            res.status(404).json({ success: false, message: 'Email not found in our system' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// 6. Reset Password
app.post('/api/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (otpStorage[email] && otpStorage[email] === otp) {
        try {
            if (await Admin.findOne({ email })) await Admin.updateOne({ email }, { password: newPassword });
            else if (await Teacher.findOne({ email })) await Teacher.updateOne({ email }, { password: newPassword });
            else if (await Student.findOne({ email })) await Student.updateOne({ email }, { password: newPassword });

            delete otpStorage[email];
            res.json({ success: true, message: 'Password reset successfully!' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Database error' });
        }
    } else {
        res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
});

// 7. Excel Import API
app.post('/api/students/import', async (req, res) => {
    try {
        const studentsData = req.body;
        if (!Array.isArray(studentsData) || studentsData.length === 0) {
            return res.json({ success: false, message: "No data provided for import." });
        }
        await Student.insertMany(studentsData, { ordered: false });
        res.json({ success: true, message: `${studentsData.length} students imported successfully!` });
    } catch (error) {
        res.status(500).json({ success: false, message: "An error occurred while importing students." });
    }
});

// 8. Add Single Student API
app.post('/api/students/add', async (req, res) => {
    try {
        const { name, roll, class: studentClass, section, mobile, fatherName } = req.body;
        if (!name || !roll || !studentClass) {
            return res.status(400).json({ success: false, message: "Name, Roll, and Class are required!" });
        }
        await Student.create({ name, roll, class: studentClass, section, mobile, fatherName });
        res.json({ success: true, message: 'Student added successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: "An error occurred while adding the student." });
    }
});

// 9. Get Students by Class (NEW - For Attendance & Marks)
app.get('/api/students/:class', async (req, res) => {
    try {
        const studentClass = req.params.class;
        // Find students and sort them by roll number
        const students = await Student.find({ class: studentClass }).sort({ roll: 1 });
        res.json({ success: true, students });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching students." });
    }
});

// 10. Save Attendance API (NEW)
app.post('/api/attendance/save', async (req, res) => {
    try {
        const { date, class: studentClass, records } = req.body;
        
        if (!date || !studentClass || !records) {
            return res.status(400).json({ success: false, message: "Missing required attendance data!" });
        }

        // If attendance already exists for this date and class, update it. Otherwise, create new.
        await Attendance.findOneAndUpdate(
            { date: date, class: studentClass },
            { records: records },
            { upsert: true, new: true }
        );

        res.json({ success: true, message: "Attendance saved successfully to MongoDB!" });
    } catch (error) {
        console.error('❌ Attendance Save Error:', error);
        res.status(500).json({ success: false, message: "Error saving attendance." });
    }
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});