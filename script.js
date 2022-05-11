

// check for broswer compatibility - only needs to run on login page because if a user is already logged in then obviously the browser is supported
function appSetup() {

    // Reset the window position
    window.scrollTo(0, 1);

    // Check that storage is available to the browser and then clear it ready for a new session
    if (typeof (Storage) !== "undefined") {

        // Clearing session storage for new session
        sessionStorage.clear();
     }

    // If the above test fails - issue a browser not supported message
    else {
        document.getElementById("body").innerHTML = "Sorry, your browser does not support the features of this application. :(";
        console.log("Error: This browser does not support localstorage.");
       
    }
}


// Page Setup - Checks if a user is logged in. If not, send them to the login page.
//              Also loads page specific functions
function pageSetup() {

    // Reset the window position to ensure proper viewing
    window.scrollTo(0, 1);

    // Read the current user from session storage to see who is logged in
    const CurrentUser = readSession();

    // Verify that someone is logged in - if not, punt them to the login page
    if (CurrentUser == null) {
        error("User is not logged in! Loading index.html");
        window.location = "./index.html";
        return;
    }

    // Set the page title and username in the document
    document.getElementById('pageTitle').innerHTML = document.title;
    document.getElementById('username').innerHTML = CurrentUser.name;

    // If the title is Notes, run the notes page specific function
    if (document.title == "Notes") {
        notesPage(CurrentUser);
    }

    // If the title is Account, run the account page specific function
    if (document.title == "Account") {
        accountPage(CurrentUser);
    }

    // If the title is Timetable, run the timetable page specific function
    if (document.title == "Timetable") {
        timetablePage(CurrentUser);
    }

    // If the title is Calendar, run the calendar page specific function
    if (document.title == "Calendar") {
        calendarPage(CurrentUser);
        
    }

}


// swapping divs to show/hide UI elements - works like a flipflop gate no matter which order two elements are passed in.
function swap(element1, element2) {

    // Reset error fields to default
    error("");

    // Perform the div swap by changing the display style of the two elements
    if (element1.style.display == "none") {
        element1.style.display = "flex";
    }
    else {
        element1.style.display = ("none");
    }
    if (element2.style.display == "flex") {
        element2.style.display = "none";
    }
    else {
        element2.style.display = "flex";
    }
}


// Login validation - runs when the user clicks log in button, validates inputs and loads next page if valid.
function validateLogin() {

    // Variables to store user inputs
    let email = document.getElementById("emField").value.toLowerCase();
    let password = document.getElementById("pwdField").value;
  
    // Login Validation test - calls functions validateEmail() & validatePassword() found in Input validation section
    if (validateEmail(email) && validatePassword(password)) {

        // Read the local storage to see if the email entered is there
        const CurrentUser = readLocal(email);
        

        // Try to access the UserObject and compare it to the entered information
        try {

            // Assign Object parameters to variables
            let objName = CurrentUser.name;
            let objEmail = CurrentUser.email;
            let objPass = CurrentUser.password;

            // Compare variables to user entries
            if (email == objEmail && password == objPass) {

                // Login was successful - Load home.html
                successfulLogin(CurrentUser);
            }

            // If the above doesn't work then the user entered wrong information
            else {
                error("Incorrect e-mail address or password.");
                return;
            }
        }

        // If loading the user object doesnt work then the user entered a wrong or non-existent email
        catch {
            error("Incorrect e-mail address.");
        }
        return true;
    }
}


// Input validations
// The following are all tests for input validation - pass in the input and get a validity bool back
// Will be re-used multiple times


// Email validation
function validateEmail(email) {
        
    // Check for blank email
    if (blankFields(email)) {
        error("You must enter an email...");
        return false;
    }

    // Check email format validity
    if (!emailRegex(email)) { //IF THE EMAIL DOESN'T MATCH THE REGEX - i.e. it returns NOT TRUE!!! derp
        error("Please enter a correctly formatted email...");
        return false;
    }

    // If both the baove are good then you can reset errors and continue
    if (!blankFields(email) && emailRegex(email)) {
        error("");
        return true;
    }
}


// check if fields are blank - pass in any field and get bool true if blank
function blankFields(field) {
    if (field.length == 0) {
        return true;
    }
}

// Regex for emails - returns true if correctly formatted email passed in
function emailRegex(email) {
    let regexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regexp.test(email); //return a bool true if it matches the expression, false if not
}

// Password validation
function validatePassword(password) {
    if (blankFields(password)) {
        error("You must enter a password...");
        return false;
    }

    if (!blankFields(password)) {
        //The password is good - carrying on...
        error("");
        return true;
    }
}



// Take the form inputs, check them and if they're good, create a new key-object pair and store them
// then fire the user back to the login page to get logged in
function validateNewUser() {

    // Variables coming in from DOM
    let newUserName = document.getElementById("newUserName").value;
    let newUserEmail = document.getElementById("newUserEmail").value.toLowerCase();
    let newUserPwd = document.getElementById("newUserPwd").value;
    let newUserPwd2 = document.getElementById("newUserPwd2").value;

    if (blankFields(newUserName)) {
        error("You must enter a name...");
        return;
    }

    // Capitalise the first letter of names

    // Make an array from the words split by spaces
    let capName = newUserName.split(" ");

    // Loop through the array an make the zero index of each string a capital letter
    for (let i = 0; i < capName.length; i++) {
        capName[i] = capName[i][0].toUpperCase() + capName[i].substr(1);
    }

    // Rejoin all the strings with spaces into one string again
    newUserName = capName.join(" ");


    // Check for blank email
    if (blankFields(newUserEmail)) {
        error("You must enter an email...")
        return;
    }

    // Check email formatting
    if (!emailRegex(newUserEmail)) { //IF THE EMAIL DOESN'T MATCH THE REGEX - i.e. it returns NOT TRUE!!! derp
        error("Please enter a correctly formatted email...")
        return;
    }

    // Check for blank password
    if (blankFields(newUserPwd)) {
        error("You must enter a password...");
        return;
    }

    // Do the new passwords match?
    if (passMatch(newUserPwd, newUserPwd2) == false) {
        error("Passwords must match.");
        return;
    }
       
    // The user input must now all be "good enough" now so let's store it now eh?
    // Check the user doesn't already exist!
    let TestObject = readLocal(newUserEmail); // may fail hard enough to do the job...?

    // If the user does already exist then tell the user
    if (readLocal(newUserEmail) != null) {
        
        error("This email address is already in use.");
        return;
    }

    // If the user doesn't exist, create it
    if (readLocal(newUserEmail) == null) {

        // Make the new object
        const NewUserObj = new UserObj(newUserName, newUserEmail, newUserPwd);

        // Store the object
        storeLocal(newUserEmail, NewUserObj);

        // YAS MADE A NEW USER!
        

        // Reset input fields
        document.getElementById('newUserName').value = "";
        document.getElementById('newUserEmail').value = "";
        document.getElementById('newUserPwd').value = "";
        document.getElementById('newUserPwd2').value = "";
        
    }

    // Tell the user of this great success and send them back to the login screen
    swap(CreateNewUser, userCreated);
    error("");

}


// Do passwords match? - checking double confirmation of password entry
function passMatch(pw1, pw2) {
    // If the inputs are not the same, return false
    if (pw1 != pw2) {

        return false;
    }

    // Else the inputs must be the same so return true
    else {
        return true;
    }
}




//***********************************************************************************************
//************************************************************************************************
// Object Constructors and storage handling here...
//*************************************************************************************************
//**********************************************************************************************


// User object constructor - a prototype for all users to be created
function UserObj(name, email, password) {

    this.name = name;
    this.email = email;
    this.password = password; // OMG YOU SHOULD NEVER STORE PASSWORDS AS PLAIN TEXT DUDE!!!!!
}

// Constructor for note objects
function NoteObj(title, content) {
    this.title = title;
    this.content = content;
}


// Write to localStorage - possible to reuse this later
function storeLocal(email, UserObj) {

    // Users will be identified in storage by using their email string as the key
    //****WILL ALWAYS HAVE TO PASS IN (email, userObj) pair to make this reusable.
    let key = email;
    localStorage.setItem(key, JSON.stringify(UserObj));
}
// Read from localStorage - possible to reuse this later
function readLocal(key) {
    let object = JSON.parse(localStorage.getItem(key));
    return object;
}

// Write to sessionStorage *FOR CURRENT USER ONLY*
function storeSession(CurrentUser) {
    sessionStorage.setItem('CurrentUser', JSON.stringify(CurrentUser));
}

// Read from sessionStorage *FOR CURRENT USER ONLY*
function readSession() {
        let object = JSON.parse(sessionStorage.getItem('CurrentUser'));
        return object;
    }


// This moves the user to the home page only after successful login
function successfulLogin(CurrentUser) {
    
    
    storeSession(CurrentUser);
    
    window.location = "./home.html";

}


// The user has chosen to log out - sets the set the current user to a null value to prevent pages loading until a new user logs in
function logout() {

    // Set current user to null value
    CurrentUser = null;

    // Send the user back to the login page
    window.location = "./index.html";
}




// BEGIN NOTES PAGE LOGIC ----------------------------------------------------------------

// this loads the notes from storage and displays them
function notesPage(CurrentUser) {

    // Set the title for the user's notes
    document.getElementById('notesusername').innerHTML = "'s Notes"; // <--- this is needed here to avoid duplicates of the username on refreshes of the page!!
    document.getElementById('notesusername').innerHTML = CurrentUser.name + document.getElementById('notesusername').innerHTML;

    // Make sure we start with a blank notes section on the page
    document.getElementById("notes").innerHTML = "";

    // Focus the note creator input
    document.getElementById('noteTitle').focus;


    // Check if notes exist in the user object
    if (CurrentUser.notes == null) {
        CurrentUser.notes = JSON.stringify([]);
        storeLocal(CurrentUser.email, CurrentUser);
        storeSession(CurrentUser);
        document.getElementById("notes").innerHTML = '<h2>No notes to display</h2>';
        return;
    }

    // load the notes array for the current user
    const LoadedNotes = JSON.parse(CurrentUser.notes);
  

    // If there are no notes to display, tell the user
    if (LoadedNotes.length == 0) {
        document.getElementById("notes").innerHTML = '<h2>No notes to display</h2>';
    }

    // loop through the notes array and display the existing notes

    for (let i = 0; i < LoadedNotes.length; i++) {

            // Create a new list element
        let li = document.createElement("LI");

        // Load the specific note object to be displayed from the array
        const Note = JSON.parse(LoadedNotes[i]);

        // Grab the title from the note object into a variable
        let title = Note.title;

        // Grab the content from the note object into a variable
        let note = Note.content;

        // Populate the new list element with the information from the array
        li.innerHTML = '<span class="deleteNote"><h2>X Del</h2></span><h1>' + title + '</h1><p>' + note + '</p>';

        // Set the list element's ID to be the same as the array index of the note object so it can be identified later
            li.setAttribute('id', i);

        // Append the new list element as a child of the existing notes list
            document.getElementById("notes").appendChild(li);
        }


    // Make the notes deleteable - show an X that can be clicked to delete a note
    let del = document.getElementsByClassName("deleteNote"); // Identify all the delete note buttons on the page

    // Loop through the found delete note buttons and add event listeners that perform the deletions when clicked
    for (let i = 0; i < del.length; i++) {

        // Add an event listener function for all the delete buttons identified
        del[i].addEventListener("click", function () {

            // Confirm the user really wants to delete the note
            if (confirm("Do you really want to delete this note? This action is not reversible.")) {

            // Splice out the selected note index from the array to delete based on the ID of the element clicked (the ID is always the note object's array index)
            LoadedNotes.splice(this.parentElement.id, 1);
            
            // Save the amended notes array to the current user object, then save that object to session and local storage
            CurrentUser.notes = JSON.stringify(LoadedNotes);
            storeLocal(CurrentUser.email, CurrentUser);
            storeSession(CurrentUser);

            // Refresh the notes display to show the updated notes list
                notesPage(CurrentUser);

            }

            // If the user doesn't confirm the note deletion, do nothing 
            else {
                return;
            }
        });
    }

   
}


// Adding new notes
function addNote() {

    // Validate the new note first
    // Check a title was entered
    if (document.getElementById("noteTitle").value == "") {
        error("You must enter a note title...")
        return;
    }

    // Check some content was entred
    if (document.getElementById("noteContent").value == "") {
        error("You must enter some note content...")
        return;
    }
    error("");



    // Find out which user we are storing the note for
    CurrentUser = readSession();
    
    // Store the entered note in variables
    let title = document.getElementById("noteTitle").value;
    let note = document.getElementById("noteContent").value;


    // let's try to save the new note shall we?
    
    // create the new note object to add to the array
    NewNoteObj = new NoteObj(title, note);
    

    // add the new note object to the array
    const ExistingNotes = JSON.parse(CurrentUser.notes);
    ExistingNotes.push(JSON.stringify(NewNoteObj));

    //save the the notes array into the CurrentUser object
    CurrentUser.notes = JSON.stringify(ExistingNotes);
    storeLocal(CurrentUser.email, CurrentUser);
    storeSession(CurrentUser);

    // clear the not entry fields and refresh the notes display
    document.getElementById("noteTitle").value = "";
    document.getElementById("noteContent").value = "";
    notesPage(CurrentUser);
}


function deleteAllNotes() {

    // load the notes array for the current user
    CurrentUser = readSession();
    const LoadedNotes = JSON.parse(CurrentUser.notes);


    // If there are no notes to delete, do nothing
    if (LoadedNotes.length == 0) {
        return;
    }


    // Confirm the user really wants to delete the notes
    if (confirm("Do you really want to delete all of your notes? This action is not reversible.")) {

        // Delete all the array content by splicing from zero index to the entire length of the array
        LoadedNotes.splice(0, LoadedNotes.length);

        // Save the amended notes array to the current user and local storage
        CurrentUser.notes = JSON.stringify(LoadedNotes);
        storeLocal(CurrentUser.email, CurrentUser);
        storeSession(CurrentUser);
    } else {
        return;
    }
  
    // Refresh the notes display
    notesPage(CurrentUser);
}



// BEGIN ACCOUNT PAGE LOGIC -----------------------------------------------------------------

function accountPage(CurrentUser) {

    // Clear any previous errors
    error("");

    // Set the content title
    document.getElementById('accountusername').innerHTML = "'s Account"; // <--- this is needed here to avoid duplicates of the username on refreshes of the page!!
    document.getElementById('accountusername').innerHTML = CurrentUser.name + document.getElementById('accountusername').innerHTML;


    // Show the user's account information
    document.getElementById('name').innerHTML = CurrentUser.name;
    document.getElementById('email').innerHTML = CurrentUser.email;

}


function changePassword() {
    let oldPass = document.getElementById('currentPW').value;
    let newPass = document.getElementById('newPW').value;
    let newPass2 = document.getElementById('newPW2').value;
    CurrentUser = readSession();

    if (blankFields(oldPass)) {
        error("Current password cannot be blank.");
        return;
    }

    if (passMatch(oldPass, CurrentUser.password) == false) {
        error("Current password is incorrect.");
        return;
    }


    if (blankFields(newPass)) {
        error("You must enter a new password.");
        return;
    }

    if (passMatch(oldPass, newPass) == true) {
        error("You cannot reuse the same password.");
        return;
    }

    if (passMatch(newPass, newPass2) == false){
        error("The new passwords must match.");
        return;
    }

    if (passMatch(newPass, newPass2) == true){

        CurrentUser.password = newPass;
        storeLocal(CurrentUser.email, CurrentUser);
        storeSession(CurrentUser);
        document.getElementById('currentPW').value = "";
        document.getElementById('newPW').value = "";
        document.getElementById('newPW2').value = "";

        swap(content, changepass);

        error("PASSWORD CHANGED SUCCESSFULLY!");
        
    }
}


// BEGIN TIMETABLE PAGE PAGE LOGIC -----------------------------------------------------------------

function timetablePage(CurrentUser) {

    // Clear any previous errors
    error("");

    // Set the content title
    document.getElementById('timetableusername').innerHTML = "'s Timetable"; // <--- this is needed here to avoid duplicates of the username on refreshes of the page!!
    document.getElementById('timetableusername').innerHTML = CurrentUser.name + document.getElementById('timetableusername').innerHTML;

    // If the user has not stored a timetable image, set a message to say so
    if (CurrentUser.timetable == null) {
        document.getElementById('currentTimetable').innerHTML = '<h2>There is no current timetable image to display. <br>Please upload one below.</h2>';
    }

    // Display the current timetable image
    if (CurrentUser.timetable != null) {

        // Load the timetable image from the CurrentUser Object
        const currentTimetableImage = JSON.parse(CurrentUser.timetable);

        // Create a place to display the timetable image
        document.getElementById('currentTimetable').innerHTML = '<img id="timetableIMG" src="" class="timetableIMG" alt="Current Timetable Image">';

        // Double check there is actually and image to display then display it
        if (currentTimetableImage) {
            document.querySelector('#timetableIMG').setAttribute("src", currentTimetableImage);
        }

        // If the timetable image element has a source, add a delete current timetable button
        if (document.getElementById('timetableIMG').getAttribute("src") != null) {
            document.getElementById('deleteTimetable').innerHTML = '<button onclick="deleteTimetable()">Delete Current Timetable</button>';
        }

    }

    
    // Add an event listener that will look for user file upload
    document.querySelector("#timetableFile").addEventListener("change", function () {


        const imageReader = new FileReader();


        imageReader.addEventListener("load", () => {

            
        CurrentUser.timetable = JSON.stringify(imageReader.result);

            try {
                storeLocal(CurrentUser.email, CurrentUser);
                storeSession(CurrentUser);
                
                timetablePage(CurrentUser);
            }
            catch {
                error("The file is too large or an incorrect format.");
            }

        });


        imageReader.readAsDataURL(this.files[0]);

        timetablePage(CurrentUser);
    });

}


function deleteTimetable() {

    // Confirm the user really wants to delete the timetable
    if (confirm("Do you really want to delete the current timetable? This action is not reversible.")) {


    // Get the current user
    const CurrentUser = readSession();

    // Set the timetable to null
    CurrentUser.timetable = null;

    // Save the change to storages
    storeLocal(CurrentUser.email, CurrentUser);
    storeSession(CurrentUser);

    // Remove the delete timetable button from the page
    document.getElementById("deleteTimetable").innerHTML = "";

    // Reset the file input
    timetableFile.value = "";

    // Refresh the timetable page
        timetablePage(CurrentUser);
    } else {
        return;
    }

}




// BEGIN CALENDAR PAGE LOGIC ----------------------------------------------------------------------------------

// Get the current date, time and time zone from the browser
const date = new Date();


function calendarPage(CurrentUser) {

    // Set the title for the user's notes
    document.getElementById('calendarusername').innerHTML = "'s Calendar"; // <--- this is needed here to avoid duplicates of the username on refreshes of the page!!
    document.getElementById('calendarusername').innerHTML = CurrentUser.name + document.getElementById('calendarusername').innerHTML;

    // Check if calendar events exist in the user object
    if (CurrentUser.eventsList == null) {

        // create the array if it doesnt exist
        CurrentUser.eventsList = JSON.stringify([],[],[]);

        // store the user in storages
        storeLocal(CurrentUser.email, CurrentUser);
        storeSession(CurrentUser);
    }

    // seting a default selected day day
    CurrentUser.selectedDay = 0;
    CurrentUser.selectedMonth = 0;
    CurrentUser.selectedYear = 0;
    storeSession(CurrentUser);

    // Add an event listener to move to previous months
    document.querySelector(".prev").addEventListener("click", () => {
        date.setMonth(date.getMonth() - 1);
        CurrentUser.selectedDay = 0;
        CurrentUser.selectedMonth = 0;
        CurrentUser.selectedYear = 0;
        storeSession(CurrentUser);
        refreshCalendar(CurrentUser);
    });

    // Add an event listener to move to next months
    document.querySelector(".next").addEventListener("click", () => {
        date.setMonth(date.getMonth() + 1);
        CurrentUser.selectedDay = 0;
        CurrentUser.selectedMonth = 0;
        CurrentUser.selectedYear = 0;
        storeSession(CurrentUser);
        refreshCalendar(CurrentUser);
    });

    document.querySelector(".save").addEventListener("click", () => {

        saveEntry(CurrentUser);
    });



    // Draw the initial calendar
    refreshCalendar(CurrentUser);
}


function refreshCalendar(CurrentUser) {

    // Sets the date to the current day
    date.setDate(1);

    // Identify the div element for displaying the days on the claendar interface
    const monthDays = document.querySelector(".days");

    // Find out what number the last day of the currently displayed month is
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    // Find the last day of the previous month
    const prevLastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();

    // Find out the index number of the current weekday to position the day numbers correctly
    const firstDayIndex = date.getDay();

    // Find out how many days are in the current month by getting the index of the last day +1 and storing it
    const lastDayIndex = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDay();

    // Find out from the last day index which day of the week the next month starts on
    const nextDays = 7 - lastDayIndex - 1;
    
    // An array of all the months of the year to display
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",];

    // Display the current month at the top of the calendar
    document.querySelector(".date h2").innerHTML = months[date.getMonth()] + " " + date.getFullYear();

    // Get today's full date as a string and display the date below the month name
    document.querySelector(".date p").innerHTML = new Date().toDateString();

    // Create a variable to store the contructed inner HTML for the calendar display
    let days = "";

    // Display the correct number of days from the previous month to line up the current month with the correct days
    for (let x = firstDayIndex; x > 0; x--) { // This subtracts the index of the weekday to find how many days from the previous months to display
            days += `<div class="prevDay">${prevLastDay - x + 1}</div>`;
    }

    // Dynamically assembling the HTML for the days within the calendar by looping up to the number of days in the current month
    for (let i = 1; i <= lastDay; i++) {

        // IF the day being displayed is today, highlight it, otherwise just populate a normal day
        if (i == new Date().getDate() && date.getMonth() == new Date().getMonth() && date.getFullYear() == new Date().getFullYear()){

            // if today is also the selected day, highlight it grey
            if (i == CurrentUser.selectedDay && date.getMonth() == new Date().getMonth()) {
                    days += `<div id="${i}" class="selected today day ${i}">${i}</div>`;
            }
            // Otherwise it's just today
            else {
                days += `<div id="${i}" class="today day ${i} ${months[date.getMonth()]}">
                                                                                        <p>${i}</p>
                        </div>`;
            }
        }
        // Or it's a selected day to be highlighted grey
        else if (i == CurrentUser.selectedDay && CurrentUser.selectedMonth == date.getMonth()) {
            days += `<div class="selected day ${i} ${months[date.getMonth()]}">${i}</div>`;
        }
        // or it's jsut a normal day
        else {
             days += `<div id="${i}" class="day ${i} ${months[date.getMonth()]}">
                                                                            <p id="${i}">${i}</p>
                    </div>`;
             }
    }

 
    // Display the days form the next month - inverse of the loop to display the previous month's days
    for (let j = 1; j <= nextDays; j++) {
        days += `<div class="nextDay ${j}">${j}</div>`;
    }

    // Display all the assembled HTML into the div with the class "days"
    monthDays.innerHTML = days;

    // If the selected day is not undefined, display it as the selected date for new entries
    if (CurrentUser.selectedDay != 0) {
        document.getElementById("newEntryDate").innerHTML = CurrentUser.selectedDay + " " + months[date.getMonth()] + " " + date.getFullYear();
    }

    // Otherwise there isn't a day selected so ask the user to select one
    else {
        document.getElementById("newEntryDate").innerHTML = "Please select a date."
    }

    // run the selectDay function to assign event listeners to days and handle user interactions
    selectDay(CurrentUser);   
}


function selectDay(CurrentUser) {

    // Make the days selectable
    let day = document.getElementsByClassName("day"); // Identify all the days in the current month
    
    // Loop through the found days and add event listeners to each one
    for (let i = 0; i < day.length; i++) {

        // Add an event listener function for all the days so the can be clicked
        day[i].addEventListener("click", function () {


            // Add the selected day to the current user object and format it as two digits
            CurrentUser.selectedDay = this.id;
            if (CurrentUser.selectedDay.length < 2) {
                CurrentUser.selectedDay = 0 + CurrentUser.selectedDay;
                
            }

            // Add the selected month to the current user object and format it as two digits
            CurrentUser.selectedMonth = date.getMonth().toString();
            if (CurrentUser.selectedMonth.length < 2) {
                CurrentUser.selectedMonth = 0 + CurrentUser.selectedMonth;
                
            }

            // Add the selected year to the current user object
            CurrentUser.selectedYear = date.getFullYear().toString();

            // store the current user
            storeSession(CurrentUser);

            // Refresh the calendar for any changes made
            refreshCalendar(CurrentUser);
            
        });
    }

    // Display any events for the selected day
    displayEvents(CurrentUser);
}


function displayEvents(CurrentUser) {

    // assemble the selected day string
    let selectedDate = CurrentUser.selectedDay.toString() + CurrentUser.selectedMonth.toString() + CurrentUser.selectedYear.toString();
    // if the user hasn't selected a day yet and no events were found for today, tell them there's no events today.

    // load the events list array
    const eventsList = JSON.parse(CurrentUser.eventsList);

    // Check that a date was actually selected. if not, ask the user to select one
    if (selectedDate == "000") {
        
        document.getElementById("events").innerHTML = "Please select a date to display or create events.";

    }

    // else if a date has already been selected
    if (selectedDate != "000") {

        // identify where to place the events on the page to display
        const eventDisplay = document.querySelector(".eventDisplay");

        // declare a variable to assemble html elements in for displaying events
        let eventDivs = "";

        /*// load the events list array
        const eventsList = JSON.parse(CurrentUser.eventsList);*/

        //loop through the events list array
        for (let i = 0; i < eventsList.length; i++) {

            // compare the selected date to the date stored with each created event
            if (eventsList[i][0].toString() == selectedDate) {
                
                // make the event ID the index number
                let eventID = i;

                // Pull the event title from the array
                let title = eventsList[i][1];

                // Pull the event details from the array
                let details = eventsList[i][2];

                // Assemble the html string for this particular event to be displayed and add it to the existing html string
                eventDivs += `<div class="event" id="${eventID}">
                                <table class="eventTable">
                                       <tr>
                                           <td id="${eventID}"><h2 class="delEvent">X</h2></td>  <td><h3>Title:</h3></td> <td><p>${title}</p></td>
                                       </tr>
                                       <tr>
                                           <td></td> <td><h3>Details:</h3></td> <td><p>${details}</p></td> 
                                       </tr>
                                </table>
                              </div>`;
            }

        }

        // Display the assembled events html
        eventDisplay.innerHTML = eventDivs;

        // If there's nothing to display it means there were no events found in the array for that day. Tell the user.
        if (eventDivs == "") {
            document.getElementById("eventsDisplay").innerHTML = '<p id="events">No events to display for the selected date.</p>';
        }
    }


    // Make the displayed events deletable

    // Make the notes deleteable - show an X that can be clicked to delete a note
    let delEvent = document.getElementsByClassName("delEvent"); // Identify all the delete event buttons on the page
    
    // Loop through the found buttons and add event listeners that perform deletions when clicked
    for (let j = 0; j < delEvent.length; j++) {

        // Add an event listener function for all the delete buttons identified
        delEvent[j].addEventListener("click", function () {

            // Confirm the user really wants to delete the calendar entry
            if (confirm("Do you really want to delete this calendar entry? This action is not reversible.")) {

            // Splice out the selected event index from the array to delete based on the ID of the element clicked
            eventsList.splice(this.parentElement.id, 1);

            // store the changed array in the user
            CurrentUser.eventsList = JSON.stringify(eventsList);
            storeLocal(CurrentUser.email, CurrentUser);
            storeSession(CurrentUser);

            // Refresh the display to show the updated events
            displayEvents(CurrentUser);

        } else {
            return;
        }

        });
    }
    
}


function saveEntry(CurrentUser) {

    // Create variables to assemble the new calendar entry
    let date = CurrentUser.selectedDay + CurrentUser.selectedMonth + CurrentUser.selectedYear;
    let title = document.getElementById("event-title").value;
    let details = document.getElementById("event-details").value;

    // If date has zeros in it, it means no date was selected - tell the user to pick a date
    if (date == "000") {
        error("You must select a date to save the event for...");
        return;
    }

    // If the title field is blank tell the user to enter a title
    if (blankFields(title)){
        error("You must enter a title for your event...");
        return;
    }

    // If the details field is blank tell the user to enter some details
    if (blankFields(details)) {
        error("You must enter some details for your event...")
        return;
    }

    // Reset the error message and wipe the entry fields
    error("");
    document.getElementById("event-title").value = "";
    document.getElementById("event-details").value = "";

    // load the old array
    let events = JSON.parse(CurrentUser.eventsList);

    // tack the new entry onto the end of the array
    events.push([date, title, details]);

    // store the appended array in the user
    CurrentUser.eventsList = JSON.stringify(events);

    // store the user in storages
    storeSession(CurrentUser);
    storeLocal(CurrentUser.email, CurrentUser);

    
    // Display the events again for any changes
    displayEvents(CurrentUser);

}

    // Sends a supplied error message to any error fields on the page and to the console
function error(errorMSG) {
    let errorFields = document.getElementsByClassName("error");
    let i;
    for (i = 0; i < errorFields.length; i++) {
        errorFields[i].innerHTML = errorMSG;
    };
    if (errorMSG != "") {
        console.log(errorMSG);
    }
}





