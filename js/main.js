import { loadDeliveries } from './deliveries.js';
import { loadDrones } from './drones.js';
import { loadSimulation } from './simulate.js';
import { loadDeliveryCreation } from "./loadDeliveryCreation.js";

function navigate() {
    const hash = window.location.hash.substring(1) || 'deliveries'; // Default to 'deliveries'
    const app = document.getElementById('app');

    switch (hash) {
        case 'deliveries':
            loadDeliveries(app);
            break;
        case 'drones':
            loadDrones(app);
            break;
        case 'simulate':
            loadSimulation(app);
            break;
        case "create-delivery":
            loadDeliveryCreation(app);
            break;
        default:
            app.innerHTML = '<p>Page not found</p>';
    }
}

// Event listeners for hash changes and initial page load
window.addEventListener('hashchange', navigate);
window.addEventListener('load', navigate);
