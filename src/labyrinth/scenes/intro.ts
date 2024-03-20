import { INTRO_MAP } from '../config/level-maps'

export class Intro extends Phaser.Scene
{
    // @ts-ignore
    private _layerMap: Phaser.Tilemaps.TilemapLayer|null = null
    // Load tiles
    private _map: Phaser.Tilemaps.Tilemap|null = null
    private bgMusic?: Phaser.Sound.BaseSound


    constructor() {
        super('Intro')
    }

    create() {
        this.introBg()
    }

    update() {
        
    }

    introBg() {
        /*
        const width: number = CONFIG.scale && CONFIG.scale.width ?
            +CONFIG.scale.width : 0
        const height: number = CONFIG.scale && CONFIG.scale.height ?
            +CONFIG.scale.height : 0
        */
        const width = +this.sys.game.config.width
        const height = +this.sys.game.config.height

        // Load tiles from spritesheet
        this._map = this.make.tilemap({data: INTRO_MAP, tileWidth: 32, tileHeight: 32})
        const tiles = this._map.addTilesetImage('background_tiles')
        
        // @ts-ignore
        this._layerMap = this._map.createLayer(0, tiles, 0, 0)

        // Music
        // Add background music
        /*
        this.bgMusic = this.sound.add('moonlight-sonata-presto');
        // Play bg music
        const musicConfig = { 
            mute: false, volume: 0.6, rate: 1,
            detune: 0, seek: 0, loop: true, delay: 0 
        };
        this.bgMusic.play(musicConfig);
        */

        // Start
        // this.add.bitmapText()
        const style = { 
            font: "bold 42px Arial",
            fill: "#00FF00", boundsAlignH: "center", boundsAlignV: "middle",
            backgroundColor: "#000000" }
        const startText = this.add.text((width / 2) - 120 , height / 2 + 100, 'Start', style).setPadding(64, 16, 64, 16)
        startText.setInteractive().on('pointerdown', this.start, this)
        // this.input.on('gameobjectdown', this.start, this)
        // const exitApp = this.add.text((width / 2) - 32 , startText.y + 20, 'Exit', style)
        // exitApp.setInteractive().on('pointerdown', this.exit, this)

        // Game Title
        this.add.image(width / 2, (height / 2) - 100, 'intro_title')

    }


    moveTileInX(object: Phaser.GameObjects.TileSprite|undefined, speed: number) {
        if (!object) {
            console.error('Object not found', object)
            return
        }
        object.tilePositionX += speed;
    }

    start() {
        this.bgMusic?.stop()

        // Clear memory
        if (this._map) {
          this._map.destroy()
        }
        if (this._layerMap) {
          this._layerMap.destroy()
        }

        this.scene.start('Level')
    }

    exit() {

    }

    
}
