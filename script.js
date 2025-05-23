window.onload = loadData;

function addSubject(name = '', marks = '', credits = '') {
  const tbody = document.getElementById("subjectList");
  const row = document.createElement("tr");

  row.innerHTML = `
    <td><input type="text" value="${name}" placeholder="Subject" onchange="saveData()"></td>
    <td><input type="number" value="${marks}" placeholder="Marks" oninput="updateGrades(); saveData();"></td>
    <td><input type="number" value="${credits}" placeholder="Credits" oninput="updateGrades(); saveData();"></td>
    <td class="grade">-</td>
    <td class="point">-</td>
    <td><button onclick="removeRow(this)">❌</button></td>
  `;
  tbody.appendChild(row);
}

function removeRow(btn) {
  btn.closest("tr").remove();
  updateGrades();
  saveData();
}

function getGradeAndPoint(marks, scale) {
  if (scale === "10") {
    if (marks >= 90) return ["A+", 10];
    if (marks >= 80) return ["A", 9];
    if (marks >= 70) return ["B+", 8];
    if (marks >= 60) return ["B", 7];
    if (marks >= 50) return ["C", 6];
    if (marks >= 40) return ["D", 5];
    return ["F", 0];
  } else if (scale === "4") {
    if (marks >= 90) return ["A", 4.0];
    if (marks >= 80) return ["B", 3.0];
    if (marks >= 70) return ["C", 2.0];
    if (marks >= 60) return ["D", 1.0];
    return ["F", 0];
  } else {
    if (marks >= 90) return ["Excellent", 90];
    if (marks >= 75) return ["Very Good", 75];
    if (marks >= 60) return ["Good", 60];
    if (marks >= 50) return ["Average", 50];
    return ["Fail", 0];
  }
}

function updateGrades() {
  const rows = document.querySelectorAll("#subjectList tr");
  const scale = document.getElementById("gradeScale").value;

  rows.forEach(row => {
    const marks = parseFloat(row.cells[1].querySelector("input").value);
    const gradeCell = row.querySelector(".grade");
    const pointCell = row.querySelector(".point");

    if (!isNaN(marks)) {
      const [grade, point] = getGradeAndPoint(marks, scale);
      gradeCell.textContent = grade;
      pointCell.textContent = point;
    } else {
      gradeCell.textContent = "-";
      pointCell.textContent = "-";
    }
  });

  updateChart();
}

function calculateGPA() {
  const rows = document.querySelectorAll("#subjectList tr");
  let totalPoints = 0, totalCredits = 0;

  rows.forEach(row => {
    const point = parseFloat(row.querySelector(".point").textContent);
    const credits = parseFloat(row.cells[2].querySelector("input").value);
    if (!isNaN(point) && !isNaN(credits)) {
      totalPoints += point * credits;
      totalCredits += credits;
    }
  });

  const result = document.getElementById("result");
  if (totalCredits > 0) {
    const cgpa = (totalPoints / totalCredits).toFixed(2);
    result.textContent = `🎯 Your CGPA is: ${cgpa}`;
  } else {
    result.textContent = "⚠️ Please enter valid marks and credits.";
  }
}

function resetForm() {
  localStorage.removeItem("subjects");
  document.getElementById("subjectList").innerHTML = "";
  document.getElementById("result").textContent = "";
  updateChart();
}

function saveData() {
  const rows = document.querySelectorAll("#subjectList tr");
  const data = [];

  rows.forEach(row => {
    const subject = row.cells[0].querySelector("input").value;
    const marks = row.cells[1].querySelector("input").value;
    const credits = row.cells[2].querySelector("input").value;
    if (subject || marks || credits) {
      data.push({ subject, marks, credits });
    }
  });

  localStorage.setItem("subjects", JSON.stringify(data));
  localStorage.setItem("gradeScale", document.getElementById("gradeScale").value);
}

function loadData() {
  const data = JSON.parse(localStorage.getItem("subjects") || "[]");
  const scale = localStorage.getItem("gradeScale") || "10";
  document.getElementById("gradeScale").value = scale;
  data.forEach(sub => addSubject(sub.subject, sub.marks, sub.credits));
  updateGrades();
}

let chart;
function updateChart() {
  const rows = document.querySelectorAll("#subjectList tr");
  const labels = [];
  const marks = [];

  rows.forEach(row => {
    const subject = row.cells[0].querySelector("input").value;
    const mark = parseFloat(row.cells[1].querySelector("input").value);
    if (subject && !isNaN(mark)) {
      labels.push(subject);
      marks.push(mark);
    }
  });

  const ctx = document.getElementById("barChart").getContext("2d");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Marks',
        data: marks,
        backgroundColor: '#4CAF50',
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });
}
