// ============================================================================
// Class BaseObject
var BaseObject = function() {};

// Draw the objects on the screen, required method for game
BaseObject.prototype.render = function() {
  // If this.scale is not given, set it to 1
  this.scale = this.scale || 1;

  if (this.scale === 1) {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
  else {
    // Scale the sprite, if required.
    var spriteImage = Resources.get(this.sprite);
    var width = spriteImage.width * this.scale;
    var height = spriteImage.height * this.scale;
    ctx.drawImage(spriteImage, this.x, this.y, width, height);
  }
};

// Reset the objects back to the start position
BaseObject.prototype.reset = function() {
  this.x = this.INIT_X;
  this.y = this.INIT_Y;
};
// ============================================================================



// ============================================================================
// Class Enemy
var Enemy = function() {
  this.sprite = 'images/enemy-bug.png'; // path to enemy image
  this.x = Math.floor(Math.random() * screen.width); // random inital x-axis position
  var possibleYPositions = [65, 148, 231]; // possible positions of enemies on the y-axis
  this.y = possibleYPositions[Math.floor(Math.random() * possibleYPositions.length)]; // random inital y-axis position
  this.speed = Math.floor(Math.random() * 400) + 20; // random speed value
};

// Setup Enemy to inherit from BaseObject
Enemy.prototype = Object.create(BaseObject.prototype);
Enemy.prototype.constructor = Enemy;

// Function to update the enemy's position
// @params: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
  // You should multiply any movement by the dt parameter
  // which will ensure the game runs at the same speed for
  // all computers.
  this.x += (this.speed * dt);

  // When the enemy goes off the screen, wrap it back on the other side of the screen
  if (this.x > screen.width) {
    // Start the enemy off the left edge of the canvas so it comes on in motion
    this.x = -Resources.get(this.sprite).width;
  }

  // Collision detection with player
  // First check if the enemy is on the same row as the player
  if (this.y + 8 === player.y) {
    // Then check if the enemy and player are close to each other
    if (Math.abs(player.x - this.x) < 80) {
      player.loseLife();
    }
  }
};
// ============================================================================



// ============================================================================
// Class Player
var Player = function() {
  this.sprite = 'images/char-boy.png'; // path to enemy image
  this.INIT_X = 202; // inital x-axis position
  this.INIT_Y = 405; // inital y-axis position
  this.X_STEP = 101; // length in player allowed to move in x-axis
  this.Y_STEP = 83; // length in player allowed to move in y-axis
  this.level = 1; // level tracker, initialize to 1
  this.TOTAL_LIVES = 3; // player lives
  this.numLives = this.TOTAL_LIVES; // player lives left
  this.highestLevel = getHighscore(); // highest level tracker, from local browser storage
  this.x = this.INIT_X; // current position on x-axis
  this.y = this.INIT_Y; // current position on y-axis
};

// Setup Player to inherit from BaseObject
Player.prototype = Object.create(BaseObject.prototype);
Player.prototype.constructor = Player;

// Function to update the player's position
// @params: dt, a time delta between ticks
Player.prototype.update = function() {
  // If the player makes it to the water, reset their position
  if (this.y < 0) {
    this.reset();
    gem.reset();
    allEnemies.push(new Enemy());  // Add an extra enemy
    this.level++;
    this.renderLevel();
  }
};

// Function to decrement player life
Player.prototype.loseLife = function() {
  this.numLives--;
  if (this.numLives === 0) {
    // If the player has no lives left now, reset the game level
    // and number of lives
    if (this.level > this.highestLevel) {
      this.highestLevel = this.level;
      storeHighscore(this.highestLevel);
    }
    this.level = 1;
    this.numLives = this.TOTAL_LIVES;
    this.renderLevel();

    // Get rid of all the enemies
    var numEnemies = allEnemies.length;
    for (var i = 0; i < numEnemies; i++) {
      allEnemies.pop();
    }

    // Add one back with a new random speed and location
    allEnemies.push(new Enemy());
  }
  this.renderLives();
  this.reset();
  gem.reset();
};

// Function to handle input from player
// @params: arrow key
Player.prototype.handleInput = function(key) {
  if (key === 'left') {
    // Move player one square left, as long as player is on the screen
    if (this.x > 0) {
      this.x -= this.X_STEP;
    }
  }
  else if (key === 'right') {
    // Move player one square right, as long as player is on the screen
    if (this.x < 4 * this.X_STEP) {
      this.x += this.X_STEP;
    }
  }
  else if (key === 'up') {
    if (this.y > 0) {
      this.y -= this.Y_STEP;
    }
  }
  else if (key === 'down') {
    if (this.y < this.INIT_Y) {
      this.y += this.Y_STEP;
    }
  }
};

// Function to draw the level number on the canvas
Player.prototype.renderLevel = function() {
  ctx.font = "30px Indie Flower";
  ctx.fillStyle = "white";
  ctx.textAlign = "right";
  ctx.clearRect(300, 10, 205, 38);
  ctx.fillText("Level: " + this.level, screen.width, 40);
};

// Function to draw hearts/lives left
Player.prototype.renderLives = function() {
  var heartImg = Resources.get('images/Heart.png');
  var heartWidth = heartImg.width * 0.5;
  var heartHeight = heartImg.height * 0.5;
  ctx.clearRect(0, 0, 300, 49);
  for (var n = 0; n < this.numLives; n++) {
    ctx.drawImage(heartImg, n * heartImg.width * 0.5, -20, heartWidth, heartHeight);
  }
};

// Function to draw the high score on the screen
Player.prototype.renderHighscore = function() {
  ctx.font = "30px Indie Flower";
  ctx.textAlign = "left";
  ctx.fillStyle = "white";
  ctx.fillText("Highest Level: " + this.highestLevel, 10, screen.height - 30);
};
// ============================================================================



// ============================================================================
// Class Gem
var Gem = function() {
  this.sprite = 'images/Gem Green.png'; // path to gem image
  this.scale = 0.7; // scale of gem sprite
  this.INIT_X = -100; // off-screen position on the x-axis
  this.INIT_Y = -100; // off-screen position on the y-axis
  this.x = this.INIT_X; // current position of the gem on the x-axis
  this.y = this.INIT_Y; // current position of the gem on the y-axis
  this.xValues = [14, 115, 216, 317, 418]; // valid values for this.x (given a scale of 0.7)
  this.yValues = [97, 180, 263]; // valid values for this.y (given a scale of 0.7)
};

// Gem inherits from the BaseObject Class
Gem.prototype = Object.create(BaseObject.prototype);
Gem.prototype.constructor = Gem;

// Function to update the gem's position
// @params: dt, a time delta between ticks
Gem.prototype.update = function() {
  if (this.x === this.INIT_X) {
    // If the gem is not on screen, make it randomly appear,
    // if more than a certain number of enemies are on the screen.
    if (allEnemies.length > 3 && Math.random() < 0.001) {
      this.x = this.xValues[Math.floor(Math.random() * this.xValues.length)];
      this.y = this.yValues[Math.floor(Math.random() * this.yValues.length)];
    }
  }
  else {
    // Collision detection with player
    if (this.y - 24 === player.y && this.x - 14 === player.x) {
      // Remove an enemy if the player collects the gem and there are
      // more than 3 enemies.
      if (allEnemies.length > 3) {
          allEnemies.pop();
      }
      this.reset();
    }

    // Randomly remove the gem
    if (Math.random() < 0.001) {
      this.reset();
    }
  }
};
// ============================================================================


// ============================================================================
// App main js

// Game screen size
var screen = {
    width: 505,
    height: 606
};

// Function to store the high score in browser storage
var storeHighscore = function(highscore) {
  if (typeof(Storage) !== "undefined") {
    localStorage.highscore = highscore;
  }
};

// Funciton to get high score from browser storage
var getHighscore = function() {
  if (typeof(Storage) !== "undefined") {
    if (localStorage.highscore) {
      return Number(localStorage.highscore);
    }
    else {
      return 1;
    }
  } else {
    return 1;
  }
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
var allEnemies = [];
allEnemies.push(new Enemy());

// Place the player object in a variable called player
var player = new Player();

// Create a gem object, which will move on and off the screen.
var gem = new Gem();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
  var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  player.handleInput(allowedKeys[e.keyCode]);
});

// Prevent the up and down arrow keys from scrolling the browser window
window.addEventListener('keydown', function(e) {
  if (e.keyCode === 38 || e.keyCode === 40) {
    e.preventDefault();
  }
});
// ============================================================================