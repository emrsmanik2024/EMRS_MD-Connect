// LocalStorage থেকে স্টুডেন্ট এবং অ্যাটেন্ডেন্স ডেটা আনা
let students = JSON.parse(localStorage.getItem('studentHub_students')) || [];
let attendanceRecords = JSON.parse(localStorage.getItem('studentHub_attendance')) || [];

// পেজ লোড হওয়ার সময় আজকের তারিখ সেট করে দেওয়া
window.onload = function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("attDate").value = today;
};

// নির্দিষ্ট ক্লাসের স্টুডেন্টদের লোড করা
function loadStudentsForAttendance() {
    const date = document.getElementById("attDate").value;
    const selectedClass = document.getElementById("attClass").value;

    if (!date || !selectedClass) {
        alert("Please select both Date and Class!");
        return;
    }

    // সিলেক্ট করা ক্লাসের স্টুডেন্টদের ফিল্টার করা
    const classStudents = students.filter(student => student.studentClass === selectedClass);
    
    const tableBody = document.getElementById("attendanceTableBody");
    tableBody.innerHTML = "";

    if (classStudents.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center;">No students found in ${selectedClass}.</td></tr>`;
    } else {
        classStudents.forEach(student => {
            // চেক করা হচ্ছে আগে থেকেই এই তারিখে অ্যাটেন্ডেন্স নেওয়া হয়েছে কিনা
            const recordId = `${date}_${selectedClass}_${student.roll}`;
            const existingRecord = attendanceRecords.find(record => record.id === recordId);
            
            // আগে থেকে সেভ করা থাকলে সেই স্ট্যাটাস দেখাবে, না হলে ডিফল্ট Present (P)
            const isAbsent = existingRecord && existingRecord.status === 'Absent' ? 'selected' : '';

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${student.roll}</td>
                <td>${student.name}</td>
                <td>
                    <select class="status-select" data-roll="${student.roll}" data-name="${student.name}" style="padding: 8px; border-radius: 4px; border: 1px solid #D1D5DB;">
                        <option value="Present">Present (P)</option>
                        <option value="Absent" ${isAbsent}>Absent (A)</option>
                    </select>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // টেবিল এরিয়া দেখানো
    document.getElementById("attendanceArea").style.display = "block";
}

// অ্যাটেন্ডেন্স সেভ করা
function saveAttendance() {
    const date = document.getElementById("attDate").value;
    const selectedClass = document.getElementById("attClass").value;
    const selects = document.querySelectorAll(".status-select");
    
    if (selects.length === 0) return;

    let successCount = 0;

    selects.forEach(select => {
        const roll = select.getAttribute("data-roll");
        const name = select.getAttribute("data-name");
        const status = select.value;
        const recordId = `${date}_${selectedClass}_${roll}`; // ইউনিক আইডি

        // আগের রেকর্ড ডিলিট করে নতুনটা আপডেট করা
        attendanceRecords = attendanceRecords.filter(record => record.id !== recordId);
        
        attendanceRecords.push({
            id: recordId,
            date: date,
            studentClass: selectedClass,
            roll: roll,
            name: name,
            status: status
        });
        
        successCount++;
    });

    // LocalStorage-এ সেভ করা
    localStorage.setItem('studentHub_attendance', JSON.stringify(attendanceRecords));
    alert(`Attendance saved successfully for ${successCount} students!`);
}