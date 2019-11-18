const canvas = document.querySelector('canvas'), ctx = canvas.getContext('2d'), ships = [], enemies = []
let frames = 0, interval = 0, started = false, i = 0, j = 0, k = 0

class SpaceShip{
  constructor(x, player){
    this.x = x
    this.y = canvas.height - 50
    this.w = 30
    this.h = 30
    this.move = [false, false]
    this.bullets = []
    this.life = 3
    this.score = 0
    this.player = player
  }
  draw(move) {
    move[0] && this.x > 20 ? this.x-- : (move[1] && this.x + this.w < canvas.width - 20 ? this.x++ : {})
    ctx.fillRect(this.x, this.y, this.w, this.h)
  }
  shot(){
    this.bullets.push(new bullet(this.x + (this.w/2), this.y, true, this))
  }
}

class enemy{
  constructor(x, y){
    this.x = x
    this.y = y
    this.w = 15
    this.h = 10
    this.dir = true
    this.bullets = []
    this.life = 1
  }
  draw(dir, f){
    f%(60*8) === 0 ? (this.dir = !dir, this.y += 20) : (
      f % 60 === 0 ? (dir ? this.x += 20 : this.x -= 20) : {}
    )
    ctx.fillRect(this.x, this.y, this.w, this.h)

  }
  shot(){
    this.bullets.push(new bullet(this.x + (this.w/2), this.y + this.h, false, false))
  }
}

class bullet{
  constructor(x, y, dir, owner){
    this.x = x
    this.y = y
    this.w = 3
    this.h = 8
    this.dir = dir
    this.life = 1
  }
  draw(){
    this.dir ? this.y--: this.y++
    ctx.fillRect(this.x, this.y, this.w, this.h)
  }
}
const drawScore = () => {
  ctx.font = '12px Arial'
  for(i = 0; i < ships.length; i++){
    ctx.fillText(`SCORE: PLAYER ${ships[i].player}: ${ships[i].score}`, 25 + i*(canvas.width - 170), 50)
  }
}

const start = () => {
  started = true
  ships.push(new SpaceShip((canvas.width/2) - 100, 1))
  ships.push(new SpaceShip((canvas.width/2) + 100, 2))
  for(i = 0; i < 11; i++){
    for(j = 0; j < 5; j++){
      enemies.push(new enemy(35 + (i*30), 100 + (j*30)))
    }
  }
  frames = 0
  interval = setInterval(update, 1000 / 60)
}

const gameOver = () => {
  ships.splice(0, ships.length)
  enemies.splice(0, enemies.length)
  frames = 0
  started = false
  clearInterval(interval)
  interval = 0
  ctx.globalAlpha = 0.6
  ctx.fillStyle = 'gray'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.globalAlpha = 1
  const gameOverImg = document.querySelector('#game-over')
  ctx.drawImage(gameOverImg, 0, 0, canvas.width, canvas.height)
  ctx.font = '20px Arial'
  ctx.fillText('Hit Enter to RESTART game!', 50, canvas.height - 50)
}

const checkShots = () => {
  ships.forEach(item => {
    enemies.forEach(jtem => {
      item.bullets.forEach(ktem => {
        if(
          jtem.y + jtem.h >= ktem.y + (ktem.h/2) &&
          jtem.y <= ktem.y + (ktem.h/2) &&
          jtem.x <= ktem.x + (ktem.w/2) &&
          jtem.x + jtem.w >= ktem.x + (ktem.w/2)
        ){
          jtem.life--
          ktem.life--
          item.score++
        }
      })
      jtem.bullets.forEach(ktem => {
        if(
          item.y + item.h >= ktem.y + (ktem.h/2) &&
          item.y <= ktem.y + (ktem.h/2) &&
          item.x <= ktem.x + (ktem.w/2) &&
          item.x + item.w >= ktem.x + (ktem.w/2)
          ){
            item.life--
            ktem.life--
        }
      })
    })
  });
}

document.addEventListener('keydown', key => {
  switch(key.keyCode) {
    case 13:
      if(interval)return
      start()
      break
    case 37:
      if(started)ships[0].move = [true, false]
      break
    case 39:
      if(started)ships[0].move = [false, true]
      break
    case 65:
      if(started)ships[1].move = [true, false]
      break
    case 68:
      if(started)ships[1].move = [false, true]
      break
    case 27:
      if(started)gameOver()
      break
    default:
      break
  }
})
document.addEventListener('keyup', key => {
  switch(key.keyCode){
    case 37:
      if(started)ships[0].move = [false, false]
      break
    case 39:
      if(started)ships[0].move = [false, false]
      break
    case 65:
      if(started)ships[1].move = [false, false]
      break
    case 68:
      if(started)ships[1].move = [false, false]
      break
    default:
      break
  }
},)
document.addEventListener('keypress', key => {
  switch(key.keyCode){
    case 27:
      if(started)gameOver()
      break
    case 32:
      if(started)ships[0].shot()
      break
    case 119:
      if(started)ships[1].shot()
      break
    default:
      break
  }
},)

const update = () => {
  if((Math.max(ships[0].life, ships[1].life) === 0) || (enemies[enemies.length - 1].y + enemies[enemies.length - 1].h >= canvas.height - 50)){
    gameOver()
  }
  ctx.fillStyle = 'black'
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  frames++
  if(frames % 30 === 0){
    if(Math.floor(Math.random() * 2) === 0){
      let n = Math.floor(Math.random() * enemies.length)
      enemies[n].shot()
    }
  }
  ctx.fillStyle = 'white'
  ships.forEach(item => {
    if(item.life > 0)item.draw(item.move)
    item.bullets.forEach(jtem => {
      if(jtem.life > 0)jtem.draw()
    })
  })
  enemies.forEach((item, index, irr) => {
    if(item.life <= 0){
      irr.splice(index, 1)
    }else{
      item.draw(item.dir, frames)
    }
    item.bullets.forEach((jtem, jndex, jrr) => {
      if(jtem.life <= 0){
        jrr.splice(jndex, 1)
      }else{
        jtem.draw()
      }
    })
  })
  checkShots()
  drawScore()
}

window.onload = () =>{
  canvas.width = document.querySelector('body').clientHeight
  canvas.height = document.querySelector('body').clientHeight
  ctx.fillStyle = 'black'
  ctx.font = '20px Arial'
  const logo = document.querySelector("#logo")
  ctx.drawImage(logo, 0, 0, canvas.width, canvas.height)
  ctx.fillStyle = 'white'
  ctx.fillText('Hit Enter to START game!', 50, canvas.height - 50)
}