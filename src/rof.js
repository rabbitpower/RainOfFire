require(['threex.planets/package.require.js'
], function () {

    var AU = 149597871; // km

    var earthDiameter = 12742; // km
    
    var earthSystemScale = 1 * earthDiameter / AU; // 0.000085175009111944 * AU;

    var moonScale = 1 * 3474 / earthDiameter;

    var kilometerScale = 1 / earthDiameter; // 6.6845813446703832938943033997781e-9 


    var container = $("#rofpanel").get(0);
    var selectedIndex;
    $("#table-data").hide();
    $("#table-data-mete").hide();

    var webgl = true;

    if (Detector.webgl)
        renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: false });
    else {
        renderer = new THREE.CanvasRenderer();
        webgl = false;
    }

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

    var animationT0 = new Date();
    var animationStart = new Date();
    var animationEnd = new Date();
    var animatingCollision = false;
    var animationPreCollisionTime = 2 * 3600 * 1000; // 1 hour before collision
    var animationSpeedUp = 100;

    function startImpactSimulation() {
        animatingCollision = true;
        animationEnd = new Date(bolides[selectedIndex].Date + " UTC");
        animationStart = new Date(animationEnd.getTime() - animationPreCollisionTime);
        animationT0 = new Date();

        earthSystemGeographic.remove(bolideObjects[selectedIndex]);
        solarSystem.remove(bolideObjects[selectedIndex]);
        bolideObjects[selectedIndex] = null;

        addBolide(selectedIndex, bolides[selectedIndex]);
    }

    var idlist = [];
    $("#selectable").selectable({
        selected: function (event, ui) {
            idlist = [];
            idlist.push(ui.selected.id);
            for (var i = 0; i < idlist.length; i++) {
                selectedIndex = idlist[0];
                infoPanel(idlist[0]);

                startImpactSimulation();
                //solarSystem.add(bolideObjects[selectedIndex]);
                //bolideObjects[selectedIndex].scale.set(earthSystemScale, earthSystemScale, earthSystemScale);

                SelectionUpdate();
            }
        }
    });

    $("#selectable").mousedown(function () {
        stopAnimation = true;
    });

    $("#buttonSimulateImpact").button()
      .click(function (event) {
          if (selectedIndex !== null) {
              startImpactSimulation();
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

        var map = THREE.ImageUtils.loadTexture(webgl ? 'images/earthmap8k.jpg' : 'images/earthmap2k.jpg');

        //var bumpMap = THREE.ImageUtils.loadTexture('images/earthbump1k.jpg');
        var specularMap = THREE.ImageUtils.loadTexture('images/earthspec1k_optimized2.jpg');

        var material = new THREE.MeshPhongMaterial({
            map: map,
            //bumpMap       : bumpMap,
            bumpScale: 0.05,
            specularMap: specularMap,
            specular: new THREE.Color('grey'),
            //side: THREE.DoubleSide
        })

        var mesh = new THREE.Mesh(geometry, material);
        //mesh.receiveShadow = true;
        mesh.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));

        return mesh
    }

    var earthSystemEcliptic = new THREE.Group();

    // inside the ecliptic system we have the earth and 'on'-earth objects tilted and rotating along the earth's axis
    var earthSystemGeographic = new THREE.Group();

    earthSystemEcliptic.add(earthSystemGeographic);

    var earthMesh = createEarth();

    earthSystemGeographic.add(earthMesh);

    if (webgl) {
        var cloudMesh = THREEx.Planets.createEarthCloud()
        cloudMesh.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));

        earthSystemGeographic.add(cloudMesh)

        onRenderFcts.push(function (delta, now) {
            cloudMesh.rotateY(1 / 16 * delta)
        })
    }

    var moonMesh = THREEx.Planets.createMoon();

    //moonMesh.castShadow = true;
    moonMesh.scale.set(moonScale, moonScale, moonScale);
    moonMesh.position.x = 1;

    earthSystemEcliptic.add(moonMesh);

    // in the solar system:
    var solarSystem = new THREE.Group();

    //renderer.shadowMapEnabled = true;
    //renderer.shadowMapSoft = false;

    //renderer.shadowCameraNear = camera.near;
    //renderer.shadowCameraFar = camera.far;
    //renderer.shadowCameraFov = 45;

    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 0, 0);
    //light.castShadow = true;
    //light.shadowDarkness = 1;

    solarSystem.add(light)

    function toJED(d) {
        var timeStamp = d.getTime();
        return timeStamp / (1000 * 60 * 60 * 24) + 2440587.5;
    }

    var orbitSegments = webgl ? 1000 : 100;
    var orbitSegmentsEarth = webgl ? 20000 : 100;

    var jed = toJED(new Date());

    var mercury = new Orbit3D(Ephemeris.mercury,
    {
        color: 0x913CEE, width: 1, jed: jed,
        display_color: new THREE.Color(0x913CEE),
        name: 'Mercury'
    });
    solarSystem.add(mercury.getEllipse(orbitSegments));
    var venus = new Orbit3D(Ephemeris.venus,
        {
            color: 0xFF7733, width: 1, jed: jed,
            display_color: new THREE.Color(0xFF7733),
            name: 'Venus'
        });
    solarSystem.add(venus.getEllipse(orbitSegments));
    var earth = new Orbit3D(Ephemeris.earth,
        {
            color: 0x009ACD, width: 1, jed: jed,
            display_color: new THREE.Color(0x009ACD),
            name: 'Earth'
        });
    solarSystem.add(earth.getEllipse(orbitSegmentsEarth));
    var mars = new Orbit3D(Ephemeris.mars,
        {
            color: 0xA63A3A, width: 1, jed: jed,
            display_color: new THREE.Color(0xA63A3A),
            name: 'Mars'
        });
    solarSystem.add(mars.getEllipse(orbitSegments));
    var jupiter = new Orbit3D(Ephemeris.jupiter,
        {
            color: 0xFF7F50, width: 1, jed: jed,
            display_color: new THREE.Color(0xFF7F50),
            name: 'Jupiter'
        });
    solarSystem.add(jupiter.getEllipse(orbitSegments));

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

    function calculateGeographicToEclipticMatrix(julianTime) {
        var earthGeographicMatrix = new THREE.Matrix4();
        var rotationSpeed = 0.99726956632908425925925925925926 // rotations in a day
        var partOfTheDay = julianTime % rotationSpeed - 1 / 12;
        var Zangle = partOfTheDay * Math.PI * 2 / rotationSpeed - Math.PI / 2;
        var Yangle = 23.44 / 180 * Math.PI; // orbital tilt;

        // 2nd: tilt the earth
        earthGeographicMatrix.multiply(new THREE.Matrix4().makeRotationX(-Yangle));
        // 1st: rotate along the Z axis so we're facing the sun with the proper side
        earthGeographicMatrix.multiply(new THREE.Matrix4().makeRotationZ(Zangle));

        return earthGeographicMatrix;
    }

    function calculateEclipticToHeliocentricMatrix(julianTime) {
        var epos = earth.getPosAtTime(julianTime);

        var earthEclipticMatrix = new THREE.Matrix4();
        earthEclipticMatrix.multiply(new THREE.Matrix4().makeTranslation(epos[0], epos[1], epos[2]));
        earthEclipticMatrix.multiply(new THREE.Matrix4().makeScale(earthSystemScale, earthSystemScale, earthSystemScale));

        return earthEclipticMatrix;
    }

    function calculateGeographicToHeliocentricMatrix(julianTime) {

        var earthEclipticMatrix = calculateEclipticToHeliocentricMatrix(julianTime);
        var earthGeographicMatrix = calculateGeographicToEclipticMatrix(julianTime);

        var conversionMatrix = new THREE.Matrix4().multiply(earthEclipticMatrix, earthGeographicMatrix);

        return conversionMatrix;
    }

    function updateEarthSystem() {
        var date = new Date(); //$("#element").dateRangeSlider("values").max;// new Date();

        if (animatingCollision) {
            var time = animationStart.getTime() + (new Date().getTime() - animationT0.getTime()) * animationSpeedUp;
            if (time < animationEnd.getTime() + animationPreCollisionTime) {
                var date = new Date(time);
            } else {
                animatingCollision = false;
            }
        }
        else {
            //date = new Date(2013, 1, 15, 5, 20, 33);
            if (animating) {
                date = $("#element").dateRangeSlider("values").max;
            }
        }

        $('#simulationTime').text(date.toISOString());

        jed = toJED(date); // + (new Date().getTime() - start) * 1000 / (1000 * 60 * 60 * 24);
        //}

        var earthEclipticMatrix = calculateEclipticToHeliocentricMatrix(jed); // new THREE.Matrix4();

        earthSystemEcliptic.matrix = new THREE.Matrix4();
        earthSystemEcliptic.applyMatrix(earthEclipticMatrix);

        var earthGeographicMatrix = calculateGeographicToEclipticMatrix(jed);

        earthSystemGeographic.matrix = new THREE.Matrix4();
        earthSystemGeographic.applyMatrix(earthGeographicMatrix);

        /* The Moon: */
        {
            var matrix = new THREE.Matrix4();

            var j2d = Astronomy.DayValue(date);// + (new Date().getTime() - start) * 100 / (1000 * 60 * 60 * 24);
            var epos2 = Astronomy.Moon.GeocentricCoordinates(j2d);

            matrix.multiply(new THREE.Matrix4().makeTranslation(epos2.x / earthSystemScale, epos2.y / earthSystemScale, epos2.z / earthSystemScale));

            matrix.multiply(new THREE.Matrix4().makeScale(moonScale, moonScale, moonScale));

            moonMesh.matrix = new THREE.Matrix4();
            moonMesh.applyMatrix(matrix);
        }
        /* ---------------- */

        solarSystem.matrix = new THREE.Matrix4();

        solarSystem.applyMatrix(new THREE.Matrix4().makeTranslation(-earthEclipticMatrix.elements[12], -earthEclipticMatrix.elements[13], -earthEclipticMatrix.elements[14]));

        var pos = new THREE.Vector3(earthEclipticMatrix.elements[12], earthEclipticMatrix.elements[13], earthEclipticMatrix.elements[14]);
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
    //      Interaction Controls                         //
    //////////////////////////////////////////////////////////////////////////////////

    function onDocumentMouseUp(event) {

        interact(event);
        sprite1.position.set((event.clientX / renderer.domElement.width) * 2 - 1, -(event.clientY / renderer.domElement.height) * 2 + 1, 1);

        render();
    }

    document.addEventListener('mouseup', onDocumentMouseUp, false);

    var $trackingOverlay = $('#tracking-overlay');

    function log10(val) {
        return Math.log(val) / Math.LN10;
    }




    function SelectionUpdate() {
        if (selectedIndex === null) {
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
        if (bolideObjects[selectedIndex].parent == earthSystemGeographic) {
            v.applyMatrix4(earthSystemGeographic.matrixWorld);
        } else {
            v.applyMatrix4(solarSystem.matrixWorld);
        }
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

    var doZoomIn = false;
    var doZoomOut = false;
    var rotateLeft = false;
    var rotateRight = false;

    function keyDownTextField(e) {
        var keyCode = e.keyCode;
        switch (keyCode) {
            case 49:
                doZoomIn = !doZoomIn;
                break;
            case 50:
                doZoomOut = !doZoomOut;
                break;
            case 51:
                rotateLeft = !rotateLeft;
                break;
            case 52:
                rotateRight = !rotateRight;
                break;
        }        
    }

    document.addEventListener("keydown", keyDownTextField, false);

    function render() {

        updateEarthSystem();

        if (doZoomIn) {
            //if(controls.radius > 1 * earthSystemScale)
                controls.dollyIn(1.004);
        }
        if (doZoomOut) {
            controls.dollyOut(1.004);
        }
        if (rotateLeft) {
            controls.rotateLeft(0.002);
        }
        if (rotateRight) {
            controls.rotateLeft(-0.002);
        }

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

        var bolideMaterial = webgl ? customMaterial : material;

        var bolideMesh = new THREE.Mesh(bolideGeometry, bolideMaterial);

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

    // Geographic coordinates - relative to the Earth's prime meridian and celestial equator
    // Scaled to earthSystemScale

    function getBolideBurstPositionAndVelocity(bol) {
        var bolideMinDistance = 0.51;

        var bolideDefaultSpeed = 10; // km/s

        var phi = parseFloat(bol.Latitude.slice(0, -1));
        var theta = parseFloat(bol.Longitude.slice(0, -1));

        if (bol.Latitude.slice(-1) == "S") phi = -phi;
        if (bol.Longitude.slice(-1) == "W") theta = -theta;

        var dx = Math.cos(theta * Math.PI / 180) * Math.cos(phi * Math.PI / 180);
        var dy = Math.sin(theta * Math.PI / 180) * Math.cos(phi * Math.PI / 180);
        var dz = Math.sin(phi * Math.PI / 180);

        var dxo = -dx * bolideDefaultSpeed, dyo = -dy * bolideDefaultSpeed, dzo = -dz * bolideDefaultSpeed;

        if (bol.vx != null && bol.vy != null && bol.vz != null) {
            var v = new THREE.Vector3(bol.vx, bol.vy, bol.vz);

            dxo = v.x;
            dyo = v.y;
            dzo = v.z;
        }

        var bolideEndX = bolideMinDistance * dx;
        var bolideEndY = bolideMinDistance * dy;
        var bolideEndZ = bolideMinDistance * dz;

        return {
            position: new THREE.Vector3(bolideEndX, bolideEndY, bolideEndZ),
            velocity: new THREE.Vector3(dxo, dyo, dzo)
        };
    }

    var bolideTrajectories = [];
    var bolideFallTrajectories = [];


    function addBolideTrajectory(index, bol, trajectory) {
        if (bolideTrajectories[index]) {
            solarSystem.add(bolideTrajectories[index]);
            return;
        }

        var p0 = new THREE.Vector3();
        var p1 = null;

        //if (bol.ImpactEnergy != 440) return;

        if (!(bol.vx != null && bol.vy != null && bol.vz != null)) {
            //return;
        }

        // calculate heliocentric object position and velocity

        var impactDate = new Date(bol.Date + " UTC");

        var julianTime = toJED(impactDate);

        var bolideMatrix = calculateGeographicToHeliocentricMatrix(julianTime);

        var position = new THREE.Vector3(trajectory.position.x, trajectory.position.y, trajectory.position.z);

        position.applyMatrix4(bolideMatrix);

        var direction = new THREE.Vector3(trajectory.velocity.x, trajectory.velocity.y, trajectory.velocity.z);
        var directionLength = direction.length();
        //var direction = new THREE.Vector3();

        //var inverseBolideMatrix = new THREE.Matrix4().getInverse(bolideMatrix);
        ////
        direction.transformDirection(bolideMatrix);
        direction.multiplyScalar(directionLength / AU);

        var bolideTminus1Matrix = calculateGeographicToHeliocentricMatrix(julianTime - 20 / (24 * 60 * 60));

        var earthCenter0 = new THREE.Vector3();
        earthCenter0.applyMatrix4(bolideMatrix);

        var earthCenterTm1 = new THREE.Vector3();
        earthCenterTm1.applyMatrix4(bolideTminus1Matrix);

        var earthVelocity = earthCenter0.sub(earthCenterTm1);
        earthVelocity.multiplyScalar(1 / 20);

        var positionTminus1 = new THREE.Vector3().copy(position);
        positionTminus1.sub(direction);
        positionTminus1.sub(earthVelocity);

        //var positionTminus1 = new THREE.Vector3(trajectory.position.x, trajectory.position.y, trajectory.position.z);
        //positionTminus1.sub(direction);
        //positionTminus1.applyMatrix4(bolideTminus1Matrix);

        direction.copy(position);
        direction.sub(positionTminus1);

        var pts = []
        var parts = 200000;

        var prevPos = position;

        var t = 720; // s

        // T0
        p0.copy(prevPos); // used for animating the bolide Mesh

        pts.push(prevPos);

        position = positionTminus1;

        // T-1
        var dTm1 = new THREE.Vector3().copy(direction);
        dTm1.multiplyScalar(t);

        position.copy(prevPos);
        position.sub(dTm1);


        pts.push(position);

        var G = 6.67384e-11;
        var Sm = 1.98855e+30;

        // precalculated constants:
        var SmAU = 88855781.211820740911879366426819; // AU-normalized Sun mass: Sm / (AU * AU * 1000 * 1000)
        var SmAUG = 0.00593009266882697733527336990834; // AU-normalized Sun gravitational pull: G * SmAU

        var currentTime = 2;

        var referenceDistance = 0;

        var vt0 = new THREE.Vector3();

        for (var i = 0; i <= parts; i += 1) {
            //if (i == 0) {
            //    vt0.copy(position);
            //}
            //if (i == 10) {
            //    prevPos.copy(vt0);
            //    t *= 10;
            //    vt0.copy(position);
            //}

            //var vector = new THREE.Vector3(position.x - direction.x * i, position.y - direction.y * i, position.z - direction.z * i);
            var nextPos = new THREE.Vector3();
            nextPos.add(position);
            nextPos.add(position);
            nextPos.sub(prevPos);

            var acceleration = SmAUG * t * t / Math.pow(position.length(), 2);

            var accelerationVector = new THREE.Vector3().copy(position);
            accelerationVector.negate();
            accelerationVector.normalize();
            accelerationVector.multiplyScalar(acceleration / (AU * 1000));

            nextPos.add(accelerationVector);

            if (i % 50 == 0) pts.push(nextPos);

            prevPos = position;
            position = nextPos;

            currentTime += t;
            if (!p1 && currentTime * 1000 >= animationPreCollisionTime) {
                p1 = new THREE.Vector3().copy(position);
            }

            if (referenceDistance != 0) {
                var delta0 = new THREE.Vector3().copy(position);
                delta0.sub(p0);

                if (delta0.length() < referenceDistance / 2) {
                    pts.push(nextPos);
                    break;
                }
            } else if (i == 0) {
                var delta0 = new THREE.Vector3().copy(position);
                delta0.sub(p0);
                referenceDistance = delta0.length();
            }
        }

        points = new THREE.Geometry();
        points.vertices = pts;

        var line = new THREE.Line(points,
          new THREE.LineBasicMaterial({
              color: 0xFFFF00,
              linewidth: 1
          }), THREE.LineStrip);

        bolideFallTrajectories[index] = { start: p1, end: p0 };

        bolideTrajectories[index] = line;
        solarSystem.add(line);
    }

    function addBolide(index, bol) {

        if (bolideObjects[index]) {
            return;
        }

        //var bolideSize = 0.005;
        var bolideSize = kilometerScale * 50;

        var bolideFallTime = 30;
        var bolideSpeedScale = 100;

        var bolideTime = 5;

        var trajectory = getBolideBurstPositionAndVelocity(bol);

        var bolide = createBolide(index, bolideSize);

        var customMat = bolide.material;

        bolide.scale.set(earthSystemScale, earthSystemScale, earthSystemScale);

        solarSystem.add(bolide);
        //earthSystemGeographic.add(bolide);
        //earthSystem.matrixWorldNeedsUpdate = true;

        addBolideTrajectory(index, bol, trajectory);

        onRenderFcts.push(function callback(delta, now) {
            if (bolideObjects[index] != bolide) {
                onRenderFcts.splice(onRenderFcts.indexOf(callback), 1);
                return;
            }
            // everything that's not selected we animate as before
            if (selectedIndex != index) {
                if (bolideTime <= 0 || !bolideObjects[index]) {
                    onRenderFcts.splice(onRenderFcts.indexOf(callback), 1);
                    return;
                }
                if (bolide.parent != earthSystemGeographic) {
                    solarSystem.remove(bolide);

                    bolide.scale.set(1, 1, 1);

                    earthSystemGeographic.add(bolide);
                    return;
                }

                bolideTime -= delta;

                bolideTime = Math.max(0, bolideTime);

                bolide.position.x = trajectory.position.x - bolideTime * trajectory.velocity.x * bolideSpeedScale * kilometerScale;
                bolide.position.y = trajectory.position.y - bolideTime * trajectory.velocity.y * bolideSpeedScale * kilometerScale;
                bolide.position.z = trajectory.position.z - bolideTime * trajectory.velocity.z * bolideSpeedScale * kilometerScale;

                if (bolideTime <= 0 || !bolideObjects[index]) {
                    onRenderFcts.splice(onRenderFcts.indexOf(callback), 1);
                    return;
                }
                return;
            }

            var t = 1 - ((new Date().getTime() - animationT0.getTime()) * animationSpeedUp) / animationPreCollisionTime;

            //bolideTime = Math.max(0, bolideTime);

            //bolide.position.x = trajectory.position.x - bolideTime * trajectory.velocity.x * bolideSpeedScale * kilometerScale;
            //bolide.position.y = trajectory.position.y - bolideTime * trajectory.velocity.y * bolideSpeedScale * kilometerScale;
            //bolide.position.z = trajectory.position.z - bolideTime * trajectory.velocity.z * bolideSpeedScale * kilometerScale;

            bolideTime = Math.max(0, t);

            sst = bolideFallTrajectories[index];

            bolide.position.x = sst.end.x - bolideTime * (sst.end.x - sst.start.x);
            bolide.position.y = sst.end.y - bolideTime * (sst.end.y - sst.start.y);
            bolide.position.z = sst.end.z - bolideTime * (sst.end.z - sst.start.z);
            
            if (bolideTime < 0.05) {
                if (bolide.material != customMat) bolide.material = customMat;
            }
            else {
                if (bolide.material == customMat) bolide.material = material;
            }

            if (bolideTime <= 0 || !bolideObjects[index]) {
                //if (!bolideObjects[index]) {
                //}

                if (bolide.parent != earthSystemGeographic) {

                    solarSystem.remove(bolide);

                    bolide.scale.set(1, 1, 1);

                    bolide.position.x = trajectory.position.x;
                    bolide.position.y = trajectory.position.y;
                    bolide.position.z = trajectory.position.z;

                    earthSystemGeographic.add(bolide);
                }

                onRenderFcts.splice(onRenderFcts.indexOf(callback), 1);

                //animatingCollision = false;
                return;
            }
        })
        bolide.name = index;
        bolideObjects[index] = bolide;

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
                solarSystem.remove(bolideObjects[i]);
                bolideObjects[i] = null;
                solarSystem.remove(bolideTrajectories[i]);
            }
        }
        $("#selectable").empty();
        populateABlist();
    }

    function StartAnimation() {
        if (animating) return;
        animating = true;

        stopAnimation = false;
        
        controls.rotateUp(-0.5);
        //controls.autoRotate = true;

        var temp = new Date(2009, 5, 1);
        var DateEnd = new Date();
        var animate = function () {
            if (temp < DateEnd && !stopAnimation) {
                tempStart = new Date(Date.UTC(temp.getFullYear() - 1, temp.getMonth(), temp.getDate()));
                temp = new Date(Date.UTC(temp.getFullYear(), temp.getMonth(), temp.getDate() + 1));
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
