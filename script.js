// Define an array to store events
let events = [];

// letiables to store event input fields and reminder list
let eventDateInput =
    document.getElementById("eventDate");
let eventTitleInput =
    document.getElementById("eventTitle");
let eventDescriptionInput =
    document.getElementById("eventDescription");
let reminderList =
    document.getElementById("reminderList");

// Counter to generate unique event IDs
let eventIdCounter = 1;

// Function to add events
function addEvent() {
    let date = eventDateInput.value;
    let title = eventTitleInput.value;
    let description = eventDescriptionInput.value;

    if (date && title) {
        // Check if the selected date is in the past
        let selectedDate = new Date(date);
        let currentDate = new Date();

        if (selectedDate < currentDate) {
            alert("Cannot add events for past dates. Please provide a valid future date.");
            // Clear input fields even if there's an alert
            clearInputFields();
            return;
        }

        // Create a unique event ID
        let eventId = eventIdCounter++;

        events.push({
            id: eventId,
            date: date,
            title: title,
            description: description
        });

        // Save events to the local storage
        saveEventsToLocal();

        // Refresh the calendar and reminders
        showCalendar(currentMonth, currentYear);
        displayReminders();

        // Clear input fields
        clearInputFields();
    }
}

// Function to clear input fields
function clearInputFields() {
    eventDateInput.value = "";
    eventTitleInput.value = "";
    eventDescriptionInput.value = "";
}


// Function to delete an event by ID
function deleteEvent(eventId) {
    // Find the index of the event with the given ID
    let eventIndex =
        events.findIndex((event) =>
            event.id === eventId);

    if (eventIndex !== -1) {
        // Remove the event from the events array
        events.splice(eventIndex, 1);

        //Save events to local storage
        saveEventsToLocal();

        //Refresh the calendar and reminders
        showCalendar(currentMonth, currentYear);
        displayReminders();
    }
}

// Function to save events to local storage
function saveEventsToLocal() {
    localStorage.setItem('events', JSON.stringify(events));
}

// Function to load events from local storage
function loadEventsFromLocal() {
    let storedEvents = localStorage.getItem('events');
    if (storedEvents) {
        events = JSON.parse(storedEvents);
    }
}

// Call loadEventsFromLocal to load events when the script is executed
loadEventsFromLocal();

// Function to display reminders
function displayReminders() {
    reminderList.innerHTML = "";
    for (let i = 0; i < events.length; i++) {
        let event = events[i];
        let eventDate = new Date(event.date);
        if (eventDate.getMonth() ===
            currentMonth &&
            eventDate.getFullYear() ===
            currentYear) {
            let listItem = document.createElement("li");
            listItem.innerHTML =
                `<strong>${event.title}</strong> - 
            ${event.description} on 
            ${eventDate.toLocaleDateString()}`;

            // Add a delete button for each reminder item
            let deleteButton =
                document.createElement("button");
            deleteButton.className = "delete-event";
            deleteButton.textContent = "Delete";
            deleteButton.onclick = function () {
                deleteEvent(event.id);
            };

            listItem.appendChild(deleteButton);
            reminderList.appendChild(listItem);
        }
    }
}

// Function to generate a range of 
// years for the year select input
function generate_year_range(start, end) {
    let years = "";
    for (let year = start; year <= end; year++) {
        years += "<option value='" +
            year + "'>" + year + "</option>";
    }
    return years;
}

// Initialize date-related letiables
today = new Date();
currentMonth = today.getMonth();
currentYear = today.getFullYear();
selectYear = document.getElementById("year");
selectMonth = document.getElementById("month");

createYear = generate_year_range(1970, 2050);

document.getElementById("year").innerHTML = createYear;

let calendar = document.getElementById("calendar");

let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];
let days = [
    "Sun", "Mon", "Tue", "Wed",
    "Thu", "Fri", "Sat"];

$dataHead = "<tr>";
for (dhead in days) {
    $dataHead += "<th data-days='" +
        days[dhead] + "'>" +
        days[dhead] + "</th>";
}
$dataHead += "</tr>";

document.getElementById("thead-month").innerHTML = $dataHead;

monthAndYear =
    document.getElementById("monthAndYear");
showCalendar(currentMonth, currentYear);

// Function to navigate to the next month
function next() {
    currentYear = currentMonth === 11 ?
        currentYear + 1 : currentYear;
    currentMonth = (currentMonth + 1) % 12;
    showCalendar(currentMonth, currentYear);
}

// Function to navigate to the previous month
function previous() {
    currentYear = currentMonth === 0 ?
        currentYear - 1 : currentYear;
    currentMonth = currentMonth === 0 ?
        11 : currentMonth - 1;
    showCalendar(currentMonth, currentYear);
}

// Function to jump to a specific month and year
function jump() {
    currentYear = parseInt(selectYear.value);
    currentMonth = parseInt(selectMonth.value);
    showCalendar(currentMonth, currentYear);
}

// Function to display the calendar
function showCalendar(month, year) {
    let firstDay = new Date(year, month, 1).getDay();
    tbl = document.getElementById("calendar-body");
    tbl.innerHTML = "";
    monthAndYear.innerHTML = months[month] + " " + year;
    selectYear.value = year;
    selectMonth.value = month;

    let date = 1;
    for (let i = 0; i < 6; i++) {
        let row = document.createElement("tr");
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay) {
                cell = document.createElement("td");
                cellText = document.createTextNode("");
                cell.appendChild(cellText);
                row.appendChild(cell);
            } else if (date > daysInMonth(month, year)) {
                break;
            } else {
                cell = document.createElement("td");
                cell.setAttribute("data-date", date);
                cell.setAttribute("data-month", month + 1);
                cell.setAttribute("data-year", year);
                cell.setAttribute("data-month_name", months[month]);
                cell.className = "date-picker";
                cell.innerHTML = "<span>" + date + "</span";

                if (
                    date === today.getDate() &&
                    year === today.getFullYear() &&
                    month === today.getMonth()
                ) {
                    cell.className = "date-picker selected";
                }

                // Check if there are events on this date
                if (hasEventOnDate(date, month, year)) {
                    cell.classList.add("event-marker");
                    cell.appendChild(
                        createEventTooltip(date, month, year)
                    );
                }

                row.appendChild(cell);
                date++;
            }
        }
        tbl.appendChild(row);
    }

    displayReminders();
}

// Function to create an event tooltip
function createEventTooltip(date, month, year) {
    let tooltip = document.createElement("div");
    tooltip.className = "event-tooltip";
    let eventsOnDate = getEventsOnDate(date, month, year);
    for (let i = 0; i < eventsOnDate.length; i++) {
        let event = eventsOnDate[i];
        let eventDate = new Date(event.date);
        let eventText = `<strong>${event.title}</strong> - 
            ${event.description} on 
            ${eventDate.toLocaleDateString()}`;
        let eventElement = document.createElement("p");
        eventElement.innerHTML = eventText;
        tooltip.appendChild(eventElement);
    }
    return tooltip;
}

// Function to get events on a specific date
function getEventsOnDate(date, month, year) {
    return events.filter(function (event) {
        let eventDate = new Date(event.date);
        return (
            eventDate.getDate() === date &&
            eventDate.getMonth() === month &&
            eventDate.getFullYear() === year
        );
    });
}

// Function to check if there are events on a specific date
function hasEventOnDate(date, month, year) {
    return getEventsOnDate(date, month, year).length > 0;
}

// Function to get the number of days in a month
function daysInMonth(iMonth, iYear) {
    return 32 - new Date(iYear, iMonth, 32).getDate();
}

// Call the showCalendar function initially to display the calendar
showCalendar(currentMonth, currentYear);

// Function to display reminders sorted by date in ascending order
function displayReminders() {
    reminderList.innerHTML = "";

    // Sort the events array by date in ascending order
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    for (let i = 0; i < events.length; i++) {
        let event = events[i];
        let eventDate = new Date(event.date);
        if (eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear) {
            let listItem = document.createElement("li");

            // Format the date in dd-mm-yyyy
            let formattedDate = eventDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

            listItem.innerHTML =
                `<strong>${event.title}</strong> - 
                ${event.description} on 
                ${formattedDate}`;

            // Create a container for buttons to align them
            let buttonContainer = document.createElement("div");

            // Add an "Edit" button for each reminder item
            let editButton = document.createElement("button");
            editButton.className = "edit-event";
            editButton.textContent = "Edit";
            editButton.onclick = function () {
                editEvent(event.id);
            };

            // Add a "Delete" button for each reminder item
            let deleteButton = document.createElement("button");
            deleteButton.className = "delete-event";
            deleteButton.textContent = "Delete";
            deleteButton.onclick = function () {
                deleteEvent(event.id);
            };

            // Append buttons to the container
            buttonContainer.appendChild(editButton);
            buttonContainer.appendChild(deleteButton);

            // Append the button container to the list item
            listItem.appendChild(buttonContainer);

            // Append the list item to the reminder list
            reminderList.appendChild(listItem);
        }
    }
}



// Function to edit an event by ID
function editEvent(eventId) {
    // Find the index of the event with the given ID
    let eventIndex = events.findIndex((event) => event.id === eventId);

    if (eventIndex !== -1) {
        let editedTitle = prompt("Edit Event Title:", events[eventIndex].title);
        let editedDescription = prompt("Edit Event Description:", events[eventIndex].description);

        // Prompt the user to edit the event date
        let editedDate = prompt("Edit Event Date (YYYY-MM-DD):", events[eventIndex].date);

        // Validate the edited date format
        if (editedDate !== null && /^\d{4}-\d{2}-\d{2}$/.test(editedDate)) {
            events[eventIndex].title = editedTitle;
            events[eventIndex].description = editedDescription;
            events[eventIndex].date = editedDate;

            // Save events to local storage
            saveEventsToLocal();

            // Refresh the calendar and reminders
            showCalendar(currentMonth, currentYear);
            displayReminders();
        } else {
            alert("Invalid date format. Date not updated.");
        }
    }
}

// Event listener for date picker cells in the right-hand side calendar
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('date-picker')) {
        // Extract date information from the clicked cell
        let clickedDate = event.target.getAttribute('data-date');
        let clickedMonth = event.target.getAttribute('data-month') - 1; // Month is zero-based
        let clickedYear = event.target.getAttribute('data-year');

        // Set the date input in the left-hand side "Add Event" section
        eventDateInput.value = `${clickedYear}-${(clickedMonth + 1).toString().padStart(2, '0')}-${clickedDate.toString().padStart(2, '0')}`;
    }
});

// Function to edit an event by ID
function editEvent(eventId) {
    // Find the index of the event with the given ID
    let eventIndex = events.findIndex((event) => event.id === eventId);

    if (eventIndex !== -1) {
        let editedTitle = prompt("Edit Event Title:", events[eventIndex].title);

        // Check if the user canceled the first prompt
        if (editedTitle === null) {
            return; // Stop editing process
        }

        let editedDescription = prompt("Edit Event Description:", events[eventIndex].description);

        // Prompt the user to edit the event date
        let editedDate = prompt("Edit Event Date (YYYY-MM-DD):", events[eventIndex].date);

        // Validate the edited date format
        if (editedDate !== null && /^\d{4}-\d{2}-\d{2}$/.test(editedDate)) {
            let currentDate = new Date();
            let selectedDate = new Date(editedDate);

            // Check if the selected date is in the past
            if (selectedDate < currentDate) {
                setTimeout(() => {
                    alert("Cannot edit events for past dates. Please provide a valid future date.");
                }, 0);
                return;
            }

            events[eventIndex].title = editedTitle;
            events[eventIndex].description = editedDescription;
            events[eventIndex].date = editedDate;

            // Save events to local storage
            saveEventsToLocal();

            // Refresh the calendar and reminders
            showCalendar(currentMonth, currentYear);
            displayReminders();
        } else {
            setTimeout(() => {
                alert("Invalid date format or past date. Date not updated. Please provide a valid future date.");
            }, 0);
        }
    }
}

// Function to delete an event by ID
function deleteEvent(eventId) {
    // Find the index of the event with the given ID
    let eventIndex = events.findIndex((event) => event.id === eventId);

    if (eventIndex !== -1) {
        // Ask the user for confirmation before deleting
        let confirmDelete = confirm("Are you sure you want to delete this event?");

        if (confirmDelete) {
            // Remove the event from the events array
            events.splice(eventIndex, 1);

            // Save events to local storage
            saveEventsToLocal();

            // Refresh the calendar and reminders
            showCalendar(currentMonth, currentYear);
            displayReminders();
        }
    }
}

// Function to clear previous alert messages
function clearAlerts() {
    let previousAlerts = document.querySelectorAll(".alert");
    previousAlerts.forEach(alert => alert.remove());
}

// Modify the searchEvents function
// Modify the searchEvents function
function searchEvents() {
    clearAlerts(); // Clear previous alert messages

    let searchInput = document.getElementById("searchInput").value.trim();

    if (searchInput === "") {
        // If the search input is empty, display all events
        displayReminders();
        return;
    }

    // Parse the input date with the format "dd-mm-yyyy"
    let parts = searchInput.split("-");
    let searchDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);

    if (isNaN(searchDate.getTime())) {
        // Invalid date format
        alert("Invalid date format. Please use dd-mm-yyyy.");
        return;
    }

    // Filter events that match the input date
    let filteredEvents = events.filter((event) => {
        let eventDate = new Date(event.date);
        return (
            eventDate.getDate() === searchDate.getDate() &&
            eventDate.getMonth() === searchDate.getMonth() &&
            eventDate.getFullYear() === searchDate.getFullYear()
        );
    });

    // Display filtered events
    displayFilteredEvents(filteredEvents);
}

// Modify the displayFilteredEvents function
function displayFilteredEvents(filteredEvents) {
    reminderList.innerHTML = "";
    if (filteredEvents.length === 0) {
        let noResultMessage = document.createElement("p");
        noResultMessage.className = "alert";
        noResultMessage.textContent = "No events found for the selected date.";
        reminderList.appendChild(noResultMessage);
    } else {
        // Display filtered events in the reminder section
        for (let i = 0; i < filteredEvents.length; i++) {
            let event = filteredEvents[i];
            let listItem = document.createElement("li");
            listItem.innerHTML =
                `<strong>${event.title}</strong> - 
                ${event.description} on 
                ${formatDate(event.date)}`;
            reminderList.appendChild(listItem);
        }
    }
}

// Function to format a date as "dd-mm-yyyy"
function formatDate(dateString) {
    let eventDate = new Date(dateString);
    let day = eventDate.getDate().toString().padStart(2, '0');
    let month = (eventDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    let year = eventDate.getFullYear();
    return `${day}-${month}-${year}`;
}

// Function to print tasks in table form
function printTasks() {
    // Get the content of the reminder list
    let reminderList = document.getElementById("reminderList");

    // Create a new window for printing
    let printWindow = window.open('', '_blank');

    // Write the content to the new window
    printWindow.document.write('<html><head><title>Task List</title></head><body>');
    printWindow.document.write('<h2>Task List</h2>');

    // Create a table and its header
    printWindow.document.write('<table border="1">');
    printWindow.document.write('<tr><th>Event Title</th><th>Event Description</th></tr>');

    // Loop through each task in the reminder list and add it to the table
    let tasks = reminderList.getElementsByTagName('li');
    for (let i = 0; i < tasks.length; i++) {
        let task = tasks[i];
        let taskContent = task.innerHTML; // Use innerHTML instead of textContent to preserve HTML

        // Remove buttons from the content
        let taskContentWithoutButtons = taskContent.replace(/<button.*?<\/button>/g, '');

        // Split task content into an array using "-" as a separator
        let taskData = taskContentWithoutButtons.split("-").map(item => item.trim());

        // Extract event title and description
        let title = taskData[0].replace(/<\/?strong>/g, ''); // Remove <strong> tags
        let description = taskData[1];

        // Add a row to the table for each task
        printWindow.document.write('<tr>');
        printWindow.document.write(`<td>${title}</td><td>${description}</td>`);
        printWindow.document.write('</tr>');
    }

    // Close the table and body tags
    printWindow.document.write('</table></body></html>');

    // Close the print window after writing content
    printWindow.document.close();

    // Trigger the print dialog
    printWindow.print();
}

function logout(){
    alert("Logout successufully");
    window.location.href = 'cloudlogin.html';
}