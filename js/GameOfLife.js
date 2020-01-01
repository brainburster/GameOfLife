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
const colors = ["#666", "#777", "#877", "#977", "#A66", "#B66", "#C77", "#D77", "#E88", "#F88"];
colors.reverse();
//不同设置对应的地图大小
const cellSizes = [20, 10, 5, 3, 2, 1];
const bitMapWs = [40, 80, 160, 266, 400, 800];
const bitMapHs = [30, 60, 120, 200, 300, 600];
//滑翔者枪
const gliderGun = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
];
const defaultMap = gliderGun;
const tools = (function () {
  const _tools = {};
  //滑翔者
  const glider = [
    [0, 0, 1],
    [1, 0, 1],
    [0, 1, 1]
  ];
  //太空船
  const spaceShip = [
    [1, 0, 0, 1, 0],
    [0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 1]
  ];
  //顺时针旋转90°，r次
  const rotate90 = (obj, r) => {
    if (r < 1) {
      return obj;
    }
    //todo：添加缓存
    const shape = [obj[0].length, obj.length];
    const neuObj = new Array(shape[0]);
    for (let i = 0; i < shape[0]; i++) {
      neuObj[i] = new Array(shape[1]);
      for (let j = 0; j < shape[1]; j++) {
        neuObj[i][shape[1] - 1 - j] = obj[j][i];
      }
    }
    return rotate90(neuObj, r - 1);
  };
  //填充数据
  const fill = (x, y, r, setData) => {
    for (let i = -r; i <= r; i++) {
      for (let j = -r; j <= r; j++) {
        setData(x + i, y + j);
      }
    }
  }
  //粘贴图案
  const pasteData = (x, y, w, h, setData) => {
    for (let j = 0; j < w; j++) {
      for (let i = 0; i < h; i++) {
        setData(x + i, y + j, i, j);
      }
    }
  }
  //注册onmousedown函数
  addOnMouseDown = (toolName, onMouseDown) => {
    _tools[toolName] = _tools[toolName] || {};
    _tools[toolName].onmousedown = onMouseDown;
  }
  addOnClick = (toolName, onMouseDown) => {
    _tools[toolName] = _tools[toolName] || {};
    _tools[toolName].onclick = onMouseDown;
  }
  //添加预制件
  const addPastePrefab = (toolName, prefab) => {
    addOnClick(toolName, (game, x, y, r) => {
      const obj = rotate90(prefab, r)
      pasteData(x, y, obj[0].length, obj.length, (x, y, i, j) => {
        game.data.setData(x, y, obj[i][j]);
      });
    });
  }
  //铅笔和橡皮
  addOnMouseDown("铅笔", (game, x, y, r) => {
    fill(x, y, r, (x, y) => {
      game.data.setData(x, y, 1);
    });
  });
  addOnMouseDown("橡皮(右键)", (game, x, y, r) => {
    fill(x, y, r, (x, y) => {
      game.data.setData(x, y, 0);
    });
  });
  //添加预制件
  addPastePrefab("滑翔者", glider);
  addPastePrefab("太空船", spaceShip);

  return _tools;
})();

// {
//   "飞行器": {
//     maps: [
//       [
//         [0, 0, 1],
//         [1, 0, 1],
//         [0, 1, 1],
//       ],
//       [
//         [0, 1, 0],
//         [1, 0, 0],
//         [1, 1, 1],
//       ],
//       [
//         [1, 1, 0],
//         [1, 0, 1],
//         [1, 0, 0],
//       ],
//       [
//         [1, 1, 1],
//         [0, 0, 1],
//         [0, 1, 0],
//       ],
//       [
//         [1, 0, 0, 1, 0],
//         [0, 0, 0, 0, 1],
//         [1, 0, 0, 0, 1],
//         [0, 1, 1, 1, 1]
//       ]
//     ],
//     onclick: (game, x, y, r) => {
//       const map = tools["飞行器"].maps[r];
//       for (let j = 0; j < map.length; j++) {
//         for (let i = 0; i < map[j].length; i++) {
//           game.data.setData(x + i - (map[j].length >>> 1), y + j - (map.length >>> 1), map[j][i]);
//         }
//       }
//     }
//   },
//   "振荡器": {
//     maps: [
//       [
//         [0, 0, 0],
//         [1, 1, 1],
//         [0, 0, 0],
//       ],
//       [
//         [0, 0, 1, 1],
//         [0, 0, 0, 1],
//         [1, 0, 0, 0],
//         [1, 1, 0, 0],
//       ],
//       [
//         [0, 0, 0, 0],
//         [0, 1, 1, 1],
//         [1, 1, 1, 0],
//         [0, 0, 0, 0],
//       ],
//       [
//         [1, 1, 1, 1, 1, 1, 1, 1, ],
//         [1, 0, 1, 1, 1, 1, 0, 1, ],
//         [1, 1, 1, 1, 1, 1, 1, 1, ]
//       ],
//       [
//         [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
//         [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
//         [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
//         [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
//         [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
//         [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
//         [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
//         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
//       ]
//     ],
//     onclick: (game, x, y, r) => {
//       const map = tools["振荡器"].maps[r];
//       for (let j = 0; j < map.length; j++) {
//         for (let i = 0; i < map[j].length; i++) {
//           game.data.setData(x + i - (map[j].length >>> 1), y + j - (map.length >>> 1), map[j][i]);
//         }
//       }
//     }
//   },
//   "滑翔者枪": {
//     onclick: (game, x, y, r) => {
//       const map = defaultMap;
//       for (let j = 0; j < map.length; j++) {
//         for (let i = 0; i < map[j].length; i++) {
//           game.data.setData(x + i - (map[j].length >>> 1), y + j - (map.length >>> 1), map[j][i]);
//         }
//       }
//     }
//   }
// }

class GameOfLife {
  constructor() {
    this.canvas = document.getElementById("main_canvas");
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.context = this.canvas.getContext("2d");
    this.context.fillStyle = "gray";
    this.context.strokeStyle = "black";

    const mapSizeRange = document.getElementById("map-size");

    this.cellSize = cellSizes[mapSizeRange.valueAsNumber];
    this.data = new Bitmap(bitMapWs[mapSizeRange.valueAsNumber], bitMapHs[mapSizeRange.valueAsNumber]);
    this.dataOld = this.data.copy();
    this.history = [];
    this.history.push(this.dataOld);
    this.pause = true;
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

    const selectTool = document.getElementById("tool");
    selectTool.oninput = () => {

    }

    const brushSizeRange = document.getElementById("brush-size");

    this.canvas.onwheel = (e) => {
      let size = brushSizeRange.valueAsNumber;
      size += e.deltaY / 50;
      brushSizeRange.value = Math.min(10, size, Math.max(2, size));
    }

    this.canvas.oncontextmenu = (e) => {
      e.preventDefault();
    }

    // this.canvas.onclick = (e) => {
    //   const x = Math.floor(e.offsetX / this.cellSize);
    //   const y = Math.floor(e.offsetY / this.cellSize);
    //   tools[selectTool.value].onclick && tools[selectTool.value].onclick(this, x, y, brushSizeRange.valueAsNumber >>> 1);
    // }

    this.canvas.onmousedown = (e) => {
      const x = Math.floor(e.offsetX / this.cellSize);
      const y = Math.floor(e.offsetY / this.cellSize);
      switch (e.buttons) {
        case 2:
          tools["橡皮(右键)"].onmousedown(this, x, y, brushSizeRange.valueAsNumber >>> 1);
          break;
        case 1:
          tools[selectTool.value].onmousedown && tools[selectTool.value].onmousedown(this, x, y, brushSizeRange.valueAsNumber >>> 1);
          tools[selectTool.value].onclick && tools[selectTool.value].onclick(this, x, y, brushSizeRange.valueAsNumber >>> 1);
          break;
        default:
          break;
      }
    }

    this.canvas.onmousemove = (e) => {
      const x = Math.floor(e.offsetX / this.cellSize);
      const y = Math.floor(e.offsetY / this.cellSize);
      switch (e.buttons) {
        case 2:
          tools["橡皮(右键)"].onmousedown(this, x, y, brushSizeRange.valueAsNumber >>> 1);
          break;
        case 1:
          tools[selectTool.value].onmousedown && tools[selectTool.value].onmousedown(this, x, y, brushSizeRange.valueAsNumber >>> 1);
          break;
        default:
          break;
      }
    }

    this.canvas.ontouchmove = (e) => {
      for (let i = 0; i < e.targetTouches.length; i++) {
        const touch = e.targetTouches[i];
        let x = touch.clientX - this.canvas.offsetLeft;
        let y = touch.clientY - this.canvas.offsetTop;
        x = Math.floor(x / this.cellSize);
        y = Math.floor(y / this.cellSize);
        tools[selectTool.value].onmousedown && tools[selectTool.value].onmousedown(this, x, y, brushSizeRange.valueAsNumber >>> 1);
      }
      e.preventDefault();
    }

    const undoBtn = document.createElement("button");
    undoBtn.innerHTML = `撤销(z)`;
    undoBtn.onclick = () => {
      if (!this.pause) {
        this.pause = true;
      }
      if (this.history.length > 7) {
        this.data = this.history.pop();
      }
    }

    document.getElementById("buttons").appendChild(undoBtn);

    const pauseBtn = document.getElementById("pause");
    pauseBtn.innerHTML = "点击，以开始";
    pauseBtn.onclick = () => {
      this.pause = !this.pause;
      if (this.pause) {
        pauseBtn.innerHTML = "点击，以开始";
      } else {
        pauseBtn.innerHTML = "暂停，以绘制地图";
      }
    }


    const debugBtn = document.createElement("button");
    debugBtn.innerHTML = "单步调试(x)";
    debugBtn.onclick = () => {
      this.pause = false;
      this.update();
      this.pause = true;
      this.draw();
      if (this.pause) {
        pauseBtn.innerHTML = "点击，以开始";
      } else {
        pauseBtn.innerHTML = "暂停，以绘制地图";
      }
    }
    document.getElementById("buttons").appendChild(debugBtn);

    mapSizeRange.oninput = () => {
      this.resize(mapSizeRange.valueAsNumber);
      this.setMap(defaultMap);
      pauseBtn.innerHTML = "点击，以开始";
    }

    const randomBtn = document.createElement("button");
    randomBtn.innerHTML = "随机汤(r)";
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
    clearBtn.innerHTML = "清屏(c)";
    clearBtn.onclick = () => {
      this.data.clear();
      this.dataOld.clear();
      this.history.length = 0;
    }
    document.getElementById("buttons").appendChild(clearBtn);

    const GPUBtn = document.createElement("button");
    GPUBtn.innerHTML = "GPU版本..";
    GPUBtn.onclick = () => {
      window.location.href = "./gameOfLifeGpu.html";
    }
    document.getElementById("buttons").appendChild(GPUBtn);

    const speedRange = document.getElementById("speed");
    speedRange.oninput = () => {
      this.speed = 200 - speedRange.valueAsNumber;
    }
    this.speed = 200 - speedRange.valueAsNumber;

    this.bHeatDeath = true;
    const checkboxHD = document.getElementById("heat-death")
    checkboxHD.oninput = () => {
      this.bHeatDeath = checkboxHD.checked;
    };

    window.onkeydown = (e) => {
      switch (e.key) {
        case "z":
          undoBtn.onclick();
          break;
        case "x":
          debugBtn.onclick();
          break;
        case "r":
          randomBtn.onclick();
          break;
        case "c":
          clearBtn.onclick();
          break;
        case "s":
          pauseBtn.onclick();
          break;
        case "g":
          GPUBtn.onclick();
          break;
        case "h":
          checkboxHD.checked = !checkboxHD.checked;
          checkboxHD.oninput();
          break;
        case "t":
          if (selectTool.selectedIndex < 4) {
            selectTool.selectedIndex += 1;
          } else {
            selectTool.selectedIndex = 0;
          }
          break;
        default:
          break;
      }
    }

    this.textB = document.getElementById("b");
    this.textS = document.getElementById("s");

    this.b = [3];
    this.s = [2, 3];

    this.textB.onchange = () => {
      let reg = /^[0-9]*$/;
      if (!reg.test(this.textB.value)) {
        this.textB.value = this.b.join("");
        return;
      }
      // reg = /(.)\1+/ig;
      // this.textB.value = this.textB.value.replace(reg, "$1");
      this.b.length = 0;
      const array = this.textB.value.split("");
      for (let i = 0; i < array.length; i++) {
        const ch = array[i];
        if (this.b.indexOf(ch) < 0) {
          this.b.push(ch);
        }
      }
      this.b.sort();
      this.textB.value = this.b.join("");
    }

    this.textS.onchange = () => {
      const reg = /^[0-9]*$/;
      if (!reg.test(this.textS.value)) {
        this.textS.value = this.s.join("");
        return;
      }
      this.s.length = 0;
      const array = this.textS.value.split("");
      for (let i = 0; i < array.length; i++) {
        const ch = array[i];
        if (this.s.indexOf(ch) < 0) {
          this.s.push(ch);
        }
      }
      this.s.sort();
      this.textS.value = this.s.join("");
    }

    this.canvas.style.cursor = "pointer";
    debugBtn.style.cursor = "pointer";
    randomBtn.style.cursor = "pointer";
    clearBtn.style.cursor = "pointer";
    GPUBtn.style.cursor = "pointer";
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
    this.history.push(this.data.copy());
    this.history.push(this.data.copy());
    this.history.push(this.data.copy());
    this.history.push(this.data.copy());
    this.history.push(this.data.copy());
    this.history.push(this.data.copy());
    this.history.push(this.data.copy());
  }

  saveData() {
    this.dataOld = this.data.copy();
    this.history.push(this.dataOld);
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
        let adj = this.getCountAdjacency(i, j);
        if (this.b.some(ch => ch == adj)) { //b3
          //出生
          this.data.setData(i, j, 1);
        } else if (this.s.some(ch => ch == adj)) { //s23
          //不变
        } else {
          //死亡
          this.data.setData(i, j, 0);
        }
      }
    }
  }

  draw() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = 0; i < this.data.w; i++) {
      for (let j = 0; j < this.data.h; j++) {
        if (this.data.getData(i, j)) {
          if (this.bHeatDeath) {
            //const count = this.history.reduceRight((a, b) => a + b.getData(i, j), 0);
            let count = 0;
            for (let k = 1; k < 8; k++) {
              const h = this.history[this.history.length - k];
              if (!h) {
                break;
              }
              count += h.getData(i, j);
            }
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
      if (lag < 500) {
        while (lag >= this.speed) {
          this.update();
          lag -= this.speed;
        }
        this.draw();
      } else {
        lag = 0;
      }

      requestAnimationFrame(gameloop);
    };

    gameloop();
  }
}