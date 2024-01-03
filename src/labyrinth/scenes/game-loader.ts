import { GameObjects } from '../config/game-objects'

export class GameLoader extends Phaser.Scene
{
    graphics: any
    newGraphics: any
    loadingText: any
    progressBarX: number = 0
    progressBarY: number = 0
    progressBarFillX: number = 0
    progressBarFillY: number = 0

    constructor() {
        super('GameLoader')
    }



    create () {
        // Disable right click menu
        this.input.mouse?.disableContextMenu()
       

    }

    calculateProgressBarPosition() {
        const width = +this.sys.game.config.width
        const height = +this.sys.game.config.height

        this.progressBarX = (width / 2) - 170;
        this.progressBarY = (height / 2) - 50;
        this.progressBarFillX = this.progressBarX + 5;
        this.progressBarFillY = this.progressBarY + 5;
        
    }

    preload()
    {
        
        this.calculateProgressBarPosition();
        this.graphics = this.add.graphics();
        this.newGraphics = this.add.graphics();
        var progressBar = new Phaser.Geom.Rectangle(this.progressBarX, this.progressBarY, 400, 50);
        var progressBarFill = new Phaser.Geom.Rectangle(this.progressBarFillX, this.progressBarFillY, 290, 40);


        this.graphics.fillStyle(0xffffff, 1);
        this.graphics.fillRectShape(progressBar);

        this.newGraphics.fillStyle(0x3587e2, 1);
        this.newGraphics.fillRectShape(progressBarFill);

        const css = { fontSize: '32px', fill: '#FFF' }
        this.loadingText = this.add.text(
            this.progressBarX + 50,
            this.progressBarY + 60,
            'Loading', 
            css
        );
        var context = this;
        this.load.on('progress', 
            function(percentage: any) {
                context.updateBar(percentage)
            }, 
            this
            //{newGraphics:this.newGraphics, loadingText:this.loadingText}
        );

        this.load.on('complete', this.complete, this);

        var gameo = new GameObjects()
        gameo.loadSounds(this)
        gameo.loadVehicles(this)
        gameo.loadBackgrounds(this)



    }

    updateBar(percentage: any) {
        this.calculateProgressBarPosition();

        this.newGraphics.clear();
        this.newGraphics.fillStyle(0x3587e2, 1);
        this.newGraphics.fillRectShape(new Phaser.Geom.Rectangle(this.progressBarFillX, this.progressBarFillY, percentage*390, 40));
                
        percentage = percentage * 100;
        this.loadingText.setText(
            'Loading ...' + 
            percentage.toFixed(2) + "%"
        );
        // console.log("P:" + percentage);
    }

    complete() {
        this.loadAnimations()

        this.scene.start('Intro');
    }


    public loadAnimations() {
        // Player Animations
        this.anims.create({
            key: 'vehicle_tank_green_anim',
            frames: this.anims.generateFrameNumbers('vehicle_tank_green', {}),
            frameRate: 24,
            repeat: 0
        })
        this.anims.create({
            key: 'vehicle_tank_green_stop',
            frames: [ {key: 'vehicle_tank_green', frame: 0} ],
            frameRate: 20,
            repeat: 0
        })
    }



}
