const API_BASE = "http://localhost:8080";

export function loadDeliveries(app) {
    app.innerHTML = `
        <h2>Deliveries</h2>
        <div class="form-check mb-3">
            <input type="checkbox" class="form-check-input" id="filter-queued">
            <label for="filter-queued" class="form-check-label">Show only queued deliveries</label>
        </div>
        <div id="delivery-list"></div>
    `;

    const filterCheckbox = document.getElementById("filter-queued");

    // Initial fetch and attach event listener for the checkbox
    fetchDeliveries(false);
    filterCheckbox.addEventListener("change", () => {
        fetchDeliveries(filterCheckbox.checked);
    });

    async function fetchDeliveries(onlyQueued) {
        try {
            const url = onlyQueued
                ? `${API_BASE}/deliveries/queue`
                : `${API_BASE}/deliveries`;
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch deliveries");
            const deliveries = await response.json();
            renderDeliveries(deliveries);
        } catch (error) {
            console.error("Error fetching deliveries:", error);
        }
    }

    function renderDeliveries(deliveries) {
        const deliveryList = document.getElementById("delivery-list");
        deliveryList.innerHTML = "";

        deliveries.sort((a, b) => new Date(a.forventetLevering) - new Date(b.forventetLevering));

        deliveries.forEach((delivery) => {
            const div = document.createElement("div");
            div.className = "card mb-3 p-3";
            div.innerHTML = `
                <h5>Delivery #${delivery.leveringId}</h5>
                <p>Address: ${delivery.adresse}</p>
                <p>Expected: ${new Date(delivery.forventetLevering).toLocaleString()}</p>
                <p>Pizza: ${delivery.pizzaName}</p>
                <p>Status: ${
                delivery.droneSerialUuid
                    ? `Assigned to Drone ${delivery.droneSerialUuid}`
                    : "Awaiting Drone"
            }</p>
                <p>Station: ${
                delivery.station
                    ? `Station #${delivery.station.stationId} (${delivery.station.latitude}, ${delivery.station.longitude})`
                    : "No Station Assigned"
            }</p>
                <p>Delivery Status: ${
                delivery.faktiskLevering
                    ? `Delivered at ${new Date(delivery.faktiskLevering).toLocaleString()}`
                    : "(Not Delivered)"
            }</p>
            `;

            // Add "Assign Drone" button if no drone is assigned
            if (!delivery.droneSerialUuid) {
                const assignDroneBtn = document.createElement("button");
                assignDroneBtn.className = "btn btn-primary";
                assignDroneBtn.textContent = "Assign Drone";
                assignDroneBtn.addEventListener("click", () => assignDrone(delivery.leveringId));
                div.appendChild(assignDroneBtn);
            }

            // Add "Complete Delivery" button if not yet delivered
            if (!delivery.faktiskLevering) {
                const completeDeliveryBtn = document.createElement("button");
                completeDeliveryBtn.className = "btn btn-success";
                completeDeliveryBtn.textContent = "Complete Delivery";
                completeDeliveryBtn.addEventListener("click", () => completeDelivery(delivery.leveringId));
                div.appendChild(completeDeliveryBtn);
            }

            deliveryList.appendChild(div);
        });
    }

    // Function to assign a drone to a delivery
    async function assignDrone(leveringId) {
        try {
            const response = await fetch(`${API_BASE}/deliveries/schedule/${leveringId}`, {
                method: "POST",
            });
            if (!response.ok) throw new Error(`Failed to assign drone to delivery #${leveringId}`);
            alert(`Drone successfully assigned to Delivery #${leveringId}`);
            fetchDeliveries(filterCheckbox.checked); // Refresh the delivery list
        } catch (error) {
            console.error("Error assigning drone:", error);
        }
    }

    // Function to complete a delivery
    async function completeDelivery(leveringId) {
        try {
            const response = await fetch(`${API_BASE}/deliveries/finish/${leveringId}`, {
                method: "POST",
            });
            if (!response.ok) throw new Error(`Failed to complete delivery #${leveringId}`);
            const result = await response.json();
            alert(`Delivery #${leveringId} completed successfully`);
            fetchDeliveries(filterCheckbox.checked); // Refresh the delivery list
        } catch (error) {
            console.error("Error completing delivery:", error);
            alert("Error: Could not complete delivery.");
        }
    }
}
