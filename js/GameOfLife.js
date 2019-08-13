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

const cellSizes = [20, 10, 5, 3, 2, 1];
const bitMapWs = [40, 80, 160, 266, 400, 800];
const bitMapHs = [30, 60, 120, 200, 300, 600];

const map = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

class GameOfLife {
  constructor() {
    this.canvas = document.getElementById("main_canvas");
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.context = this.canvas.getContext("2d");
    this.context.fillStyle = "gray";
    this.context.strokeStyle = "black";

    const mapSizeRange = document.getElementById("map-size");
    mapSizeRange.oninput = () => {
      this.resize(mapSizeRange.valueAsNumber);
      this.setMap(map);
    }

    this.cellSize = cellSizes[mapSizeRange.valueAsNumber];
    this.data = new Bitmap(bitMapWs[mapSizeRange.valueAsNumber], bitMapHs[mapSizeRange.valueAsNumber]);
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

    const brushSizeRange = document.getElementById("brush-size");
    const drawPen = (x, y) => {
      const r = brushSizeRange.valueAsNumber >>> 1;
      for (let i = -r; i <= r; i++) {
        for (let j = -r; j <= r; j++) {
          this.data.setData(x + i, y + j, penColor);
        }
      }
    }

    this.canvas.onmousedown = (e) => {
      const x = Math.floor(e.offsetX / this.cellSize);
      const y = Math.floor(e.offsetY / this.cellSize);
      drawPen(x, y);
    }

    this.canvas.onmousemove = (e) => {
      if (e.buttons !== 1) {
        return;
      }
      const x = Math.floor(e.offsetX / this.cellSize);
      const y = Math.floor(e.offsetY / this.cellSize);
      drawPen(x, y);
    }

    // this.canvas.ontouchstart = (e) => {
    //   e.preventDefault();
    // }

    this.canvas.ontouchmove = (e) => {
      for (let i = 0; i < e.targetTouches.length; i++) {
        const touch = e.targetTouches[i];
        let x = touch.clientX - this.canvas.offsetLeft;
        let y = touch.clientY - this.canvas.offsetTop;
        x = Math.floor(x / this.cellSize);
        y = Math.floor(y / this.cellSize);
        drawPen(x, y);
      }
      e.preventDefault();
    }

    // const undoBtn = document.createElement("button");
    // undoBtn.innerHTML = `撤销,最多7步`;
    // undoBtn.onclick = () => {
    //   if (this.history.length > 1) {
    //     this.data = this.history.pop();
    //   }
    //   undoBtn.innerHTML = `撤销,最多${this.history.length-1}步`;
    // }
    // document.getElementById("buttons").appendChild(undoBtn);

    const debugBtn = document.createElement("button");
    debugBtn.innerHTML = "单步调试";
    debugBtn.onclick = () => {
      if (!this.pause) {
        return;
      }
      this.pause = false;
      this.update();
      this.pause = true;
      this.draw();
      //undoBtn.innerHTML = `撤销,最多${this.history.length-1}步`;
    }
    document.getElementById("buttons").appendChild(debugBtn);

    const pauseBtn = document.createElement("button");
    pauseBtn.innerHTML = "点击，以开始";
    pauseBtn.onclick = () => {
      this.pause = !this.pause;
      if (this.pause) {
        pauseBtn.innerHTML = "点击，以开始";
      } else {
        pauseBtn.innerHTML = "暂停，以绘制地图";
      }
    }
    document.getElementById("buttons").appendChild(pauseBtn);

    const pencilOrRubber = ["橡皮", "铅笔"];
    const penBtn = document.getElementById("pen");
    penBtn.value = pencilOrRubber[penColor];
    penBtn.onclick = () => {
      penColor = penColor ? 0 : 1;
      penBtn.value = pencilOrRubber[penColor];
    }

    const randomBtn = document.createElement("button");
    randomBtn.innerHTML = "随机汤";
    randomBtn.onclick = () => {
      for (let i = 0; i < this.data.w; i++) {
        for (let j = 0; j < this.data.h; j++) {
          let value = Math.random() > 0.33 ? 0 : 1;
          this.data.setData(i, j, value);
        }
      }
      this.dataOld = this.data.copy();
      this.history.length = 0;
    }
    document.getElementById("buttons").appendChild(randomBtn);
    const restartBtn = document.createElement("button");
    restartBtn.innerHTML = "重开";
    restartBtn.onclick = () => {
      window.location.reload();
    }
    document.getElementById("buttons").appendChild(restartBtn);

    const clearBtn = document.createElement("button");
    clearBtn.innerHTML = "清屏";
    clearBtn.onclick = () => {
      this.data.clear();
      this.dataOld.clear();
      this.history.length = 0;
    }
    document.getElementById("buttons").appendChild(clearBtn);

    const aboutBtn = document.createElement("button");
    aboutBtn.innerHTML = "什么是生命游戏？";
    aboutBtn.onclick = () => {
      window.open("https://baike.baidu.com/item/生命游戏");
    }
    document.getElementById("buttons").appendChild(aboutBtn);

    const speedRange = document.getElementById("speed");
    speedRange.oninput = () => {
      this.speed = 200 - speedRange.valueAsNumber;
    }
    this.speed = 200 - speedRange.valueAsNumber;

    this.bHeatDeath = document.getElementById("heat-death");

    this.canvas.style.cursor = "pointer";
    penBtn.style.cursor = "pointer";
    randomBtn.style.cursor = "pointer";
    clearBtn.style.cursor = "pointer";
    aboutBtn.style.cursor = "help";
    restartBtn.style.cursor = "pointer";
    pauseBtn.style.cursor = "pointer";
  }

  resize(n) {
    this.cellSize = cellSizes[n];
    this.data = new Bitmap(bitMapWs[n], bitMapHs[n]);
    this.dataOld = this.data.copy();
    this.history.length = 0;
    this.history.push(this.dataOld);
    this.pause = true;
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
      this.history.shift();
    }
  }

  drawCell(x, y, color = "gray") {
    this.context.fillStyle = color;
    this.context.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
    if (this.cellSize < 4) {
      return;
    }
    if (this.cellSize < 9) {
      this.context.fillStyle = "darkgray";
    } else {
      this.context.fillStyle = "black";
    }
    this.context.strokeRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
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

  update() {
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
        this.update();
        lag -= this.speed;
      }
      this.draw();
      requestAnimationFrame(gameloop);
    };

    gameloop();
  }
}