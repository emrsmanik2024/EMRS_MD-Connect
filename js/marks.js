let students = JSON.parse(localStorage.getItem('studentHub_students')) || [];
let marksRecords = JSON.parse(localStorage.getItem('studentHub_marks')) || [];

function loadStudentsForMarks() {
    const selectedClass = document.getElementById("markClass").value;
    const examType = document.getElementById("examType").value;

    if (!selectedClass) {
        alert("Please select a Class!");
        return;
    }

    const classStudents = students.filter(student => student.studentClass === selectedClass);
    const tableBody = document.getElementById("marksTableBody");
    tableBody.innerHTML = "";

    if (classStudents.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="12" style="text-align:center;">No students found.</td></tr>`;
        document.getElementById("marksArea").style.display = "block";
        return;
    }

    classStudents.forEach(student => {
        // আগে থেকে সেভ করা মার্কস খোঁজা
        const recordId = `${examType}_${selectedClass}_${student.roll}`;
        const existingRecord = marksRecords.find(r => r.id === recordId) || { 
            eng: '', hin: '', ben: '', math: '', sci: '', sst: '', ai: '', total: 0, percent: 0, grade: '-' 
        };

        const row = document.createElement("tr");
        row.setAttribute("data-roll", student.roll);
        row.setAttribute("data-name", student.name);

        row.innerHTML = `
            <td>${student.roll}</td>
            <td style="text-align: left; font-weight: 500;">${student.name}</td>
            <td><input type="number" class="mark-input eng" value="${existingRecord.eng}" onkeyup="calculateRow(this)"></td>
            <td><input type="number" class="mark-input hin" value="${existingRecord.hin}" onkeyup="calculateRow(this)"></td>
            <td><input type="number" class="mark-input ben" value="${existingRecord.ben}" onkeyup="calculateRow(this)"></td>
            <td><input type="number" class="mark-input math" value="${existingRecord.math}" onkeyup="calculateRow(this)"></td>
            <td><input type="number" class="mark-input sci" value="${existingRecord.sci}" onkeyup="calculateRow(this)"></td>
            <td><input type="number" class="mark-input sst" value="${existingRecord.sst}" onkeyup="calculateRow(this)"></td>
            <td><input type="number" class="mark-input ai" value="${existingRecord.ai}" onkeyup="calculateRow(this)"></td>
            
            <td class="result-text total-val">${existingRecord.total}</td>
            <td class="result-text percent-val">${existingRecord.percent}%</td>
            <td><span class="grade-badge" style="background: ${getGradeColor(existingRecord.grade)}">${existingRecord.grade}</span></td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById("marksArea").style.display = "block";
}

// অটোমেটিক ক্যালকুলেশন ফাংশন
function calculateRow(inputElement) {
    const row = inputElement.closest("tr");
    
    // ভ্যালুগুলো নেওয়া (খালি থাকলে 0 ধরা হবে)
    const eng = Number(row.querySelector(".eng").value) || 0;
    const hin = Number(row.querySelector(".hin").value) || 0;
    const ben = Number(row.querySelector(".ben").value) || 0;
    const math = Number(row.querySelector(".math").value) || 0;
    const sci = Number(row.querySelector(".sci").value) || 0;
    const sst = Number(row.querySelector(".sst").value) || 0;
    const ai = Number(row.querySelector(".ai").value) || 0;

    // টোটাল এবং পারসেন্টেজ (৭টি সাবজেক্ট = ৭০০ মার্কস)
    const total = eng + hin + ben + math + sci + sst + ai;
    const percent = (total / 700) * 100;

    // গ্রেড নির্ধারণ
    let grade = "F";
    let color = "#EF4444"; // Red

    if (percent >= 80) { grade = "A+"; color = "#10B981"; } 
    else if (percent >= 70) { grade = "A"; color = "#3B82F6"; } 
    else if (percent >= 60) { grade = "A-"; color = "#6366F1"; } 
    else if (percent >= 50) { grade = "B"; color = "#F59E0B"; } 
    else if (percent >= 40) { grade = "C"; color = "#8B5CF6"; } 

    // টেবিলে রেজাল্ট আপডেট করা
    row.querySelector(".total-val").innerText = total;
    row.querySelector(".percent-val").innerText = percent.toFixed(2) + "%";
    
    const gradeBadge = row.querySelector(".grade-badge");
    gradeBadge.innerText = grade;
    gradeBadge.style.background = color;
}

// গ্রেডের কালার হেল্পার ফাংশন
function getGradeColor(grade) {
    if (grade === "A+") return "#10B981";
    if (grade === "A") return "#3B82F6";
    if (grade === "A-") return "#6366F1";
    if (grade === "B") return "#F59E0B";
    if (grade === "C") return "#8B5CF6";
    if (grade === "F") return "#EF4444";
    return "#6B7280"; // Default
}

// সব মার্কস একসাথে সেভ করা
function saveAllMarks() {
    const selectedClass = document.getElementById("markClass").value;
    const examType = document.getElementById("examType").value;
    const rows = document.querySelectorAll("#marksTableBody tr");

    let successCount = 0;

    rows.forEach(row => {
        if (!row.getAttribute("data-roll")) return; // Empty row check

        const roll = row.getAttribute("data-roll");
        const name = row.getAttribute("data-name");
        const recordId = `${examType}_${selectedClass}_${roll}`;

        const eng = row.querySelector(".eng").value;
        const hin = row.querySelector(".hin").value;
        const ben = row.querySelector(".ben").value;
        const math = row.querySelector(".math").value;
        const sci = row.querySelector(".sci").value;
        const sst = row.querySelector(".sst").value;
        const ai = row.querySelector(".ai").value;
        
        const total = row.querySelector(".total-val").innerText;
        const percent = parseFloat(row.querySelector(".percent-val").innerText);
        const grade = row.querySelector(".grade-badge").innerText;

        // আগের রেকর্ড ডিলিট করে নতুনটা আপডেট করা
        marksRecords = marksRecords.filter(r => r.id !== recordId);

        marksRecords.push({
            id: recordId, examType, studentClass: selectedClass, roll, name,
            eng, hin, ben, math, sci, sst, ai, total, percent, grade
        });

        successCount++;
    });

    localStorage.setItem('studentHub_marks', JSON.stringify(marksRecords));
    alert(`Marks for ${examType} saved successfully!`);
}