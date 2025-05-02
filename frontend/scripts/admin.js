const navLinks = document.querySelectorAll(".admin-sidebar a");
const sections = document.querySelectorAll("main section");

// settings section
const save_tariff_btn = document.getElementById("save-tariff-btn");
const reset_tariff_btn = document.getElementById("reset-tariff-btn");

// bookings table

// edit btn
let allBookings = [];

async function loadBookings() {
  try {
    const res = await fetch("/api/bookings");
    const data = await res.json();
    allBookings = data;
    renderBookingsTable(allBookings);
  } catch (err) {
    console.error("Failed to load bookings", err);
  }
}

function attachBookingEditHandlers() {
  document.querySelectorAll(".booking-btn-edit").forEach((btn, index) => {
    btn.addEventListener("click", () => {
      const row = btn.closest("tr");
      const booking = allBookings[index];

      // замінюємо клітинки на input
      const inputs = {
        client: `<input type="text" value="${booking.client}">`,
        phone: `<input type="text" value="${booking.phone}">`,
        check_in_date: `<input type="date" value="${
          booking.check_in_date.split("T")[0]
        }">`,
        check_out_date: `<input type="date" value="${
          booking.check_out_date.split("T")[0]
        }">`,
        type: `
          <select>
            <option value="Only Car" ${
              booking.type === "Only Car" ? "selected" : ""
            }>Only Car</option>
            <option value="Car with Tent" ${
              booking.type === "Car with Tent" ? "selected" : ""
            }>Car with Tent</option>
          </select>
        `,
        amount: `<input type="number" value="${booking.amount}">`,
      };

      row.innerHTML = `
        <td>${inputs.client}</td>
        <td>${inputs.phone}</td>
        <td>${inputs.check_in_date}</td>
        <td>${inputs.check_out_date}</td>
        <td>${inputs.type}</td>
        <td>${inputs.amount}</td>
        <td>
          <div class="booking-actions">
            <button class="action-btn save booking-btn-save"><i class="fas fa-check"></i></button>
            <button class="action-btn cancel booking-btn-cancel"><i class="fas fa-times"></i></button>
          </div>
        </td>
      `;

      row
        .querySelector(".booking-btn-save")
        .addEventListener("click", async () => {
          const updated = {
            client_id: booking.client_id,
            client: row.querySelector("td:nth-child(1) input").value,
            phone: row.querySelector("td:nth-child(2) input").value,
            check_in_date: row.querySelector("td:nth-child(3) input").value,
            check_out_date: row.querySelector("td:nth-child(4) input").value,
            type: row.querySelector("td:nth-child(5) select").value,
            amount: row.querySelector("td:nth-child(6) input").value,
          };

          try {
            const res = await fetch(
              `/api/bookings/client/${updated.client_id}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated),
              }
            );

            if (res.ok) {
              // оновлюємо локальні дані
              allBookings[index] = updated;
              renderBookingsTable(allBookings);
            } else {
              alert("Не вдалося зберегти зміни");
            }
          } catch (err) {
            console.error("Save error:", err);
          }
        });

      row.querySelector(".booking-btn-cancel").addEventListener("click", () => {
        renderBookingsTable(allBookings);
      });
    });
  });
}

// delete btn
function attachBookingDeleteHandlers() {
  document.querySelectorAll(".booking-btn-delete").forEach((btn, index) => {
    btn.addEventListener("click", async () => {
      const booking = allBookings[index];
      if (
        confirm(`Ви дійсно хочете повністю видалити клієнта ${booking.client}?`)
      ) {
        try {
          console.log("Deleting client with ID:", booking.client_id);

          const res = await fetch(`/api/bookings/client/${booking.client_id}`, {
            method: "DELETE",
          });

          if (res.ok) {
            allBookings = allBookings.filter(
              (b) => b.client_id !== booking.client_id
            );
            renderBookingsTable(allBookings);
          } else {
            alert("Помилка при видаленні клієнта");
          }
        } catch (err) {
          console.error("Delete error:", err);
        }
      }
    });
  });
}

async function fetchBookings() {
  try {
    const res = await fetch("/api/bookings");
    allBookings = await res.json();
    renderBookingsTable(allBookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
  }
}

function renderBookingsTable(bookings) {
  const tbody = document.querySelector("#bookings-section tbody");
  tbody.innerHTML = "";

  bookings.forEach((booking) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${booking.client}</td>
      <td>${booking.phone}</td>
      <td>${formatDate(booking.check_in_date)}</td>
      <td>${formatDate(booking.check_out_date)}</td>
      <td>${booking.type}</td>
      <td>₴${booking.amount}</td>
      <td>
        <div class="booking-actions">
          <button class="booking-btn-edit"><i class="fas fa-edit"></i></button>
          <button class="booking-btn-delete"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
  attachBookingEditHandlers();
  attachBookingDeleteHandlers();
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return `${String(date.getDate()).padStart(2, "0")}.${String(
    date.getMonth() + 1
  ).padStart(2, "0")}.${date.getFullYear()}`;
}

document.addEventListener("DOMContentLoaded", function () {
  function switchSection(sectionId) {
    sections.forEach((section) => {
      section.classList.remove("active-section");
    });

    const activeSection = document.getElementById(`${sectionId}-section`);
    if (activeSection) {
      activeSection.classList.add("active-section");
    }

    navLinks.forEach((link) => {
      link.parentElement.classList.remove("active");
      if (link.getAttribute("href") === `#${sectionId}`) {
        link.parentElement.classList.add("active");
      }
    });
    history.pushState(null, "", `#${sectionId}`);
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const sectionId = this.getAttribute("href").substring(1);
      switchSection(sectionId);
    });
  });

  window.addEventListener("hashchange", function () {
    const sectionId = window.location.hash.substring(1);
    switchSection(sectionId);
  });

  const initialSectionId = window.location.hash.substring(1) || "bookings";
  switchSection(initialSectionId);

  // Bookings таблиця БД
  fetchBookings();
  loadBookings();
  const searchInput = document.querySelector(".bookings-search");
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    const filtered = allBookings.filter(
      (b) => b.client.toLowerCase().includes(term) || b.phone.includes(term)
    );
    renderBookingsTable(filtered);
  });

  attachBookingDeleteHandlers();
  attachBookingEditHandlers();

  // Expenses таблиця БД
  const loadExpenses = () => {
    fetch("/api/expenses")
      .then((response) => response.json())
      .then((data) => {
        const tbody = document.querySelector(".expenses-table tbody");
        tbody.innerHTML = "";

        const categoryFilter = document.getElementById(
          "expense-category-filter"
        ).value;
        console.log("Selected category:", categoryFilter);

        const categoryMapping = {
          rent: "Оренда землі",
          internet: "Інтернет",
          utilities: "Комунальні послуги",
          salaries: "Зарплата",
        };

        const categoryFilterMapped = categoryMapping[categoryFilter] || "all";

        console.log("Mapped category:", categoryFilterMapped);

        const filteredData =
          categoryFilterMapped === "all"
            ? data
            : data.filter(
                (expense) => expense.category === categoryFilterMapped
              );

        console.log("Filtered data:", filteredData);

        filteredData.forEach((expense) => {
          const tr = document.createElement("tr");

          tr.innerHTML = `
            <td>${new Date(expense.date).toLocaleDateString()}</td>
            <td>${expense.category}</td>
            <td>${expense.description}</td>
            <td>₴${expense.amount}</td>
            <td>
              <button class="action-btn edit" data-id="${expense.expense_id}">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn delete" data-id="${expense.expense_id}">
                <i class="fas fa-trash"></i>
              </button>
            </td>`;

          tbody.appendChild(tr);
        });

        // Delete button listeners
        document.querySelectorAll(".action-btn.delete").forEach((button) => {
          button.addEventListener("click", () => {
            const id = button.dataset.id;

            if (confirm("Are you sure you want to delete this expense?")) {
              fetch(`/api/expenses/${id}`, {
                method: "DELETE",
              })
                .then((response) => {
                  if (response.ok) {
                    loadExpenses();
                  } else {
                    alert("Failed to delete expense.");
                  }
                })
                .catch((error) =>
                  console.error("Error deleting expense:", error)
                );
            }
          });
        });

        // Edit button listeners
        document.querySelectorAll(".action-btn.edit").forEach((button) => {
          button.addEventListener("click", () => {
            const tr = button.closest("tr");
            const id = button.dataset.id;

            const cells = tr.querySelectorAll("td");
            const date = new Date(cells[0].innerText)
              .toISOString()
              .split("T")[0];
            const category = cells[1].innerText;
            const description = cells[2].innerText;
            const amount = cells[3].innerText.replace(/[₴\s]/g, "");

            tr.innerHTML = `
              <td><input type="date" value="${date}"></td>
              <td><input type="text" value="${category}"></td>
              <td><input type="text" value="${description}"></td>
              <td><input type="number" value="${amount}"></td>
              <td>
                <button class="action-btn save"><i class="fas fa-check"></i></button>
                <button class="action-btn cancel"><i class="fas fa-times"></i></button>
              </td>
            `;

            // Save button
            tr.querySelector(".save").addEventListener("click", () => {
              const inputs = tr.querySelectorAll("input");
              const updatedExpense = {
                date: inputs[0].value,
                category: inputs[1].value,
                description: inputs[2].value,
                amount: parseFloat(inputs[3].value),
              };

              fetch(`/api/expenses/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedExpense),
              }).then((response) => {
                if (response.ok) loadExpenses();
                else alert("Failed to update");
              });
            });

            // Cancel button
            tr.querySelector(".cancel").addEventListener("click", () => {
              loadExpenses();
            });
          });
        });
      })
      .catch((error) => {
        console.error("Error loading expenses:", error);
      });
  };

  loadExpenses();
  document
    .getElementById("expense-category-filter")
    .addEventListener("change", loadExpenses);

  // Tariffs таблиця БД
  // Функція для завантаження останнього тарифу
  const loadTariffs = () => {
    fetch("/api/tariffs")
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          document.getElementById("tariff-id").value = data.tariff_id || "";
          document.getElementById("person-price").value = data.per_person || 0;
          document.getElementById("tent-price").value = data.per_tent || 0;
          document.getElementById("car-price").value = data.per_car || 0;
          document.getElementById("storage-price").value =
            data.storage_fee || 0;
          document.getElementById("last-update-date").textContent = new Date(
            data.effective_date
          ).toLocaleDateString();
        }
      })
      .catch((error) => {
        console.error("Error loading tariffs:", error);
      });
  };

  // При завантаженні сторінки
  loadTariffs();

  // Save button
  save_tariff_btn.addEventListener("click", () => {
    const tariffData = {
      per_person: Number(document.getElementById("person-price").value) || 0,
      per_tent: Number(document.getElementById("tent-price").value) || 0,
      per_car: Number(document.getElementById("car-price").value) || 0,
      storage_fee: Number(document.getElementById("storage-price").value) || 0,
    };

    fetch("/api/tariffs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tariffData),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message);
        loadTariffs();
      })
      .catch((error) => {
        console.error("Error saving tariffs:", error);
      });
  });

  // Reset button
  reset_tariff_btn.addEventListener("click", () => {
    if (confirm("Are you sure you want to reset the latest tariff?")) {
      fetch("/api/tariffs/latest", {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          alert(data.message);
          loadTariffs();
        })
        .catch((error) => {
          console.error("Error resetting tariff:", error);
        });
    }
  });

  document.getElementById("save-expense-btn").addEventListener("click", () => {
    const date = document.getElementById("new-expense-date").value;
    const category = document.getElementById("new-expense-category").value;
    const description = document
      .getElementById("new-expense-description")
      .value.trim();
    const amount = parseFloat(
      document.getElementById("new-expense-amount").value
    );

    if (!date || !category || !description || isNaN(amount)) {
      alert("Будь ласка, заповніть всі поля");
      return;
    }

    const newExpense = { date, category, description, amount };

    fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newExpense),
    })
      .then((response) => {
        if (response.ok) {
          loadExpenses();
          // Очищаємо форму
          document.getElementById("new-expense-date").value = "";
          document.getElementById("new-expense-category").value =
            "Оренда землі";
          document.getElementById("new-expense-description").value = "";
          document.getElementById("new-expense-amount").value = "";
        } else {
          alert("Помилка при додаванні витрати");
        }
      })
      .catch((error) => console.error("Error adding expense:", error));
  });
});
