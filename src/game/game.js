import Phaser from 'phaser'
import BootScene from './scenes/BootScene'
import PlayScene from './scenes/PlayScene'


function launch() {
  new Phaser.Game({
    type: Phaser.AUTO,
    width: document.body.clientWidth,
    height: document.body.clientHeight,
    backgroundColor: '#ababab',
    parent: 'game-container',
    scene: [BootScene, PlayScene]
  })
}

export default launch
export { launch }
