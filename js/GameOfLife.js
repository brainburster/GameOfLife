class GameOfLife {
  constructor() {
    this.time = 0;
    this.canvas = document.getElementById("main_canvas");
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.context = this.canvas.getContext("2d");
    this.context.fillStyle = "gray";
    this.context.strokeStyle = "black";
    this.model = [];
    this.model_old = [];
    for (let index = 0; index < 80; index++) {
      this.model[index] = [];
      this.model_old[index] = [];
      for (let i = 0; i < 60; i++) {
        this.model[index][i] = 0;
        this.model_old[index][i] = 0;
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
    //鼠标点击事件
    this.canvas.onclick = (e) => {
      let x = Math.floor(e.offsetX / 10);
      let y = Math.floor(e.offsetY / 10);
      if (this.model[x][y]) {
        this.model[x][y] = 0;
      } else {
        this.model[x][y] = 1;
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
    this.restart_btn = document.createElement("button");
    this.restart_btn.innerHTML = "重开";
    this.restart_btn.onclick = () => {
      window.location.href = window.location.href;
    }
    document.getElementById("buttons").appendChild(this.restart_btn);
    this.about_btn = document.createElement("button");
    this.about_btn.innerHTML = "什么是生命游戏？";
    this.about_btn.onclick = () => {
      window.open("https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life");
    }
    document.getElementById("buttons").appendChild(this.about_btn);

    this.canvas.style.cursor = "pointer";
    this.about_btn.style.cursor = "help";
    this.restart_btn.style.cursor = "pointer";
    this.pause_btn.style.cursor = "pointer";
  }

  setMap(map) {
    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[i].length; j++) {
        this.model[j][i] = map[i][j];
      }
    }
  }

  saveModel() {
    for (let i = 0; i < this.model.length; i++) {
      for (let j = 0; j < this.model[i].length; j++) {
        this.model_old[i][j] = this.model[i][j];
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
      case this.direction.DIRECTION_lEFT:
        {
          if (this.model_old[x - 1] == undefined) {
            return 0;
          }
          return this.model_old[x - 1][y] || 0;
        }
        break;
      case this.direction.DIRECTION_RIGHT:
        {
          if (this.model_old[x + 1] == undefined) {
            return 0;
          }
          return this.model_old[x + 1][y] || 0;
        }
        break;
      case this.direction.DIRECTION_UP:
        {
          return this.model_old[x][y - 1] || 0;
        }
        break;
      case this.direction.DIRECTION_DWON:
        {
          return this.model_old[x][y + 1] || 0;
        }
        break;
      case this.direction.DIRECTION_LEFT_UP:
        {
          if (this.model_old[x - 1] == undefined) {
            return 0;
          }
          return this.model_old[x - 1][y - 1] || 0;
        }
        break;
      case this.direction.DIRECTION_lEFT_DWON:
        {
          if (this.model_old[x - 1] == undefined) {
            return 0;
          }
          return this.model_old[x - 1][y + 1] || 0;
        }
        break;
      case this.direction.DIRECTION_RIGHT_UP:
        {
          if (this.model_old[x + 1] == undefined) {
            return 0;
          }
          return this.model_old[x + 1][y - 1] || 0;
        }
        break;
      case this.direction.DIRECTION_RIGHT_DWON:
        {
          if (this.model_old[x + 1] == undefined) {
            return 0;
          }
          return this.model_old[x + 1][y + 1] || 0;
        }
        break;
      default:
        {
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
    if (this.time++ % 5 != 1) {
      return;
    }
    this.saveModel(); //model_old = model
    for (let i = 0; i < this.model.length; i++) {
      for (let j = 0; j < this.model[i].length; j++) {
        let temp = this.findNeighbor(i, j);
        if (temp == 3) {
          this.model[i][j] = 1;
        } else if (temp != 2) {
          this.model[i][j] = 0;
        } else {
          //不变
        }
      }
    }
  }

  draw() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = 0; i < this.model.length; i++) {
      for (let j = 0; j < this.model[i].length; j++) {
        if (this.model[i][j] != 0) {
          this.drawCell(i, j);
        }
      }
    }
  }

  run() {
    //每帧调用
    setInterval(() => {
      //logic
      this.logic();
      //draw
      this.draw();
    }, 1000 / 30);
  }
}