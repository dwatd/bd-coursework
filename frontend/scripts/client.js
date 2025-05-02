const form = document.querySelector("form");
const startInput = document.getElementById("start");
const endInput = document.getElementById("end");
const peopleInput = document.getElementById("people");
const vehicleSelect = document.getElementById("vehicle");
const backpacksInput = document.getElementById("backpacks");

const nightsEl = document.getElementById("nights");
const accommodationEl = document.getElementById("accommodation-type");
const rateEl = document.getElementById("rate");
const backpacksTotalEl = document.getElementById("backpacks-total");
const totalEl = document.getElementById("total");
const payBtn = document.getElementById("payBtn");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const startDate = new Date(startInput.value);
  const endDate = new Date(endInput.value);
  const nights = (endDate - startDate) / (1000 * 60 * 60 * 24);

  if (isNaN(nights) || nights <= 0) {
    alert("Please select valid dates.");
    return;
  }

  const people = parseInt(peopleInput.value) || 0;
  const vehicle = vehicleSelect.value;
  const backpacks = parseInt(backpacksInput.value) || 0;

  const accommodationCost = vehicle === "car" ? 100 : 250;
  const perPersonCost = 200;
  const backpackCost = 50;

  const perPersonTotal = people * perPersonCost;
  const backpacksTotal = backpacks * backpackCost;

  const total = nights * (accommodationCost + perPersonTotal + backpacksTotal);

  nightsEl.textContent = `${nights} night${nights > 1 ? "s" : ""}`;
  accommodationEl.textContent =
    vehicle === "car" ? "Only Car (₴100)" : "Car with Tent (₴250)";
  rateEl.textContent = `${people}x ₴${perPersonCost}`;
  backpacksTotalEl.textContent = `${backpacks}x ₴${backpackCost}`;
  totalEl.textContent = `₴${total}`;

  payBtn.disabled = false;
});

payBtn.addEventListener("click", async () => {
  const fullName = document.getElementById("name").value;
  const phoneNumber = document.getElementById("phone").value;
  const startDate = document.getElementById("start").value;
  const endDate = document.getElementById("end").value;
  const people = parseInt(document.getElementById("people").value);
  const vehicle = document.getElementById("vehicle").value;
  const backpacks = parseInt(document.getElementById("backpacks").value) || 0;

  const accommodationCost = vehicle === "car" ? 100 : 250;
  const perPersonCost = 200;
  const perPersonTotal = people * perPersonCost;
  const backpacksCost = backpacks * 50;

  const totalWithoutBackpacks = accommodationCost + perPersonTotal;
  const nights =
    (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
  const amount = totalWithoutBackpacks * nights;

  let clientId,
    accData = {},
    serviceData = {};

  try {
    // Save client
    const clientRes = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        phone_number: phoneNumber,
      }),
    });

    if (!clientRes.ok) throw new Error("Failed to save client");
    const clientData = await clientRes.json();
    clientId = clientData.id;

    // Save accommodation
    const accRes = await fetch("/api/accommodation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        check_in_date: startDate,
        check_out_date: endDate,
        tent_on_car: vehicle === "car",
        amount: amount,
        payment_date: new Date().toISOString().split("T")[0],
      }),
    });

    if (!accRes.ok) throw new Error("Failed to save accommodation");
    accData = await accRes.json();

    // Save service (if any)
    if (backpacks > 0) {
      const serviceRes = await fetch("/api/storage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          backpack_count: backpacks,
          start_date: startDate,
          end_date: endDate,
          payment_date: new Date().toISOString().split("T")[0],
          amount: backpacksCost * nights,
          tariff_id: 1,
        }),
      });

      if (!serviceRes.ok) throw new Error("Failed to save service");
      serviceData = await serviceRes.json();
    }

    // Save income
    const incomeRes = await fetch("/api/income", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: new Date().toISOString().split("T")[0],
        total_amount: amount + backpacksCost * nights,
        client_id: clientId,
        service_id: backpacks > 0 ? serviceData.service_id : null,
        accommodation_id: accData.accommodation_id,
      }),
    });

    if (!incomeRes.ok) throw new Error("Failed to save income");
    const incomeData = await incomeRes.json();

    alert("Booking saved. Income ID: " + incomeData.income_id);
  } catch (err) {
    console.error("Booking Error:", err);
    alert("Something went wrong during booking.");
  }
});
