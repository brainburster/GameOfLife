class Bitmap {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.rowLength = ((w - 1) >> 5) + 1;
    this.data = new Array();
    for (let i = 0; i < this.rowLength; i++) {
      this.data.push(new Uint32Array(h));
    }
  }
  setData(x, y, v) {
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) {
      //throw Error("超出范围");
      return 0;
    }
    const row = x >>> 5;
    x &= 0b11111;
    const flag = 1 << x;
    if (v) {
      this.data[row][y] |= flag;
    } else {
      this.data[row][y] &= ~flag;
    }
  }
  getData(x, y) {
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) {
      //throw Error("超出范围");
      return 0;
    }
    const row = x >>> 5;
    x = x % 32;
    const flag = 1 << x;
    return (this.data[row][y] & flag) ? 1 : 0;
  }
  clear() {
    this.data.forEach((v) => {
      v.fill(0);
    });
  }
  equal(bitmap) {
    if (this.w !== bitmap.w || this.h !== bitmap.h) {
      return false;
    }
    return this.data.every((v, x) => v.every((u, y) => u === bitmap.data[x][y]));
  }
  copy() {
    const bitmap = new Bitmap(this.w, this.h);
    for (let i = 0; i < this.rowLength; i++) {
      bitmap.data[i] = new Uint32Array(this.data[i])
    }
    return bitmap;
  }
}

//热寂效果
const colors = ["#666", "#777", "#877", "#977", "#A77", "#B77", "#C88", "#D88", "#E99", "#F99"];
colors.reverse();

class GameOfLife {
  constructor() {
    this.canvas = document.getElementById("main_canvas");
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.context = this.canvas.getContext("2d");
    this.context.fillStyle = "gray";
    this.context.strokeStyle = "black";
    this.data = new Bitmap(80, 60);
    this.dataOld = this.data.copy();
    this.history = [];
    this.history.push(this.dataOld);
    this.pause = true;
    let penColor = 1;
    //定义枚举
    this.direction = {
      DIRECTION_ALL: 0,
      DIRECTION_LEFT: 1,
      DIRECTION_RIGHT: 2,
      DIRECTION_UP: 3,
      DIRECTION_DWON: 4,
      DIRECTION_LEFT_UP: 5,
      DIRECTION_LEFT_DWON: 6,
      DIRECTION_RIGHT_UP: 7,
      DIRECTION_RIGHT_DWON: 8
    }

    this.canvas.onmousedown = (e) => {
      const x = Math.floor(e.offsetX / 10);
      const y = Math.floor(e.offsetY / 10);
      this.data.setData(x, y, penColor);
    }

    this.canvas.onmousemove = (e) => {
      if (e.buttons !== 1) {
        return;
      }
      const x = Math.floor(e.offsetX / 10);
      const y = Math.floor(e.offsetY / 10);
      this.data.setData(x, y, penColor);
    }

    this.canvas.ontouchstart = (e) => {
      e.preventDefault();
    }

    this.canvas.ontouchmove = (e) => {
      for (let i = 0; i < e.targetTouches.length; i++) {
        const touch = e.targetTouches[i];
        let x = touch.clientX - this.canvas.offsetLeft;
        let y = touch.clientY - this.canvas.offsetTop;
        x = Math.floor(x / 10);
        y = Math.floor(y / 10);
        this.data.setData(x, y, penColor);
      }
      e.preventDefault();
    }


    this.pauseBtn = document.createElement("button");
    this.pauseBtn.innerHTML = "点击，以开始";
    this.pauseBtn.onclick = () => {
      this.pause = !this.pause;
      if (this.pause) {
        this.pauseBtn.innerHTML = "点击，以开始";
      } else {
        this.pauseBtn.innerHTML = "暂停，以绘制地图";
      }
    }
    document.getElementById("buttons").appendChild(this.pauseBtn);

    const pencilOrRubber = ["橡皮", "铅笔"];
    this.penBtn = document.createElement("button");
    this.penBtn.innerHTML = pencilOrRubber[penColor];
    this.penBtn.onclick = () => {
      penColor = penColor ? 0 : 1;
      this.penBtn.innerHTML = pencilOrRubber[penColor];
    }
    document.getElementById("buttons").appendChild(this.penBtn);

    this.randomBtn = document.createElement("button");
    this.randomBtn.innerHTML = "随机汤";
    this.randomBtn.onclick = () => {
      for (let i = 0; i < this.data.w; i++) {
        for (let j = 0; j < this.data.h; j++) {
          let value = Math.random() > 0.3 ? 0 : 1;
          this.data.setData(i, j, value);
        }
      }
    }
    document.getElementById("buttons").appendChild(this.randomBtn);
    this.restartBtn = document.createElement("button");
    this.restartBtn.innerHTML = "重开";
    this.restartBtn.onclick = () => {
      window.location.reload();
    }
    document.getElementById("buttons").appendChild(this.restartBtn);

    this.clearBtn = document.createElement("button");
    this.clearBtn.innerHTML = "清屏";
    this.clearBtn.onclick = () => {
      this.data.clear();
      this.dataOld.clear();
      this.history.length = 0;
    }
    document.getElementById("buttons").appendChild(this.clearBtn);

    this.aboutBtn = document.createElement("button");
    this.aboutBtn.innerHTML = "什么是生命游戏？";
    this.aboutBtn.onclick = () => {
      window.open("https://baike.baidu.com/item/生命游戏");
    }
    document.getElementById("buttons").appendChild(this.aboutBtn);

    this.speedRange = document.getElementById("speed");
    this.speedRange.oninput = () => {
      this.speed = 200 - Number(this.speedRange.value);
    }
    this.speed = 200 - Number(this.speedRange.value);

    this.bHeatDeath = document.getElementById("heat-death");

    this.canvas.style.cursor = "pointer";
    this.penBtn.style.cursor = "pointer";
    this.randomBtn.style.cursor = "pointer";
    this.clearBtn.style.cursor = "pointer";
    this.aboutBtn.style.cursor = "help";
    this.restartBtn.style.cursor = "pointer";
    this.pauseBtn.style.cursor = "pointer";
  }

  setMap(map) {
    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[i].length; j++) {
        this.data.setData(i, j, map[i][j]);
      }
    }
    //创建虚假而永恒的历史
    this.history.push(this.data);
    this.history.push(this.data);
    this.history.push(this.data);
    this.history.push(this.data);
    this.history.push(this.data);
    this.history.push(this.data);
    this.history.push(this.data);
  }

  saveData() {
    this.dataOld = this.data.copy();
    this.history.push(this.dataOld);
    if (this.history.length > 8) {
      this.history.splice(0, 1);
    }
  }

  drawCell(x, y, color = "gray", height = 10) {
    this.context.fillStyle = color;
    this.context.fillRect(x * 10, y * 10, height, height);
    this.context.strokeRect(x * 10, y * 10, height, height);
  }

  getCountAdjacency(x, y, direction = 0) {
    if (direction === this.direction.DIRECTION_ALL) {
      let sum = 0;
      for (let i = 1; i < 9; i++) {
        sum += this.getCountAdjacency(x, y, i) || 0;
      }
      return sum;
    }

    switch (direction) {
      case this.direction.DIRECTION_LEFT:
        x -= 1;
        break;
      case this.direction.DIRECTION_RIGHT:
        x += 1;
        break;
      case this.direction.DIRECTION_UP:
        y -= 1;
        break;
      case this.direction.DIRECTION_DWON:
        y += 1;
        break;
      case this.direction.DIRECTION_LEFT_UP:
        x -= 1;
        y -= 1;
        break;
      case this.direction.DIRECTION_LEFT_DWON:
        x -= 1;
        y += 1;
        break;
      case this.direction.DIRECTION_RIGHT_UP:
        x += 1;
        y -= 1;
        break;
      case this.direction.DIRECTION_RIGHT_DWON:
        x += 1;
        y += 1;
        break;
      default:
        break;
    }
    return this.dataOld.getData(x, y);
  }

  logic() {
    if (this.pause) {
      return;
    }

    this.saveData();
    for (let i = 0; i < this.data.w; i++) {
      for (let j = 0; j < this.data.h; j++) {
        let temp = this.getCountAdjacency(i, j);
        if (temp == 3) {
          //出生
          this.data.setData(i, j, 1);
        } else if (temp != 2) {
          //死亡
          this.data.setData(i, j, 0);
        } else {
          //不变
        }
      }
    }
  }

  draw() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = 0; i < this.data.w; i++) {
      for (let j = 0; j < this.data.h; j++) {
        if (this.data.getData(i, j)) {
          if (this.bHeatDeath.checked) {
            const count = this.history.reduce((a, b) => a + b.getData(i, j), 0);
            this.drawCell(i, j, colors[count]);
          } else {
            this.drawCell(i, j, "gray");
          }
        }
      }
    }
  }

  run() {
    let previous = (new Date()).getTime();
    let lag = 0.0;

    const gameloop = () => {
      const current = (new Date()).getTime();
      const elapsed = current - previous;
      previous = current;
      lag += elapsed;

      while (lag >= this.speed) {
        this.logic();
        lag -= this.speed;
      }
      this.draw();
      requestAnimationFrame(gameloop);
    };

    gameloop();
  }
}