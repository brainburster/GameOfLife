class GameOfLife {
  constructor() {
    this.canvas = document.getElementById("main_canvas");
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.context = this.canvas.getContext("2d");
    this.context.fillStyle = "gray";
    this.context.strokeStyle = "black";
    this.data = [];
    this.dataOld = [];
    for (let i = 0; i < 80; i++) {
      this.data[i] = [];
      this.dataOld[i] = [];
      for (let j = 0; j < 60; j++) {
        this.data[i][j] = 0;
        this.dataOld[i][j] = 0;
      }
    }
    this.pause = true;
    //定义枚举
    this.direction = {
      DIRECTION_ALL: 0,
      DIRECTION_lEFT: 1,
      DIRECTION_RIGHT: 2,
      DIRECTION_UP: 3,
      DIRECTION_DWON: 4,
      DIRECTION_LEFT_UP: 5,
      DIRECTION_lEFT_DWON: 6,
      DIRECTION_RIGHT_UP: 7,
      DIRECTION_RIGHT_DWON: 8
    }

    this.canvas.onmousemove = (e) => {
      if (e.buttons !== 1) {
        return;
      }
      console.log(e);
      let x = Math.floor(e.offsetX / 10);
      let y = Math.floor(e.offsetY / 10);
      this.data[x][y] = 1;
    }
    //鼠标点击事件
    this.canvas.onmouseup = (e) => {
      let x = Math.floor(e.offsetX / 10);
      let y = Math.floor(e.offsetY / 10);
      if (this.data[x][y]) {
        this.data[x][y] = 0;
      } else {
        this.data[x][y] = 1;
      }
    }

    this.pause_btn = document.createElement("button");
    this.pause_btn.innerHTML = "点击，以开始";
    this.pause_btn.onclick = () => {
      this.pause = !this.pause;
      if (this.pause) {
        this.pause_btn.innerHTML = "点击，以开始";
      } else {
        this.pause_btn.innerHTML = "暂停，以绘制地图";
      }
    }
    document.getElementById("buttons").appendChild(this.pause_btn);
    this.random_btn = document.createElement("button");
    this.random_btn.innerHTML = "随机汤";
    this.random_btn.onclick = () => {
      this.data = [];
      this.dataOld = [];
      for (let i = 0; i < 80; i++) {
        this.data[i] = [];
        this.dataOld[i] = [];
        for (let j = 0; j < 60; j++) {
          let value = Math.random() > 0.3 ? 0 : 1;
          this.data[i][j] = value;
          this.dataOld[i][j] = value;
        }
      }
    }
    document.getElementById("buttons").appendChild(this.random_btn);
    this.restart_btn = document.createElement("button");
    this.restart_btn.innerHTML = "重开";
    this.restart_btn.onclick = () => {
      window.location.reload();
    }
    document.getElementById("buttons").appendChild(this.restart_btn);

    this.clear_btn = document.createElement("button");
    this.clear_btn.innerHTML = "清屏";
    this.clear_btn.onclick = () => {
      for (let i = 0; i < 80; i++) {
        for (let j = 0; j < 60; j++) {
          this.data[i][j] = 0;
        }
      }
    }
    document.getElementById("buttons").appendChild(this.clear_btn);

    this.about_btn = document.createElement("button");
    this.about_btn.innerHTML = "什么是生命游戏？";
    this.about_btn.onclick = () => {
      window.open("https://baike.baidu.com/item/生命游戏");
    }
    document.getElementById("buttons").appendChild(this.about_btn);

    this.speedRange = document.getElementById("speed");
    this.speedRange.oninput = () => {
      this.speed = 200 - Number(this.speedRange.value);
    }
    this.speed = 200 - Number(this.speedRange.value);

    this.canvas.style.cursor = "pointer";
    this.random_btn.style.cursor = "pointer";
    this.clear_btn.style.cursor = "pointer";
    this.about_btn.style.cursor = "help";
    this.restart_btn.style.cursor = "pointer";
    this.pause_btn.style.cursor = "pointer";
  }

  setMap(map) {
    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[i].length; j++) {
        this.data[i][j] = map[i][j];
      }
    }
  }

  saveData() {
    for (let i = 0; i < this.data.length; i++) {
      for (let j = 0; j < this.data[i].length; j++) {
        this.dataOld[i][j] = this.data[i][j];
      }
    }
  }

  drawCell(x, y, height) {
    x = x || 0;
    y = y || 0;
    height = height || 10;
    this.context.fillRect(x * 10, y * 10, height, height);
    this.context.strokeRect(x * 10, y * 10, height, height);
  }

  findNeighbor(x, y, direction) {
    switch (direction) {
      case this.direction.DIRECTION_lEFT: {
        if (this.dataOld[x - 1] == undefined) {
          return 0;
        }
        return this.dataOld[x - 1][y] || 0;
      }
      break;
    case this.direction.DIRECTION_RIGHT: {
      if (this.dataOld[x + 1] == undefined) {
        return 0;
      }
      return this.dataOld[x + 1][y] || 0;
    }
    break;
    case this.direction.DIRECTION_UP: {
      return this.dataOld[x][y - 1] || 0;
    }
    break;
    case this.direction.DIRECTION_DWON: {
      return this.dataOld[x][y + 1] || 0;
    }
    break;
    case this.direction.DIRECTION_LEFT_UP: {
      if (this.dataOld[x - 1] == undefined) {
        return 0;
      }
      return this.dataOld[x - 1][y - 1] || 0;
    }
    break;
    case this.direction.DIRECTION_lEFT_DWON: {
      if (this.dataOld[x - 1] == undefined) {
        return 0;
      }
      return this.dataOld[x - 1][y + 1] || 0;
    }
    break;
    case this.direction.DIRECTION_RIGHT_UP: {
      if (this.dataOld[x + 1] == undefined) {
        return 0;
      }
      return this.dataOld[x + 1][y - 1] || 0;
    }
    break;
    case this.direction.DIRECTION_RIGHT_DWON: {
      if (this.dataOld[x + 1] == undefined) {
        return 0;
      }
      return this.dataOld[x + 1][y + 1] || 0;
    }
    break;
    default: {
      let sum = 0;
      for (let i = 1; i < 9; i++) {
        sum += this.findNeighbor(x, y, i);
      }
      return sum;
    }
    }
  }

  logic() {
    if (this.pause) {
      return;
    }

    this.saveData(); //dataOld = data
    for (let i = 0; i < this.data.length; i++) {
      for (let j = 0; j < this.data[i].length; j++) {
        let temp = this.findNeighbor(i, j);
        if (temp == 3) {
          this.data[i][j] = 1;
        } else if (temp != 2) {
          this.data[i][j] = 0;
        } else {
          //不变
        }
      }
    }
  }

  draw() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = 0; i < this.data.length; i++) {
      for (let j = 0; j < this.data[i].length; j++) {
        if (this.data[i][j] != 0) {
          this.drawCell(i, j);
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