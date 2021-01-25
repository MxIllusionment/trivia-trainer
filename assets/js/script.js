var bots = [];
var users = [];
var triviaUrl = ""
var currentQuestionIndex = 0;
var allQuestions = [];
var availableAnswers;
var currentUser = -1;


var currentGameData = {
  difficulty: "",
  category: "",
  questions: -1,
  score: -1
};


var categoryData = [
  {
    category: "General Knowledge",
    value: 9
  },
  {
    category: "Books",
    value: 10
  },
  {
    category: "Film",
    value: 11
  },
  {
    category: "Music",
    value: 12
  },
  {
    category: "Musicals and Theatre",
    value: 13
  },
  {
    category: "TV",
    value: 14
  },
  {
    category: "Video Games",
    value: 15
  },
  {
    category: "Board Games",
    value: 16
  },
  {
    category: "Science and Nature",
    value: 17
  },
  {
    category: "Computers",
    value: 18
  },
  {
    category: "Math",
    value: 19
  },
  {
    category: "Mythology",
    value: 20
  },
  {
    category: "Sports",
    value: 21
  },
  {
    category: "Geography",
    value: 22
  },
  {
    category: "History",
    value: 23
  },
  {
    category: "Politics",
    value: 24
  },
  {
    category: "Art",
    value: 25
  },
  {
    category: "Celebrities",
    value: 26
  },
  {
    category: "Animals",
    value: 27
  },
  {
    category: "Vehicles",
    value: 28
  },
  {
    category: "Comic Books",
    value: 29
  },
  {
    category: "Gadgets",
    value: 30
  },
  {
    category: "Anime",
    value: 31
  },
  {
    category: "Cartoons and Animation",
    value: 32
  },

];



/* Initialization and opening of start/user select page */
function openStartPage() {
  renderUsers();
  $("#start-screen").removeClass("hide");
  $("#setup-screen").addClass("hide");
  $("#game-screen").addClass("hide");
  $("#history-screen").addClass("hide");
}

/* Initialization and opening of game setup page */
function openSetupPage() {
  $("#invalid-options").addClass("hide");

  $("#start-screen").addClass("hide");
  $("#setup-screen").removeClass("hide");
  $("#game-screen").addClass("hide");
  $("#history-screen").addClass("hide");
}

/* Initialization and opening of quiz/game page */
function openQuizPage() {
  $("#question-display").removeClass("hide");
  $("#answer-display").removeClass("hide");
  $("#answer-response").addClass("hide");
  $("#next-button").addClass("hide");
  $("#game-over").addClass("hide");
  $("#end-game").addClass("hide");

  $("#start-screen").addClass("hide");
  $("#setup-screen").addClass("hide");
  $("#game-screen").removeClass("hide");
  $("#history-screen").addClass("hide");
}

//Initialization and opening of game history page
function openHistoryPage() {
  renderHistory();
  $("#start-screen").addClass("hide");
  $("#setup-screen").addClass("hide");
  $("#game-screen").addClass("hide");
  $("#history-screen").removeClass("hide");
}

//click function for navigation buttons
$(".new-user").on("click", function () {
  openStartPage();
});

$(".view-history").on("click", function () {
  openHistoryPage();
});

$(".header").on("click", function () {
  stopBotEngine();
  openStartPage();
});

$(".view-setup").on("click", function () {
  openSetupPage();
});

/* Returns a link to a user avatar image */
function genUserAvatar(seed) {
  return "https://avatars.dicebear.com/api/gridy/" + seed + ".svg?colorful=1&deterministic=1&w=75&h=75";
}

/* Returns a link to a bot avatar image */
function genBotAvatar(seed) {
  return "https://avatars.dicebear.com/api/bottts/" + seed + ".svg?colorful=1&mouthChance=50&sidesChance=50&topChance=50&w=75&h=75";
}

/* Initializes the bots list with a set number of new bots */
function initializeBots(count) {
  bots = [];
  for (var i = 0; i < count; i++) {
    var newBot = {
      seed: Math.floor(Math.random() * 1000000) + 1,
      interval: null,
      answered: false
    };
    newBot.url = genBotAvatar(newBot.seed);
    bots.push(newBot);
  }
}

/* On-click function for user in list being clicked */
function clickUser() {
  var userIdx = parseInt($(this).attr("data-index"));

  currentUser = userIdx;

  openSetupPage();
}

/* Renders list of users to front end */
function renderUsers() {
  $("#users").empty();
  users.forEach(function (user, idx) {
    var newDiv = $("<div>");
    var newImg = $("<img>").attr("src", user.avatarURL);
    var newSpan = $("<span>").html(user.name);

    newImg.attr("data-index", idx);
    newImg.addClass("user-avatar");
    newImg.click(clickUser);

    newDiv.append(newImg);
    newDiv.append(newSpan);
    $("#users").append(newDiv);
  });
}

/* Creates a new user, adds it to the list of users, and returns the
   index of the new user */
function addUser(name) {
  var newUser = {
    name: name,
    seed: Math.floor(Math.random() * 1000000) + 1,
    history: []
  }
  newUser.avatarURL = genUserAvatar(name + newUser.seed);
  users.push(newUser);
  saveUsers();

  return users.length - 1;
}

/* Saves all users to local storage */
function saveUsers() {
  localStorage.setItem("trivia-users", JSON.stringify(users));
}

/* Loads users from local storage */
function loadUsers() {
  var loadedUsers = JSON.parse(localStorage.getItem("trivia-users"));

  if (loadedUsers) {
    users = loadedUsers;
  }
}

/* Renders bot answer to front end */
function renderBotAnswer(imgURL, answer) {
  var newBot = $("<div>").addClass("bot-answer");
  var newRow = $("<div>").addClass("row");
  var newImg = $("<img>").attr("src", imgURL);
  var newImgCol = $("<div>").addClass("col-4");
  var newAnswer = $("<div>").addClass("col-8 bot-answer-text");

  newImg.addClass("bot-avatar");
  newImgCol.append(newImg);

  newAnswer.html("answered '" + answer + "'");

  newRow.append(newImgCol);
  newRow.append(newAnswer);
  newBot.append(newRow);

  $("#bot-chat").append(newBot);
}

/* Callback function to handle bot behavior at set interval */
function botHandler(botIdx) {
  var answerChance = 0.45; // Probability that bot will answer

  /* Check if bot will answer */
  if (!bots[botIdx].answered && (Math.random() < answerChance)) {
    var botAnswer;
    var answerIndex = Math.floor(Math.random() * availableAnswers.length);

    bots[botIdx].answered = true;

    /* Randomly select an answer */
    botAnswer = availableAnswers[answerIndex];

    /* Remove selected answer from available answers */
    availableAnswers.splice(answerIndex, 1);

    /* Render answer */
    renderBotAnswer(bots[botIdx].url, botAnswer);

    /* Process if answer is correct */
    processBotAnswer(botAnswer);
  }
}

/* Starts up the bot engine for all bots */
function startBotEngine() {
  var botTimer = 3500; // base ms timer for each bot

  availableAnswers = allQuestions[currentQuestionIndex].answers;
  $("#bot-chat").empty();
  for (var i = 0; i < bots.length; i++) {
    var timerRand = Math.floor(Math.random() * 2000);

    bots[i].answered = false;
    bots[i].interval = setInterval(botHandler, botTimer + timerRand, i);
  }
}

/* Stops bot engine for all bots */
function stopBotEngine() {
  for (var i = 0; i < bots.length; i++) {
    clearInterval(bots[i].interval);
  }
}

/*get the trivial url based on selections from user */
function getTriviaUrl() {
  var difficulty = $("#difficulty").val();
  var category = $("#category").val();
  var questionAmount = $("#questionAmount").val();

  if (difficulty === "" && category === "") {
    triviaUrl = "https://opentdb.com/api.php?amount=" + questionAmount + "&type=multiple";
  }
  else if (difficulty !== "" && category === "") {
    triviaUrl = "https://opentdb.com/api.php?amount=" + questionAmount + "&difficulty=" + difficulty + "&type=multiple";
  }
  else if (difficulty === "" && category !== "") {
    triviaUrl = "https://opentdb.com/api.php?amount=" + questionAmount + "&category=" + category + "&type=multiple";
  }
  else {
    triviaUrl = "https://opentdb.com/api.php?amount=" + questionAmount + "&category=" + category + "&difficulty=" + difficulty + "&type=multiple";
  }

  return triviaUrl;

}

/*shuffles an array put into it */
function shuffle(array) {
  var currentIndex = array.length, tempValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    tempValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = tempValue;
  }
  return array;
}

/*Starts the game */
function startGame(response) {
  //store required data to global
  allQuestions = [];
  for (var i = 0; i < response.results.length; i++) {
    var newQuestion = {
      question: response.results[i].question,
      answers: putAnswersArray(response, i),
      correctAnswer: response.results[i].correct_answer
    };
    allQuestions.push(newQuestion);
  }

  if (allQuestions.length === currentGameData.questions) {
    currentQuestionIndex = 0;
    initializeBots(4);
    renderQuestion();
    openQuizPage();
    startBotEngine();
  } else {
    $("#invalid-options").removeClass("hide");
  }
}

/* Renders the question and answer buttons */
function renderQuestion() {
  $("#question-display").html(allQuestions[currentQuestionIndex].question);
  $("#answer-display").empty();
  //display answers
  for (var i = 0; i < allQuestions[currentQuestionIndex].answers.length; i++) {
    var answerBtn = $("<button>");
    answerBtn.addClass("btn-block game-btn");
    answerBtn.html(allQuestions[currentQuestionIndex].answers[i]);
    answerBtn.attr("data-value", allQuestions[currentQuestionIndex].answers[i]);
    $("#answer-display").append(answerBtn);
    answerBtn.on("click", function () {
      processAnswer($(this).attr("data-value"));
    });
  }
}

/* Processes a clicked user answer button */
function processAnswer(answer) {
  if (answer === allQuestions[currentQuestionIndex].correctAnswer) {
    currentGameData.score++;
    $("#answer-response").html("You got it right!");
  }
  else {
    $("#answer-response").html("Wrong! Correct Answer: " + allQuestions[currentQuestionIndex].correctAnswer);
  }
  $("#answer-response").removeClass("hide");
  finishQuestion();
}

/* Checks if a bot answer is correct and halts current question if it is*/
function processBotAnswer(answer) {
  if (answer === allQuestions[currentQuestionIndex].correctAnswer) {
    $("#answer-response").html("An opponent answered first: " + allQuestions[currentQuestionIndex].correctAnswer);
    $("#answer-response").removeClass("hide");
    finishQuestion();
  }
}

/* Creates a shuffled array of answers for a question */
function putAnswersArray(response, i) {
  var currentAnswerArray = response.results[i].incorrect_answers.concat(response.results[i].correct_answer)
  // console.log(answerArray)
  shuffle(currentAnswerArray);
  return currentAnswerArray;
}

/* Sets the global current game data */
function setCurrentGameData() {
  currentGameData.difficulty = $("#difficulty").val();
  currentGameData.category = $("#category").val();
  currentGameData.questions = parseInt($("#questionAmount").val());
  currentGameData.score = 0;
}

/* Saves game data to user history */
function saveGameHistory(userIdx) {
  var newHistory = {
    date: dayjs().format("MM/DD/YYYY"),
    time: dayjs().format("h:mmA"),
    score: currentGameData.score + "/" + currentGameData.questions
  };

  newHistory.difficulty = currentGameData.difficulty === "" ? "any" : currentGameData.difficulty;

  /* Lookup category value and translate into string */
  if (currentGameData.category === "") {
    newHistory.category = "Any";
  } else {
    var catVal = parseInt(currentGameData.category);
    for (var i = 0; i < categoryData.length; i++) {
      if (catVal === categoryData[i].value) {
        newHistory.category = categoryData[i].category;
        break;
      }
    }
  }

  users[userIdx].history.push(newHistory);
  saveUsers();
}

/* Updates for finalizing a question and moving on */
function finishQuestion() {
  $("#question-display").addClass("hide");
  $("#answer-display").addClass("hide");
  stopBotEngine();

  if (currentQuestionIndex === allQuestions.length - 1) {
    endGame();
  } else {
    $("#next-button").removeClass("hide");
  }
}

//function to render history
function renderHistory() {
  $("#past_records").empty();

  if (users[currentUser].history.length === 0) {
    $("#past_records").text("Nothing here. Play some games!");
  } else {
    users[currentUser].history.forEach(function (history) {
      var newHistoryItem = $("<div>");

      newHistoryItem.text(history.date + " " + history.time + ":  Difficulty: " + history.difficulty + ",  Category: " + history.category + ", Score: " + history.score);
      newHistoryItem.addClass("mb-1 history-item");

      $("#past_records").prepend(newHistoryItem);
    });
  }
}

//function to end game
function endGame() {
  //call savegamehistory
  saveGameHistory(currentUser);

  //display game over screen with score
  var gameOverDisplay = $("#game-over");

  //display score on gameOverDisplay
  gameOverDisplay.text("GAME OVER! Your score was: " + currentGameData.score);
  gameOverDisplay.removeClass("hide");

  //button to move onto game history
  $("#end-game").removeClass("hide");
}

/* Click event to create a new user */
$("#create-user").on("click", function (event) {
  event.preventDefault();
  var name = $("#user-input").val();
  if (name !== "") {
    currentUser = addUser(name);
    $("#user-input").val("");
    openSetupPage();
  }
});

/*for when we click to play game, this gets the url */
$("#start-game").on("click", function () {
  var triviaUrl = getTriviaUrl();

  setCurrentGameData();
  $.ajax({
    url: triviaUrl,
    method: "GET"
  }).then(startGame);
});

/* Click event for next question button */
$("#next-button").on("click", function () {
  $("#answer-response").addClass("hide");
  $("#next-button").addClass("hide");
  currentQuestionIndex++;
  $("#question-display").removeClass("hide")
  $("#answer-display").removeClass("hide")
  renderQuestion();
  startBotEngine();
});

/* Click event to finish game */
$("#end-game").on("click", function () {
  $("#bot-chat").empty();
  openHistoryPage();
});

/* Initialization items */
loadUsers();
openStartPage();
