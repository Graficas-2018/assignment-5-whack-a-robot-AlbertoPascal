var renderer = null, 
scene = null, 
camera = null,
root = null,
robot_idle = null,
robot_attack = null,
flamingo = null,
stork = null,
group = null,
orbitControls = null;
loopAnimation = false;
var spawner_copy=null
var robot_mixer = {};
var deadAnimator;
var morphs = [];
var mouse = new THREE.Vector2(), INTERSECTED, CLICKED;
var raycaster=null;
var duration = 2000; // ms
var currentTime = Date.now();
var deadMoment = null;
var deltaTime = null;
var MovementAnimator=null;
var DontKillRobot = true;
var stopAll = true;
var score=0;
var robots_array=[];
var contador=0;
var time_remaining=60;
var animation = "idle";
var tablero=null;
function changeAnimation(animation_text, object)
{
    animation = animation_text;


    if(animation =="dead")
    {
        createDeadAnimation(object);
    }
    else
    {
        robot_idle.rotation.x = 0;
        robot_idle.position.y = -4;
    }
}

function createDeadAnimation(objeto)
{
    if(time_remaining>0)
    {
        score = score + 10;
        printScore();
        console.log("Voy a animar a ", objeto);
    console.log("anets era: ", robot_idle)
     objeto.deadAnimator = new KF.KeyFrameAnimator;
        objeto.deadAnimator.init({ 
            interps:
                [
                    { 
                        keys:[0, 0.5, 1], 
                        values:[
                                { y : 0 },
                                { y : - Math.PI },
                                { y : -2*Math.PI },
                                ],
                        target:objeto.rotation
                    },
                    { 
                        keys:[0, 0.25, 0.5, 0.75, 1], 
                        values:[
                                { x : 0 },
                                { x : - Math.PI / 2 },
                                { x : - Math.PI },
                                { x : - 3*Math.PI/2 },
                                { x : -2*Math.PI },
                                ],
                        target:objeto.rotation
                    },
                    { 
                        keys:[0, 0.25, 0.5, 0.75, 1], 
                        values:[
                                { y : objeto.position.y },
                                { y : objeto.position.y - 4 },
                                { y : objeto.position.y -8},
                                { y : objeto.position.y-12 },
                                { y : objeto.position.y-16 },
                                ],
                        target:objeto.position
                    },
                ],
            loop: false,
            duration:duration
        });
        console.log(objeto.deadAnimator)
        objeto.deadAnimator.start();
    }
    
}

function loadFBX()
{
    var loader = new THREE.FBXLoader();
    loader.load( '../models/Robot/robot_idle.fbx', function ( object ) 
    {
        robot_mixer["idle"] = new THREE.AnimationMixer( scene );
        object.scale.set(0.02, 0.02, 0.02);
        object.position.y -= 4;
        object.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        } );
        robot_idle = object;
        //scene.add( robot_idle );
        spawner_copy = robot_idle;
       // createDeadAnimation(robot_idle);

        robot_mixer["idle"].clipAction( object.animations[ 0 ], robot_idle ).play();

        loader.load( '../models/Robot/robot_atk.fbx', function ( object ) 
        {
            robot_mixer["attack"] = new THREE.AnimationMixer( scene );
            robot_mixer["attack"].clipAction( object.animations[ 0 ], robot_idle ).play();
        } );

        loader.load( '../models/Robot/robot_run.fbx', function ( object ) 
        {
            robot_mixer["run"] = new THREE.AnimationMixer( scene );
            robot_mixer["run"].clipAction( object.animations[ 0 ], robot_idle ).play();
        } );

        loader.load( '../models/Robot/robot_walk.fbx', function ( object ) 
        {
            robot_mixer["walk"] = new THREE.AnimationMixer( scene );
            robot_mixer["walk"].clipAction( object.animations[ 0 ], robot_idle ).play();
        } );
        loader.load( '../models/Robot/robot_atk.fbx', function ( object ) 
        {
            robot_mixer["dead"] = new THREE.AnimationMixer( scene );
            robot_mixer["dead"].clipAction( object.animations[ 0 ], robot_idle ).play();
        } );
    } );
}
function GameTime()
{
    if(time_remaining>0)
        {
            time_remaining-=1;
        }
    if(time_remaining<=0)
    {
         $('#title3').text("G A M E   O V E R");
    }
    else
    {
        $('#title3').text("");
    }
    $('#title2').text("Time: "+time_remaining+" segs");
}
function animate() {

    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;
    var newRobot=null;
    if(contador<4)
    {
        // DontKillRobot the robot
        if (DontKillRobot) {
            //let z = 
            //console.log(z);
            var rand = Math.random()
            var positionsX = []
            newRobot = cloneFbx(robot_idle);
            newRobot.name="Robot" + contador;
            console.log("voy a agregar un robotcitooo");
            newRobot.mixer =  new THREE.AnimationMixer( scene );
            var action = newRobot.mixer.clipAction( newRobot.animations[0], newRobot );
            action.play();
            newRobot.position.x = Math.floor(Math.random() * 40) - Math.floor(Math.random() * 20);
            newRobot.position.z = 5 - Math.floor(Math.random() * 40) - Math.floor(Math.random() * 30);
            robots_array.push(newRobot);
           // console.log(robots_array.size());
            contador+=1
            scene.add(robots_array[contador-1]);
            DontKillRobot = false;
            deltaTime = now;

            var loader = new THREE.FBXLoader();
            loader.load( '../models/Robot/robot_idle.fbx', function ( object ) 
    {
        robot_mixer["idle"] = new THREE.AnimationMixer( scene );
        object.scale.set(0.02, 0.02, 0.02);
        object.position.y -= 4;
        object.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        } );
        

        robot_mixer["idle"].clipAction( object.animations[ 0 ], robots_array[contador-1] ).play();

        loader.load( '../models/Robot/robot_atk.fbx', function ( object ) 
        {
            robot_mixer["attack"] = new THREE.AnimationMixer( scene );
            robot_mixer["attack"].clipAction( object.animations[ 0 ], robots_array[contador-1] ).play();
        } );
    } );
    


            
        } else {
            console.log("Toca matarlo")
            if ((now - deltaTime) >= 3500) {
                console.log("ya valió");
                scene.remove(robots_array.pop(0));
                contador-=1;
                DontKillRobot = true;
            }
        }
        animation="attack";
        robot_mixer[animation].update(deltat * 0.001);
        deadMoment = now;
    }

   /* if(robot_idle && robot_mixer[animation])
    {
        robot_mixer[animation].update(deltat * 0.001);
    }*/

    if(animation =="dead")
    {
        KF.update();
        robot_mixer["walk"].update(deltat * 0.001);
        //console.log(now - deadMoment);
        if ((now - deadMoment) >= duration / 10) {
            scene.remove(newRobot);
            animation = "idle";
            newRobot.rotation.x = 0;
        }
    }
}

function run() {
    requestAnimationFrame(function() { run(); });
    
        // Render the scene
       

        // Spin the cube for next frame
        if(time_remaining>0)
        {
             renderer.render( scene, camera );
             animate();
             KF.update();

        // Update the camera controller
            orbitControls.update();
        }
       
}
function Reset()
{
    score=0;
    time_remaining=60;
    $('#title').text("Score: No score yet");
}
function printScore(){
  if (score < 0)
    score = 0;
  $('#title').text("Score: "+score);
}
function onDocumentMouseDown(event)
{
    event.preventDefault();
    event.preventDefault();
    mouse.x = ( event.clientX / 800 ) * 2 - 1;
    mouse.y = - ( event.clientY / 600 ) * 2 + 1;

    // find intersections
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( scene.children, true );

    if ( intersects.length > 0 ) 
    {
        console.log("click");
        CLICKED = intersects[ 0 ].object;

        console.log(CLICKED.parent);
        //CLICKED.material.emissive.setHex( 0x00ff00 );
        if(CLICKED.parent.name!="Robot0" && CLICKED.parent.name!="Robot1" && CLICKED.parent.name!="Robot2" && CLICKED.parent.name!="Robot3" && CLICKED.parent.name!="Robot4"){

        }
        else
        {
            createDeadAnimation(CLICKED.parent)
        }
        
    } 
    else 
    {
        if ( CLICKED ) 
            CLICKED.material.emissive.setHex( CLICKED.currentHex );

        CLICKED = null;
    }
}
function setLightColor(light, r, g, b)
{
    r /= 255;
    g /= 255;
    b /= 255;
    
    light.color.setRGB(r, g, b);
}

var directionalLight = null;
var spotLight = null;
var ambientLight = null;
var mapUrl = "../images/checker_large.gif";

var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

function createScene(canvas) {
    time_remaining=60;
    score=0;
    setInterval(GameTime, 1000);
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
    raycaster = new THREE.Raycaster();
    document.addEventListener('mousedown', onDocumentMouseDown);

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(-20, 30, 60);
    scene.add(camera);

    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
        
    // Create a group to hold all the objects
    root = new THREE.Object3D;
    
    spotLight = new THREE.SpotLight (0xffffff);
    spotLight.position.set(0, 50, 30);
    spotLight.target.position.set(0, 0, 0);
    root.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 200;
    spotLight.shadow.camera.fov = 45;
    
    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    ambientLight = new THREE.AmbientLight ( 0x888888 );
    root.add(ambientLight);
    
    // Create the objects
    loadFBX();
    //scene.add(robot_idle);
    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    // Create a texture map
    var map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    var color = 0xffffff;

    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -4.02;
    mesh.name="SoyTablero";
    tablero=mesh;
    tablero.name="tablero";
    // Add the mesh to our group
    group.add( mesh );
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    
    // Now add the group to our scene
    scene.add( root );
}