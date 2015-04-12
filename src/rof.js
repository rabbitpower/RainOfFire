require(['threex.planets/package.require.js'
], function () {

    if (Detector.webgl)
        renderer = new THREE.WebGLRenderer({ antialias: true });
    else
        renderer = new THREE.CanvasRenderer();

    var DateMin;
    var DateMax;
    var bolides = [];
    var RadiatedEnergyMin = Number.MAX_VALUE;
    var RadiatedEnergyMax = 1;
    var SelectedEnergyMin = 0;
    var SelectedEnergyMax = 0;
    var ImpactEnergyMin = Number.MAX_VALUE;
    var ImpactEnergyMax = 0;
    var SelectedImpactEnergyMin = 0;
    var SelectedImpactEnergyMax = 0;

    var AltitudeMin = Number.MAX_VALUE;
    var AltitudeMax = 0;
    var SelAltitudeMin = 0;
    var SelAltitudeMax = 0;

    var stopAnimation = false;

    StartDateMin = new Date(2009, 0, 1);

    $("#element").dateRangeSlider({

        bounds: { min: StartDateMin, max: new Date(2015, 11, 31) },
        defaultValues: { min: StartDateMin, max: StartDateMin },
        scales: [{
            first: function (value) {
                return value;
            },
            end: function (value) {
                return value;
            },
            next: function (value) {
                var next = new Date(value);
                return new Date(next.setFullYear(value.getFullYear() + 1));
            },
            label: function (value) {
                return value.getFullYear();
            },
            format: function (tickContainer, tickStart, tickEnd) {
                tickContainer.addClass("ui-ruler-tick");
            }
        }],


        arrows: false,
        valueLabels: "change",
        durationIn: 500,
        durationOut: 2000,
        // symmetricPositionning: true,
        range: { min: 0 },
        wheelMode: "zoom"
    });

    function log10(val) {
        return Math.log(val) / Math.LN10;
    }

    function RESlider() {
        //alert(RadiatedEnergyMax);
        var sc = (log10(RadiatedEnergyMax) - log10(RadiatedEnergyMin)) / 20;

        $("#element2").rangeSlider({

            bounds: { min: log10(RadiatedEnergyMin), max: log10(RadiatedEnergyMax) },
            defaultValues: { min: log10(RadiatedEnergyMin), max: log10(RadiatedEnergyMax) },
            formatter: function (val) {
                var value = Math.pow(10, val);
                if (value < 100) {
                    value = Math.round(value / 10) / 100 + "K";
                } else if (value < 1000) {
                    value = Math.round(value / 100) / 10 + "K";
                } else if (value < 1000000) {
                    value = Math.round(value / 1000) + "K";
                } else if (value < 1000000000) {
                    value = Math.round(value / 1000000) + "M";
                } else {
                    value = Math.round(value / 1000000000) + "G";
                }
                return value.toString();
            },
            scales: [
        // Primary scale
          {
              first: function (val) { return val; },
              next: function (val) { return val + sc },
              stop: function (val) { return false; },
              label: function () { return ""; },
              format: function (tickContainer, tickStart, tickEnd) {
                  tickContainer.addClass("ruler-label");
              }
          },

            ],
            arrows: false,
           // valueLabels: "change",

            // symmetricPositionning: true,
            range: { min: 0 },
            wheelMode: "zoom"
        });
    }

    function IESlider() {
        //alert(RadiatedEnergyMax);
        var sc = (ImpactEnergyMax - ImpactEnergyMin) / 20;

        $("#element3").rangeSlider({

            bounds: { min: (ImpactEnergyMin), max: (ImpactEnergyMax) },
            defaultValues: { min: (ImpactEnergyMin), max: (ImpactEnergyMax) },
            scales: [
        // Primary scale
          {
              first: function (val) { return val; },
              next: function (val) { return val + sc },
              stop: function (val) { return false; },
              label: function () { return ""; },
              format: function (tickContainer, tickStart, tickEnd) {
                  tickContainer.addClass("ruler-label");
              }
          },

            ],
            arrows: false,
           // valueLabels: "change",

            // symmetricPositionning: true,
            range: { min: 0 },
            wheelMode: "zoom"
        });
    }

    function AltSlider() {
        //alert(RadiatedEnergyMax);
        var sc = (AltitudeMax - AltitudeMin) / 20;

        $("#element4").rangeSlider({

            bounds: { min: (AltitudeMin), max: (AltitudeMax) },
            defaultValues: { min: (AltitudeMin), max: (AltitudeMax) },
            scales: [
        // Primary scale
          {
              first: function (val) { return val; },
              next: function (val) { return val + sc },
              stop: function (val) { return false; },
              label: function () { return ""; },
              format: function (tickContainer, tickStart, tickEnd) {
                  tickContainer.addClass("ruler-label");
              }
          },

            ],
            arrows: false,
          //  valueLabels: "change",

            // symmetricPositionning: true,
            range: { min: 0 },
            wheelMode: "zoom"
        });
    }

    $("#element").bind("valuesChanging", function (e, data) {
        DateMin = data.values.min;
        DateMax = data.values.max;
        stopAnimation = true;
        getJSonData();
    });

    $("#element").bind("valuesChanged", function (e, data) {
        DateMin = data.values.min;
        DateMax = data.values.max;
        getJSonData();
    });

    $("#element2").bind("valuesChanging", function (e, data) {
        SelectedEnergyMin = data.values.min;
        SelectedEnergyMax = data.values.max;
        getJSonData();
    });

    $("#element3").bind("valuesChanging", function (e, data) {
        SelectedImpactEnergyMin = data.values.min;
        SelectedImpactEnergyMax = data.values.max;
        getJSonData();
    });

    $("#element4").bind("valuesChanging", function (e, data) {
        SelAltitudeMin = data.values.min;
        SelAltitudeMax = data.values.max;
        getJSonData();
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    var onRenderFcts = [];
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.x = 1.0687713212237027;
    camera.position.y = 1.1071055030683448;
    camera.position.z = -0.5345343704213782;

    var light = new THREE.AmbientLight(0x888888)
    scene.add(light)

    var light = new THREE.DirectionalLight(0xcccccc, 1)
    light.position.set(5, 3, 5)
    scene.add(light)

    //////////////////////////////////////////////////////////////////////////////////
    //      add an object and make it move                  //
    //////////////////////////////////////////////////////////////////////////////////  
    function createEarth() {
        var geometry = new THREE.SphereGeometry(0.5, 32, 32);

        //var loader = new THREE.DDSLoader();
        //var map = loader.load( 'images/earthmap7k.dds' );

        var map = THREE.ImageUtils.loadTexture('images/earthmap7k.jpg');

        //var bumpMap = THREE.ImageUtils.loadTexture('images/earthbump1k.jpg');
        var specularMap = THREE.ImageUtils.loadTexture('images/earthspec1k.jpg');

        var material = new THREE.MeshPhongMaterial({
            map: map,
            //bumpMap       : bumpMap,
            bumpScale: 0.05,
            specularMap: specularMap,
            specular: new THREE.Color('grey'),
        })

        var mesh = new THREE.Mesh(geometry, material)
        return mesh
    }

    var earthMesh = createEarth();
    scene.add(earthMesh);

    var center = new THREE.Vector3(0, 0, 0);

    //onRenderFcts.push(function (delta, now) {
    //    camera.lookAt(center);
    //});

    var cloudMesh = THREEx.Planets.createEarthCloud()
    scene.add(cloudMesh)

    onRenderFcts.push(function (delta, now) {
        cloudMesh.rotateY(1 / 16 * delta)
    })


    //////////////////////////////////////////////////////////////////////////////////
    //      add star field                          //
    //////////////////////////////////////////////////////////////////////////////////

    var geometry = new THREE.SphereGeometry(90, 32, 32)
    var material = new THREE.MeshBasicMaterial()
    material.map = THREE.ImageUtils.loadTexture('threex.planets/images/galaxy_starfield.png')
    material.side = THREE.BackSide
    var mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    //////////////////////////////////////////////////////////////////////////////////
    //      Camera Controls                         //
    //////////////////////////////////////////////////////////////////////////////////
    //var projector = new THREE.Projector();
    //var ray = new THREE.Raycaster(camera.position, null);

    //var mouse = { x: 0, y: 0 }
    //var mouse3D, isMouseDown = false, onMouseDownPosition = new THREE.Vector2(),
    //    radious = 1.5, theta = 45, onMouseDownTheta = 45, phi = 60, onMouseDownPhi = 60;

    //camera.position.x = radious * Math.sin(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
    //camera.position.y = radious * Math.sin(phi * Math.PI / 360);
    //camera.position.z = radious * Math.cos(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
    //camera.updateMatrix();

    function onDocumentMouseDown(event) {

        event.preventDefault();

        isMouseDown = true;

        onMouseDownTheta = theta;
        onMouseDownPhi = phi;
        onMouseDownPosition.x = event.clientX;
        onMouseDownPosition.y = event.clientY;

    }

    function onDocumentMouseMove(event) {

        event.preventDefault();

        if (isMouseDown) {

            theta = -((event.clientX - onMouseDownPosition.x) * 0.5) + onMouseDownTheta;
            phi = ((event.clientY - onMouseDownPosition.y) * 0.5) + onMouseDownPhi;

            phi = Math.min(180, Math.max(-180, phi));

            camera.position.x = radious * Math.sin(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
            camera.position.y = radious * Math.sin(phi * Math.PI / 360);
            camera.position.z = radious * Math.cos(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
            camera.updateMatrix();

        }

        var vector = new THREE.Vector3((event.clientX / renderer.domElement.width) * 2 - 1, -(event.clientY / renderer.domElement.height) * 2 + 1, 0.5);
        mouse3D = vector.unproject(camera);
        ray.direction = mouse3D.sub(camera.position).normalize();

        interact();
        render();

    }

    function onDocumentMouseUp(event) {

        //event.preventDefault();

        //isMouseDown = false;

        //onMouseDownPosition.x = event.clientX - onMouseDownPosition.x;
        //onMouseDownPosition.y = event.clientY - onMouseDownPosition.y;

        //if (onMouseDownPosition.length() > 5) {

        //    return;

        //}

        //var intersect, intersects = ray.intersectScene(scene);

        //if (intersects.length > 0) {

        //    //intersect = intersects[0].object == brush ? intersects[1] : intersects[0];

        //    //if (intersect) {

        //    //    if (isShiftDown) {

        //    //        if (intersect.object != plane) {

        //    //            scene.removeObject(intersect.object);

        //    //        }

        //    //    } else {

        //    //        var position = new THREE.Vector3().add(intersect.point, intersect.object.matrixRotation.transform(intersect.face.normal.clone()));

        //    //        var voxel = new THREE.Mesh(cube, new THREE.MeshColorFillMaterial(colors[color]));
        //    //        voxel.position.x = Math.floor(position.x / 50) * 50 + 25;
        //    //        voxel.position.y = Math.floor(position.y / 50) * 50 + 25;
        //    //        voxel.position.z = Math.floor(position.z / 50) * 50 + 25;
        //    //        voxel.overdraw = true;
        //    //        scene.addObject(voxel);

        //    //    }

        //    //}

        //}

        //updateHash();
        interact();
        render();

    }

    function onDocumentMouseWheel(event) {

        radious -= event.wheelDeltaY / 1000;

        camera.position.x = radious * Math.sin(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
        camera.position.y = radious * Math.sin(phi * Math.PI / 360);
        camera.position.z = radious * Math.cos(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
        camera.updateMatrix();

        interact();
        render();

    }

    //document.addEventListener('mousemove', onDocumentMouseMove, false);
    //document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);

    //document.addEventListener('mousewheel', onDocumentMouseWheel, false);

    function interact() {
        //console.log(camera.position.x);
        //console.log(camera.position.y);
        //console.log(camera.position.z);
        //if (objectHovered) {

        //    objectHovered.material[0].color.a = 1;
        //    objectHovered.material[0].color.updateStyleString();
        //    objectHovered = null;

        //}

        //var position, intersect, intersects = ray.intersectScene(scene);

        //if (intersects.length > 0) {

        //    intersect = intersects[0].object != brush ? intersects[0] : intersects[1];

        //    if (intersect) {

        //        if (isShiftDown) {

        //            if (intersect.object != plane) {

        //                objectHovered = intersect.object;
        //                objectHovered.material[0].color.a = 0.5;
        //                objectHovered.material[0].color.updateStyleString();

        //                return;

        //            }

        //        } else {

        //            position = new THREE.Vector3().add(intersect.point, intersect.object.matrixRotation.transform(intersect.face.normal.clone()));

        //            brush.position.x = Math.floor(position.x / 50) * 50 + 25;
        //            brush.position.y = Math.floor(position.y / 50) * 50 + 25;
        //            brush.position.z = Math.floor(position.z / 50) * 50 + 25;

        //            return;

        //        }

        //    }

        //}

        //brush.position.y = 2000;

    }

    function animate() {
        requestAnimationFrame(animate);
        render();
        update();
    }

    function update() {
        if (keyboard.pressed("z")) {
            // do something
        }
        var delta = clock.getDelta();
        //customUniforms.time.value += delta;
        controls.update();
    }

    function render() {
        renderer.render(scene, camera);
        controls.update();
        //controls.rotateUp(-0.0002);
    }

    //////////////////////////////////////////////////////////////////////////////////
    //      render the scene                        //
    //////////////////////////////////////////////////////////////////////////////////
    onRenderFcts.push(function () {
        render();
    })

    //////////////////////////////////////////////////////////////////////////////////
    //      loop runner                         //
    //////////////////////////////////////////////////////////////////////////////////
    var lastTimeMsec = null
    requestAnimationFrame(function animate(nowMsec) {
        // keep looping
        requestAnimationFrame(animate);
        // measure time
        lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60
        var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
        lastTimeMsec = nowMsec
        // call each update function
        onRenderFcts.forEach(function (onRenderFct) {
            onRenderFct(deltaMsec / 1000, nowMsec / 1000)
        })
    })

    var map = THREE.ImageUtils.loadTexture('images/bolide-red.jpg');

    var material = new THREE.MeshPhongMaterial({
        map: map,
        //bumpMap       : bumpMap,
        //bumpScale   : 0.05,
        //specularMap : specularMap,
        //specular    : new THREE.Color('grey'),
    })

    //material = new THREE.MeshBasicMaterial({ color: 0xFFFF88 });

    //
    var bolideObjects = [];
    //

    function createBolide(index, bolideSize) {
        //var geometry = new THREE.SphereGeometry(bolideSize, 8, 8);
        //var mesh = new THREE.Mesh(geometry, material);

        // base image texture for mesh
        var lavaTexture = new THREE.ImageUtils.loadTexture('images/lava.jpg');
        lavaTexture.wrapS = lavaTexture.wrapT = THREE.RepeatWrapping;
        // multiplier for distortion speed 		
        var baseSpeed = 0.02;
        // number of times to repeat texture in each direction
        var repeatS = repeatT = 4.0;

        // texture used to generate "randomness", distort all other textures
        var noiseTexture = new THREE.ImageUtils.loadTexture('images/cloud.png');
        noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping;
        // magnitude of noise effect
        var noiseScale = 0.5;

        // texture to additively blend with base image texture
        var blendTexture = new THREE.ImageUtils.loadTexture('images/lava.jpg');
        blendTexture.wrapS = blendTexture.wrapT = THREE.RepeatWrapping;
        // multiplier for distortion speed 
        var blendSpeed = 0.01;
        // adjust lightness/darkness of blended texture
        var blendOffset = 0.25;

        // texture to determine normal displacement
        var bumpTexture = noiseTexture;
        bumpTexture.wrapS = bumpTexture.wrapT = THREE.RepeatWrapping;
        // multiplier for distortion speed 		
        var bumpSpeed = 0.15;
        // magnitude of normal displacement
        var bumpScale = bolideSize * 2;

        // use "this." to create global object
        var customUniforms = {
            baseTexture: { type: "t", value: lavaTexture },
            baseSpeed: { type: "f", value: baseSpeed },
            repeatS: { type: "f", value: repeatS },
            repeatT: { type: "f", value: repeatT },
            noiseTexture: { type: "t", value: noiseTexture },
            noiseScale: { type: "f", value: noiseScale },
            blendTexture: { type: "t", value: blendTexture },
            blendSpeed: { type: "f", value: blendSpeed },
            blendOffset: { type: "f", value: blendOffset },
            bumpTexture: { type: "t", value: bumpTexture },
            bumpSpeed: { type: "f", value: bumpSpeed },
            bumpScale: { type: "f", value: bumpScale },
            alpha: { type: "f", value: 1.0 },
            time: { type: "f", value: 1.0 }
        };

        // create custom material from the shader code above
        //   that is within specially labeled script tags
        var customMaterial = new THREE.ShaderMaterial(
        {
            uniforms: customUniforms,
            vertexShader: document.getElementById('vertexShader').textContent,
            fragmentShader: document.getElementById('fragmentShader').textContent
        });

        var bolideGeometry = new THREE.SphereGeometry(bolideSize, 16, 16);
        var bolideMesh = new THREE.Mesh(bolideGeometry, customMaterial);

        onRenderFcts.push(function callback(delta, now) {
            if (!bolideObjects[index]) {
                onRenderFcts.splice(onRenderFcts.indexOf(callback), 1);
                return;
            }

            customUniforms.time.value += delta;
        });

        return bolideMesh;
    }

    var bolideGeometry = new THREE.Geometry();

    function addBolide(index, bol) {

        if (bolideObjects[index]) return;

        var bolideSize = 0.005;
        var bolideRadius = 0.65;

        
        var phi = parseFloat( bol.Latitude.slice(0, -1) );
        var theta = parseFloat( bol.Longitude.slice(0, -1) );

        if( bol.Latitude.slice(-1) == "S" ) phi = -phi;
        if( bol.Longitude.slice(-1) == "W" ) theta = -theta;

        theta += 90;

        var dx = Math.sin(theta * Math.PI / 180) * Math.cos(phi * Math.PI / 180);
        var dy = Math.sin(phi * Math.PI / 180);
        var dz = Math.cos(theta * Math.PI / 180) * Math.cos(phi * Math.PI / 180);

        var bolide = createBolide(index, bolideSize);

        bolide.position.x = bolideRadius * dx;
        bolide.position.y = bolideRadius * dy;
        bolide.position.z = bolideRadius * dz;

        scene.add(bolide);

        onRenderFcts.push(function callback(delta, now) {
            bolideRadius -= delta / 100;

            if (bolideRadius < 0.51 || !bolideObjects[index]) {
                onRenderFcts.splice(onRenderFcts.indexOf(callback), 1);
                return;
            }

            bolide.position.x = bolideRadius * dx;
            bolide.position.y = bolideRadius * dy;
            bolide.position.z = bolideRadius * dz;
        })

        bolideObjects[index] = bolide;

        //for( var i = 0; i < 10; i++ ) {

        ////scene.add(bolide);
        ////bolide.scale.set(bolideSize, bolideSize, bolideSize);

        //bolide.position.x = bolideRadius * Math.sin(theta * Math.PI / 180) * Math.cos(phi * Math.PI / 180);
        //bolide.position.y = bolideRadius * Math.sin(phi * Math.PI / 180);
        //bolide.position.z = bolideRadius * Math.cos(theta * Math.PI / 180) * Math.cos(phi * Math.PI / 180);

        //THREE.GeometryUtils.merge(bolideGeometry, bolide);

        //bolide.matrix.set(new THREE.Matrix4());

        ////theta += 1.5;
        ////phi += 0.1;

        //bolideRadius += 0.005;

        //}
    }

    // other

    /*
    scene.add( new THREE.Mesh( new THREE.CubeGeometry(5, 0.01, 0.01), new THREE.MeshBasicMaterial({ color: 0x0000FF }) ) );
    scene.add( new THREE.Mesh( new THREE.CubeGeometry(0.01, 5, 0.01), new THREE.MeshBasicMaterial({ color: 0x00FF00 }) ) );
    scene.add( new THREE.Mesh( new THREE.CubeGeometry(0.01, 0.01, 5), new THREE.MeshBasicMaterial({ color: 0xFF0000 }) ) );
    */

    THREEx.WindowResize(renderer, camera);
    THREEx.FullScreen.bindKey({ charCode: 'm'.charCodeAt(0) });
    // CONTROLS
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minDistance = 0.65;
    controls.maxDistance = 2;
    controls.noPan = true;
    controls.autoRotate = true;

    function parseJsonDate(jsonDateString) {
        return new Date(parseInt(jsonDateString.replace('/Date(', '')));
    }



    function getJSonData() {
        //for (var i = 0; i < bolideObjects.length; i++) {
        //    scene.remove(bolideObjects[i]);
        //}
        //bolideObjects = [];

        for (var i = 0; i < bolides.length; i++) {
            var visible = false;

            if (new Date(bolides[i].Date).valueOf() >= DateMin.valueOf() && new Date(bolides[i].Date).valueOf() <= DateMax.valueOf()) {

                if (!bolides[i].RadiatedEnergy || ( log10(bolides[i].RadiatedEnergy) >= SelectedEnergyMin && log10(bolides[i].RadiatedEnergy) <= SelectedEnergyMax) ) {

                    if ( !bolides[i].ImpactEnergy || (bolides[i].ImpactEnergy >= SelectedImpactEnergyMin && bolides[i].ImpactEnergy <= SelectedImpactEnergyMax) ) {
                        if (!bolides[i].Altitude || (bolides[i].Altitude >= SelAltitudeMin && bolides[i].Altitude <= SelAltitudeMax)) {
                            addBolide(i, bolides[i]);
                            visible = true;
                        }
                    }
                }
            }

            if(!visible) {
                scene.remove(bolideObjects[i]);
                bolideObjects[i] = null;
            }
        }
        //render();
    }

    function StartAnimation() {
        var temp = StartDateMin;
        var DateEnd = new Date(2015, 11, 31);
        var animate = function () {
            if (temp < DateEnd && !stopAnimation) {
                temp = new Date(temp.getFullYear(), temp.getMonth(), temp.getDate() + 4);
                $("#element").dateRangeSlider("values", StartDateMin, temp);
                window.setTimeout(animate, 100);
            }
            else
            {
                controls.autoRotate = false;
            }
        }
        animate();
    }

    $.getJSON("data/bolides.json", function (data) {

        for (var i = 0; i < data.length; i++) {
            bolides.push(data[i]);
            if (RadiatedEnergyMax < data[i].RadiatedEnergy) {
                RadiatedEnergyMax = data[i].RadiatedEnergy;
            }
            SelectedEnergyMax = log10(RadiatedEnergyMax);

            if (RadiatedEnergyMin > data[i].RadiatedEnergy) {
                RadiatedEnergyMin = data[i].RadiatedEnergy;
            }
            SelectedEnergyMin = log10(RadiatedEnergyMin);

            //
            if (ImpactEnergyMax < data[i].ImpactEnergy) {
                ImpactEnergyMax = data[i].ImpactEnergy;
            }
            SelectedImpactEnergyMax = ImpactEnergyMax;

            if (ImpactEnergyMin > data[i].ImpactEnergy) {
                ImpactEnergyMin = data[i].ImpactEnergy;
            }
            SelectedImpactEnergyMin = ImpactEnergyMin;

            //
            if (AltitudeMax < data[i].Altitude) {
                AltitudeMax = data[i].Altitude;
            }
            SelAltitudeMax = AltitudeMax;

            if (AltitudeMin > data[i].Altitude) {
                AltitudeMin = data[i].Altitude;
            }
            SelAltitudeMin = AltitudeMin;

            //
        }
        RESlider();
        IESlider();
        AltSlider();
        StartAnimation();
    });

});
