export class ErrorScreen extends Phaser.Scene
{
	constructor() {
		super('ErrorScreen')
	}

	create() {
		const width = +this.sys.game.config.width
    const height = +this.sys.game.config.height

		// Start
    // this.add.bitmapText()
    const style = { 
        font: "bold 42px Arial",
        fill: "#00FF00", boundsAlignH: "center", boundsAlignV: "middle",
        backgroundColor: "#000000" }
    this.add.text((width / 2) - 120 , height / 2, 'Error :(', style).setPadding(64, 16, 64, 16)
    
	}

}