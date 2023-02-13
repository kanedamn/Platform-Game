            var config = {
                type: Phaser.AUTO,
                width: 800,
                height: 400,
                physics:{
                    default: "arcade",
                    arcade:{
                        gravity:{y:310},
                        debug: false
                    }
                },
                scene: {
                    preload: preload,
                    create: create,
                    update: update
                }
            };
        
            var game = new Phaser.Game(config);
            
            var score = 0;
            var scoreText;
        
            function preload ()
            {
                this.load.image('sky', 'assets/sky.webp');
                this.load.image('ground', 'assets/platform.png');
                this.load.image('star', 'assets/star.png');
                this.load.image('bomb', 'assets/bomb.png');
                this.load.image('spikes', 'assets/spikes.png');
                this.load.spritesheet('dude', 
                    'assets/dude.png',
                    { frameWidth: 32, frameHeight: 48 }
            );
            }
        
            function create ()
            {
                this.physics.world.setBounds(0, 0, 1600, 400);
                var bg = this.add.image(0, 0, 'sky').setOrigin(0);

                //make a grouop for all the platforms
                platforms = this.physics.add.staticGroup();

                //set platforms
                platforms.create(1300, 400, 'ground').setScale(2).refreshBody();
                platforms.create(400, 400, 'ground').setScale(2).refreshBody();
                platforms.create(150, 240, 'ground');
                platforms.create(480, 120, 'ground');
                platforms.create(960, 190, 'ground');
                platforms.create(1300, 100, 'ground');

                //set player
                player = this.physics.add.sprite(100,300, "dude"),
                player.setBounce(0.2);
                player.setCollideWorldBounds(true);

                //set camera to follow player
                camera = this.cameras.main;
                camera.setBounds(0, 0, 1600, 400);
                camera.startFollow(player, true, 0.05, 0, -200, 120);
                
                //add spikes
                spikes = this.physics.add.staticGroup();
                spikes.enableBody = true;
                spikes = spikes.create(850,390, 'spikes');
                spikes.body.immovable = true;

                //set overlap for player and spikes
                this.physics.add.overlap(player, spikes, hitSpikes, null, this);

                //set function that makes the game restart if player hits spikes
                function hitSpikes(player, spikes){
                    player.disableBody(false,false);
                    var tween = this.tweens.add({
                        targets: player,
                        alpha: 0.3,
                        scaleX: 1.1,
                        scaleY: 1.1,
                        angle: 90,
                        x: player.x - 20,
                        y: player.y - 20,
                        ease: 'Linear',
                        duration: 300,
                        onComplete: function() {
                            this.scene.restart();
                            var score = 0;
                        },
                        onCompleteScope: this
                    });
                }

                //set stars
                stars = this.physics.add.group({
                    key: "star",
                    repeat: 11,
                    setXY: {x: 11, y: 0, stepX: 140}
                });

                //make stars bounce when they hit platforms
                stars.children.iterate(function(child){
                    child.setBounceY(Phaser.Math.FloatBetween(0.4,0.8));
                });

                //set collider for stars and platforms and set overlap for stars and player
                this.physics.add.collider(stars, platforms);
                this.physics.add.overlap(player, stars, collectStar, null, this);

                //set function wnen player overlaps stars, stars disappear and score goes up
                function collectStar (player, star)
                {
                    star.disableBody(true, true);

                    score += 1;
                    scoreText.setText("score:" + score);
                }

                scoreText = this.add.text(16,16,"score:0", {fontSize: "32px", fill:"#FFF"});

                //create a contain for elements that stay fixed
                hud = this.add.container(0, 0, [scoreText]);

                //lock it to the camera
                hud.setScrollFactor(0);

                this.anims.create({
                    key:"left",
                    frames: this.anims.generateFrameNumbers("dude", {start:0, end:3}),
                    frameRate: 10,
                    repeat: -1
                });

                this.anims.create({
                    key: "turn",
                    frames:[{key: "dude", frame:4}],
                    framerate:20
                });
                
                this.anims.create({
                    key:"right",
                    frames: this.anims.generateFrameNumbers("dude", {start:5, end:8}),
                    frameRate: 10,
                    repeat: -1
                });

                this.physics.add.collider(player, platforms);

                cursors = this.input.keyboard.createCursorKeys();
            }
        
            function update (){
                if (cursors.left.isDown)
                {
                    player.setVelocityX(-160);

                    player.anims.play('left', true);
                }
                else if (cursors.right.isDown)
                {
                    player.setVelocityX(160);

                    player.anims.play('right', true);
                }
                else
                {
                    player.setVelocityX(0);

                    player.anims.play('turn');
                }

                if (cursors.up.isDown && player.body.touching.down)
                {
                    player.setVelocityY(-60);
                }

                //set double jump
                if (cursors.up.isDown && Phaser.Input.Keyboard.JustDown(cursors.up)){
                player.setVelocityY('-20');
            }
            }