const vsText = `
precision lowp float;

attribute vec2 position;
attribute vec2 texCoord;
//uniform mat4 m;
varying vec2 uv;

void main(){
  gl_Position=vec4(position,0,1);
  uv=texCoord;
}
`
const fsText = `
precision lowp float;

varying vec2 uv;
uniform sampler2D sampler;
void main(){
  gl_FragColor=texture2D(sampler,uv);
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
    0, 1,
    1, 1,
    1, 0,
    0, 0
  ]),
  indices: new Uint8Array([
    0, 1, 2, 0, 2, 3
  ]),
  count: 6
}

class GameOfLife {
  constructor(w, h, cvsW = 800, cvsH = 600) {
    this.delay = 16; //ms
    this.cvs = document.createElement("canvas");
    this.gl = this.cvs.getContext("webgl");
    this.cvs.width = cvsW;
    this.cvs.height = cvsH;
    this.gl.viewport(0, 0, cvsW, cvsH);
    this.w = w;
    this.h = h;
    const gl = this.gl;
    this.data = {
      texture1: this.gl.createTexture(),
      texture2: this.gl.createTexture(),
      swapBuffer: function () {
        const temp = this.texture1;
        this.texture1 = this.texture2;
        this.texture2 = temp;
      },
      init: function (w, h, data) {
        gl.bindTexture(gl.TEXTURE_2D, this.texture1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, this.texture2);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
      },
      getTexture() {
        return this.texture1;
      }
    }

    //创建着色器程序
    const vs = gl.createShader(gl.VERTEX_SHADER);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vs, vsText);
    gl.shaderSource(fs, fsText);
    gl.compileShader(vs);
    gl.compileShader(fs);
    this.program = gl.createProgram();
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);
    this.locPos = gl.getAttribLocation(this.program, "position");
    this.locUv = gl.getAttribLocation(this.program, "texCoord");
    gl.enableVertexAttribArray(this.locPos);
    gl.enableVertexAttribArray(this.locUv);

    //创建VAO
    this.ext = gl.getExtension("OES_vertex_array_object");
    this.vao = this.ext.createVertexArrayOES();
    this.ext.bindVertexArrayOES(this.vao);
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.vertexAttribPointer(this.locPos, 2, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, rect.positions, gl.STATIC_DRAW);
    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.vertexAttribPointer(this.uvs, 2, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, rect.uvs, gl.STATIC_DRAW);
    const ebo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, rect.indices, gl.STATIC_DRAW);
    this.ext.bindVertexArrayOES(null);

  }

  getCanvas() {
    return this.cvs;
  }

  mouse2World(mx, my) {
    //return {x,y};
  }

  init() {

  }

  handleInput() {

  }

  update() {

  }

  render() {

  }

  run() {
    let previous = (new Date()).getTime();
    let lag = 0.0;
    const gameloop = () => {
      const current = (new Date()).getTime();
      const elapsed = current - previous;
      previous = current;
      lag += elapsed;

      this.handleInput();

      while (lag >= this.delay) {
        this.update();
        lag -= this.delay;
      }

      this.render();
      requestAnimationFrame(gameloop);
    };

    this.init();
    gameloop();
  }
}

window.onload = function () {
  const game = new GameOfLife(1024, 1024, 1024, 1024);
  document.getElementById("game").appendChild(game.getCanvas());
  game.run();
}