export class GameObjects {
  public loadSounds(scene: Phaser.Scene): void {
    // Audio 

    scene.load.audio('motor-loop', [
        'assets/audio/motor-loop.wav'
    ])

    scene.load.audio('item-pickup', [
      'assets/audio/678385__deltacode__item-pickup-v2.wav'
    ])

    scene.load.audio('item-found', [
      'assets/audio/202812__zombie_expert__item-found.wav'
    ])

    
  }

  public loadVehicles(scene: Phaser.Scene): void {
    // Green Tank
    scene.load.spritesheet(
      'vehicle_tank_green',
      'assets/images/vehicles/tanque1Small.png',
      {
        frameWidth: 32,
        frameHeight: 32
      }
    )

    // Blue Tank
  }

  public loadBackgrounds(scene: Phaser.Scene): void {
    scene.load.image('intro_title', 'assets/images/labyrinthTitle.png')
    scene.load.image('background_tiles', 'assets/images/gameSpritesheet.png')
    scene.load.spritesheet(
      'items_spritesheet',
      'assets/images/itemsSpritesheet.png',
      {
        frameWidth: 32,
        frameHeight: 32
      }
    )
  }

}