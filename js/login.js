let currentCaptchaTotal = 0;
let currentResetContact = ""; 

window.onload = function() {
    localStorage.removeItem('studentHub_loggedIn'); 
    generateCaptcha(); 
};

// 1. CAPTCHA Logic
function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1; 
    const num2 = Math.floor(Math.random() * 10) + 1;
    currentCaptchaTotal = num1 + num2;
    document.getElementById("captchaQuestion").innerText = `${num1} + ${num2} = `;
    document.getElementById("captchaAnswer").value = ""; 
}

// 2. Login Logic (সরাসরি সার্ভার চেক করবে)
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const captchaAns = parseInt(document.getElementById("captchaAnswer").value);

    // প্রথমে ক্যাপচা মেলানো
    if (captchaAns !== currentCaptchaTotal) {
        showError("Incorrect Math Answer! Please try again.");
        generateCaptcha();
        return;
    }

    try {
        // সার্ভারে ইমেইল ও পাসওয়ার্ড পাঠানো চেক করার জন্য
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (data.success) {
            localStorage.setItem('studentHub_loggedIn', 'true');
            window.location.href = "index.html"; 
        } else {
            showError(data.message);
            document.getElementById("password").value = "";
            generateCaptcha();
        }
    } catch (error) {
        showError("Server Connection Error!");
    }
}

function showSection(sectionId) {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("forgotSection").style.display = "none";
    document.getElementById("otpSection").style.display = "none";
    document.getElementById("resetSection").style.display = "none";
    hideMessages();
    document.getElementById(sectionId).style.display = "block";
    if(sectionId === 'loginForm') generateCaptcha();
}

// 3. Forgot Password & OTP API Calls
async function sendOTP(event) {
    event.preventDefault();
    const contact = document.getElementById("resetContact").value.trim();

    // আপাতত ডিফল্ট অ্যাডমিন ইমেইল বা নাম্বারের সাথে মেলাচ্ছি
    if (contact === "admin@studenthub.com" || contact === "01700000000") {
        currentResetContact = contact; 
        
        try {
            const response = await fetch('/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contact: contact })
            });
            const data = await response.json();
            
            if(data.success) {
                showSuccess("An OTP has been sent! Check your Server Terminal.");
                showSection('otpSection');
            }
        } catch (error) {
            showError("Server Error! Make sure Node.js server is running.");
        }
    } else {
        showError("Contact details not found in our system!");
    }
}

async function verifyOTP(event) {
    event.preventDefault();
    const enteredOTP = document.getElementById("otpInput").value;

    try {
        const response = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contact: currentResetContact, otp: enteredOTP })
        });
        const data = await response.json();

        if (data.success) {
            showSection('resetSection');
            showSuccess("OTP Verified! Now you can login with your credentials or update password later.");
        } else {
            showError("Invalid OTP! Please try again.");
        }
    } catch (error) {
        showError("Server Error!");
    }
}

function resetPassword(event) {
    event.preventDefault();
    const newPass = document.getElementById("newPassword").value;
    const confirmPass = document.getElementById("confirmPassword").value;

    if (newPass.length < 5) {
        showError("Password must be at least 5 characters long!");
        return;
    }

    if (newPass === confirmPass) {
        showSuccess("Password changed successfully! You can now log in.");
        showSection('loginForm');
    } else {
        showError("Passwords do not match!");
    }
}

function showError(msg) {
    document.getElementById("loginSuccess").style.display = "none";
    const errObj = document.getElementById("loginError");
    errObj.innerText = msg;
    errObj.style.display = "block";
}

function showSuccess(msg) {
    document.getElementById("loginError").style.display = "none";
    const succObj = document.getElementById("loginSuccess");
    succObj.innerText = msg;
    succObj.style.display = "block";
}

function hideMessages() {
    document.getElementById("loginError").style.display = "none";
    document.getElementById("loginSuccess").style.display = "none";
}