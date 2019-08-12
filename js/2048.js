var game2048 = function () {
  let o = {};
  //带种子的随机数
  Math.seed = 5;
  Math.seededRandom = function (min, max) {
    max = max || 1;
    min = min || 0;
    Math.seed = (Math.seed * 9301 + 49297) % 233280;
    var rnd = Math.seed / 233280.0;
    return min + rnd * (max - min);
  };
  o.random_offset = (new Date()).getTime();
  o.canvas = document.getElementById("main_canvas");
  o.canvas.width = 400;
  o.canvas.height = 400;
  o.context = o.canvas.getContext("2d");
  o.context.fillStyle = "gray";
  o.context.strokeStyle = "black";

  //对象的属性+闭包，可能写的有点乱
  let offset_x;
  let offset_y;
  let b_mouse_down = false;
  o.canvas.onmousedown = function (e) {
    offset_x = e.offsetX;
    offset_y = e.offsetY;
    b_mouse_down = true;
  }
  o.canvas.onmouseup = function (e) {
    offset_x = e.offsetX - offset_x;
    offset_y = e.offsetY - offset_y;
    b_mouse_down = false;
    if (Math.abs(offset_x) < 50 && Math.abs(offset_y) < 50) {
      return;
    } else if (Math.abs(offset_x) > Math.abs(offset_y)) {
      if (offset_x > 0) {
        //右
        o.onTouchRight();
      } else {
        //左
        o.onTouchLeft();
      }
    } else {
      if (offset_y > 0) {
        //下
        o.onTouchDown();
      } else {
        //上
        o.onTouchUp();
      }
    }
  }
  o.canvas.onmouseout = function (e) {
    if (b_mouse_down) {
      o.canvas.onmouseup(e);
    }
    b_mouse_down = false;
  }
  window.onkeydown = function (e) {
    switch (e.keyCode) {
      case 37:
        o.onTouchLeft();
        break;
      case 38:
        o.onTouchUp();
        break;
      case 39:
        o.onTouchRight();
        break;
      case 40:
        o.onTouchDown();
        break;
      default:

    }
  }
  o.game_map = [
    [0, 0, 0, 0],
    [0, 0, 2, 0],
    [0, 2, 0, 0],
    [0, 0, 0, 0]
  ];
  //作用是判断输入是否有效
  o.old_map = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];
  //记录所有的地图，注意数组和对象是浅拷贝
  o.map_record = [
    [
      [0, 0, 0, 0],
      [0, 0, 2, 0],
      [0, 2, 0, 0],
      [0, 0, 0, 0]
    ]
  ];
  o.current_record_index = 0;
  o.score = 0;
  o.game_over = false;
  //判断游戏结束的第二个条件，是否存在相邻相同的元素。第一个条件是是否有空位
  o.b_has_neighbor_equal = function (i, j) {
    for (let j = 0; j < 4; j++) {
      for (let i = 0; i < 4; i++) {
        let t = o.game_map[i][j];
        if (o.game_map[i - 1] != undefined)
          if (t == o.game_map[i - 1][j])
            return true;
        if (o.game_map[i + 1] != undefined)
          if (t == o.game_map[i + 1][j])
            return true;
        if (t == o.game_map[i][j + 1])
          return true;
        if (t == o.game_map[i][j - 1])
          return true;
      }
    }
    return false;
  }
  o.drawMap = function () {
    o.game_over = true;
    o.score = 0;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        let t = o.game_map[x][y];
        //分数为地图上所有数的和
        o.score += t;
        switch (t) {
          case 0:
            o.context.fillStyle = "#AAAAAA";
            o.context.fillRect(x * 100, y * 100, 100, 100);
            o.context.strokeRect(x * 100, y * 100, 100, 100);
            o.game_over = false;
            break;
          case 2:
            o.context.fillStyle = "#FFFF99";
            o.context.font = "60px Georgia";
            o.context.fillRect(x * 100, y * 100, 100, 100);
            o.context.strokeRect(x * 100, y * 100, 100, 100);
            o.context.fillStyle = "black";
            o.context.fillText(t.toString(), x * 100 + 36, y * 100 + 63);
            break;
          case 4:
            o.context.fillStyle = "#FFCC99";
            o.context.font = "50px Georgia";
            o.context.fillRect(x * 100, y * 100, 100, 100);
            o.context.strokeRect(x * 100, y * 100, 100, 100);
            o.context.fillStyle = "black";
            o.context.fillText(t.toString(), x * 100 + 36, y * 100 + 63);
            break;
          case 8:
            o.context.fillStyle = "#FF9999";
            o.context.font = "50px Georgia";
            o.context.fillRect(x * 100, y * 100, 100, 100);
            o.context.strokeRect(x * 100, y * 100, 100, 100);
            o.context.fillStyle = "black";
            o.context.fillText(t.toString(), x * 100 + 36, y * 100 + 63);
            break;
          case 16:
            o.context.fillStyle = "#FF9966";
            o.context.font = "40px Georgia";
            o.context.fillRect(x * 100, y * 100, 100, 100);
            o.context.strokeRect(x * 100, y * 100, 100, 100);
            o.context.fillStyle = "black";
            o.context.fillText(t.toString(), x * 100 + 30, y * 100 + 60);
            break;
          case 32:
            o.context.fillStyle = "#FF9900";
            o.context.font = "40px Georgia";
            o.context.fillRect(x * 100, y * 100, 100, 100);
            o.context.strokeRect(x * 100, y * 100, 100, 100);
            o.context.fillStyle = "black";
            o.context.fillText(t.toString(), x * 100 + 30, y * 100 + 60);
            break;
          case 64:
            o.context.fillStyle = "#CCFF66";
            o.context.font = "40px Georgia";
            o.context.fillRect(x * 100, y * 100, 100, 100);
            o.context.strokeRect(x * 100, y * 100, 100, 100);
            o.context.fillStyle = "black";
            o.context.fillText(t.toString(), x * 100 + 30, y * 100 + 60);
            break;
          case 128:
            o.context.fillStyle = "#CCCC33";
            o.context.font = "35px Georgia";
            o.context.fillRect(x * 100, y * 100, 100, 100);
            o.context.strokeRect(x * 100, y * 100, 100, 100);
            o.context.fillStyle = "black";
            o.context.fillText(t.toString(), x * 100 + 24, y * 100 + 60);
            break;
          case 256:
            o.context.fillStyle = "#CC6666";
            o.context.font = "35px Georgia";
            o.context.fillRect(x * 100, y * 100, 100, 100);
            o.context.strokeRect(x * 100, y * 100, 100, 100);
            o.context.fillStyle = "black";
            o.context.fillText(t.toString(), x * 100 + 24, y * 100 + 60);
            break;
          case 512:
            o.context.fillStyle = "#CC0099";
            o.context.font = "35px Georgia";
            o.context.fillRect(x * 100, y * 100, 100, 100);
            o.context.strokeRect(x * 100, y * 100, 100, 100);
            o.context.fillStyle = "black";
            o.context.fillText(t.toString(), x * 100 + 24, y * 100 + 60);
            break;
          case 1024:
            o.context.fillStyle = "#CC6600";
            o.context.font = "30px Georgia";
            o.context.fillRect(x * 100, y * 100, 100, 100);
            o.context.strokeRect(x * 100, y * 100, 100, 100);
            o.context.fillStyle = "black";
            o.context.fillText(t.toString(), x * 100 + 20, y * 100 + 60);
            break;
          default:
            o.context.fillStyle = "#CC0000";
            o.context.font = "30px Georgia";
            o.context.fillRect(x * 100, y * 100, 100, 100);
            o.context.strokeRect(x * 100, y * 100, 100, 100);
            o.context.fillStyle = "black";
            o.context.fillText(t.toString(), x * 100 + 20, y * 100 + 60);
            break;
        }
      }
    }
    o.game_over = o.game_over && !o.b_has_neighbor_equal();
  }
  o.updateButton = function () {
    if (o.current_record_index <= 0) {
      document.getElementById("id_back").disabled = true;
    } else {
      document.getElementById("id_back").disabled = false;
    }
    if (o.current_record_index >= o.map_record.length - 1) {
      document.getElementById("id_next").disabled = true;
    } else {
      document.getElementById("id_next").disabled = false;
    }
  }
  o.onTouchUp = function () {
    for (let k = 0; k < 4; k++) {
      for (let j = 1; j < 4; j++) { //不考虑第一行
        for (let i = 0; i < 4; i++) {
          if (o.game_map[i][j - 1] == o.game_map[i][j] || o.game_map[i][j - 1] == 0) {
            o.game_map[i][j - 1] += o.game_map[i][j];
            o.game_map[i][j] = 0;
          }
        }
      }
    }
    o.update();
  }
  o.onTouchDown = function () {
    for (let k = 0; k < 4; k++) {
      for (let j = 4 - 2; j >= 0; j--) { //不考虑最后一行
        for (let i = 0; i < 4; i++) {
          if (o.game_map[i][j + 1] == o.game_map[i][j] || o.game_map[i][j + 1] == 0) {
            o.game_map[i][j + 1] += o.game_map[i][j];
            o.game_map[i][j] = 0;
          }
        }
      }
    }
    o.update();
  }
  o.onTouchRight = function () {
    for (let k = 0; k < 4; k++) {
      for (let j = 0; j < 4; j++) {
        for (let i = 4 - 2; i >= 0; i--) { //不考虑最后一列
          if (o.game_map[i + 1][j] == o.game_map[i][j] || o.game_map[i + 1][j] == 0) {
            o.game_map[i + 1][j] += o.game_map[i][j];
            o.game_map[i][j] = 0;
          }
        }
      }
    }
    o.update();
  }
  o.onTouchLeft = function () {
    for (let k = 0; k < 4; k++) {
      for (let j = 0; j < 4; j++) {
        for (let i = 1; i < 4; i++) { //不考虑第一列
          if (o.game_map[i - 1][j] == o.game_map[i][j] || o.game_map[i - 1][j] == 0) {
            o.game_map[i - 1][j] += o.game_map[i][j];
            o.game_map[i][j] = 0;
          }
        }
      }
    }
    o.update();
  }
  //以当前回合数+分数+网页载入时的时间之和（总是递增的）为随机数种子，获得一个随机数字
  //这样做的好处是，1、每次重载网页，每局游戏不会重复。
  //2、在单局游戏中，撤销到上一步，使用相同操作，生成的随机数字和之前是相同的。
  o.getARandomNum = function () {
    Math.seed = o.current_record_index + o.score + o.random_offset;
    while (!o.game_over) {
      let i = Math.floor(Math.seededRandom(0, 4));
      let j = Math.floor(Math.seededRandom(0, 4));
      if (0 == o.game_map[i][j]) {
        o.game_map[i][j] = Math.seededRandom(0, 2) > 1 ? 2 : 4;
        break;
      }
    }
  }
  o.saveMap = function () {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        o.old_map[i][j] = o.game_map[i][j];
      }
    }
  }
  o.checkMapEqual = function () {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (o.old_map[i][j] != o.game_map[i][j])
          return false;
      }
    }
    return true;
  }
  o.update = function () {
    if (o.checkMapEqual()) {
      return;
    }
    o.getARandomNum();
    o.drawMap();

    if (o.game_over) {
      setTimeout(() => {
        alert("你输了");
        window.location.href = window.location.href;
      }, 100);
    }
    o.saveMap();
    o.recordCurrentMap();
    //console.log(o.map_record);
    document.getElementById("id_score").innerText = "分数：" + o.score.toString();
    document.getElementById("id_time").innerText = "回合数：" + (o.current_record_index + 1).toString();
    o.updateButton();
  }
  //记录当前地图，需要要深拷贝
  o.recordCurrentMap = function () {
    let t = [
      [],
      [],
      [],
      []
    ];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        t[i][j] = o.game_map[i][j];
      }
    }
    //覆盖记录
    o.map_record.splice(o.current_record_index + 1,
      o.map_record.length - o.current_record_index,
      t);
    o.current_record_index++;
  }
  //读取记录
  o.readRecord = function (index) {
    let t = o.map_record[index];
    if (t == undefined) {
      return;
    }
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        o.game_map[i][j] = t[i][j];
      }
    }
  }
  //回滚到上一步
  o.recordBack = function () {
    if (--o.current_record_index < 0) {
      o.current_record_index = 0;
    }
    o.readRecord(o.current_record_index);
    o.saveMap();
    o.drawMap();
    document.getElementById("id_score").innerText = "分数：" + o.score.toString();
    document.getElementById("id_time").innerText = "回合数：" + (o.current_record_index + 1).toString();
    o.updateButton();
  }
  //重做下一步
  o.recordNext = function () {
    if (++o.current_record_index > o.map_record.length - 1) {
      o.current_record_index = o.map_record.length - 1;
    }
    o.readRecord(o.current_record_index);
    o.saveMap();
    o.drawMap();
    document.getElementById("id_score").innerText = "分数：" + o.score.toString();
    document.getElementById("id_time").innerText = "回合数：" + (o.current_record_index + 1).toString();
    o.updateButton();
  }
  //
  document.getElementById("id_back").onclick = function () {
    o.recordBack();
  }
  document.getElementById("id_next").onclick = function () {
    o.recordNext();
  }
  document.getElementById("id_back").style.cursor = "pointer";
  document.getElementById("id_next").style.cursor = "pointer";
  o.canvas.style.cursor = "pointer";
  o.drawMap();
  o.updateButton();
  return o;
};