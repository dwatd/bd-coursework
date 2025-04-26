const navLinks = document.querySelectorAll(".admin-sidebar a");
const sections = document.querySelectorAll("main section");

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

  const initialSectionId = window.location.hash.substring(1) || "dashboard";
  switchSection(initialSectionId);
});
