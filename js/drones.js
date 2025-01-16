const API_BASE = "http://localhost:8080";

export function loadDrones(app) {
    app.innerHTML = `
        <h2>Drones</h2>
        <button id="create-drone" class="btn btn-success mb-3">Create New Drone</button>
        <div id="drone-list"></div>
    `;

    fetchDrones();

    // Event listener for creating a new drone
    document.getElementById("create-drone").addEventListener("click", async () => {
        try {
            const response = await fetch(`${API_BASE}/drones`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    serialUuid: generateUUID(),
                    status: "OPERATIONAL",
                }),
            });
            if (!response.ok) throw new Error("Failed to create drone");
            fetchDrones(); // Refresh the drone list
        } catch (error) {
            console.error(error);
        }
    });

    // Fetch all drones from the backend
    async function fetchDrones() {
        try {
            const response = await fetch(`${API_BASE}/drones`);
            if (!response.ok) throw new Error("Failed to fetch drones");
            const drones = await response.json();
            renderDrones(drones);
        } catch (error) {
            console.error("Error fetching drones:", error);
        }
    }

    // Render drones in the DOM
    function renderDrones(drones) {
        const droneList = document.getElementById("drone-list");
        if (!droneList) {
            console.error("Error: drone-list element not found.");
            return;
        }

        droneList.innerHTML = ""; // Clear existing content

        drones.forEach((drone) => {
            const div = document.createElement("div");
            div.className = "card mb-3 p-3";
            div.innerHTML = `
                <h5>Drone #${drone.droneId}</h5>
                <p>UUID: ${drone.serialUuid}</p>
                <p>Status: ${drone.status}</p>
                <p>Station: ${
                drone.station
                    ? `${drone.station.stationId} (${drone.station.latitude}, ${drone.station.longitude})`
                    : "None"
            }</p>
            <div>
                <button class="btn btn-primary btn-sm enable-drone" data-id="${drone.droneId}">Enable</button>
                <button class="btn btn-warning btn-sm disable-drone" data-id="${drone.droneId}">Disable</button>
                <button class="btn btn-danger btn-sm retire-drone" data-id="${drone.droneId}">Retire</button>
            </div>
            `;

            droneList.appendChild(div);
        });

        // Attach event listeners to each button
        document.querySelectorAll(".enable-drone").forEach((button) =>
            button.addEventListener("click", () => updateDroneStatus(button.dataset.id, "enable"))
        );
        document.querySelectorAll(".disable-drone").forEach((button) =>
            button.addEventListener("click", () => updateDroneStatus(button.dataset.id, "disable"))
        );
        document.querySelectorAll(".retire-drone").forEach((button) =>
            button.addEventListener("click", () => updateDroneStatus(button.dataset.id, "retire"))
        );
    }

    // Update drone status (enable, disable, retire)
    async function updateDroneStatus(droneId, action) {
        try {
            const response = await fetch(`${API_BASE}/drones/${action}/${droneId}`, {
                method: "POST",
            });
            if (!response.ok) throw new Error(`Failed to ${action} drone #${droneId}`);
            alert(`Drone #${droneId} ${action}d successfully`);
            fetchDrones(); // Refresh the drone list
        } catch (error) {
            console.error(`Error updating drone status: ${error.message}`);
            alert(`Error: Could not ${action} drone #${droneId}`);
        }
    }

    // Generate a unique UUID for a new drone
    function generateUUID() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
}
