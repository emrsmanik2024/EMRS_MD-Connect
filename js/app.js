window.onload = function() {
    updateDashboardStats();
};

let myStudentChart; // চার্ট ভেরিয়েবল গ্লোবালি রাখা হলো যাতে পরে আপডেট করা যায়

function updateDashboardStats() {
    let students = JSON.parse(localStorage.getItem('studentHub_students')) || [];
    let attendanceRecords = JSON.parse(localStorage.getItem('studentHub_attendance')) || [];

    // 1. Total Students আপডেট
    document.getElementById('dashTotalStudents').innerText = students.length;

    // 2. Present Today আপডেট
    const today = new Date().toISOString().split('T')[0];
    const presentCount = attendanceRecords.filter(record => record.date === today && record.status === 'Present').length;
    document.getElementById('dashPresentToday').innerText = presentCount;

    // 3. Recent Activity আপডেট
    const activityText = document.getElementById('recentActivity');
    if (students.length > 0) {
        const lastStudent = students[students.length - 1];
        activityText.innerHTML = `✅ New student <strong>${lastStudent.name}</strong> (Roll: ${lastStudent.roll}) was recently added in <strong>${lastStudent.studentClass}</strong>.`;
    } else {
        activityText.innerText = "No students in the database yet. Go to the 'Students' menu to add new students.";
    }

    // ==========================================
    // CHART GENERATION LOGIC (Class-wise Students)
    // ==========================================
    
    // কোন ক্লাসে কতজন স্টুডেন্ট আছে সেটা কাউন্ট করা
    const classCounts = {};
    students.forEach(student => {
        let cls = student.studentClass;
        classCounts[cls] = (classCounts[cls] || 0) + 1;
    });

    // চার্টের জন্য ডেটা এবং লেবেল রেডি করা
    const labels = Object.keys(classCounts); // যেমন: ["Class VI", "Class VII"]
    const data = Object.values(classCounts); // যেমন: [15, 20]

    // Total Classes কার্ডটাও ডাইনামিক করে দেওয়া হলো
    document.getElementById('dashTotalClasses').innerText = labels.length;

    // Canvas ধরা
    const ctx = document.getElementById('studentChart').getContext('2d');

    // আগে যদি চার্ট থাকে, সেটা ডিলিট করে নতুনটা বানাবে (যাতে রিলোডে ঝামেলা না হয়)
    if (myStudentChart) {
        myStudentChart.destroy();
    }

    // নতুন চার্ট তৈরি
    myStudentChart = new Chart(ctx, {
        type: 'bar', // Bar chart
        data: {
            labels: labels.length > 0 ? labels : ['No Data'],
            datasets: [{
                label: 'Number of Students',
                data: data.length > 0 ? data : [0],
                backgroundColor: [
                    '#4F46E5', // Indigo
                    '#10B981', // Green
                    '#3B82F6', // Blue
                    '#F59E0B', // Yellow
                    '#8B5CF6', // Purple
                    '#EC4899'  // Pink
                ],
                borderRadius: 6 // বারের মাথাটা সুন্দর গোল করার জন্য
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // ক্যানভাসের সাইজ অনুযায়ী ফিট হওয়ার জন্য
            plugins: {
                legend: {
                    display: false // ওপরের লেবেলটা হাইড করা হলো ক্লিন লুকের জন্য
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1 // মানুষ তো আর ১.৫ জন হতে পারে না, তাই পূর্ণসংখ্যা রাখা হলো
                    }
                }
            }
        }
    });
}