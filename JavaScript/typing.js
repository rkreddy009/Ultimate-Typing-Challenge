let timer;
let difficulty = localStorage.getItem('difficulty');  // Get difficulty from index.html
let timeLimit = 1;  // Default timer is set to 1 minute
let correct = 0;  // Correct letters count
let incorrect = 0;  // Incorrect letters count
let typedText = '';  // Typed text storage

// Wikipedia API Fetch Function to get a meaningful passage based on difficulty
async function fetchWikiText() {
    const response = await fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary');
    const data = await response.json();
    return data.extract;  // Get a meaningful passage from a random Wikipedia article
}

// Function to get a passage of appropriate length based on difficulty level
function getRandomText(text, difficulty) {
    let length;
    if (difficulty === 'easy') {
        length = 300;  // Easy passage length
    } else if (difficulty === 'medium') {
        length = 500;  // Medium passage length
    } else if (difficulty === 'hard') {
        length = 700;  // Hard passage length
    }

    if (text.length > length) {
        return text.substring(0, length);  // Trim to the appropriate length
    }
    return text;  // If text is shorter than the required length, return it as-is
}

// Display text and timer based on user selection
async function displayTextAndStartTimer() {
    const wikiText = await fetchWikiText();
    const randomText = getRandomText(wikiText, difficulty);

    const paraDiv = document.getElementById("para");
    paraDiv.innerHTML = "";  // Clear previous content

    // Create spans for each character in the passage
    for (let char of randomText) {
        const span = document.createElement("span");
        span.className = "span";
        span.textContent = char;
        paraDiv.append(span);
    }

    // Start the timer
    startTimer(timeLimit);
}

// Timer function
function startTimer(duration) {
    let time = duration * 60;  // Convert minutes to seconds
    const display = document.getElementById('timerDisplay');

    timer = setInterval(() => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        display.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
        time--;

        if (time < 0) {
            clearInterval(timer);
            endTest();  // End test when the timer reaches zero
        }
    }, 1000);
}

// Input field to track typing and highlight correct/incorrect characters
const inputField = document.getElementById("input");
inputField.addEventListener('input', () => {
    typedText = inputField.value;
    const spanElements = document.getElementById("para").getElementsByTagName("span");

    // Loop through the typed characters and compare
    for (let i = 0; i < spanElements.length; i++) {
        const span = spanElements[i];
        const typedChar = typedText[i];

        // Mark correct, incorrect, or untyped characters
        if (typedChar === undefined) {
            span.style.color = "";  // Reset to default if untyped
        } else if (typedChar === span.textContent) {
            span.style.color = "grey";  // Correct character
        } else {
            span.style.color = "red";  // Incorrect character
        }
    }
});

// End the test and calculate results
function endTest() {
    inputField.disabled = true;  // Disable further typing
    calculateResults();  // Calculate typing statistics
}

// Function to calculate accuracy, net speed, gross speed, etc.
function calculateResults() {
    let totalCharacters = document.getElementById("para").textContent.length;
    let totalTyped = typedText.length;
    let grossSpeed = Math.floor(totalTyped / 5);  // Gross speed: Total characters typed divided by 5
    let incorrectChars = 0;

    // Calculate correct and incorrect words/characters
    const spanElements = document.getElementById("para").getElementsByTagName("span");
    for (let i = 0; i < totalTyped; i++) {
        if (spanElements[i] && spanElements[i].textContent === typedText[i]) {
            correct++;
        } else {
            incorrect++;
            incorrectChars++;
        }
    }

    // Calculate accuracy and net speed
    let accuracy = (correct / totalTyped) * 100;
    let netSpeed = grossSpeed - Math.floor(incorrectChars / 5);  // Net speed: Gross speed minus penalty for incorrect words

    if (netSpeed < 0) {
        netSpeed = 0;  // Ensure net speed is not negative
    }

    // Display the results
    displayResults(grossSpeed, netSpeed, accuracy.toFixed(2), correct, incorrect);
}

// Function to display the results at the end of the test
function displayResults(grossSpeed, netSpeed, accuracy, correctWords, incorrectWords) {
    const resultsDiv = document.createElement("div");
    resultsDiv.id = "results";

    resultsDiv.innerHTML = `
        <h2>Your Test Score</h2>
        <div>
            <div class="gross-speed">
                <h3>Gross Speed</h3>
                <p>${grossSpeed}</p>
                <div class="wpm">WPM</div>
            </div>
            <div class="net-speed">
                <h3>Net Speed</h3>
                <p>${netSpeed}</p>
                <div class="wpm">WPM</div>
            </div>
            <div class="accuracy">
                <h3>Accuracy</h3>
                <p>${accuracy}%</p>
            </div>
        </div>
        <div class="details">
            <p>Correct Letters : ${correctWords}</p>
            <p>Incorrect Letters : ${incorrectWords}</p>
        </div>
        <div id="control1">
            <button onclick="restart()">Restart</button>
            <button onclick="exit()">Exit</button>
        </div>
    `;

    const mainDiv = document.getElementById("main1");
    mainDiv.innerHTML = '';  // Clear the current content
    mainDiv.appendChild(resultsDiv);  // Append the results to the main div
}

// Restart function to reload the page
function restart() {
    window.location.reload();
}

// Exit function to go back to the main index page
function exit() {
    window.location.href = "index.html";
}

// Call the function to display text and start timer when the page loads
window.onload = displayTextAndStartTimer;
