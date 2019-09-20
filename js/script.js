let empTables = document.querySelector(".employee-table");
let buttons; // will be used for pagination
const employeesPerPage = 8;
const pagination = document.querySelector(".pagination");

const search = document.querySelector("[name=search]");
const sortByRestDays = document.querySelector("[name=days-for-rest]");
const onHoliday = document.querySelector(".on-holiday");
const choose = document.querySelector(".choose");

const dbase = fetch("../employee.json").then(data => data.json());

// employee card html structure

function createCards(arr) {
  empTables.innerHTML = "";
  return arr.map(emp => {
    return (empTables.innerHTML += `
      <div class="card">
        <div class="img-info">
          <img src="${emp.picture}">
        </div>
        <div class="basic-info">
          <h1>${emp.name}</h1>
          <p class="age">age: ${emp.age},</p>
          <p class="gender">${emp.gender}</p>
        </div>
        <div class="contact">${emp.contact.map(contact => {
          const info = `
          <p class="mail"><i class="far fa-envelope"></i> ${contact.email}</p>
          <p class="phone"><i class="fas fa-phone"></i> ${contact.phone}</p>
          `;
          return info;
        })}</div>
        <div class="vacation-info">
          <p>Use holiday currently: ${
            emp.onVacation ? '<i class="fas fa-check"></i>' : `<span>No!</span>`
          }</p>
          <p>Holiday fond days: <span>${emp.vacationDays}<span></p>
        </div>
        <div class="salary">
          <p>Salary: <span>${emp.salary}</span><p>
        </div>
      </div>
      `);
  });
}

// pagination

// creates paginations with cards
function createPagination(numbersOfPages, arr) {
  for (var i = 1; i <= numbersOfPages; i++) {
    let newButton = document.createElement("button");
    newButton.textContent = i;
    newButton.classList.add(`button-${i}`);
    pagination.append(newButton);
  }
  buttons = document.querySelectorAll("[class^=button]");
  buttons[0].classList.add("active");
  for (var i = 0; i < buttons.length; i++) {
    if (buttons[i].classList.contains("active")) {
      const pagList = arr.slice(i, i + employeesPerPage);
      createCards(pagList);
    }
  }
}

// functional buttons

function buttonsActivated(buttons, base) {
  buttons.forEach(button =>
    button.addEventListener("click", function() {
      buttons.forEach(button => button.classList.remove("active"));
      this.classList.add("active");
      for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].classList.contains("active")) {
          const pagList =
            i == 0
              ? base.slice(i, i + employeesPerPage)
              : base.slice(
                  i * employeesPerPage,
                  i * employeesPerPage + employeesPerPage
                );
          createCards(pagList);
        }
      }
    })
  );
}

dbase.then(data => {
  const pagNum = Math.ceil(data.length / employeesPerPage);
  createPagination(pagNum, data);
  buttonsActivated(buttons, data);
});

// search - dinamicnije trazenje ce biti mozda malo sporije ali katkad ne skodi :)

search.addEventListener("input", function() {
  // ban na manje smisleno sortiranje :)
  if (search.value) {
    sortByRestDays.style.cursor = "not-allowed";
    sortByRestDays.disabled = true;
  }
  function filterNames(arr, inpt) {
    const foundNames =
      inpt.length >= 1
        ? arr.filter(employee => {
            if (employee.name.toLowerCase().includes(inpt)) {
              return employee;
            }
          })
        : arr;
    if (foundNames.length == 0) {
      empTables.innerHTML = "NO MATCH";
    }
    const pagNum = Math.ceil(foundNames.length / employeesPerPage);
    pagination.innerHTML = "";
    createPagination(pagNum, foundNames);
    createCards(foundNames);
  }
  dbase.then(data => filterNames(data, search.value));
});

// sort employees

sortByRestDays.addEventListener("change", function() {
  if (this.value === "least") {
    choose.textContent = "Reset";
    dbase.then(data => {
      fromLeast = data.sort((x, y) => {
        return x.vacationDays - y.vacationDays;
      });
      createCards(fromLeast.slice(0, employeesPerPage));
      buttons.forEach(button => {
        button.classList.remove("active");
      });
      buttons[0].classList.add("active");
    });
  } else if (this.value === "most") {
    choose.textContent = "Reset";
    dbase.then(data => {
      fromMost = data.sort((x, y) => {
        return y.vacationDays - x.vacationDays;
      });
      createCards(fromMost.slice(0, employeesPerPage));
      buttons.forEach(button => {
        button.classList.remove("active");
      });
      buttons[0].classList.add("active");
    });
  } else {
    location.reload();
  }
});

// filter people who are currently use vacation
onHoliday.addEventListener("click", function(e) {
  e.preventDefault();
  search.value = "";
  dbase.then(data => {
    const holidayPeople = data.filter(people => people.onVacation);
    const pagNum = Math.ceil(holidayPeople.length / employeesPerPage);
    pagination.innerHTML = "";
    createPagination(pagNum, data);
    createCards(holidayPeople.slice(0, employeesPerPage));
    buttonsActivated(buttons, holidayPeople);
  });
});
