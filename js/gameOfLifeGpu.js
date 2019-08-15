class GameOfLife {
  constructor(w, h, cvsW = 800, cvsH = 600) {
    this.cvs = document.createElement("canvas");
    this.gl = this.cvs.getContext("webgl");
    this.cvs.width = cvsW;
    this.cvs.height = cvsH;
    this.gl.viewport(cvsW, cvsH);
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
    this.speed = 16; //ms
  }
  getCanvas() {
    return this.cvs;
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

      while (lag >= this.speed) {
        this.update();
        lag -= this.speed;
      }

      this.renders();

      requestAnimationFrame(gameloop);
    };

    gameloop();
  }
}

window.onload = function () {
  const game = GameOfLife();
  game.run();
}