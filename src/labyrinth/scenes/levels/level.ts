import { GAME_PROPERTIES } from '../../config/game-properties'
import { Graph } from '../../graph/graph'
import { Vertex } from '../../graph/vertex'
import { Edge } from '../../graph/edge'
import { DepthFirstSearch } from '../../graph/depth-first-search'
import { BreadthFirstSearch } from '../../graph/breadth-first-search'
import { LEVEL_MAPS, TILE_TYPE } from '../../config/level-maps'


export class Level extends Phaser.Scene
{
  private _tank?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  private _cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys
  private _layerMap?: Phaser.Tilemaps.TilemapLayer
  private _playerInitialPos: {x:number, y:number, angle: number} = {x: 0, y: 0, angle: 0}
  
  // Load tiles
  private _map: Phaser.Tilemaps.Tilemap|null = null
  private _levelMap: number[][] = []
  private numLevels = LEVEL_MAPS.length
  private currentLevel = -1

  // Solution
  private _pathSolution: Vertex[] = []

  private _btnTxtDFS: Phaser.GameObjects.Text|null = null
  private _btnTxtDFSGreedy: Phaser.GameObjects.Text|null = null
  private _btnTxtBFS: Phaser.GameObjects.Text|null = null
  private _btnTxtClearPath: Phaser.GameObjects.Text|null = null
  private _btnBack: Phaser.GameObjects.Text|null = null
  private _btnNextLevel: Phaser.GameObjects.Text|null = null
  private _btnPrevLevel: Phaser.GameObjects.Text|null = null
  private _btnStopMusic: Phaser.GameObjects.Text|null = null
  private _txtScore: Phaser.GameObjects.Text|null = null
  private _txtLevel: Phaser.GameObjects.Text|null = null
  private _bottomButtonsGroup: Phaser.GameObjects.Group|undefined = undefined

  private _score = 0
  private _bgMusic: Phaser.Sound.BaseSound|null = null
  private _motorLoop: Phaser.Sound.BaseSound|null = null
  private _itemSound: Phaser.Sound.BaseSound|null = null

  private _itemsGroup: Phaser.Physics.Arcade.Group|undefined = undefined
  private _itemsGroupCollider: Phaser.Physics.Arcade.Collider|undefined = undefined

  private _pathSolutionLabelsGroup: Phaser.GameObjects.Group|undefined = undefined

  private _tweenPathSolution: Phaser.Tweens.Tween|undefined = undefined
  private _tweenPathLabels: Phaser.Tweens.Tween|undefined = undefined


  private readonly _pointsLevel = 100
  private readonly _pointsItemCoin = 5

  private motor_sound_config: any = {
    mute: false, volume: 0.6, rate: 1,
    detune: 0, seek: 0, loop: true, delay: 0 
  }

  private item_sound_config: any = {
    mute: false, volume: 0.6, rate: 1,
    detune: 0, seek: 0, loop: false, delay: 0 
  }

  constructor() {
    super('Level')
  }

  update() {
    this.movePlayer()
    this.movePlayerMouse()
  }

  create() {
    this._score = 0
    this._pathSolution = []

    
    // Load map tiles
    this.currentLevel = -1
    this.nextLevel()

    // Listen for keyboard events
    this._cursorKeys = this.input.keyboard?.createCursorKeys()

    // Load sounds
    this._motorLoop = this.sound.add('motor-loop')
    this._itemSound = this.sound.add('item-pickup')
  }


  _helperMovePlayer(direction: string) {
    const reward = this._pointsLevel * (this.currentLevel + 1)
    if (!this._tank || !this._cursorKeys) {
      return
    }

    let pressedKey: Phaser.Input.Keyboard.Key|null = null
    let tile: Phaser.Tilemaps.Tile|undefined = undefined
    let velX = 0
    let velY = 0

    if (direction === 'left') {
      this._tank.angle = 270
      pressedKey = this._cursorKeys.left
      tile = this._layerMap?.getTileAtWorldXY(
        this._tank.x - (this._tank.width / 2 + 4),
        this._tank.y,
        true
      )
      velX = -GAME_PROPERTIES.player_speed
      velY = 0

    } else if (direction === 'right') {
      this._tank.angle = 90
      pressedKey = this._cursorKeys.right
      tile = this._layerMap?.getTileAtWorldXY(
        this._tank.x + (this._tank.width / 2 + 4),
        this._tank.y,
        true
      )
      velX = GAME_PROPERTIES.player_speed
      velY = 0

    } else if (direction === 'up') {
      this._tank.angle = 0
      pressedKey = this._cursorKeys.up
      tile = this._layerMap?.getTileAtWorldXY(
        this._tank.x,
        this._tank.y - (this._tank.height / 2),
        true
      )
      velX = 0
      velY = -GAME_PROPERTIES.player_speed

    } else if (direction === 'down') {
      this._tank.angle = 180
      pressedKey = this._cursorKeys.down
      tile = this._layerMap?.getTileAtWorldXY(
        this._tank.x,
        this._tank.y + (this._tank.height / 2),
        true
      )
      velX = 0
      velY = GAME_PROPERTIES.player_speed
    } else if (direction === 'stop') {
      this._tank.setVelocityX(0)
      this._tank.setVelocityY(0)
      this._tank.anims.play('vehicle_tank_green_stop')
      this._motorLoop?.stop()
      return
    } else {
      return
    }

    // Animation and sound
    // @ts-ignore
    if (pressedKey && Phaser.Input.Keyboard.JustDown(pressedKey)) {
      this._motorLoop?.play(this.motor_sound_config)
    } else if (this.input.activePointer.isDown && !this._motorLoop?.isPlaying) {
      this._motorLoop?.play(this.motor_sound_config)
    }
    this._tank.anims.play('vehicle_tank_green_anim', true)
    
    // Check bounds
    if (this.tileTypeIsColliding(tile)) {
      velX = 0
      velY = 0
    } // Check if goal is reached
    else if (this.tileTypeIsDestination(tile)) {
      this._score += reward
      this.nextLevel()
      return
    }
    // Move player
    //this._tank.x -= GAME_PROPERTIES.step_distance
    this._tank.setVelocityY(velY)
    this._tank.setVelocityX(velX)
  }


  movePlayer() {
    if (!this._cursorKeys || !this._tank) {
      console.error('No keyboard/tank found', this._cursorKeys)
      return
    }

    // Move Down
    if ((this._cursorKeys.down.isDown && this._cursorKeys.left.isDown) ||
        (this._cursorKeys.down.isDown && this._cursorKeys.right.isDown) ||
        this._cursorKeys.down.isDown) {
      this._helperMovePlayer('down')
    } // Move Left
    else if ((this._cursorKeys.left.isDown && this._cursorKeys.up.isDown) ||
        (this._cursorKeys.left.isDown && this._cursorKeys.down.isDown) ||
        this._cursorKeys.left.isDown) {
      this._helperMovePlayer('left')
    } // Move RIGHT
    else if ((this._cursorKeys.right.isDown && this._cursorKeys.up.isDown) ||
        (this._cursorKeys.right.isDown && this._cursorKeys.down.isDown) ||
        this._cursorKeys.right.isDown) {
      this._helperMovePlayer('right')
      
    } // Move UP
    else if ((this._cursorKeys.up.isDown && this._cursorKeys.left.isDown) ||
        (this._cursorKeys.up.isDown && this._cursorKeys.right.isDown) ||
        this._cursorKeys.up.isDown) {
      this._helperMovePlayer('up')

    } // Stop
    else {
      if (!this.input.activePointer.isDown) {
        this._helperMovePlayer('stop')
      }
    }

    
  }

  calculatePosition(
    layerMap: Phaser.Tilemaps.TilemapLayer|undefined,
    objectToMove: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
    x: number,
    y: number
  ): { x:number, y:number, angle: number } {
    const res = { x:0, y:0, angle: 0 }
    if (!layerMap) {
      return res
    }
    const tile = layerMap.getTileAt(x, y)
    if (tile) {
      
      res.x = tile.pixelX + objectToMove.width / 2
      res.y = tile.pixelY + objectToMove.height / 2
      
      res.angle = 90
    }

    return res
  }

  tileTypeIsColliding(tile: Phaser.Tilemaps.Tile|undefined) {
    if (!tile)
      return false

    const collidingTiles = Object.values(TILE_TYPE).filter(v => v.colliding).map(v => v.val)
    if (collidingTiles.indexOf(tile.index) >= 0) {
      return true
    }

    return false
  }

  tileIndexIsColliding(tileIndex: number) {
    const collidingTiles = Object.values(TILE_TYPE).filter(v => v.colliding).map(v => v.val)
    if (collidingTiles.indexOf(tileIndex) >= 0) {
      return true
    }
    return false
  }

  tileTypeIsDestination(tile: Phaser.Tilemaps.Tile|undefined) {
    if (!tile)
      return false

    const goalTiles = Object.values(TILE_TYPE).filter(v => v.isDestination).map(v => v.val)
    if (goalTiles.indexOf(tile.index) >= 0) {
      return true
    }

    return false
  }

  tileTypeIsSource(tile: Phaser.Tilemaps.Tile|undefined) {
    if (!tile)
      return false

    const tiles = Object.values(TILE_TYPE).filter(v => v.isSource).map(v => v.val)
    if (tiles.indexOf(tile.index) >= 0) {
      return true
    }

    return false
  }

  tileIndexIsSource(tileIndex: number) {
    const tiles = Object.values(TILE_TYPE).filter(v => v.isSource).map(v => v.val)
    if (tiles.indexOf(tileIndex) >= 0) {
      return true
    }

    return false
  }

  tileIndexIsDestination(tileIndex: number) {
    const goalTiles = Object.values(TILE_TYPE).filter(v => v.isDestination).map(v => v.val)
    if (goalTiles.indexOf(tileIndex) >= 0) {
      return true
    }

    return false
  }

  createGraphFromMap(tileMap: number[][]): Graph {
    const graph = new Graph()
    const numRows = tileMap.length

    // Add Vertices
    // Get row from tileMap
    for (const rowIndex in tileMap) {
      // Get columns from row
      for (const colIndex in tileMap[rowIndex]) {
        const vertex = new Vertex(`${rowIndex},${colIndex}`)
        graph.addVertex(vertex)
      }
    }

    // Add Edges
    // Get row from tileMap
    for (const rowIndex in tileMap) {
      // Get columns from row
      for (const colIndex in tileMap[rowIndex]) {
        const numCols = tileMap[rowIndex].length
        const tileIndex = tileMap[rowIndex][colIndex]

        const parentVertex = new Vertex(`${rowIndex},${colIndex}`)
        // The tile does not have edges if colliding is true
        if (this.tileIndexIsColliding(tileIndex)) {
          continue
        }

        // Edge 1: Check left
        if (+colIndex - 1 >= 0 && tileMap[rowIndex][+colIndex - 1] !== undefined) {
          // Check colliding property
          // if true, the player should not pass through this tile :)
          const neighborTileIndex = tileMap[rowIndex][+colIndex - 1]
          if (!this.tileIndexIsColliding(neighborTileIndex)) {
            const leftVertex = new Vertex(`${rowIndex},${+colIndex - 1}`)
            const leftEdge = new Edge(parentVertex, leftVertex)
            graph.addEdge(leftEdge)
          }
        }

        // Edge 2: Check right
        if (+colIndex + 1 < numCols && tileMap[rowIndex][+colIndex + 1] !== undefined) {
          // Check colliding property
          // if true, the player should not pass through this tile :)
          const neighborTileIndex = tileMap[rowIndex][+colIndex + 1]
          if (!this.tileIndexIsColliding(neighborTileIndex)) {
            const rightVertex = new Vertex(`${rowIndex},${+colIndex + 1}`)
            const rightEdge = new Edge(parentVertex, rightVertex)
            graph.addEdge(rightEdge)
          }
        }

        // Edge 3: Check up
        if (+rowIndex - 1 >= 0 && tileMap[+rowIndex - 1][colIndex] !== undefined) {
          // Check colliding property
          // if true, the player should not pass through this tile :)
          const neighborTileIndex = tileMap[+rowIndex - 1][colIndex]
          if (!this.tileIndexIsColliding(neighborTileIndex)) {
            const upVertex = new Vertex(`${+rowIndex - 1},${colIndex}`)
            const upEdge = new Edge(parentVertex, upVertex)
            graph.addEdge(upEdge)
          }
        }

        // Edge 4: Check down
        if (+rowIndex + 1 < numRows && tileMap[+rowIndex + 1][colIndex] !== undefined) {
          // Check colliding property
          // if true, the player should not pass through this tile :)
          const neighborTileIndex = tileMap[+rowIndex + 1][colIndex]
          if (!this.tileIndexIsColliding(neighborTileIndex)) {
            const downVertex = new Vertex(`${+rowIndex + 1},${colIndex}`)
            const downEdge = new Edge(parentVertex, downVertex)
            graph.addEdge(downEdge)
          }
          
        }

      }
    }

    return graph
  }

  searchGoal(start: Vertex, goal: Vertex, greedy: boolean): Vertex[] {
    const g = this.createGraphFromMap(this._levelMap)
    const dfs = new DepthFirstSearch()
    const path = dfs.search(g, start, goal, greedy)

    return path
  }

  searchGoalBreadth(start: Vertex, goal: Vertex): Vertex[] {
    const g = this.createGraphFromMap(this._levelMap)
    const bfs = new BreadthFirstSearch()
    const path = bfs.search(g, start, goal)

    return path
  }

  clearTintInTiles(path: Vertex[]) {
    if (this._tweenPathLabels) {
      this._tweenPathLabels.stop()
      this._tweenPathLabels.destroy()
    }
    if (this._tweenPathSolution) {
      this._tweenPathSolution.stop()
      this._tweenPathSolution.destroy()
    }

    for (const p of path) {
      const [y, x] = p.label.split(',')
      const tmpTile = this._layerMap?.getTileAt(+x, +y)
      if (tmpTile) {
        tmpTile.tint = 0xFFFFFF 
      }
    }

    this.clearPathSolutionLabels()

  }

  tintTiles(path: Vertex[]) {
    // Tint tiles
    const timeInc = 50
    let delay = 0
    let step = 1
    for (const p of path) {
      const [y, x] = p.label.split(',')
      const tmpTile = this._layerMap?.getTileAt(+x, +y)

      if (tmpTile) {
        const style = { font: "10px Arial" }
        const tmpText = this.add.text(tmpTile.getCenterX(), tmpTile.getCenterY(), `${step}`, style)
        tmpText.x -= tmpText.width / 2
        tmpText.y -= tmpText.height / 2
        tmpText.alpha = 0

        this._tweenPathSolution = this.tweens.add({
          targets: tmpTile,
          tint: { from: tmpTile.tint, to: 0x0CAABF },
          ease: 'Linear',
          duration: timeInc * 4,
          repeat: 0,
          yoyo: false,
          delay: delay
        });
        this._tweenPathLabels = this.tweens.add({
          targets: tmpText,
          alpha: 1,
          ease: 'Linear',
          duration: timeInc * 4,
          repeat: 0,
          yoyo: false,
          delay: delay
        });

        delay += timeInc

        //@ts-ignore
        this._pathSolutionLabelsGroup.add(tmpText)
        step += 1
      }
    }
  }

  clearPathSolutionLabels() {
    if (this._pathSolutionLabelsGroup) {
      if (this._pathSolutionLabelsGroup.children) {
        this._pathSolutionLabelsGroup.clear(true, true)
      }
      this._pathSolutionLabelsGroup.destroy()
    }
  }


  solveMaze(start: Vertex, goal: Vertex, algorithm: 'dfs'|'bfs'|'dfs-greedy') {
    // Clear tint in tiles
    // @ts-ignore
    const tiles = this._layerMap.tilemap.getTilesWithin().map(t => new Vertex(`${t.y},${t.x}`))
    this.clearTintInTiles(tiles)


    // Reset global solution
    this._pathSolution = []
    this._pathSolutionLabelsGroup = this.add.group()

    if (algorithm === 'bfs') {
      this._pathSolution = this.searchGoalBreadth(start, goal)
    } else if (algorithm === 'dfs') {
      this._pathSolution = this.searchGoal(start, goal, false)
    } else if (algorithm === 'dfs-greedy') {
      this._pathSolution = this.searchGoal(start, goal, true)
    }else {
      return this._pathSolution
    }
    
    this.tintTiles(this._pathSolution)
  }

  getGoals(tileMap: number[][]): Vertex[] {
    const goals: Vertex[] = []

    for (const row in tileMap) {
      for (const col in tileMap[row]) {
        const tileIndex = tileMap[row][col]
        if (this.tileIndexIsDestination(tileIndex)) {
          const resV = new Vertex(`${row},${col}`)
          goals.push(resV)
        }
      }
    }


    return goals
  }

  getStartingLines(levelMap: number[][]): Vertex[] {
    const startingLines: Vertex[] = []

    for (const row in levelMap) {
      for (const col in levelMap[row]) {
        const tileIndex = levelMap[row][col]
        if (this.tileIndexIsSource(tileIndex)) {
          const resV = new Vertex(`${row},${col}`)
          startingLines.push(resV)
        }
      }
    }

    return startingLines
  }

  getInitialPosition(): Vertex {
    const startingLines = this.getStartingLines(this._levelMap)
    const numStartingLines = startingLines.length

    if (numStartingLines <= 0 || !numStartingLines) {
      console.warn('No starting line found')
      throw new Error('Error searching initial position')
    }

    return startingLines[Phaser.Math.Between(0, numStartingLines - 1)]
  }

  getRandomGoal(): Vertex {
    const goals = this.getGoals(this._levelMap)
    const numGoals = goals.length

    if (numGoals <= 0 || !numGoals) {
      console.warn('No goals found')
      throw new Error('Error searching goals')
    }

    return goals[Phaser.Math.Between(0, numGoals - 1)]
  }

  addScoreAndLevelText() {
    const width = +this.sys.game.config.width
    // const height = +this.sys.game.config.height
    const font = { 
      fontFamily: 'Arial, "Goudy Bookletter 1911", Times, serif'
    }
    if (this._txtScore) {
      this._txtScore.destroy()
    }
    if (this._txtLevel) {
      this._txtLevel.destroy()
    } 
    // this._txtLevel?.setText(`Level: ${this.currentLevel}`)
    this._txtScore = this.add.text(4, 4, `Score: ${this._score}`, font)
    this._txtLevel = this.add.text(width - 100, 4, `Level: ${this.currentLevel}`, font)
    this._txtScore.setScrollFactor(0, 0)
    this._txtLevel.setScrollFactor(0, 0)
    this._txtScore.setStroke('#293219', 12);
    this._txtLevel.setStroke('#293219', 12);
  }

  addNavButtons() {
    const width = +this.sys.game.config.width
    const height = +this.sys.game.config.height
    const font = { 
      fontFamily: 'Arial, "Goudy Bookletter 1911", Times, serif',
      backgroundColor: '#000000'
    }

    if (this._bottomButtonsGroup) {
      if (this._bottomButtonsGroup.children) {
        this._bottomButtonsGroup.clear(true, true)
      }
      this._bottomButtonsGroup.destroy(true)
    }
    this._bottomButtonsGroup = this.add.group()

    this._btnBack = this.add.text(width - 120, height - 40, "Back to menu", font)
    this._btnNextLevel = this.add.text(this._btnBack.x - (50 + 20), height - 40, "Next >", font)
    this._btnPrevLevel = this.add.text(this._btnNextLevel.x - (50 + 20), height - 40, "< Prev", font)
    this._btnStopMusic = this.add.text(this._btnPrevLevel.x - (120 + 20), height - 40, "Play/Stop music", font)
    this._btnBack.setScrollFactor(0, 0)
    this._btnNextLevel.setScrollFactor(0, 0)
    this._btnPrevLevel.setScrollFactor(0, 0)
    this._btnStopMusic.setScrollFactor(0, 0)

    this._bottomButtonsGroup.add(this._btnBack)
    this._bottomButtonsGroup.add(this._btnNextLevel)
    this._bottomButtonsGroup.add(this._btnPrevLevel)
    this._bottomButtonsGroup.add(this._btnStopMusic)

    this._btnBack?.setInteractive().on('pointerdown', () => {
      if (this._bgMusic) {
        this._bgMusic.destroy()
      }
      this.scene.start('Intro')
    }, this)

    this._btnNextLevel?.setInteractive().on('pointerdown', () => {
      this.nextLevel()
    }, this)

    this._btnPrevLevel?.setInteractive().on('pointerdown', () => {
      this.prevLevel()
    }, this)

    this._btnStopMusic?.setInteractive().on('pointerdown', () => {
      if (this._bgMusic?.isPlaying) {
        this._bgMusic?.stop()
      } else {
        this.setBgMusic()
      }
    }, this)

    //@ts-ignore
    this.addSolveButton(this._layerMap, this._tank)
  }

  addSolveButton(
    layerMap: Phaser.Tilemaps.TilemapLayer,
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
    const height = +this.sys.game.config.height
     const font = { 
      fontFamily: 'Arial, "Goudy Bookletter 1911", Times, serif',
      backgroundColor: '#000000'
    }
    this._btnTxtDFS = this.add.text(20, height - 40, "DFS", font)
    this._btnTxtDFSGreedy = this.add.text(this._btnTxtDFS.x + this._btnTxtDFS.width + 20, height - 40, "Greedy BestFS", font)
    this._btnTxtBFS = this.add.text(this._btnTxtDFSGreedy.x + this._btnTxtDFSGreedy.width + 20, height - 40, "BFS", font)
    this._btnTxtClearPath = this.add.text(this._btnTxtBFS.x + this._btnTxtBFS.width + 20, height - 40, "Clear", font)
    this._btnTxtDFS.setScrollFactor(0, 0)
    this._btnTxtDFSGreedy.setScrollFactor(0, 0)
    this._btnTxtBFS.setScrollFactor(0, 0)
    this._btnTxtClearPath.setScrollFactor(0, 0)

    this._btnTxtDFS?.setInteractive().on('pointerdown', () => {
      const goal = this.getRandomGoal()
      const currentTile = layerMap.getTileAtWorldXY(
        player.x, player.y 
      )
      const playerInitialVertex = new Vertex(`${currentTile.y},${currentTile.x}`)
      this.solveMaze(playerInitialVertex, goal, 'dfs')
    }, this)

    this._btnTxtDFSGreedy?.setInteractive().on('pointerdown', () => {
      const goal = this.getRandomGoal()
      const currentTile = layerMap.getTileAtWorldXY(
        player.x, player.y 
      )
      const playerInitialVertex = new Vertex(`${currentTile.y},${currentTile.x}`)
      this.solveMaze(playerInitialVertex, goal, 'dfs-greedy')
    }, this)

    this._btnTxtBFS?.setInteractive().on('pointerdown', () => {
      const goal = this.getRandomGoal()
      const currentTile = layerMap.getTileAtWorldXY(player.x, player.y)
      const playerInitialVertex = new Vertex(`${currentTile.y},${currentTile.x}`)
      this.solveMaze(playerInitialVertex, goal, 'bfs')
    }, this)

    this._btnTxtClearPath?.setInteractive().on('pointerdown', () => {
      // @ts-ignore
      const tiles = this._layerMap.tilemap.getTilesWithin().map(t => new Vertex(`${t.y},${t.x}`))
      this.clearTintInTiles(tiles)
    }, this)

    if (this._bottomButtonsGroup) {
      this._bottomButtonsGroup.add(this._btnTxtDFS)
      this._bottomButtonsGroup.add(this._btnTxtDFSGreedy)
      this._bottomButtonsGroup.add(this._btnTxtBFS)
      this._bottomButtonsGroup.add(this._btnTxtClearPath)
    }

    
  }

  initMap(data: number[][]|undefined): Phaser.Tilemaps.Tilemap {


    if (this._map) {
      this._map.destroy()
    }
    if (this._layerMap) {
      this._layerMap.destroy()
    }
    if (this._tank) {
      this._tank.destroy()
    }
    this._pathSolution = []

    // Load tiles from spritesheet
    this._map = this.make.tilemap({data: data, tileWidth: 32, tileHeight: 32})
    const tiles = this._map.addTilesetImage('background_tiles')
    
    // @ts-ignore
    this._layerMap = this._map.createLayer(0, tiles, 0, 0)

    // Create player
    this._tank = this.physics.add.sprite(
      this._playerInitialPos.x,
      this._playerInitialPos.y,
      'vehicle_tank_green'
    )
    this._tank.setBounce(1).setCollideWorldBounds(true)

    // Set initial position for player
    this.setPlayerInitialPosition(this._tank)


    // Animate player
    this.tweens.add({
      targets: this._tank,
      ease: 'Power1',
      duration: 300,
      repeat: 1,
      yoyo: true,
      tint: { from: this._tank.tint, to: 0x0FFFF0},
    })


    // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
    this.cameras.main.setBounds(0, 0, this._map.widthInPixels, this._map.heightInPixels)
    // Fix world bounds
    this.physics.world.setBounds(0, 0, this._map.widthInPixels, this._map.heightInPixels)
    // Camera follows to the player
    this.cameras.main.startFollow(this._tank, true)

    // This is a fix

    // Add buttons and labels
    // @ts-ignore
    this.addNavButtons()

    // Play music
    this.setBgMusic()

    return this._map
  }

  setPlayerInitialPosition(tank: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
    const playerInitialVertex = this.getInitialPosition()
    const [tileY, tileX] = playerInitialVertex.label.split(',').map(xy => +xy)
    this._playerInitialPos = this.calculatePosition(
      this._layerMap, tank, tileX, tileY
    )

    // Set player location
    tank.x = this._playerInitialPos.x
    tank.y = this._playerInitialPos.y
    tank.angle = this._playerInitialPos.angle

  }

  nextLevel() {
    // Clear memory
    this.removeItems()
    // Clear tint in tiles
    if (this._layerMap && this._layerMap.tilemap) {
      const tiles = this._layerMap.tilemap.getTilesWithin()
      if (tiles) {
        this.clearTintInTiles(tiles.map(t => new Vertex(`${t.y},${t.x}`)))
      }
    }

    if (this.currentLevel + 1 < this.numLevels) {
      this.currentLevel += 1
    } else {
      this.currentLevel = 0
    }
    this._levelMap = LEVEL_MAPS[this.currentLevel]
    try {
      this.initMap(this._levelMap)
      // Load labels
      this.addScoreAndLevelText()
      // Load items
      this.addItems()
    } catch (error) {
      this._bgMusic?.stop()
      console.error('Error: ', error)
      this.scene.start('ErrorScreen')
    }
  }
  prevLevel() {
    // Clear memory
    this.removeItems()
    // Clear tint in tiles
    if (this._layerMap && this._layerMap.tilemap) {
      const tiles = this._layerMap.tilemap.getTilesWithin()
      if (tiles) {
        this.clearTintInTiles(tiles.map(t => new Vertex(`${t.y},${t.x}`)))
      }
    }

    if (this.currentLevel - 1 >= 0) {
      this.currentLevel -= 1
      this._levelMap = LEVEL_MAPS[this.currentLevel]
      this.initMap(this._levelMap)
      // Load labels
      this.addScoreAndLevelText()
      this.addItems()
    } else {
      // alert('no more levels')
    }
  }

  setBgMusic() {
    const music = [
      'fur-elise',
      'moonlight-sonata-presto',
      'moonlight-sonata-adagio',
      'symphony-5',
      'concerto-winter',
      'toccata-and-fugue',
      'wwv-86b'
    ]
    const m = Phaser.Math.Between(0, music.length - 1)
    if (this._bgMusic) {
      this._bgMusic.destroy()
    }

    // Add background music
    this._bgMusic = this.sound.add(music[m])
    
    // Play bg music
    const musicConfig = { 
      mute: false, volume: 1, rate: 1,
      detune: 0, seek: 0, loop: true, delay: 0 
    };
    this._bgMusic.play(musicConfig);
  }

  movePlayerMouse(): boolean {
      const pointer = this.input.activePointer
      const px = pointer.worldX
      const py = pointer.worldY
      const _player = this._tank

      if (!_player) {

        return false
      }

      // Pointer must be down to move the player 
      if (!pointer.isDown) {
        return false;
      }

      if (this.input.activePointer.isDown) {
        // Move left
        if (px < _player.x - _player.width )
        {
          this._helperMovePlayer('left');
        } // Right
        else if (px > _player.x + _player.width )
        {
          this._helperMovePlayer('right');
        }
        // Up
        else if (py < _player.y)
        {
          this._helperMovePlayer('up');
        } // Down
        else if (py > _player.y)
        {
          this._helperMovePlayer('down');
        }
      }

      return true;
  }


  addItems() {
    if (!this._tank) {
      return
    }
    this.removeItems()
    const numItems = Phaser.Math.Between(1, (4 * (this.currentLevel + 1)))
    const positions = this.getFreeVertices(this._levelMap)
    const numPositions = positions.length
    this._itemsGroup = this.physics.add.group()
    this._itemsGroupCollider = this.physics.add.overlap(this._tank, this._itemsGroup, this.pickItem, undefined, this)
    
    for (let i = 0; i < numItems; i++) {
      const vertex = positions[Phaser.Math.Between(0, numPositions - 1)]
      const [rowX, colY] = vertex.label.split(',')

      const item = this._itemsGroup.create(0, 0, 'items_spritesheet', 0)
      // const item = this.physics.add.sprite(0, 0, 'items_spritesheet', 1)

      const fpos = this.calculatePosition(this._layerMap, item, +colY, +rowX)
      item.setPosition(fpos.x, fpos.y)
      item.setScale(0.6)

      // this._itemsGroup.add(item)
      if (item) {
        //item.preFX?.addGlow(undefined, 1, 1, undefined, 1, 0);

      }

    }

    
  }

  removeItems() {
    if (this._itemsGroup) {
      if (this._itemsGroup.children) {
        this._itemsGroup.clear(true, true)
      }
      this._itemsGroup.destroy()
    }
    if (this._itemsGroupCollider && this._itemsGroupCollider.active) {
      this._itemsGroupCollider.destroy()
    }

  }

  pickItem(
    _player: Phaser.Tilemaps.Tile|Phaser.Types.Physics.Arcade.GameObjectWithBody|Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, 
    _item: Phaser.Tilemaps.Tile|Phaser.Types.Physics.Arcade.GameObjectWithBody|Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
    this._score += this._pointsItemCoin
    this._txtScore?.setText(`Score: ${this._score}`)
    this._itemSound?.play(this.item_sound_config)
    _item.destroy(true)
  }

  getFreeVertices(levelMap: number[][]): Vertex[] {
    const positions: Vertex[] = []

    for (const row in levelMap) {
      for (const col in levelMap[row]) {
        const tileIndex = levelMap[row][col]
        if (!this.tileIndexIsColliding(tileIndex)) {
          const resV = new Vertex(`${row},${col}`)
          positions.push(resV)
        }
      }
    }


    return positions
  }

}