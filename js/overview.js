var renderer;
var camera;
var scene;
var skyBox;
var controls;
var skyMaterial;
var skyShader;

function initThree() {
  width = document.getElementById('canvas-frame').clientWidth;
  height = document.getElementById('canvas-frame').clientHeight;
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  document.getElementById('canvas-frame').appendChild(renderer.domElement);
  renderer.setClearColor(0xFFFFA0, 1.0);
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 0;
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, -0.01);
}

function updateCamera() {
  var clock = new THREE.Clock();
  controls.update(clock.getDelta());
}

function initScene() {
  scene = new THREE.Scene();
}

function initObject() {
  var path = 'textures/A6/';
  var sides = [path + '1.jpg', path + '2.jpg', path + '4.jpg', path + '3.jpg', path + '5.jpg', path + '6.jpg'];

  //var textures = THREE.ImageUtils.loadTextureCube(sides);
  var loader = new THREE.CubeTextureLoader();
  document.getElementById("info").innerText = "正在加载资源请稍后..";
  loader.load(sides, (textures) => {
    skyShader = THREE.ShaderLib["cube"];
    skyShader.uniforms["tCube"].value = textures;
    skyMaterial = new THREE.ShaderMaterial({
      fragmentShader: skyShader.fragmentShader,
      vertexShader: skyShader.vertexShader,
      uniforms: skyShader.uniforms,
      depthWrite: false,
      side: THREE.BackSide
    });
    skyBox = new THREE.Mesh(new THREE.CubeGeometry(50, 50, 50), skyMaterial);
    skyMaterial.needsUpdate = true;
    scene.add(skyBox);
    document.getElementById("info").innerText = "全景图test";
  });
}

function threeStart() {
  initThree();
  initScene();
  initCamera();
  initObject();
  frame();
  updateCamera();
  window.onresize = function () {
    width = document.getElementById('canvas-frame').clientWidth;
    height = document.getElementById('canvas-frame').clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  var btn = document.getElementsByClassName("btn_change_skybox");
  for (let index = 0; index < btn.length; index++) {
    btn[index].onclick = () => {
      var path = 'textures/' + btn[index].value + '/';
      var sides = [path + '1.jpg', path + '2.jpg', path + '4.jpg', path + '3.jpg', path + '5.jpg', path + '6.jpg'];
      var loader = new THREE.CubeTextureLoader();
      document.getElementById("info").innerText = "正在加载资源请稍后..";
      loader.load(sides, (textures) => {
        skyShader.uniforms["tCube"].value = textures;
        document.getElementById("info").innerText = "全景图test";
      });
    }
  }
}
//游戏循环
function frame() {
  requestAnimationFrame(frame);
  renderer.render(scene, camera);
}