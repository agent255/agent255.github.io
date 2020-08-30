/**
  Hello and welcome to Space Quest - A game full of fun!
  
  How to Play:
    This game is simple. All you have to do is keep the enemies from passing the edge of your screen. Shoot them down by HOLDING down the spacebar, and move up and down with your arrow keys. If an enemy pases your screen, you lose one of your three lives! So try to pay attention, you never know what might happen next.
  
  Scores:
    If you want to submit a highscore, I have a thread where you can do so. Just make a spin-off of this game without changing any of the code. Once you do, submit the link of your spin-off in the thread.
    
    > 1st Place: Une - 1746
    > 2nd Place: Flostin (READ BIO) - 453
    > 3rd Place: OOPS! Studio! #Prayers4SueAnn - 225
    > 4th Place: Glorfindel - 211
    > 5th Place: EspeonGirl - 188
    > 6th Place: Anthony - 164
    > 7th Place: Pineapple Watermelon - 161
    > 8th Place: GryffindorLab - 158
    > 9th Place: Silver Cat - 153
  
  Credits:
    I like to do as much as I can by myself, it challenges me to be a better programmer. So I'm proud to only have a single thing on this list:
      * Animating the stars in the background - (https://stackoverflow.com/a/39740009)
**/

var keys = [];
var bullets = [];
var enemies = [];
var mouseIsClicked = false;

/* This will take an image and return a cropped version of it */
var cropImage = function(img, offsets) {
    var ctx = createGraphics(img.width - offsets[2], img.height - offsets[3], JAVA2D);
    
    ctx.beginDraw();
        ctx.background(0, 0, 0, 0);
        ctx.image(img, -offsets[0], -offsets[1]);
    ctx.endDraw();
    
    return ctx;
};

/* This returns a huge array of stars */
var stars = (function() {
    var array = [];
    for (var i = 0; i < 75; i++) {
        array.push({x: random(width), y: random(height), size: random(2, 7), speed: random(1, 9)});
    }
    
    return array;
})();
/* This function draws the stars and animates them */
var starBackground = function() {
    background(0);
    fill(255);
    for (var i = 0; i < 75; i++) {
        var star = stars[i];
        ellipse(star.x, star.y, star.size, star.size);
        
        star.x = (star.x + width - star.speed) % width;
    }
};

/* Here is where the code for our buuttons are defined */
var button = function(x, y, w, h, txt, action) {
    strokeWeight(5);
    stroke(170);
    fill(80);
    
    if (mouseIsClicked && mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) {
        action();
    }
    
    rect(x, y, w, h);
    
    fill(255);
    textSize(30);
    text(txt, x + w / 2, y + h / 2);
};

/* Here is the constructor function for the bullets */
var Bullet = function(x, y) {
    this.x = x;
    this.y = y;
};

/* These are constants that are not put into each object */
Bullet.prototype.size = 20;
Bullet.prototype.speed = 8;

Bullet.prototype.run = function() {
    ellipse(this.x, this.y, this.size, this.size);
    
    this.x += this.speed;
};

/* This will check for the collision of a bullet and an enemy */
Bullet.prototype.checkCollision = function(that) {
    var trueX = this.x - this.size / 2;
    var trueY = this.y - this.size / 2;
    return trueX + this.size > that.x && trueX < that.x + that.width && trueY + this.size > that.y && trueY < that.y + that.height;
};

/* Here is the constructor function for the enemies */
var Enemy = function() {
    this.image = this.enemyList[random(this.enemyList.length) | 0];
    var ratio = this.size / this.image.width;
    this.width = this.size;
    this.height = this.image.height * ratio;
    this.x = width;
    this.y = random(height - this.height);
};

Enemy.prototype.size = 60;
Enemy.prototype.enemyList = [
    (cropImage(getImage("space/planet"), [20, 28, 59, 58])),
    (cropImage(getImage("avatars/spunky-sam"), [14, 5, 30, 6])),
    (cropImage(getImage("avatars/leafers-seed"), [28, 28, 60, 54])),
    (cropImage(getImage("avatars/mr-pink"), [4, 3, 12, 6])),
    (cropImage(getImage("creatures/OhNoes"), [8, 6, 19, 16])),
    getImage("creatures/Hopper-Jumping"),
    getImage("creatures/Winston")
];

Enemy.prototype.run = function() {
    image(this.image, this.x, this.y, this.width, this.height);
    
    this.x -= 5;
};

/* Here is the constructor function for the player */
var Player = function() {
    this.size = 100;
    this.x = 0;
    this.y = (height - this.size) / 2;
    this.image = getImage("space/octopus");
    this.speed = 8;
    this.startTime = millis();
    this.score = 0;
    this.highScore = 0;
    this.lives = 3;
    this.heart = getImage("space/healthheart");
};

Player.prototype.draw = function(currentHigh) {
    this.currentTime = millis();
    image(this.image, this.x, this.y, this.size, this.size);
    
    fill(255);
    textAlign(RIGHT, BASELINE);
    text("Score: " + this.score, 390, 32);
    text("High: " + currentHigh, 390, 62);
    
    for (var i = 0; i < this.lives; i++) {
        image(this.heart, i * 40 + 270, 355, 40, 40);
    }
};

Player.prototype.update = function() {
    /* This code will move the player up and down when the arrow keys are pressed */
    if (keys[UP] || keys[87]) {
        this.y = max(this.y - this.speed, -this.size / 4);
    } else if (keys[DOWN] || keys[83]) {
        this.y = min(this.y + this.speed, height - this.size * 0.88);
    }
    
    /* This will shoot bullets if the spacebar is pressed and 3/10ths a second has passed */
    if (keys[32] && (this.currentTime - this.startTime) > 300) {
        this.startTime = millis();
        bullets.push(new Bullet(this.x + this.size / 2, this.y + this.size * 0.67));
    }
};

var player = new Player();

/* These are the scenes of the game */
var scene = "menu", timer;
var gameOver = function() {
    pushStyle();
    textAlign(CENTER, CENTER);
    text((player.score === player.highScore && player.score > 0) ? "You got a new highscore!" : "Better luck next time!", 200, 50);
    
    
    text("Your highscore is: " + player.highScore, 200, 100);
    text("Your current score is: " + player.score, 200, 150);
    
    button(120, 225, 175, 50, "MENU", function() {
        scene = "menu";
    });
    button(120, 300, 175, 50, "PLAY AGAIN", function() {
        player.lives = 3;
        scene = "game";
        player.score = 0;
        timer = millis();
    });
    popStyle();
};
var game = function() {
    var currentHigh = max(player.score, player.highScore);
    
    pushStyle();
    if (player.lives === 0) {
        bullets = [];
        enemies = [];
        player.highScore = currentHigh;
        scene = "over";
    }
    
    /* Here we add a new enemy every half of a second */
    if (frameCount % 30 === 0) {
        enemies.push(new Enemy());
    }
    
    /* This draws and animates all the enemies onto the screen */
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].run();
    }
    
    /* This will delete a bullet if there are any, and if it's off the screen */
    if (bullets.length > 0 && bullets[0].x > width) {
        bullets.shift();
    }
    
    if (enemies.length > 0 && enemies[0].x < -enemies[0].width) {
        enemies.shift();
        player.lives--;
    }
    
    /* This draws and animates all the bullets onto the srceen and checks for collisions*/
    fill(0, 255, 0);
    for (var i = 0; i < bullets.length; i++) {
        bullets[i].run();
        for (var j = 0; j < enemies.length; j++) {
            /* If there's a collision, this will remove the enemy AND the bullet */
            if (bullets[i].checkCollision(enemies[j])) {
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                player.score++;
                break;
            }
        }
    }
    
    player.draw(currentHigh);
    player.update();
    popStyle();
};
var menu = function() {
    pushStyle();
    textAlign(CENTER, CENTER);
    textSize(55);
    text("Space Quest", 200, 55);
    
    button(125, 125, 150, 50, "PLAY", function() {
        player.lives = 3;
        scene = "game";
        player.score = 0;
        timer = millis();
    });
    button(125, 225, 150, 50, "HELP", function() {scene = "help";});
    textSize(30);
    text((player.highScore > 0) ? "Your highscore is: " + player.highScore : "Play to get a highscore!", 200, 330);
    popStyle();
};
var help = function() {
    pushStyle();
        text("HOLD down your spacebar to shoot enemies! You lose a life for every enemy that passes your screen. You only have three lives, so good luck!", 25, 0, 360, 300);
        button(132, 300, 150, 50, "MENU", function() {scene = "menu";});
    popStyle();
};

noStroke();
frameRate(50);
textAlign(CENTER, CENTER);
textFont(createFont("Trebuchet MS"), 30);
draw = function() {
    starBackground();
    
    /* This controls which scene of the game is running */
    switch (scene) {
        case "menu":
            menu();
        break;
        case "help":
            help();
        break;
        case "game":
            /* This is the countdown to prepare the user for the game */
            if (millis() - timer > 2900) {
                game();
            } else {
                textSize(150);
                text(3 - floor((millis() - timer) / 1000), 200, 200);
                textSize(30);
            }
        break;
        case "over":
            gameOver();
    }
    
    if (mouseIsClicked) {mouseIsClicked = false;}
};

var mouseClicked = function() {
    mouseIsClicked = true;
};

keyPressed = function() {
    keys[keyCode] = true;
};

keyReleased = function() {
    keys[keyCode] = false;
};
