let students = JSON.parse(localStorage.getItem('studentHub_students')) || [];
let editIndex = -1; 

window.onload = function() {
    populateClassFilter(); // পেজ লোড হওয়ার সাথে সাথে ড্রপডাউন রেডি করবে
    displayStudents();
};

// ==========================================
// Dynamic Class Filter Logic
// ==========================================
function populateClassFilter() {
    const filterSelect = document.getElementById("filterClass");
    const currentSelection = filterSelect.value; 
    
    // ডাটাবেস থেকে ইউনিক ক্লাসের নামগুলো খুঁজে বের করা
    const uniqueClasses = [...new Set(students.map(s => s.studentClass))].filter(Boolean).sort();
    
    // ড্রপডাউন রিসেট করা
    filterSelect.innerHTML = '<option value="All">All Classes</option>';
    
    // অপশনগুলো অ্যাড করা
    uniqueClasses.forEach(cls => {
        const opt = document.createElement("option");
        opt.value = cls;
        opt.text = cls;
        filterSelect.appendChild(opt);
    });
    
    // আগের সিলেক্ট করা ক্লাসটা ধরে রাখা (যদি থাকে)
    if(uniqueClasses.includes(currentSelection)) {
        filterSelect.value = currentSelection;
    }
}

function filterStudents() {
    const searchText = document.getElementById("searchStudent").value.toLowerCase();
    const filterClass = document.getElementById("filterClass").value;

    const filtered = students.filter(function(student) {
        const matchNameRoll = student.name.toLowerCase().includes(searchText) || student.roll.toLowerCase().includes(searchText);
        const matchClass = (filterClass === "All") || (student.studentClass === filterClass);
        
        return matchNameRoll && matchClass;
    });

    displayStudents(filtered);
}

// ==========================================
// Core UI Logic
// ==========================================
function showStudentForm() {
    document.getElementById("studentForm").style.display = "block";
    document.getElementById("studentList").style.display = "none";
    document.getElementById("formTitle").innerText = "Add New Student";
    document.getElementById("saveBtn").innerText = "Save Student";
}

function hideStudentForm() {
    document.getElementById("studentForm").style.display = "none";
    document.getElementById("studentList").style.display = "block";
    clearForm();
    editIndex = -1; 
}

function showStudentList() {
    hideStudentForm();
    displayStudents();
}

function saveStudent() {
    const name = document.getElementById("studentName").value.trim();
    const roll = document.getElementById("rollNumber").value.trim();
    const studentClass = document.getElementById("studentClass").value;
    const section = document.getElementById("section").value.trim();
    const father = document.getElementById("fatherName").value.trim();
    const mobile = document.getElementById("mobile").value.trim();

    if (name === "" || roll === "" || studentClass === "") {
        alert("Please enter Name, Roll Number, and Class.");
        return;
    }

    const student = { name, roll, studentClass, section, father, mobile };
    
    if (editIndex === -1) {
        students.push(student);
        alert("Student saved successfully!");
    } else {
        students[editIndex] = student;
        alert("Student updated successfully!");
        editIndex = -1; 
    }

    localStorage.setItem('studentHub_students', JSON.stringify(students));
    
    populateClassFilter(); // নতুন স্টুডেন্ট অ্যাড হলে ফিল্টার আপডেট
    clearForm();
    showStudentList();
}

function displayStudents(list = students) {
    const table = document.getElementById("studentTable");
    table.innerHTML = "";

    if (list.length === 0) {
        table.innerHTML = "<tr><td colspan='6' style='text-align:center; padding: 20px;'>No students found matching your criteria.</td></tr>";
        return;
    }

    list.forEach(function(student, index) {
        const originalIndex = students.indexOf(student); 

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.roll}</td>
            <td>${student.studentClass}</td>
            <td>${student.section || '-'}</td>
            <td>${student.mobile || '-'}</td>
            <td>
                <button class="btn btn-primary" style="padding: 6px 12px; font-size: 12px; margin-right: 5px;" onclick="editStudent(${originalIndex})">Edit</button>
                <button class="btn btn-danger" onclick="deleteStudent(${originalIndex})">Delete</button>
            </td>
        `;
        table.appendChild(row);
    });
}

function editStudent(index) {
    editIndex = index; 
    const student = students[index];

    document.getElementById("studentName").value = student.name;
    document.getElementById("rollNumber").value = student.roll;
    document.getElementById("studentClass").value = student.studentClass;
    document.getElementById("section").value = student.section;
    document.getElementById("fatherName").value = student.father;
    document.getElementById("mobile").value = student.mobile;

    document.getElementById("studentForm").style.display = "block";
    document.getElementById("studentList").style.display = "none";
    document.getElementById("formTitle").innerText = "Edit Student";
    document.getElementById("saveBtn").innerText = "Update Student";
}

function deleteStudent(index) {
    if (confirm("Are you sure you want to delete this student?")) {
        students.splice(index, 1);
        localStorage.setItem('studentHub_students', JSON.stringify(students));
        
        populateClassFilter(); // ডিলিট হওয়ার পর ফিল্টার আপডেট
        filterStudents(); // কারেন্ট ফিল্টার অনুযায়ী পেজ রিফ্রেশ
    }
}

function clearForm() {
    document.getElementById("studentName").value = "";
    document.getElementById("rollNumber").value = "";
    document.getElementById("studentClass").value = "";
    document.getElementById("section").value = "";
    document.getElementById("fatherName").value = "";
    document.getElementById("mobile").value = "";
}

// ==========================================
// Excel/CSV Import Logic
// ==========================================
function handleExcelUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const json_data = XLSX.utils.sheet_to_json(worksheet);
        
        if (json_data.length === 0) {
            alert("The file is empty or formatted incorrectly!");
            return;
        }

        let successCount = 0;
        
        json_data.forEach(row => {
            const getVal = (keyStr) => {
                const foundKey = Object.keys(row).find(k => k.toLowerCase().includes(keyStr.toLowerCase()));
                return foundKey ? String(row[foundKey]).trim() : "";
            };

            const name = getVal("name") || getVal("student");
            const roll = getVal("roll");
            let rawClass = getVal("class");
            const section = getVal("section");
            const father = getVal("father");
            const mobile = getVal("mobile") || getVal("phone");

            let finalClass = "";
            if (rawClass) {
                let cleanClass = rawClass.toUpperCase().replace("CLASS", "").trim();
                finalClass = "Class " + cleanClass;
            }

            if (name && roll && finalClass) {
                students.push({
                    name: name,
                    roll: roll,
                    studentClass: finalClass,
                    section: section,
                    father: father,
                    mobile: mobile
                });
                successCount++;
            }
        });

        localStorage.setItem('studentHub_students', JSON.stringify(students));
        
        populateClassFilter(); // আপলোডের পর ফিল্টার আপডেট
        displayStudents();
        
        alert(`Success! ${successCount} students imported from Excel.`);
        event.target.value = "";
    };
    
    reader.readAsArrayBuffer(file);
}