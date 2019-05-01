import { Scene } from 'phaser'

let text
let scene
let lastTile
let buildingGroup = []
let skeletons = []
let buildingData = [
  {
    name: 'ncku-short',
    row: 1,
    column: 1,
    coordinateX: 0,
    coordinateY: 0
  },
  {
    name: 'ncku-tall',
    row: 1,
    column: 1,
    coordinateX: 1,
    coordinateY: 0
  },
  {
    name: 'church',
    row: 1,
    column: 1,
    coordinateX: 1,
    coordinateY: 1
  },
  {
    name: 'bs',
    row: 2,
    column: 2,
    coordinateX: 3,
    coordinateY: 3
  }
]
const anims = {
  idle: {
    startFrame: 0,
    endFrame: 4,
    speed: 0.2
  },
  walk: {
    startFrame: 4,
    endFrame: 12,
    speed: 0.15
  },
  attack: {
    startFrame: 12,
    endFrame: 20,
    speed: 0.11
  },
  die: {
    startFrame: 20,
    endFrame: 28,
    speed: 0.2
  },
  shoot: {
    startFrame: 28,
    endFrame: 32,
    speed: 0.1
  }
}
const directions = {
  west: { offset: 0, x: -2, y: 0, opposite: 'east' },
  northWest: { offset: 32, x: -2, y: -1, opposite: 'southEast' },
  north: { offset: 64, x: 0, y: -2, opposite: 'south' },
  northEast: { offset: 96, x: 2, y: -1, opposite: 'southWest' },
  east: { offset: 128, x: 2, y: 0, opposite: 'west' },
  southEast: { offset: 160, x: 2, y: 1, opposite: 'northWest' },
  south: { offset: 192, x: 0, y: 2, opposite: 'north' },
  southWest: { offset: 224, x: -2, y: 1, opposite: 'northEast' }
}

export default class PlayScene extends Scene {
  constructor () {
    super({ key: 'PlayScene' })
  }

  create () {
    scene = this;
    scene.input.on('pointerdown', function(){
      text.setText('Nothinig');
      if(lastTile){
        scene.tweens.add({
          targets: lastTile,
          duration: 130,
          y: '+=20',
          ease: 'Quad.easeOut'
        })
        lastTile.isJump = false;
        lastTile = null;
      }
    })
    text = scene.add.text(100, 100, 'Click either of the sprites', { font: '16px Courier', fill: '#000000' })

    var Skeleton = new Phaser.Class({
      Extends: Phaser.GameObjects.Image,
      initialize: function Skeleton (scene, x, y, motion, direction, distance) {
        this.startX = x
        this.startY = y
        this.distance = distance

        this.motion = motion
        this.anim = anims[motion]
        this.direction = directions[direction]
        this.speed = 0.15
        this.f = this.anim.startFrame

        Phaser.GameObjects.Image.call(this, scene, x, y, 'skeleton', this.direction.offset + this.f)

        this.depth = y + 192

        scene.time.delayedCall(this.anim.speed * 1000, this.changeFrame, [], this)
      },
      changeFrame: function () {
        this.f++;
        var delay = this.anim.speed;
        if(this.f === this.anim.endFrame){
          switch (this.motion) {
            case 'walk':
              this.f = this.anim.startFrame
              this.frame = this.texture.get(this.direction.offset + this.f)
              scene.time.delayedCall(delay * 1000, this.changeFrame, [], this)
              break
            case 'attack':
              delay = Math.random() * 2
              scene.time.delayedCall(delay * 1000, this.resetAnimation, [], this)
              break
            case 'idle':
              delay = Math.random()
              scene.time.delayedCall(delay * 1000, this.resetAnimation, [], this)
              break
          }
        } else {
          this.frame = this.texture.get(this.direction.offset + this.f)
          scene.time.delayedCall(delay * 1000, this.changeFrame, [], this)
        }
      },
      resetAnimation: function () {
        this.f = this.anim.startFrame
        this.frame = this.texture.get(this.direction.offset + this.f)
        scene.time.delayedCall(this.anim.speed * 1000, this.changeFrame, [], this)
      },
      update: function () {
        if (this.motion === 'walk') {
          this.x += this.direction.x * this.speed
          if (this.direction.y !== 0) {
            this.y += this.direction.y * this.speed
            this.depth = this.y + 192
          }

          // walked far enough?
          if (Phaser.Math.Distance.Between(this.startX, this.startY, this.x, this.y) >= this.distance) {
            this.direction = directions[this.direction.opposite]
            this.f = this.anim.startFrame
            this.frame = this.texture.get(this.direction.offset + this.f)
            this.startX = this.x
            this.startY = this.y
          }
        }
      }
    })
    buildMap()
    buildingGroup = this.add.group()
    placeHouses()

    let mapScale = scene.cache.json.get('map').layers[0].height;
    let w = document.body.clientWidth
    let h = document.body.clientHeight

    skeletons.push(this.add.existing(new Skeleton(this, w/2-96, h/2-96/1.718-20, 'walk', 'southEast', 150).setOrigin(0.5,1)))
    skeletons.push(this.add.existing(new Skeleton(this, w/2-96*2, h/2-20, 'walk', 'southEast', 200).setOrigin(0.5,1)))
    skeletons.push(this.add.existing(new Skeleton(this, w/2+96*2, h/2-20, 'walk', 'southWest', 400).setOrigin(0.5,1)))

    this.cameras.main.setSize(w, h)
    this.cameras.main.centerOn(w/2, h/2+(mapScale-3)*48)
  }

  update () {
    skeletons.forEach(function (skeleton) {
      skeleton.update()
    })

    let pointer = scene.input.activePointer
    if (pointer.justMoved) {
      let x = this.cameras.main.midPoint.x - pointer.x + pointer.prevPosition.x
      let y = this.cameras.main.midPoint.y - pointer.y + pointer.prevPosition.y
      this.cameras.main.centerOn(x, y)
    }
  }

  
}

function buildMap () {
  //  Parse the data out of the map
  var data = scene.cache.json.get('map');

  var tilewidth = data.tilewidth;
  var tileheight = data.tileheight;

  let tileWidthHalf = tilewidth / 2;
  let tileHeightHalf = tileheight / 2;

  // map scale
  var mapwidth = data.layers[0].width;
  var mapheight = data.layers[0].height;

  // canvas size
  let canvasWidth = document.body.clientWidth;
  let canvasHeight = document.body.clientHeight;

  var centerX = canvasWidth/2;
  var centerY = canvasHeight/2;

  for (var y = 0; y < mapheight; y++) {
    for (var x = 0; x < mapwidth; x++){

      var tx = (x - y) * tileWidthHalf
      var ty = (x + y) * tileHeightHalf

      var tile = scene.add.image(centerX + tx, centerY + ty, 'tile').setOrigin(0.5,1)
      
      tile.depth = centerY + ty
      tile.coordinateX = x
      tile.coordinateY = y
      
      tile.setInteractive(scene.input.makePixelPerfect())
      tile.on('pointerdown', function () {
          console.log(this.coordinateX, this.coordinateY)
      })
    }
  }
}

function placeHouses () {
  const halfW = document.body.clientWidth/2
  const halfH = document.body.clientHeight/2
  const offsetWidth = 192/2
  const offsetHeight = 192/4

  buildingData.map((ele, index) => {
    let positionX, positionY

    if (ele.row === 1 && ele.column === 1) {
      positionX = halfW - ele.coordinateX*offsetWidth + ele.coordinateY*offsetWidth
      positionY = halfH + ele.coordinateX*offsetHeight + ele.coordinateY*offsetHeight
    } else if (ele.row == 2 && ele.column == 2) {
      positionX = halfW - ele.coordinateX*offsetWidth + ele.coordinateX*offsetWidth
            positionY = halfH + ele.coordinateX*offsetHeight + ele.coordinateY*offsetHeight + offsetHeight
    }

    buildingGroup.create(positionX, positionY, ele.name).setOrigin(0.5, 1)
    buildingGroup.getChildren()[index].setInteractive(scene.input.makePixelPerfect())
    buildingGroup.getChildren()[index].depth = buildingGroup.getChildren()[index].y + 108
    buildingGroup.getChildren()[index].name = ele.name
    buildingGroup.getChildren()[index].on('pointerdown', function (pointer, x, y, event) {
      text.setText(this.name)
      if(this.isJump){ return false }
      this.isJump = true
      if(lastTile){
          scene.tweens.add({
              targets: lastTile,
              duration: 130,
              y: '+=20',
              ease: 'Quad.easeOut',
          })
          lastTile.isJump = false;
          lastTile = null;
      }
      scene.tweens.add({
          targets: this,
          duration: 130,
          y: '-=20',
          ease: 'Quad.easeOut',
      })
      lastTile = this
      
      event.stopPropagation()
    })
  })
}