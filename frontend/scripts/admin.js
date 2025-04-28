const navLinks = document.querySelectorAll(".admin-sidebar a");
const sections = document.querySelectorAll("main section");

const save_tariff_btn = document.getElementById('save-tariff-btn');
const reset_tariff_btn = document.getElementById('reset-tariff-btn');

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

  const initialSectionId = window.location.hash.substring(1) || "finances";
  switchSection(initialSectionId);

  // Tariffs таблиця БД
  // Функція для завантаження останнього тарифу
  const loadTariffs = () => {
    fetch('/api/tariffs')
      .then(response => response.json())
      .then(data => {
        if (data) {
          document.getElementById('tariff-id').value = data.tariff_id || '';
          document.getElementById('person-price').value = data.per_person || 0;
          document.getElementById('tent-price').value = data.per_tent || 0;
          document.getElementById('car-price').value = data.per_car || 0;
          document.getElementById('storage-price').value = data.storage_fee || 0;
          document.getElementById('last-update-date').textContent = new Date(data.effective_date).toLocaleDateString();
        }
      })
      .catch(error => {
        console.error('Error loading tariffs:', error);
      });
  }

  // При завантаженні сторінки
  loadTariffs();

  // Save button
  save_tariff_btn.addEventListener('click', () => {
    const tariffData = {
      per_person: Number(document.getElementById('person-price').value) || 0,
      per_tent: Number(document.getElementById('tent-price').value) || 0,
      per_car: Number(document.getElementById('car-price').value) || 0,
      storage_fee: Number(document.getElementById('storage-price').value) || 0,
    };

    fetch('/api/tariffs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tariffData)
    })
      .then(response => response.json())
      .then(data => {
        alert(data.message);
        loadTariffs();
      })
      .catch(error => {
        console.error('Error saving tariffs:', error);
      });
  });

  // Reset button
  reset_tariff_btn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the latest tariff?')) {
      fetch('/api/tariffs/latest', {
        method: 'DELETE'
      })
        .then(response => response.json())
        .then(data => {
          alert(data.message);
          loadTariffs();
        })
        .catch(error => {
          console.error('Error resetting tariff:', error);
        });
    }
  });
});
