const API_BASE = "http://localhost:8080";

export function loadSimulation(app) {
    app.innerHTML = `
    <h2>Simulate Deliveries</h2>
    <div class="simulation-controls mb-3">
      <button id="simulate-create" class="btn btn-primary">Simulate Delivery Creation</button>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>Actions</th>
          <th>Delivery ID</th>
          <th>Address</th>
          <th>Pizza</th>
          <th>Expected Delivery</th>
          <th>Drone</th>
          <th>Station</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody id="delivery-table-body">
      </tbody>
    </table>
  `;

    const simulatedDeliveries = [];

    document
        .getElementById("simulate-create")
        .addEventListener("click", async () => {
            try {
                const response = await fetch(`${API_BASE}/deliveries/simulate/add`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        adresse: "Customer Address, Example City",
                        pizzaId: 1, // Example pizza ID
                    }),
                });

                if (!response.ok) {
                    throw new Error("Failed to simulate delivery creation");
                }
                const newDelivery = await response.json();
                simulatedDeliveries.push(newDelivery);
                addDeliveryRow(newDelivery);
            } catch (error) {
                console.error(error);
                alert("Error creating delivery: " + error.message);
            }
        });

    function addDeliveryRow(delivery) {
        const tableBody = document.getElementById("delivery-table-body");
        const row = document.createElement("tr");

        let droneText = "";
        if (delivery.droneSerialUuid) {
            droneText = `Assigned to Drone ${delivery.droneSerialUuid}`;
        } else {
            droneText = "Awaiting Drone";
        }

        let stationText = "";
        if (delivery.station) {
            stationText = `Station #${delivery.station.stationId} 
                     (${delivery.station.latitude}, ${delivery.station.longitude})`;
        } else {
            stationText = "No Station Assigned";
        }

        let statusText = "";
        if (delivery.faktiskLevering) {
            statusText = "Completed";
        } else {
            statusText = "Pending";
        }

        row.innerHTML = `
      <td>
        <button class="btn btn-success btn-sm" data-id="${delivery.leveringId}">Complete</button>
      </td>
      <td>${delivery.leveringId}</td>
      <td>${delivery.adresse}</td>
      <td>${delivery.pizzaName}</td>
      <td>${new Date(delivery.forventetLevering).toLocaleString()}</td>
      <td>${droneText}</td>
      <td>${stationText}</td>
      <td>${statusText}</td>
    `;

        const completeButton = row.querySelector("button");
        completeButton.addEventListener("click", () =>
            completeDelivery(delivery.leveringId, row)
        );

        tableBody.appendChild(row);
    }


    async function completeDelivery(leveringId, row) {
        try {
            const response = await fetch(`${API_BASE}/deliveries/finish/${leveringId}`, {
                method: "POST",
            });
            if (!response.ok) {
                throw new Error("Failed to complete delivery");
            }

            const completedDelivery = await response.json();
            const completedTime = new Date(completedDelivery.faktiskLevering).toLocaleString();

            row.children[7].textContent = `Completed at ${completedTime}`;

            const completeButton = row.querySelector("button");
            completeButton.textContent = "Completed";
            completeButton.classList.remove("btn-success");
            completeButton.classList.add("btn-danger");
            completeButton.disabled = true;
        } catch (error) {
            console.error(error);
            alert("Error completing delivery: " + error.message);
        }
    }

}
