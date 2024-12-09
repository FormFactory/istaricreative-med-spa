
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

    document.querySelectorAll('.content-item').forEach(item => {
        if (item.querySelector('.checkbox').checked) {
            const dateValue = item.querySelector('.date-selector').value;
            let noDateAssignedYet = 'No Date Assigned Yet';

            let formattedDate = noDateAssignedYet;

            if (dateValue) {
                try {
                    const date = new Date(dateValue);
                    formattedDate = date.toLocaleDateString();
                } catch {
                    formattedDate = noDateAssignedYet;
                }
            }

            selectedPosts.push({
                phase: item.closest('.phase').querySelector('.phase-header h2').textContent,
                pillar: item.querySelector('.pillar').textContent,
                title: item.querySelector('.title').textContent,
                description: item.querySelector('.description').textContent,
                hashtags: item.querySelector('.hashtags-input').value,
                date: formattedDate
            });
        }
    });

    if (selectedPosts.length > 0) {
        console.log('Sending posts:', selectedPosts);

        const exportButton = document.querySelector('.export-button');
        exportButton.disabled = true;
        exportButton.textContent = 'Exporting...';

        // const scriptUrl = 'https://script.google.com/macros/s/AKfycbx8Jmrd_8dxoKzC04el7I59owIrodfpsUwQcpRrACtSWwt1eo6A3AlvBl0TdWW2_lO6Eg/exec';
        const scriptUrl = "https://script.google.com/macros/s/AKfycbz041HnYJnAg5_cUvf7sYGV4eWKZipjRWZ3iKj3mz-6m2uLEj-LzisIXK65jLWsO8eIJA/exec"

        const formData = new FormData();
        formData.append('data', JSON.stringify(selectedPosts));

        fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        })
            .then(response => {
                return fetch(`${scriptUrl}?action=getLastDoc`);
            })
            .then(response => response.json())
            .then(data => {
                if (data.url) {
                    window.open(data.url, '_blank');
                } else {
                    throw new Error('No document URL received');
                }
            })
            .catch(error => {
                console.error('Export failed:', error);
                alert('Export failed. Please try again.');
            })
            .finally(() => {
                exportButton.disabled = false;
                exportButton.textContent = 'Export Selected Posts';
            });
    }
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