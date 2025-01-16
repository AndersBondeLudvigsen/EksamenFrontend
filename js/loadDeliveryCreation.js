const API_BASE = "http://localhost:8080";

export function loadDeliveryCreation(app) {
    app.innerHTML = `
        <h2>Create Delivery</h2>
        <form id="create-delivery-form" class="mb-3">
            <div class="mb-3">
                <label for="adresse" class="form-label">Address</label>
                <input type="text" id="adresse" class="form-control" placeholder="Enter delivery address" required>
            </div>
            <div class="mb-3">
                <label for="pizzaId" class="form-label">Pizza ID</label>
                <input type="number" id="pizzaId" class="form-control" placeholder="Enter pizza ID" required>
            </div>
            <button type="submit" class="btn btn-primary">Create Delivery</button>
        </form>
        <div id="creation-result" class="mt-3"></div>
    `;

    document.getElementById("create-delivery-form").addEventListener("submit", async (event) => {
        event.preventDefault();

        // Collect input values
        const adresse = document.getElementById("adresse").value;
        const pizzaId = parseInt(document.getElementById("pizzaId").value, 10);

        try {
            const response = await fetch(`${API_BASE}/deliveries`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adresse, pizzaId }),
            });

            if (!response.ok) throw new Error("Failed to create delivery, invalid input");

            displayResult(`Delivery created`);
        } catch (error) {
            console.error("Error creating delivery:", error);
            displayResult(`Error: ${error.message}`);
        }
    });

    // Function to display results
    function displayResult(message) {
        const resultDiv = document.getElementById("creation-result");
        resultDiv.innerHTML = `<p>${message}</p>`;
    }
}
