export class GameObjects {
  public loadSounds(scene: Phaser.Scene): void {
    // Audio
    scene.load.audio('fur-elise', [
        'assets/audio/Bagatelle no. 25 Fur Elise, WoO 59.mp3'
    ])
    scene.load.audio('moonlight-sonata-presto', [
        'assets/audio/Paul Pitman - Moonlight Sonata Op. 27 No. 2 - III. Presto.mp3'
    ])
    scene.load.audio('moonlight-sonata-adagio', [
        'assets/audio/Paul Pitman - Moonlight Sonata, Op. 27 No. 2 - I. Adagio sostenuto.mp3'
    ])
    scene.load.audio('symphony-5', [
        'assets/audio/Symphony no. 5 in Cm, Op. 67 - I. Allegro con brio.mp3'
    ])
    scene.load.audio('concerto-winter', [
        'assets/audio/Violin Concerto in F minor, RV 297 Winter.mp3'
    ])
    scene.load.audio('toccata-and-fugue', [
        'assets/audio/Toccata and Fugue in Dm, BWV 565.mp3'
    ])


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