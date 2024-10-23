let words = ["take", "break", "back", "track"];

let precedingPhrases = [
  "if it gives you can bet its gonna",
  "if it bends you can bet its gonna",
  "if its gone you can bet its coming",
  "if you're wrong than you're on the right",
];

let currentWordIndex = 0;
let currentWord = words[currentWordIndex];
let currentPhrase = precedingPhrases[currentWordIndex];
let previousGuesses = [];
let currentGuess = "";
let attempts = 3;
let points = 0;
let sound;
let buttons = [];
let deleteButton;
let backgroundImage;
let startButton; // Start button
let gameState = "start"; // Initial game state
let redirectTriggered = false; // Ensure we only trigger the redirect once

// q: how to make the font source code pro from google fonts, it is linked in html


function preload() {
  sound = loadSound("instrumental.wav");
  backgroundImage = loadImage("assets/images/cover.JPG");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();

  // Create the start button (centered)
  startButton = new Button("Start", width / 2 - 50, height / 2 - 25, 100, 50);

  // Set up the keyboard buttons and delete button
  createKeyboardButtons();
  deleteButton = new Button("delete", width / 2 - 40, 750, 80, 25);
  buttons.push(deleteButton);
  textFont("Source Code Pro"); // Set the font to Source Code Pro
}

function draw() {
  clear();
  // Handle different game states
  if (gameState === "start") {
    drawStartScreen();
  } else if (gameState === "playing") {
    drawGameScreen();
  } else if (gameState === "end") {
    drawEndScreen();
  }
}

function drawStartScreen() {

    image(backgroundImage, 0, 0, windowWidth, windowHeight);
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("What I'll Do", width / 2, height / 2 - 200);
  textSize(16);
    text("(a wordle game)", width / 2, height / 2 - 100);

  // Show the start button
  startButton.show();
}

function drawEndScreen() {
  image(backgroundImage, 0, 0, windowWidth,windowHeight) ;
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Your final score: " + (points/12)*100 + "%", width / 2, height / 2 + 50);

  // Trigger the redirect after 5 seconds (5000ms), only once
  if (!redirectTriggered) {
    redirectTriggered = true; // Prevent multiple redirects
    setTimeout(function() {
      window.location.href = "https://artists.landr.com/055855869807"; // Redirect to the provided link
    }, 2500); // 2.5-second delay
  }
}

function drawGameScreen() {
  image(backgroundImage, 0, 0, windowWidth, windowHeight);
  displayScoreAndPhrase();
  displayGuessGrid();
  buttons.forEach((button) => button.show());
}

// Start the game and loop the sound
function startGame() {
  gameState = "playing"; // Change the game state to 'playing'
  sound.loop(); // Start looping the sound
  loop(); // 
  //console.log("Game started!"); // Add this for debugging
}

// Handle guess input from keyboard and mouse
function handleGuessInput(input) {
  if (input === "delete") {
    currentGuess = currentGuess.slice(0, -1);
  } else if (currentGuess.length < currentWord.length) {
    currentGuess += input;
    if (currentGuess.length === currentWord.length) {
      checkGuess(); // Ensure checkGuess is called when guess is complete
    }
  }
}

// Define the missing checkGuess function
function checkGuess() {
  if (currentGuess === currentWord) {
    // Correct guess, increment points based on attempts
    if (attempts === 3) {
      points += 3;
    } else if (attempts === 2) {
      points += 2;
    } else if (attempts === 1) {
      points += 1;
    }
    // Move to the next word, unless it's the last word
    if (currentWordIndex < words.length - 1) {
      currentWordIndex++;
      currentWord = words[currentWordIndex];
      currentPhrase = precedingPhrases[currentWordIndex];
      currentGuess = "";
      previousGuesses = [];
      attempts = 3;
    } else {
      gameState = "end"; // End the game if all words are guessed
    }
  } else {
    // Incorrect guess
    attempts--;
    previousGuesses.push(currentGuess);
    currentGuess = "";
    if (attempts === 0) {
      // Move to the next word, unless it's the last word
      if (currentWordIndex < words.length - 1) {
        currentWordIndex++;
        currentWord = words[currentWordIndex];
        currentPhrase = precedingPhrases[currentWordIndex];
        previousGuesses = [];
        attempts = 3;
      } else {
        gameState = "end"; // End the game if all words are guessed
      }
    }
  }
}

function keyPressed() {
  if (gameState === "playing") {
    // Check if the pressed key is a regular letter (A-Z)
    if (keyCode >= 65 && keyCode <= 90) { // A-Z key codes
      currentGuess += key.toLowerCase();
      if (currentGuess.length === currentWord.length) {
        checkGuess(); // Check the guess when it's complete
      }
    }
  }
}

function displayScoreAndPhrase() {
  fill(255);
  textSize(15);
  textAlign(CENTER, CENTER);
  text("score: " + points, width / 2, height / 2);
  text(currentPhrase, width / 2, 40);
}

function displayGuessGrid() {
  let startX = (windowWidth - currentWord.length * 60) / 2;
  for (let i = 0; i < currentWord.length; i++) {
    for (let j = 0; j < 3; j++) {
      let x = startX + i * 60;
      let y = 100 + j * 60;
      let letter = new LetterUnit(" ", x, y);
      assignLetterToGrid(i, j, letter);
      letter.show();
    }
  }
}

function assignLetterToGrid(i, j, letter) {
  if (j === previousGuesses.length && currentGuess.length > i) {
    letter.letter = currentGuess[i];
  } else if (previousGuesses[j]) {
    letter.letter = previousGuesses[j][i];
    let currentGuessRow = previousGuesses[j];

    // Step 1: Count occurrences of each letter in the current word
    let wordLetterCount = {};
    for (let char of currentWord) {
      wordLetterCount[char] = (wordLetterCount[char] || 0) + 1;
    }

    // Step 2: First, handle correct (green) placements and decrease count
    let resultColors = new Array(currentGuessRow.length).fill(null); // To track letter colors (null, yellow, green)
    let guessedLetters = new Array(currentGuessRow.length).fill(false); // To track which positions have been processed

    // Check for correct (green) letters first
    for (let k = 0; k < currentGuessRow.length; k++) {
      if (currentGuessRow[k] === currentWord[k]) {
        resultColors[k] = color(0, 255, 0); // Mark as green
        wordLetterCount[currentGuessRow[k]]--; // Reduce available count for that letter in the word
        guessedLetters[k] = true; // Mark this position as processed
      }
    }

    // Step 3: Handle misplaced (yellow) letters
    for (let k = 0; k < currentGuessRow.length; k++) {
      if (!guessedLetters[k]) { // Process only non-green letters
        let guessedLetter = currentGuessRow[k];

        // Check if the letter exists in the word and hasn't been fully matched
        if (currentWord.includes(guessedLetter) && wordLetterCount[guessedLetter] > 0) {
          resultColors[k] = color(255, 255, 0); // Mark as yellow
          wordLetterCount[guessedLetter]--; // Decrease available count for that letter
        } else {
          resultColors[k] = color(230); // Gray (default)
        }
      }
    }

    // Apply the determined color to the current letter
    letter.color = resultColors[i];
  }
}

function createKeyboardButtons() {
  let buttonLayout = [
    { rowLength: 10, xOffset: -160, yOffset: 600 },
    { rowLength: 9, xOffset: -140, yOffset: 650 },
    { rowLength: 7, xOffset: -110, yOffset: 700 },
  ];

  let letters = "qwertyuiopasdfghjklzxcvbnm";
  let buttonIndex = 0;

  buttonLayout.forEach((layout) => {
    let buttonX = width / 2 + layout.xOffset;
    let buttonY = layout.yOffset;
    for (let i = 0; i < layout.rowLength; i++) {
      let letter = letters[buttonIndex++];
      buttons.push(new Button(letter, buttonX, buttonY, 25, 25));
      buttonX += 30;
    }
  });
}

class LetterUnit {
  constructor(letter, x, y, width = 50, height = 50) {
    this.letter = letter;
    this.x = x;
    this.y = y;
    this.color = 230;
    this.width = width;
    this.height = height;
  }

  show() {
    fill(this.color);
    rect(this.x, this.y, this.width, this.height);
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(32);
    text(this.letter, this.x + this.width / 2, this.y + this.height / 2);
  }
}

class Button {
  constructor(letter, x, y, width = 25, height = 25) {
    this.letter = letter;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  show() {
    fill(255);
    rect(this.x, this.y, this.width, this.height, 10);
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(20);
    text(this.letter, this.x + this.width / 2, this.y + this.height / 2);
  }

  isClicked(mouseX, mouseY) {
    const isClicked = mouseX > this.x && mouseX < this.x + this.width && mouseY > this.y && mouseY < this.y + this.height;
    //console.log("Button clicked:", isClicked); // Add this for debugging
    return isClicked;
  }
}

function mouseClicked() {
  //console.log("Mouse clicked at:", mouseX, mouseY); // Add this for debugging
  handleClickOrTouch(mouseX, mouseY); 
}

function touchStarted() {
  if (touches.length > 0) {
    handleClickOrTouch(touches[0].x, touches[0].y); // Get the first touch point
  }
  return false; // Prevent default behavior like scrolling or zooming in mobile browsers
}

// A unified function to handle both click and touch events
function handleClickOrTouch(x, y) {
  // Check if we are on the start screen and the start button is clicked
  if (gameState === "start" && startButton.isClicked(x, y)) {
    startGame(); // Start the game when the start button is clicked
  } else if (gameState === "playing") {
    buttons.forEach((button) => {
      if (button.isClicked(x, y)) {
        handleGuessInput(button.letter);
      }
    });
  }
}
