import { GameLoader } from '../scenes/game-loader'
import { Intro } from '../scenes/intro'
import { Level } from '../scenes/levels/level'
import { ErrorScreen } from '../scenes/error-screen'

export const CONFIG: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    scale: {
        parent: 'content',
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1024,
        height: 576
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [GameLoader, Intro, Level, ErrorScreen]
    /*,
    audio: {
        disableWebAudio: true
    }
    */
};
