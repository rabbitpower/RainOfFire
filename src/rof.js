require(['threex.planets/package.require.js'
], function () {

    var AU = 1;

    var earthDiameter = 12742; // km
    
    var earthSystemScale = AU * earthDiameter / 149597871; // 0.000085175009111944 * AU;

    var moonScale = 1 * 3474 / earthDiameter;

    var kilometerScale = 1 / earthDiameter; // 6.6845813446703832938943033997781e-9 


    var container = $("#rofpanel").get(0);
    var selectedIndex;
    $("#table-data").hide();
    $("#table-data-mete").hide();
    if (Detector.webgl)
        renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: false });
    else
        renderer = new THREE.CanvasRenderer();

    var DateMin;
    var DateMax;
    var bolides = [];
    var meteorites = [];
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

    var animating = false;
    var stopAnimation = false;

    StartDateMin = new Date(2009, 0, 1);
    var activeTab = -1;
    ///////////////////////////////////////////////
    //var canvas1, context1, texture1, sprite1;
    //canvas1 = document.createElement('canvas');
    ////canvas1.width = 200;
    ////canvas1.height = 100;
    //context1 = canvas1.getContext('2d');
    //context1.font = "Bold 20px Arial";
    //context1.fillStyle = "rgba(1,1,1,0.95)";
    //context1.fillText('Hello, world!', 0, 20);

    //// canvas contents will be used for a texture
    //texture1 = new THREE.Texture(canvas1)
    //texture1.needsUpdate = true;
    //var spriteMaterial = new THREE.SpriteMaterial({ map: texture1 });
    //sprite1 = new THREE.Sprite(spriteMaterial);

    var sprite1 = makeTextSprite(" World! ",
		{ fontsize: 32, fontface: "Georgia", borderColor: { r: 0, g: 0, b: 255, a: 1.0 } });
    sprite1.scale.set(0.2, 0.1, 0.5);
    sprite1.position.set(0.50, 0.50, 0.50);
 

    ////////////////////////////////////////////////


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


        arrows: true,
        valueLabels: "change",
        durationIn: 500,
        durationOut: 2000,
        symmetricPositionning: true,
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

    function apparentMagnitude(Joules, d) {
        var f_bolid = Joules / (4 * 3.14 * (d * d));
        var f_vega = 2.775764 / 100000000;
        var app_mag = -2.5 * log10(f_bolid / f_vega);
        return app_mag;
    }


    function infoPanel(index) {
        if (($("#info-panel").tabs("option", "active")) == 0) {
            $("#table-data-mete").hide();
            var rad_en = bolides[index].RadiatedEnergy;
            var distance = bolides[index].Altitude;
            var app_mag = apparentMagnitude(rad_en, distance * 1000);
            $("#datetime").text(bolides[index].Date);
            $("#latitude").text(bolides[index].Latitude);
            $("#longtitude").text(bolides[index].Longitude);
            $("#altitude").text(distance);
            $("#velocity").text(bolides[index].Velocity);
            $("#vx").text(bolides[index].vx);
            $("#vy").text(bolides[index].vy);
            $("#vz").text(bolides[index].vz);
            $("#raden").text(rad_en);
            $("#imen").text(bolides[index].ImpactEnergy);
            if (distance != null) {
                $("#appMag").text(app_mag);
            }
            else {
                $("#appMag").text("");
            }
            $("#table-data").show();
       }
        if (($("#info-panel").tabs("option", "active")) == 1) {
            $("#table-data").hide();
           $("#Mname").text(meteorites[index].name);
           $("#Mtype").text(meteorites[index].recclass);
           $("#Mclass").text(MeteoriteClasses[meteorites[index].recclass]);
           $("#Mmass").text(meteorites[index].mass);
           $("#Mfall").text(meteorites[index].fall);
           $("#Myear").text(meteorites[index].year);
           $("#Mlatitude").text(meteorites[index].reclat);
           $("#Mlongtitude").text(meteorites[index].reclong);
           

           $("#table-data-mete").show();

       }
    }

    var idlist = [];
    $("#selectable").selectable({
        selected: function (event, ui) {
            idlist = [];
            idlist.push(ui.selected.id);
            for (var i = 0; i < idlist.length; i++) {
                selectedIndex = idlist[0];
                infoPanel(idlist[0]);
                SelectionUpdate();
            }
        }
    });

    $("#selectable2").selectable({
        selected: function (event, ui) {
            idlist = [];
            idlist.push(ui.selected.id);
            for (var i = 0; i < idlist.length; i++) {
                selectedIndex = idlist[0];
                infoPanel(idlist[0]);
                SelectionUpdate();
            }
        }
    });

    function setNextItem(newItem, id) {
        return $('<li id="' + id + '">' + newItem + '</li>');
    }

    function populateABlist() {

        for (var i = 0; i < bolideListData.length; i++) {
         
            setNextItem(bolideListData[i].Date, bolideListData[i].id)
                 .addClass("ui-widget-content")
                 .appendTo("#selectable");
        }
    };

    $("#element").bind("valuesChanging", function (e, data) {
        DateMin = data.values.min;
        DateMax = data.values.max;
        $("#selectable").empty();
        populateABlist();
        stopAnimation = true;
        getJSonData();
    });

    $("#element").bind("valuesChanged", function (e, data) {
        DateMin = data.values.min;
        DateMax = data.values.max;
        $("#selectable").empty();
        populateABlist();
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

    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    var onRenderFcts = [];
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, renderer.domElement.width / renderer.domElement.height, earthSystemScale * 0.1, 20000);
    camera.up.set(0, 0, 1);
    camera.position.x = 0.5369996722951439 * earthSystemScale;
    camera.position.y = 1.1648934719530957 * earthSystemScale;
    camera.position.z = 1.1496685032579688 * earthSystemScale;

    var light = new THREE.AmbientLight(0x888888)
    scene.add(light)

    /////////////
   // scene.add(sprite1);
    //////////////////
    //////////////////////////////////////////////////////////////////////////////////
    //      add an object and make it move                  //
    //////////////////////////////////////////////////////////////////////////////////  
    function createEarth() {
        var geometry = new THREE.SphereGeometry(0.5, 64, 32);

        //var loader = new THREE.DDSLoader();
        //var map = loader.load( 'images/earthmap7k.dds' );

        var map = THREE.ImageUtils.loadTexture('images/earthmap8k.jpg');

        //var bumpMap = THREE.ImageUtils.loadTexture('images/earthbump1k.jpg');
        var specularMap = THREE.ImageUtils.loadTexture('images/earthspec1k_optimized2.jpg');

        var material = new THREE.MeshLambertMaterial({
            map: map,
            //bumpMap       : bumpMap,
            bumpScale: 0.05,
            specularMap: specularMap,
            specular: new THREE.Color('grey'),
            //side: THREE.DoubleSide
        })

        var mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));

        return mesh
    }

    var earthSystemEcliptic = new THREE.Group();

    // inside the ecliptic system we have the earth and 'on'-earth objects tilted and rotating along the earth's axis
    var earthSystemGeographic = new THREE.Group();

    earthSystemEcliptic.add(earthSystemGeographic);

    var earthMesh = createEarth();

    earthSystemGeographic.add(earthMesh);

    //var earthSystem2 = new THREE.Group();
    //earthSystem2.add(createEarth());

    var cloudMesh = THREEx.Planets.createEarthCloud()
    cloudMesh.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));

    earthSystemGeographic.add(cloudMesh)

    onRenderFcts.push(function (delta, now) {
        cloudMesh.rotateY(1 / 16 * delta)
    })

    var moonMesh = THREEx.Planets.createMoon();

    moonMesh.castShadow = true;
    moonMesh.scale.set(moonScale, moonScale, moonScale);
    moonMesh.position.x = 1;

    earthSystemEcliptic.add(moonMesh);

    // in the solar system:
    var solarSystem = new THREE.Group();

    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = false;

    renderer.shadowCameraNear = camera.near;
    renderer.shadowCameraFar = camera.far;
    renderer.shadowCameraFov = 45;

    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadowDarkness = 1;

    solarSystem.add(light)

    function toJED(d) {
        var timeStamp = d.getTime();
        //return timeStamp / (1000 * 60 * 60 * 24) + 2440587.5;
        return timeStamp / (1000 * 60 * 60 * 24) + 2440587.5;
    }


    var jed = toJED(new Date());

    var mercury = new Orbit3D(Ephemeris.mercury,
    {
        color: 0x913CEE, width: 1, jed: jed,
        display_color: new THREE.Color(0x913CEE),
        name: 'Mercury'
    });
    solarSystem.add(mercury.getEllipse());
    var venus = new Orbit3D(Ephemeris.venus,
        {
            color: 0xFF7733, width: 1, jed: jed,
            display_color: new THREE.Color(0xFF7733),
            name: 'Venus'
        });
    solarSystem.add(venus.getEllipse());
    var earth = new Orbit3D(Ephemeris.earth,
        {
            color: 0x009ACD, width: 1, jed: jed,
            display_color: new THREE.Color(0x009ACD),
            name: 'Earth'
        });
    solarSystem.add(earth.getEllipse());
    var mars = new Orbit3D(Ephemeris.mars,
        {
            color: 0xA63A3A, width: 1, jed: jed,
            display_color: new THREE.Color(0xA63A3A),
            name: 'Mars'
        });
    solarSystem.add(mars.getEllipse());
    var jupiter = new Orbit3D(Ephemeris.jupiter,
        {
            color: 0xFF7F50, width: 1, jed: jed,
            display_color: new THREE.Color(0xFF7F50),
            name: 'Jupiter'
        });
    solarSystem.add(jupiter.getEllipse());

    planets = [mercury, venus, earth, mars, jupiter];

    var texture = THREE.ImageUtils.loadTexture('images/sunsprite.png');
    var sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: texture,
        blending: THREE.AdditiveBlending,
        useScreenCoordinates: false,
        color: 0xffffff
    }));
    sprite.scale.x = 1;
    sprite.scale.y = 1;
    sprite.scale.z = 1;
    solarSystem.add(sprite);

    scene.add(solarSystem);

    var toTheSun = new THREE.Mesh(new THREE.BoxGeometry(3000, 0.01, 0.01), new THREE.MeshBasicMaterial({ color: 0xFF0000, side: THREE.DoubleSide }));
    toTheSun.scale.set(earthSystemScale, earthSystemScale, earthSystemScale);
    toTheSun.updateMatrix();
    var toTheSunMatrix = new THREE.Matrix4().copy(toTheSun.matrix);
    //scene.add(toTheSun);

    var start = new Date().getTime();

    function updateEarthSystem() {
        // TODO: Set earth's tilted axis and position
        //if (!stopAnimation) {
        //    jed = toJED($("#element").dateRangeSlider("values").max);
        //}
        //else {
        //jed = 2451545 - 10; //0.25;// toJED(new Date());

        var date = new Date(); //$("#element").dateRangeSlider("values").max;// new Date();

        //var date = new Date(2015, 2, 20, 10, 41);

        jed = toJED(date);// + (new Date().getTime() - start) * 100 / (1000 * 60 * 60 * 24);
        //}

        var matrix = new THREE.Matrix4();

        var epos = earth.getPosAtTime(jed);

        matrix.multiply(new THREE.Matrix4().makeTranslation(epos[0], epos[1], epos[2]));

        matrix.multiply(new THREE.Matrix4().makeScale(earthSystemScale, earthSystemScale, earthSystemScale));

        earthSystemEcliptic.matrix = new THREE.Matrix4();
        earthSystemEcliptic.applyMatrix(matrix);

        var matrix = new THREE.Matrix4();

        var rotationSpeed = 0.99726956632908425925925925925926 // rotations in a day

        var partOfTheDay = jed % rotationSpeed - 1/12;
        var Zangle = partOfTheDay * Math.PI * 2 / rotationSpeed - Math.PI / 2;
        var Yangle = 23.44 / 180 * Math.PI; // orbital tilt;

        // 4rd: rotate the earth to be facing the sun properly
        //matrix.multiply(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));

        // 2nd: tilt the earth
        matrix.multiply(new THREE.Matrix4().makeRotationX(-Yangle));

        // 1st: rotate along the Z axis so we're facing the sun with the proper side
        matrix.multiply(new THREE.Matrix4().makeRotationZ(Zangle));

        earthSystemGeographic.matrix = new THREE.Matrix4();
        earthSystemGeographic.applyMatrix(matrix);

        /* The second Earth: */
        /*
        {
            var matrix = new THREE.Matrix4();

            var j2d = Astronomy.DayValue(date);// + (new Date().getTime() - start) * 1000000 / (1000 * 60 * 60 * 24);
            var epos2 = Astronomy.Earth.EclipticCartesianCoordinates(j2d);

            matrix.multiply(new THREE.Matrix4().makeTranslation(epos2.x, epos2.y, epos2.z));

            matrix.multiply(new THREE.Matrix4().makeScale(earthSystemScale, earthSystemScale, earthSystemScale));

            // 4rd: rotate the earth to be facing the sun properly
            matrix.multiply(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));

            // 3rd: tilt the earth
            matrix.multiply(new THREE.Matrix4().makeRotationY(-Yangle));

            // 2nd: rotate along the Z axis so we're facing the sun with the proper side
            matrix.multiply(new THREE.Matrix4().makeRotationZ(Zangle));

            // 1st: get the earth straight
            matrix.multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));

            earthSystem2.matrix = new THREE.Matrix4();
            earthSystem2.applyMatrix(matrix);
        }
        */
        /* ---------------- */

        /* The Moon: */
        {
            var matrix = new THREE.Matrix4();

            var j2d = Astronomy.DayValue(date);// + (new Date().getTime() - start) * 100 / (1000 * 60 * 60 * 24);
            var epos2 = Astronomy.Moon.GeocentricCoordinates(j2d);

            //matrix.multiply(new THREE.Matrix4().makeTranslation(epos[0], epos[1], epos[2]));
            matrix.multiply(new THREE.Matrix4().makeTranslation(epos2.x / earthSystemScale, epos2.y / earthSystemScale, 0* epos2.z / earthSystemScale));

            matrix.multiply(new THREE.Matrix4().makeScale(moonScale, moonScale, moonScale));

            moonMesh.matrix = new THREE.Matrix4();
            moonMesh.applyMatrix(matrix);
        }
        /* ---------------- */

        //var deltaPos = new THREE.Vector3().copy(camera.position);
        //deltaPos.sub(earthSystem.position);

        solarSystem.matrix = new THREE.Matrix4();

        solarSystem.applyMatrix(new THREE.Matrix4().makeTranslation(-epos[0], -epos[1], -epos[2]));
        //solarSystem.applyMatrix(new THREE.Matrix4().makeTranslation(-epos.x, -epos.y, -epos.z));

        //deltaPos.add(earthSystem.position);

        //camera.position.copy(deltaPos);

        //camera.lookAt(earthSystem.position);
        //earthSystem.matrixWorldNeedsUpdate = true;


        var pos = new THREE.Vector3(epos[0], epos[1], epos[2]);
        //var pos = new THREE.Vector3(epos.x, epos.y, epos.z);
        var angle = pos.angleTo(new THREE.Vector3(0, 1, 0));

        toTheSun.matrix.copy(toTheSunMatrix);
        toTheSun.applyMatrix(new THREE.Matrix4().makeRotationZ(angle - Math.PI / 2));
    }

    updateEarthSystem();

    //scene.add(earthSystem);
    solarSystem.add(earthSystemEcliptic);
    //solarSystem.add(earthSystem2);

    //////////////////////////////////////////////////////////////////////////////////
    //      add star field                          //
    //////////////////////////////////////////////////////////////////////////////////

    var geometry = new THREE.SphereGeometry(10000, 64, 32)
    var material = new THREE.MeshBasicMaterial()
    material.map = THREE.ImageUtils.loadTexture('threex.planets/images/galaxy_starfield.png')
    material.side = THREE.BackSide
    var mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    //////////////////////////////////////////////////////////////////////////////////
    //      Camera Controls                         //
    //////////////////////////////////////////////////////////////////////////////////
    var projector = new THREE.Projector();

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

      
        // update the mouse variable
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;


    }

    function onDocumentMouseMove(event) {

        event.preventDefault();

        if (isMouseDown) {
            ////
            sprite1.position.set(event.clientX, event.clientY - 20, 0);
            ////
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
        interact(event);
        sprite1.position.set((event.clientX / renderer.domElement.width) * 2 - 1, -(event.clientY / renderer.domElement.height) * 2 + 1, 1);

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

    var $trackingOverlay = $('#tracking-overlay');

    function log10(val) {
        return Math.log(val) / Math.LN10;
    }




    function SelectionUpdate() {
        if (selectedIndex == null) {
            $trackingOverlay.css('display', 'none');
            return;
        }
        var p, v, percX, percY, left, top;
        if (($("#info-panel").tabs("option", "active")) == 0) {
            if (!bolideObjects[selectedIndex]) {
                $trackingOverlay.css('display', 'none');
                return;
            }
            v = bolideObjects[selectedIndex].position.clone();
        }
        if (($("#info-panel").tabs("option", "active")) == 1) {
            $trackingOverlay.css('display', 'none');
            return;
           // v = meteoriteObjects[selectedIndex].position.clone();
        }
        v.applyMatrix4(earthSystemGeographic.matrixWorld);
        v.project(camera);
        percX = (v.x + 1) / 2;
        percY = (-v.y + 1) / 2;
        left = percX * renderer.domElement.width;
        top = percY * renderer.domElement.height;
        $trackingOverlay
            .css('display', 'block')
            .css('left', (left - $trackingOverlay.width() / 2) + 'px')
            .css('top', (top - $trackingOverlay.height() / 2) + 'px');
    }

    function interact(event) {

        var raycaster = new THREE.Raycaster();
        var mouse = new THREE.Vector2();

        //function onMouseClick(event) {

        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components

        mouse.x = (event.clientX / renderer.domElement.width) * 2 - 1;
        mouse.y = -(event.clientY / renderer.domElement.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        raycaster.near = camera.near;
        raycaster.far = camera.far;

        //raycaster.origin.copy(camera.position);
        //raycaster.direction.set(coords.x, coords.y, 0.5).unproject(camera).sub(camera.position).normalize();


        if(($("#info-panel").tabs("option", "active")) == 0){
            // calculate objects intersecting the picking ray
            var intersects = raycaster.intersectObjects(bolideObjects, true);
           


            for (var i = 0; i < intersects.length; i++) {
                //
                /////////////////////////////////////////////////////////////////////////////////
                selectedIndex = intersects[i].object.name;
                infoPanel(selectedIndex);
                SelectionUpdate();
                break;

            }
        }
        if(($("#info-panel").tabs("option", "active")) == 1)
        {
            var matrix = new THREE.Matrix4();
            matrix.getInverse(earthSystemGeographic.matrixWorld);

            raycaster.ray.origin.applyMatrix4(matrix);
            raycaster.ray.direction.transformDirection(matrix);

            var intersects = raycaster.intersectObjects(meteoriteObjects, true);
            for (var i = 0; i < intersects.length; i++) {
                // alert(intersects[i].object);
           
                selectedIndex = intersects[i].object.name;

                infoPanel(selectedIndex);
            }
        }
    }

        //}

        function render() {

            // update the picking ray with the camera and mouse position	
            raycaster.setFromCamera(mouse, camera);

            // calculate objects intersecting the picking ray
           // var intersects = raycaster.intersectObjects(bolideObjects, true);
            var intersects = raycaster.intersectObjects(meteoriteObjects, true);
           
            for (var i = 0; i < intersects.length; i++) {
               
                //alert(intersects[i].object);
                //intersects[i].object.material.color.set(0xff0000);

            }
            
           // renderer.render(scene, camera);

        }

        //window.addEventListener('mouseclick', onMouseClick, false);

        //window.requestAnimationFrame(render);

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

    //}

    //function animate() {
    //    requestAnimationFrame(animate);
    //    render();
    //    update();
    //}

    //function update() {
    //    if (keyboard.pressed("z")) {
    //        // do something
    //    }
    //    var delta = clock.getDelta();
    //    //customUniforms.time.value += delta;
    //    controls.update();
    //}

    function render() {

        updateEarthSystem();
        controls.update();
        SelectionUpdate();

        renderer.render(scene, camera);
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
    var meteoriteObjects = [];
    var meteoriteGroup = new THREE.Group({ name: 'meteoriteGroup' });

    function createMeteorites() {

        var material;
       
        var segments = 16;

        var circlesCh = new THREE.Geometry();
        var circlesAch = new THREE.Geometry();
        var circlesIr = new THREE.Geometry();
        var circlesStIr = new THREE.Geometry();
        var circlesDef = new THREE.Geometry();
       
        var Chmat = new THREE.MeshBasicMaterial({
            color: 0x689F38 // green
        });

        var Achmat = new THREE.MeshBasicMaterial({
            color: 0x03A9F4 //blue
        });

        var Irmat = new THREE.MeshBasicMaterial({
            color: 0xFFEB3B // yellow
        });

        var StIrmat = new THREE.MeshBasicMaterial({
            color: 0xFF5722 //orange
        });

        var Defmat = new THREE.MeshBasicMaterial({
            color: 0x9b59b6 //purple
        });
        var minr, maxr;
        for (var i = 0; i < 1000; i++){// meteorites.length; i++) {
           
            var radius = 0.001;
           
            if (meteorites[i].mass > 1) {
                radius = 0.0004 * Math.pow(meteorites[i].mass, 1 / 4);
                


                // radius = 0.001 * Math.log(meteorites[i].mass);
            }
            var circleGeometry = new THREE.CircleGeometry(radius, segments);
            var circle = new THREE.Mesh(circleGeometry, material);

            circle.rotation.y = Math.PI / 2;
            circle.position.x = 0.51 + (1 - (radius - 0.0004) / (0.0222 - 0.0004)) * (0.52 - 0.51); //0.51;
            
            var m = new THREE.Matrix4();
            var n = new THREE.Matrix4();
            m.makeRotationY((-meteorites[i].reclat / 180) * Math.PI);
            n.makeRotationZ((meteorites[i].reclong / 180) * Math.PI);
            //m.multiply(n);
            n.multiply(m);
            circle.updateMatrix();
            circle.applyMatrix(n);
            meteoriteObjects.push(circle);
            circle.name = i;

            switch(MeteoriteClasses[meteorites[i].recclass]) {
                case "Chondrites":
                 
                    circlesCh.merge(circle.geometry, circle.matrix);
                    break;
                case "Achondrites":
                       
                    circlesAch.merge(circle.geometry, circle.matrix);
                    break;
                case "Stony Irons":
                  
                    circlesIr.merge(circle.geometry, circle.matrix);
                    break;
                case "Irons":
                   
                    circlesStIr.merge(circle.geometry, circle.matrix);
                    break;
                default:
                   
                    circlesDef.merge(circle.geometry, circle.matrix);
            } 

         //   THREE.GeometryUtils.merge(circles, circle);

            circle.matrixWorld = circle.matrix;
            //earthSystemGeographic.add(circle);

        }

        earthSystemGeographic.remove(meteoriteGroup);
        meteoriteGroup = new THREE.Group({ name: 'meteoriteGroup' });

        meteoriteGroup.add(new THREE.Mesh(circlesCh, Chmat));
        meteoriteGroup.add(new THREE.Mesh(circlesIr, Irmat));
        meteoriteGroup.add(new THREE.Mesh(circlesStIr, StIrmat));
        meteoriteGroup.add(new THREE.Mesh(circlesAch, Achmat));
        meteoriteGroup.add(new THREE.Mesh(circlesDef, Defmat));

        earthSystemGeographic.add(meteoriteGroup);
    }

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
        //var bolideMesh = new THREE.Mesh(bolideGeometry, material);

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

        //var bolideSize = 0.005;
        var bolideSize = kilometerScale * 50;

        var bolideMinDistance = 0.51;

        var bolideFallTime = 4;
        var bolideDefaultSpeed = 10; // km/s
        var bolideSpeedScale = 100;

        var bolideTime = bolideFallTime;

        var phi = parseFloat( bol.Latitude.slice(0, -1) );
        var theta = parseFloat( bol.Longitude.slice(0, -1) );

        if( bol.Latitude.slice(-1) == "S" ) phi = -phi;
        if( bol.Longitude.slice(-1) == "W" ) theta = -theta;

        var dx = Math.cos(theta * Math.PI / 180) * Math.cos(phi * Math.PI / 180); // X?
        var dy = Math.sin(theta * Math.PI / 180) * Math.cos(phi * Math.PI / 180); // Y?
        var dz = Math.sin(phi * Math.PI / 180); // Z?

        var dxo = -dx * kilometerScale * bolideDefaultSpeed, dyo = -dy * kilometerScale * bolideDefaultSpeed, dzo = -dz * kilometerScale * bolideDefaultSpeed;

        var bolide = createBolide(index, bolideSize);

        if (bol.vx != null && bol.vy != null && bol.vz != null) {
            var v = new THREE.Vector3(bol.vx, bol.vy, bol.vz);
            //v.divideScalar(100);

            // Taken from NASA's Fireball and Bolide Reports description of the Velocity Components:
            // The pre-impact velocity components are expressed in a geocentric Earth-fixed reference frame defined as follows: 
            // the z-axis is directed along the Earth's rotation axis towards the celestial north pole, 
            // the x-axis lies in the Earth's equatorial plane, directed towards the prime meridian, 
            // and the y-axis completes the right-handed coordinate system.
            //
            // We have to re-map the components to the coordinate system our Earth object is currently in.

            dxo = v.x * kilometerScale;
            dyo = v.y * kilometerScale;
            dzo = v.z * kilometerScale;
        }

        var bolideEndX = bolideMinDistance * dx;
        var bolideEndY = bolideMinDistance * dy;
        var bolideEndZ = bolideMinDistance * dz;

        earthSystemGeographic.add(bolide);
        //earthSystem.matrixWorldNeedsUpdate = true;

        onRenderFcts.push(function callback(delta, now) {
            bolideTime -= delta;

            bolideTime = Math.max(0, bolideTime);

            bolide.position.x = bolideEndX - bolideTime * dxo * bolideSpeedScale;
            bolide.position.y = bolideEndY - bolideTime * dyo * bolideSpeedScale;
            bolide.position.z = bolideEndZ - bolideTime * dzo * bolideSpeedScale;

            if (bolideTime <= 0 || !bolideObjects[index]) {
                onRenderFcts.splice(onRenderFcts.indexOf(callback), 1);
                return;
            }
        })
        bolide.name = index;
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
    var x = new THREE.Mesh(new THREE.CubeGeometry(1, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: 0xFF0000, side: THREE.DoubleSide }));
    x.scale.set(earthSystemScale, earthSystemScale, earthSystemScale);
    x.position.x = 0;
    scene.add(x);
    var y = new THREE.Mesh(new THREE.CubeGeometry(0.00001, 5, 0.00001), new THREE.MeshBasicMaterial({ color: 0x00FF00 }));
    y.position.y = 0;
    var z = new THREE.Mesh(new THREE.CubeGeometry(0.00001, 0.00001, 5), new THREE.MeshBasicMaterial({ color: 0x0000FF }));
    z.position.z = 0;
    scene.add(y);
    scene.add(z);
    */
    

    $(document).ready(function () {
        THREEx.WindowResize(renderer, camera);
    });

    THREEx.FullScreen.bindKey({ charCode: 'm'.charCodeAt(0) });
    // CONTROLS
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    //controls.target = new THREE.Vector3().copy(earthSystem.position);
    controls.target = new THREE.Vector3();
    //controls.target = earthSystem.position;

    controls.minDistance = 0.65 * earthSystemScale;
    controls.maxDistance = 500; // * earthSystemScale;
    controls.noPan = true;
    controls.rotateSpeed = 0.55 / earthSystemScale;
    controls.slowDownDistance = 2 * earthSystemScale;

    controls.targetRadius = 0.5 * earthSystemScale;
    controls.autoRotateSpeed = 0.25;
    controls.rotateLeft(-1);
    controls.autoRotate = true;
    //controls.addEventListener('change', function () { window.setTimeout(SelectionUpdate, 20); });


    function parseJsonDate(jsonDateString) {
        return new Date(parseInt(jsonDateString.replace('/Date(', '')));
    }


    var bolideListData = [];
    function getJSonData() {
        bolideListData = [];
        var j = 0;
        for (var i = 0; i < bolides.length; i++) {
            var visible = false;
            if (new Date(bolides[i].Date).valueOf() >= DateMin.valueOf() && new Date(bolides[i].Date).valueOf() <= DateMax.valueOf()) {

                if (!bolides[i].RadiatedEnergy || ( log10(bolides[i].RadiatedEnergy) >= SelectedEnergyMin && log10(bolides[i].RadiatedEnergy) <= SelectedEnergyMax) ) {

                    if ( !bolides[i].ImpactEnergy || (bolides[i].ImpactEnergy >= SelectedImpactEnergyMin && bolides[i].ImpactEnergy <= SelectedImpactEnergyMax) ) {
                        if (!bolides[i].Altitude || (bolides[i].Altitude >= SelAltitudeMin && bolides[i].Altitude <= SelAltitudeMax)) {
                            bolideListData[j] = bolides[i];
                            j++;
                            addBolide(i, bolides[i]);
                            visible = true;
                        }
                    }
                }
            }

            if(!visible) {
                earthSystemGeographic.remove(bolideObjects[i]);
                bolideObjects[i] = null;
            }
        }
    }

    function StartAnimation() {
        if (animating) return;
        animating = true;

        stopAnimation = false;
        controls.autoRotate = true;

        var temp = StartDateMin;
        var DateEnd = new Date(2015, 11, 31);
        var animate = function () {
            if (temp < DateEnd && !stopAnimation) {
                tempStart = new Date(temp.getFullYear() - 1, temp.getMonth(), temp.getDate());
                temp = new Date(temp.getFullYear(), temp.getMonth(), temp.getDate() + 2);
                $("#element").dateRangeSlider("values", tempStart, temp);
                window.setTimeout(animate, 20);
            }
            else
            {
                controls.autoRotate = false;
                animating = false;
            }
        }
        animate();
    }

    $("#info-panel").tabs({
        active: 0,
        collapsible: true,
        create: function (event, ui) {
            StartAnimation();
        },
        activate: function (event, ui) {

            activeTab = $("#info-panel").tabs("option", "active");
            switch (activeTab) {
                case 0:
                    {
                        selectedIndex = null;
                        earthSystemGeographic.remove(meteoriteGroup);
                        //StartAnimation();
                    }
                    break;
                case 1:
                    {
                        selectedIndex = null;
                        stopAnimation = true;
                        createMeteorites();
                    }
                    break;
                case 2:
                    {
                        selectedIndex = null;
                        stopAnimation = true;
                    }
                    break;
                default:
                    { }

            }
        }
    })




    $.getJSON("data/meteorites.json", function (data) {
        var minr, maxr;
       
        for (var i = 0; i < data.length; i++) {
            meteorites.push(data[i]);
        }
    })

    $.getJSON("data/bolides.json", function (data) {

        for (var i = 0; i < data.length; i++) {
            bolides.push(data[i]);
            data[i].id = i;
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
