function generateReport() {
    const selectedClass = document.getElementById("repClass").value;
    const examType = document.getElementById("repExamType").value;
    const examLabel = document.getElementById("repExamType").options[document.getElementById("repExamType").selectedIndex].text;

    if (!selectedClass) {
        alert("Please select a Class to generate the report!");
        return;
    }

    // LocalStorage থেকে ডাটাবেস আনা
    const students = JSON.parse(localStorage.getItem('studentHub_students')) || [];
    const marksRecords = JSON.parse(localStorage.getItem('studentHub_marks')) || [];
    const attendanceRecords = JSON.parse(localStorage.getItem('studentHub_attendance')) || [];
    const schoolInfo = JSON.parse(localStorage.getItem('studentHub_schoolInfo')) || {};

    // Settings থেকে স্কুলের ইনফরমেশন সেট করা
    document.getElementById("printSchoolName").innerText = schoolInfo.name || "StudentHub Public School";
    document.getElementById("printSchoolAddress").innerText = schoolInfo.address || "";
    document.getElementById("printAcademicYear").innerText = schoolInfo.year ? `(${schoolInfo.year})` : "";
    document.getElementById("printExamClass").innerText = `Class: ${selectedClass} | Exam: ${examLabel}`;

    // নির্দিষ্ট ক্লাসের স্টুডেন্টদের ফিল্টার করা
    const classStudents = students.filter(student => student.studentClass === selectedClass);
    
    const tableBody = document.getElementById("reportTableBody");
    tableBody.innerHTML = "";

    if (classStudents.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No students found in ${selectedClass}.</td></tr>`;
        document.getElementById("reportArea").style.display = "block";
        return;
    }

    classStudents.forEach(student => {
        // মার্কস খোঁজা
        const markId = `${examType}_${selectedClass}_${student.roll}`;
        const studentMarks = marksRecords.find(r => r.id === markId) || { total: 'N/A', percent: 'N/A', grade: '-' };

        // অ্যাটেন্ডেন্স হিসাব করা
        const classAttendance = attendanceRecords.filter(r => r.studentClass === selectedClass);
        const uniqueDates = [...new Set(classAttendance.map(item => item.date))];
        const totalClasses = uniqueDates.length;
        const presentDays = classAttendance.filter(r => r.roll === student.roll && r.status === 'Present').length;
        
        let attPercent = "0%";
        if (totalClasses > 0) {
            attPercent = ((presentDays / totalClasses) * 100).toFixed(1) + "%";
        } else {
            attPercent = "N/A"; 
        }

        // টেবিলে ডেটা বসানো
        const row = document.createElement("tr");
        row.innerHTML = `
            <td style="text-align: center;">${student.roll}</td>
            <td style="font-weight: 500;">${student.name}</td>
            <td style="text-align: center;">${student.section || '-'}</td>
            <td style="text-align: center; font-weight: bold;">${studentMarks.total}</td>
            <td style="text-align: center;">${studentMarks.percent !== 'N/A' ? studentMarks.percent + '%' : 'N/A'}</td>
            <td style="text-align: center;">
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; color: white; background: ${getGradeColor(studentMarks.grade)}">
                    ${studentMarks.grade}
                </span>
            </td>
            <td style="text-align: center;">${attPercent}</td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById("reportArea").style.display = "block";
}

function getGradeColor(grade) {
    if (grade === "A+") return "#10B981";
    if (grade === "A") return "#3B82F6";
    if (grade === "A-") return "#6366F1";
    if (grade === "B") return "#F59E0B";
    if (grade === "C") return "#8B5CF6";
    if (grade === "F") return "#EF4444";
    return "#6B7280"; 
}