
function updateExportButton() {
    const exportButton = document.querySelector('.export-button');
    const checkedItems = document.querySelectorAll('.checkbox:checked').length;
    exportButton.disabled = checkedItems === 0; // Only disable if no items are selected
}

document.addEventListener('DOMContentLoaded', function () {
    const phases = document.querySelectorAll('.phase');


    function updatePhaseCounter(phase) {
        const checkedBoxes = phase.querySelectorAll('.checkbox:checked').length;
        const counter = phase.querySelector('.selection-counter');
        counter.textContent = `Selected: ${checkedBoxes}`;

        // Get the recommended range from the phase header text
        const recommendedText = phase.querySelector('.phase-header p').textContent;
        const [min, max] = recommendedText.match(/\d+/g).map(Number);

        // Update counter color based on selection range
        if (checkedBoxes < min) {
            counter.style.color = '#F7F5A3'; // yellow
        } else if (checkedBoxes > max) {
            counter.style.color = '#D4574C'; // coral
        } else {
            counter.style.color = '#90EE90'; // light green for valid range
        }
    }

    // Add click event listeners to all checkboxes
    phases.forEach(phase => {
        const checkboxes = phase.querySelectorAll('.checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                updatePhaseCounter(phase);
                updateExportButton(); // Keep the existing export button update
            });
        });

        // Initialize counter
        updatePhaseCounter(phase);
    });
});

function exportSelectedPosts() {
    const selectedPosts = [];
    const month = getMonthFromHeader();
    const url = window.location.href;

    console.log('Month:', month);
    console.log('URL:', url);

    // Collect data from selected posts
    document.querySelectorAll('.content-item').forEach(item => {
        if (item.querySelector('.checkbox').checked) {
            const postData = collectPostData(item);
            console.log('Collected Post Data:', postData);
            selectedPosts.push(postData);
        }
    });

    console.log('Selected Posts:', selectedPosts);

    // If there are selected posts, send them to the backend
    if (selectedPosts.length > 0) {
        const params = {
            month: month,
            url: url,
            posts: selectedPosts
        };

        console.log('Sending data to backend:', params);
        sendDataToBackend(params);
    } else {
        console.log('No posts selected.');
    }
}

// Get the month from the header
function getMonthFromHeader() {
    const headerText = document.querySelector('.calendar-header h1').textContent;
    const monthYear = headerText.split(' ')[0] + ' ' + headerText.split(' ')[1];
    console.log('Extracted Month:', monthYear);
    return monthYear; // Extracts "February 2025"
}

// Collect data from a single post item
function collectPostData(item) {
    const dateValue = item.querySelector('.date-selector').value;
    const formattedDate = formatDate(dateValue);

    const postData = {
        date: formattedDate,
        pillar: normalizeText(item.querySelector('.pillar').textContent),
        title: normalizeText(item.querySelector('.title').textContent),
        description: normalizeText(item.querySelector('.description').textContent),
        hashtags: normalizeText(item.querySelector('.hashtags-input').value),
        canva: normalizeText(item.querySelector('.canva-link').href)
    };

    return postData;
}

// Format the date to MM/DD/YYYY, or return "No Date Assigned Yet"
function formatDate(dateValue) {
    if (!dateValue) return "No Date Assigned Yet";

    try {
        const date = new Date(dateValue);
        const formattedDate = date.toLocaleDateString('en-US'); // Format as MM/DD/YYYY
        console.log('Formatted Date:', formattedDate);
        return formattedDate;
    } catch (error) {
        console.log('Error formatting date:', error);
        return "No Date Assigned Yet";
    }
}

function normalizeText(input) {
    return input
        .replace(/\s+/g, ' ') // Replace all whitespace (newlines, tabs, spaces) with a single space
        .trim();              // Trim leading and trailing whitespace
}

// Send the collected data to the backend
function sendDataToBackend(params) {
    const exportButton = document.querySelector('.export-button');
    const scriptUrl = "https://script.google.com/macros/s/AKfycbzdZUqLAZOCN22iZd3cZH0AFVcpnl-RercJz_MFou-X3TOhJEcbgjaEE0M5BdnciFlqag/exec";

    // Convert params to a URL query string
    const queryString = new URLSearchParams({ data: JSON.stringify(params) }).toString();
    const urlWithParams = `${scriptUrl}?${queryString}`;

    // Disable the button and update its text
    updateExportButtonState(exportButton, true, 'Exporting...');

    console.log('Sending GET request to backend:', { urlWithParams });

    // Perform the GET request
    fetch(urlWithParams, {
        method: 'GET',
    })
        .then(validateResponse)
        .then(response => response.json())
        .then(data => handleResponse(data))
        .catch(error => handleError(error))
        .finally(() => {
            // Re-enable the button after completion
            updateExportButtonState(exportButton, false, 'Export Selected Posts');
        });
}

// Helper to validate the response status
function validateResponse(response) {
    console.log('Response received:', response);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response;
}

// Helper to update export button state
function updateExportButtonState(button, isDisabled, text) {
    button.disabled = isDisabled;
    button.textContent = text;
}



// Handle the response from the backend
function handleResponse(data) {
    console.log('Backend response data:', data);
    if (data.documentUrl) {
        console.log('Document URL:', data.documentUrl);
        window.open(data.documentUrl, '_blank');
    } else {
        throw new Error('No document URL received');
    }
}

// Handle any errors that occur during the fetch
function handleError(error) {
    console.error('Export failed:', error);
    alert('Export failed. Please try again.');
}


// Updated button state management
document.addEventListener('DOMContentLoaded', function () {
    const exportButton = document.querySelector('.export-button');
    exportButton.addEventListener('click', exportSelectedPosts);

    // Add event listeners for checkboxes only
    document.querySelectorAll('.checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateExportButton);
    });

    // Initial button state
    updateExportButton();
});