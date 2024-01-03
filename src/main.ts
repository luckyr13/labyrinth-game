import 'phaser'
import { CONFIG } from './labyrinth/config/game-config'
import './css/styles.css'

window.addEventListener('load', () => {
    // @ts-ignore
    const game = new Phaser.Game(CONFIG);
})