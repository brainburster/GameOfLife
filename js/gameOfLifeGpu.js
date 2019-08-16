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
  if(texture2D(sampler,((gl_FragCoord.xy+direction)/vec2(1024,1024))).r>0.1){
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
  if(color.r<0.1&&sum==3){
    gl_FragColor = vec4(1,1,0.3,1);
  }
  else if(sum==2){
    if(color.r>0.2){
      color.r-=0.005;
    }
    if(color.g>0.2){
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
uniform mat4 m;
varying vec2 uv;

void main(){
  gl_Position=m*vec4(position,0,1);
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

class GameOfLife {
  constructor(w, h, cvsW = 800, cvsH = 600) {
    this.delay = 32; //ms
    this.pause = false;
    this.cvs = document.createElement("canvas");
    this.gl = this.cvs.getContext("webgl");
    this.cvs.width = cvsW;
    this.cvs.height = cvsH;
    this.gl.viewport(0, 0, w, h);
    this.w = w;
    this.h = h;
    const gl = this.gl;
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
        gl.bindTexture(gl.TEXTURE_2D, this.backTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
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

    //this.ext.bindVertexArrayOES(this.vao);
    this.scale = 1;

    this.cvs.onwheel = (e) => {
      this.scale += e.deltaY * 0.001;
      this.scale = Math.max(0.4, Math.min(this.scale, 4));
      e.preventDefault();
    }
    this.cvs.oncontextmenu = (e) => {
      e.preventDefault();
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
    this.fbuffer = gl.createFramebuffer();
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
    //传入观察矩阵
    const gl = this.gl;
    gl.viewport(0, 0, 800, 600);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.renderProgram);
    gl.bindTexture(gl.TEXTURE_2D, this.data.frontTexture);
    const a = this.scale;
    const b = this.scale * this.cvs.width / this.cvs.height;
    const mat = new Float32Array([
      a, 0, 0, 0,
      0, b, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ])
    gl.uniformMatrix4fv(this.locRenderM, false, mat);
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