class LoadGame extends Phaser.Scene {
    constructor() {
        super({ key: 'LoadGame' });
    }

    preload() {
        // Load background image
        this.load.image('background', 'assets/images/cyberpunk-street.png');
        this.load.audio('soundtrack', 'music/soundtrack.mp3');

    }

    create() {
    this.timeInSeconds = 0;
    this.timeText = this.add.text(16, 16, "Time: 0", { fontSize: '32px', fill: '#FFF' });

        this.sound.play('soundtrack', { loop: true, volume: 0.20 });
        // Add background image
        const background = this.add.image(0, 0, 'background').setOrigin(0, 0);
        background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Add welcome text
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        const textStyle = {
            fontFamily: 'Rocher',
            fill: '#FEFEFE', // Purple color
            align: 'center',
        };
        const welcomeText = this.add.text(centerX, centerY - 150, 'WELCOME', textStyle);
        welcomeText.setOrigin(0.5);
        welcomeText.setFontSize(70);

        const matevzcraftText = this.add.text(centerX, centerY - 50, 'TO MATEVZJUMP', textStyle);
        matevzcraftText.setOrigin(0.5);
        matevzcraftText.setFontSize(70);

        const startText = this.add.text(centerX, centerY + 30, 'Press SPACE to start', textStyle);
        startText.setOrigin(0.5);
        startText.setFontSize(45);

        // Add tween to make the text move up and down
        this.tweens.add({
            targets: startText,
            y: centerY + 60, // Move down by 4 pixels
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Linear',

        });

        // Listen for space key press to start the game
        this.input.keyboard.on('keydown-SPACE', this.startGame, this);
    }

    startGame() {
        // Start the Game scene
        this.scene.start('GameScene');
    }
       
}


class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        // Initialize variables
        this.score = 0;
        this.elapsedTime = 0; // V  v           ariable to keep track of the elapsed time
        this.lastPlatformX = 800;
        this.platformVelocity = -200;
        this.scrollSpeed = 0.8; // Initial scroll speed for background
        this.gameOver = false;
        this.scoreUpdateInterval = 100; // Interval for updating the score
        this.scoreTimer = this.time.addEvent({
            delay: this.scoreUpdateInterval,
            callback: () => this.updateScore(),
            callbackScope: this,
            loop: true
        });

        // Adjustments for lowering positions by 30%
        this.loweringFactor = 0.3;
    }

    preload() {
        this.load.image('player', 'assets/macka.jpg');
        this.load.image('background', 'assets/background.jpg');
        this.load.audio('jump', 'music/jump.mp3');
        this.load.audio('death', 'music/death.mp3');
        this.load.audio('soundtrack', 'music/soundtrack.mp3');
        this.load.image('platform', 'assets/images/platform.png');

        
    }
    
    create() {
            const screenWidth = this.cameras.main.width;
            const screenHeight = this.cameras.main.height;
            const backgroundWidth = 602;
            const backgroundHeight = 192;
        
            // Calculate scale factors
            const scaleX = screenWidth / backgroundWidth;
            const scaleY = screenHeight / backgroundHeight;
        
            // Create two background images for seamless scrolling
            this.backgrounds = [];
            for (let i = 0; i < 2; i++) {
                const bg = this.add.image(i * screenWidth, 0, 'background');
                bg.setOrigin(0, 0);
                bg.setScale(scaleX, scaleY);
                this.backgrounds.push(bg);
            }
        
            // Create the player
            player = this.physics.add.sprite(200, 491 * (1 + this.loweringFactor), 'player'); // Adjust player's initial position
            player.setOrigin(0.5, 0.5);
            player.setCollideWorldBounds(true);
            player.setScale(0.2);
            player.setBounce(0.2);
            player.setGravityY(300);
        
            cursors = this.input.keyboard.createCursorKeys();
        
            // Create the platforms group
            platforms = this.physics.add.group({
                allowGravity: false,
                immovable: true
            });
        
            // Create a long initial platform
            var initialPlatform = platforms.create(400, (550 * (1 + this.loweringFactor)), 'platform');
            initialPlatform.setData('isPlatform', true); // Add a custom property to identify platforms
            initialPlatform.displayWidth = 1600;
            initialPlatform.displayHeight = 50; // Set the display height to match the original height
            initialPlatform.setVelocityX(this.platformVelocity);
        
            // Collision handlers
            this.physics.add.collider(player, platforms, () => {
                if (this.gameOver) {
                    this.endGame();
                }
            });
        
            // Create the score text
            this.scoreText = this.add.text(screenWidth - 100, 16, 'Score: 0', { fontSize: '32px', fill: '#FFF' });
        
            // Timer for platform generation
            this.time.addEvent({
                delay: 1000,
                callback: this.generatePlatforms,
                callbackScope: this,
                loop: true
            });
        }
        
    update() {
        
        player.setVelocityX(0);
    
        player.setVelocityX(0);
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
    
    } 
    
    
    else if (cursors.right.isDown) {
        player.setVelocityX(160);
    }
       
  
        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-400);
            this.sound.play('jump');
        }
    
        platforms.children.iterate(function (child) {
            if (child && child.body && child.x < -child.displayWidth / 2) {
                child.destroy();
            }
        });
    
        if (this.lastPlatformX < 800) {
            this.generatePlatforms();
        }
    
        this.backgrounds.forEach((bg, index) => {
            bg.x -= this.scrollSpeed; // Use scrollSpeed for background
            if (bg.x <= -bg.displayWidth) {
                // Find the rightmost background image
                let rightmostBg = this.backgrounds.reduce((rightmost, bg) => {
                    return (bg.x > rightmost.x) ? bg : rightmost;
                });
    
                // Position this background image immediately after the rightmost one
                bg.x = rightmostBg.x + rightmostBg.displayWidth;
            }
        });
    
        if (!this.gameOver) { // Check if the game is not over
            this.updateScore();

            // Check if the player is below the screen boundary
            if (player.y >= (790 * (1 + this.loweringFactor))) { // Adjust death point
                console.log('Player fell off the screen'); // Debugging log
                this.gameOver = true; // Set game over to true
                this.endGame(); // Call the endGame function
            }
            if (!this.gameOver) { // Check if the game is not over
                // Other update logic...
            
                // Check if the player is below the death point
                if (player.y >= (750 * (1 + this.loweringFactor))) { // Adjust death point
                    this.sound.play('death');
                    console.log('Player died'); // Debugging log
                    this.gameOver = true; // Set game over to true
                    this.endGame(); // Call the endGame function
                }
            }
                    
        }
    }
    
    generatePlatforms() {
        // Your platform generation logic here
        const platformWidth = Phaser.Math.Between(100, 300); // Random width for the platform
        const platformHeightOffset = Phaser.Math.Between(-80, 80); // Random height offset
        const newPlatform = platforms.create(this.lastPlatformX + platformWidth + Phaser.Math.Between(50, 200), (550 * (1 + this.loweringFactor)) + platformHeightOffset, 'platform'); // Adjust platform's position by adding a random distance
        newPlatform.displayWidth = platformWidth;
        newPlatform.displayHeight = 32; // Set the display height to match the original height
        newPlatform.setVelocityX(this.platformVelocity);
    
        this.lastPlatformX += platformWidth + Phaser.Math.Between(50, 150); // Adjust the last platform X position
    }
    
     updateScore() {
        this.score += 1;
        this.scoreText.setText('Score: ' + this.score);
    }
    
    endGame() {
        // Start the EndGame scene
        this.scene.start('EndGame');
    }
}
class EndGame extends Phaser.Scene {
    constructor() {
        super({ key: 'EndGame' });
    }

    create() {
        const background = this.add.image(0, 0, 'background').setOrigin(0, 0);
        background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        const textStyle = {
            fontFamily: 'Rocher',
            fill: '#FEFEFE', // Purple color
            align: 'center',
    
        };
      
        const welcomeText = this.add.text(centerX, centerY - 100, 'GAME OVER', textStyle);
                welcomeText.setOrigin(0.5);
                welcomeText.setFontSize(70);
                const subtitleText = this.add.text(centerX, centerY, 'Press SPACE to start', textStyle);
                subtitleText.setOrigin(0.5);
                subtitleText.setFontSize(30);

        this.input.keyboard.on('keydown-SPACE', this.startGame, this);
    }

    startGame() {
        this.scene.start('GameScene');
    }
}

// Create the game configuration
var config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [LoadGame, GameScene, EndGame]
};

var game = new Phaser.Game(config);
var player;
var cursors;
var platforms;
var score = 0;
var scoreText;
var lastPlatformX = 800;
var platformVelocity = -200;
var gameOver = false;


function generatePlatforms() {
    var platformGap = Phaser.Math.Between(100, 300);
    var platformWidth = Phaser.Math.Between(100, 300);

    var platform1 = platforms.create(lastPlatformX + platformGap, 550, 'platform');
    platform1.displayWidth = platformWidth;
    platform1.setVelocityX(platformVelocity);
    platform1.setImmovable(true);

    lastPlatformX = platform1.x + platformWidth;
   
}
function createSolidColorTexture(color, width, height) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    return canvas.toDataURL();
}
