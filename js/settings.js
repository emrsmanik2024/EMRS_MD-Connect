window.onload = function() {
    // ডাইনামিক Academic Year তৈরি (বর্তমান সাল থেকে আগামী ১০ বছর)
    const yearSelect = document.getElementById("academicYear");
    const currentYear = new Date().getFullYear();
    
    // আগের ১ বছর থেকে শুরু করে আগামী ১০ বছর পর্যন্ত লুপ চালানো হলো
    for (let i = -1; i <= 10; i++) {
        let startYear = currentYear + i;
        let endYear = startYear + 1;
        let option = document.createElement("option");
        option.value = `${startYear}-${endYear}`;
        option.text = `${startYear}-${endYear}`;
        yearSelect.appendChild(option);
    }

    // LocalStorage থেকে আগের সেভ করা ডেটা ফর্মে বসানো
    const schoolInfo = JSON.parse(localStorage.getItem('studentHub_schoolInfo')) || {};
    
    if (schoolInfo.name) document.getElementById("schoolName").value = schoolInfo.name;
    if (schoolInfo.address) document.getElementById("schoolAddress").value = schoolInfo.address;
    if (schoolInfo.contact) document.getElementById("schoolContact").value = schoolInfo.contact;
    
    // যদি আগে কোনো সাল সেভ করা থাকে, সেটা সিলেক্ট করে দাও
    if (schoolInfo.year) {
        document.getElementById("academicYear").value = schoolInfo.year;
    }
};

function saveSchoolInfo() {
    const name = document.getElementById("schoolName").value.trim();
    const address = document.getElementById("schoolAddress").value.trim();
    const contact = document.getElementById("schoolContact").value.trim();
    const year = document.getElementById("academicYear").value;

    if (name === "") {
        alert("School Name is required!");
        return;
    }

    const schoolInfo = {
        name: name,
        address: address,
        contact: contact,
        year: year
    };

    localStorage.setItem('studentHub_schoolInfo', JSON.stringify(schoolInfo));
    alert("School Information updated successfully!");
}