import { Scene } from 'phaser'
import tile from '@/game/assets/tile-192.png'
import map from '@/game/assets/isometric-grass-and-water.json'
import skeleton from '@/game/assets/skeleton8.png'
import nckuShort from '@/game/assets/ncku-short.png'
import nckuTall from '@/game/assets/ncku-tall.png'
import bs from '@/game/assets/bs.png'
import church from '@/game/assets/church.png'


export default class BootScene extends Scene {
  constructor () {
    super({ key: 'BootScene' })
  }

  preload () {
    this.load.image('tile', tile)
    this.load.json('map', map)
    this.load.spritesheet('skeleton', skeleton, { frameWidth: 128, frameHeight: 128 })
    this.load.image('ncku-short', nckuShort)
    this.load.image('ncku-tall', nckuTall)
    this.load.image('bs', bs)
    this.load.image('church', church)
  }

  create () {
    this.scene.start('PlayScene')
  }
}
