const vsUpdate = `
precision mediump float;

attribute vec2 position;
attribute vec2 texCoord;
varying vec2 uv;

void main(){
  gl_Position=vec4(position,0,1);
  uv=texCoord;
}
`
const fsUpdate = `
precision mediump float;

varying vec2 uv;
uniform sampler2D sampler;

int isLive(vec2 direction){
  vec3 color = texture2D(sampler,((gl_FragCoord.xy+direction)/vec2(1024,1024))).rgb;
  if(color.b>0.95&&color.r>0.95&&color.g>0.95){
    return 0;
  }
  else if(color.r>0.2){
    return 1;
  }
  return 0;
}

void main(){
  int sum = isLive(vec2(-1,1))+
  isLive(vec2(0,1))+
  isLive(vec2(1,1))+
  isLive(vec2(1,0))+
  isLive(vec2(1,-1))+
  isLive(vec2(0,-1))+
  isLive(vec2(-1,-1))+
  isLive(vec2(-1,0));
  vec3 color = texture2D(sampler,uv).rgb;
  if(color.r<0.2&&sum==3){
    gl_FragColor = vec4(1,1,0.3,1);
  }
  else if(sum==2){
    if(color.r>0.21){
      color.r-=0.005;
    }
    if(color.g>0.21){
      color.g-=0.02;
    }
    gl_FragColor = vec4(color.r,color.g,0.3,1);
  }
  else if(sum==3){
    if(color.r>0.43){
      color.r-=0.003;
    }
    if(color.g>0.3){
      color.g-=0.01;
    }
    gl_FragColor = vec4(color.r,color.g,0.3,1);
  }
  else{
    gl_FragColor = vec4(0,0,0,1);
  }
  //gl_FragColor = texture2D(sampler,((gl_FragCoord.xy)/vec2(800,600)));//texture2D(sampler,uv);
}
`

const vsRender = `
precision mediump float;

attribute vec2 position;
attribute vec2 texCoord;
uniform mat3 m;
varying vec2 uv;

void main(){
  gl_Position=vec4((m*vec3(position,1)).xy,0,1);
  uv=texCoord;
}
`

const fsRender = `
precision mediump float;

varying vec2 uv;
uniform sampler2D sampler;

void main(){
  gl_FragColor = texture2D(sampler,uv);
}
`

const rect = {
  positions: new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    1.0, 1.0,
    -1.0, 1.0,
  ]),
  uvs: new Float32Array([
    0, 0,
    1, 0,
    1, 1,
    0, 1
  ]),
  indices: new Uint8Array([
    0, 1, 2, 0, 2, 3
  ])
}

function createProgram(gl, vsText, fsText) {
  const vs = gl.createShader(gl.VERTEX_SHADER);
  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(vs, vsText);
  gl.shaderSource(fs, fsText);
  gl.compileShader(vs);
  gl.compileShader(fs);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  return program;
}

function m3Cross(a, b) {
  const [
    a11, a12, a13,
    a21, a22, a23,
    a31, a32, a33
  ] = a;
  const [
    b11, b12, b13,
    b21, b22, b23,
    b31, b32, b33
  ] = b;
  const c11 = a11 * b11 + a12 * b21 + a13 * b31;
  const c12 = a11 * b12 + a12 * b22 + a13 * b32;
  const c13 = a11 * b13 + a12 * b23 + a13 * b33;
  const c21 = a21 * b11 + a22 * b21 + a23 * b31;
  const c22 = a21 * b12 + a22 * b22 + a23 * b32;
  const c23 = a21 * b13 + a22 * b23 + a23 * b33;
  const c31 = a31 * b11 + a32 * b21 + a33 * b31;
  const c32 = a31 * b12 + a32 * b22 + a33 * b32;
  const c33 = a31 * b13 + a32 * b23 + a33 * b33;
  return [
    c11, c12, c13,
    c21, c22, c23,
    c31, c32, c33
  ];
}

class GameOfLife {
  constructor(w, h, cvsW = 800, cvsH = 600) {
    this.delay = 32; //ms
    this.pause = false;
    this.cvs = document.createElement("canvas");
    this.gl = this.cvs.getContext("webgl2") || this.cvs.getContext("webgl");
    this.cvs.width = cvsW;
    this.cvs.height = cvsH;
    this.gl.viewport(0, 0, w, h);
    this.w = w;
    this.h = h;
    const gl = this.gl;
    this.fbuffer = gl.createFramebuffer();
    const that = this;
    this.data = {
      frontTexture: gl.createTexture(),
      backTexture: gl.createTexture(),
      swapBuffer: function () {
        const temp = this.frontTexture;
        this.frontTexture = this.backTexture;
        this.backTexture = temp;
      },
      init: function (w, h, data) {
        gl.bindTexture(gl.TEXTURE_2D, this.frontTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, this.backTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
      },
      load: function (image) {
        const temp = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, temp);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.useProgram(that.renderProgram);
        gl.bindFramebuffer(gl.FRAMEBUFFER, that.fbuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.frontTexture, 0);
        gl.viewport(0, 0, 1024, 1024);
        gl.uniformMatrix3fv(that.locRenderM, false, [
          1, 0, 0,
          0, 1, 0,
          0, 0, 1
        ]);

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, rect.indices.length, gl.UNSIGNED_BYTE, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.bindBuffer
      }
    }


    //创建着色器程序
    this.updateProgram = createProgram(gl, vsUpdate, fsUpdate);
    this.locUpdatePos = gl.getAttribLocation(this.updateProgram, "position");
    this.locUpdateUv = gl.getAttribLocation(this.updateProgram, "texCoord");
    this.renderProgram = createProgram(gl, vsRender, fsRender);
    this.locRenderPos = gl.getAttribLocation(this.renderProgram, "position");
    this.locRenderUv = gl.getAttribLocation(this.renderProgram, "texCoord");
    this.locRenderM = gl.getUniformLocation(this.renderProgram, "m");
    //创建VAO
    //this.ext = gl.getExtension("OES_vertex_array_object");
    //this.vao = this.ext.createVertexArrayOES();
    //this.ext.bindVertexArrayOES(this.vao);
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, rect.positions, gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.locUpdatePos, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribPointer(this.locRenderPos, 2, gl.FLOAT, false, 0, 0);
    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, rect.uvs, gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.locUpdateUv, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribPointer(this.locRenderUv, 2, gl.FLOAT, false, 0, 0);
    const ebo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, rect.indices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(this.locUpdatePos);
    gl.enableVertexAttribArray(this.locUpdateUv);
    gl.enableVertexAttribArray(this.locRenderPos);
    gl.enableVertexAttribArray(this.locRenderUv);
    //this.ext.bindVertexArrayOES(null);

    const btnStart = document.getElementById("start");
    btnStart.value = this.pause ? "开始" : "暂停";
    btnStart.onclick = () => {
      this.pause = !this.pause;
      btnStart.value = this.pause ? "开始" : "暂停";
    }
    const range = document.getElementById("speed");
    this.delay = 216 - range.valueAsNumber;
    range.oninput = () => {
      this.delay = 216 - range.valueAsNumber;
    }
    const btnDebug = document.getElementById("debug");
    btnDebug.onclick = () => {
      this.pause = false;
      this.update();
      this.pause = true;
      btnStart.value = this.pause ? "开始" : "暂停";
    }
    const btnCpu = document.getElementById("back2Cpu");
    btnCpu.onclick = () => {
      window.location.href = "https://brainburster.github.io/GameOfLife/";
    }

    const testImage = document.getElementById("test-image");
    testImage.onclick = () => {
      this.pause = true;
      const image = new Image();
      this.scale = 200;
      this.x = 400;
      this.y = 300;
      image.crossOrigin = "";
      image.onload = () => {
        this.data.load(image);
        this.render();
        btnStart.value = this.pause ? "开始" : "暂停";
      }
      image.src = "./icon.png";
    }

    const loadImage = document.getElementById("load-image");
    loadImage.onchange = () => {
      const file = loadImage.files[0];
      if (!file) {
        alert("未载入图片");
        return;
      }
      this.pause = true;
      this.scale = 200;
      this.x = 400;
      this.y = 300;
      const image = new Image();
      image.crossOrigin = "";
      image.onload = () => {
        this.data.load(image);
        this.render();
        btnStart.value = this.pause ? "开始" : "暂停";
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        image.src = e.target.result;
      }
      reader.readAsDataURL(file);
    }

    //this.ext.bindVertexArrayOES(this.vao);
    this.scale = 800;
    this.x = 0;
    this.y = 0;
    this.dx = 0;
    this.dy = 0;
    this.cvs.onwheel = (e) => {
      this.dx = this.x - e.offsetX;
      this.dy = this.y - e.offsetY;
      const scaleOld = this.scale;
      this.scale += e.deltaY;
      this.scale = Math.max(200, Math.min(this.scale, 3200));
      this.x = e.offsetX + this.dx * (this.scale / scaleOld);
      this.y = e.offsetY + this.dy * (this.scale / scaleOld);
      e.preventDefault();
    }
    this.cvs.oncontextmenu = (e) => {
      e.preventDefault();
    }

    this.cvs.onmousedown = (e) => {
      this.dx = this.x - e.offsetX;
      this.dy = this.y - e.offsetY;
    }
    this.cvs.onmousemove = (e) => {
      switch (e.buttons) {
        case 1:
          this.x = e.offsetX + this.dx;
          this.y = e.offsetY + this.dy;
          break;
        case 2:
          this.x = e.offsetX + this.dx;
          this.y = e.offsetY + this.dy;
          break;
        default:
          break;
      }
    }
  }

  getCanvas() {
    return this.cvs;
  }

  mouse2World(mx, my) {
    //return {x,y};
  }

  init() {
    const data = new Uint8Array(1024 * 1024 * 4);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() + Math.random() * 0.5 + Math.random() * 0.25 * +Math.random() * 0.125 > 1.3 ? 255 : 0;
      if (i % 4 === 3) {
        data[i] = 255;
      }
    }
    this.data.init(1024, 1024, data);
    this.gl.clearColor(0.1, 0.1, 0.1, 1);
    this.gl.disable(this.gl.DEPTH_TEST);
  }

  handleInput() {

  }

  update() {
    //
    if (this.pause) {
      return;
    }
    const gl = this.gl;
    gl.viewport(0, 0, 1024, 1024);
    gl.useProgram(this.updateProgram);
    gl.bindTexture(gl.TEXTURE_2D, this.data.frontTexture);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.data.backTexture, 0);

    //this.ext.bindVertexArrayOES(this.vao);
    gl.drawElements(gl.TRIANGLES, rect.indices.length, gl.UNSIGNED_BYTE, 0);
    // this.ext.bindVertexArrayOES(null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    this.data.swapBuffer();
  }

  render() {
    const gl = this.gl;
    gl.viewport(0, 0, 800, 600);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.renderProgram);
    gl.bindTexture(gl.TEXTURE_2D, this.data.frontTexture);
    const a = 2 / this.cvs.width;
    const b = -2 / this.cvs.height; //* 4 / 3;
    const x = this.x;
    const y = this.y;
    const s = this.scale;

    const transMat = [
      1, 0, 0,
      0, 1, 0,
      x, y, 1
    ];

    const scalMat = [
      s, 0, 0,
      0, s, 0,
      0, 0, 1
    ];

    const projMat = [
      a, 0, 0,
      0, b, 0,
      -1, 1, 1
    ];

    let mat = m3Cross(scalMat, transMat);
    mat = m3Cross(mat, projMat);
    gl.uniformMatrix3fv(this.locRenderM, false, mat);

    //this.ext.bindVertexArrayOES(this.vao);
    gl.drawElements(gl.TRIANGLES, rect.indices.length, gl.UNSIGNED_BYTE, 0);
    //this.ext.bindVertexArrayOES(null);
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
        this.handleInput();
        while (lag >= this.delay) {
          this.update();
          lag -= this.delay;
        }

        this.render();
      } else {
        lag = 0;
      }

      requestAnimationFrame(gameloop);
    };

    this.init();
    gameloop();
  }
}

window.onload = function () {
  const game = new GameOfLife(1024, 1024, 800, 600);
  document.getElementById("game").appendChild(game.getCanvas());
  game.run();
}