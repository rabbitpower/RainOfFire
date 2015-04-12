require(['threex.planets/package.require.js'
], function () {
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    var onRenderFcts = [];
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.z = 1.5;

    var light = new THREE.AmbientLight(0x888888)
    scene.add(light)

    var light = new THREE.DirectionalLight(0xcccccc, 1)
    light.position.set(5, 3, 5)
    scene.add(light)

    //////////////////////////////////////////////////////////////////////////////////
    //      add an object and make it move                  //
    //////////////////////////////////////////////////////////////////////////////////  
    function createEarth() {
        var geometry    = new THREE.SphereGeometry(0.5, 32, 32);

        //var loader = new THREE.DDSLoader();
        //var map = loader.load( 'images/earthmap7k.dds' );

        var map = THREE.ImageUtils.loadTexture('images/earthmap7k.jpg');

        //var bumpMap = THREE.ImageUtils.loadTexture('images/earthbump1k.jpg');
        var specularMap = THREE.ImageUtils.loadTexture('images/earthspec1k.jpg');

        var material    = new THREE.MeshPhongMaterial({
            map     : map,
            //bumpMap       : bumpMap,
            bumpScale   : 0.05,
            specularMap : specularMap,
            specular    : new THREE.Color('grey'),
        })

        var mesh    = new THREE.Mesh(geometry, material)
        return mesh 
    }

    var earthMesh = createEarth();
    scene.add(earthMesh);

    var center = new THREE.Vector3(0, 0, 0);

    onRenderFcts.push(function (delta, now) {
        camera.lookAt(center);
    });

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
    var projector = new THREE.Projector();
    var ray = new THREE.Raycaster(camera.position, null);

    var mouse = { x: 0, y: 0 }
    var mouse3D, isMouseDown = false, onMouseDownPosition = new THREE.Vector2(),
        radious = 1.5, theta = 45, onMouseDownTheta = 45, phi = 60, onMouseDownPhi = 60;

    camera.position.x = radious * Math.sin(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
    camera.position.y = radious * Math.sin(phi * Math.PI / 360);
    camera.position.z = radious * Math.cos(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
    camera.updateMatrix();

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

        event.preventDefault();

        isMouseDown = false;

        onMouseDownPosition.x = event.clientX - onMouseDownPosition.x;
        onMouseDownPosition.y = event.clientY - onMouseDownPosition.y;

        if (onMouseDownPosition.length() > 5) {

            return;

        }

        var intersect, intersects = ray.intersectScene(scene);

        if (intersects.length > 0) {

            //intersect = intersects[0].object == brush ? intersects[1] : intersects[0];

            //if (intersect) {

            //    if (isShiftDown) {

            //        if (intersect.object != plane) {

            //            scene.removeObject(intersect.object);

            //        }

            //    } else {

            //        var position = new THREE.Vector3().add(intersect.point, intersect.object.matrixRotation.transform(intersect.face.normal.clone()));

            //        var voxel = new THREE.Mesh(cube, new THREE.MeshColorFillMaterial(colors[color]));
            //        voxel.position.x = Math.floor(position.x / 50) * 50 + 25;
            //        voxel.position.y = Math.floor(position.y / 50) * 50 + 25;
            //        voxel.position.z = Math.floor(position.z / 50) * 50 + 25;
            //        voxel.overdraw = true;
            //        scene.addObject(voxel);

            //    }

            //}

        }

        updateHash();
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

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);

    document.addEventListener('mousewheel', onDocumentMouseWheel, false);

    function interact() {

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

    function render() {
        renderer.render(scene, camera);
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

    var material    = new THREE.MeshPhongMaterial({
        map     : map,
        //bumpMap       : bumpMap,
        //bumpScale   : 0.05,
        //specularMap : specularMap,
        //specular    : new THREE.Color('grey'),
    })

    //material = new THREE.MeshBasicMaterial({ color: 0xFFFF88 });

    function createBolide() {
        var geometry = new THREE.SphereGeometry(0.5, 16, 16);
        var mesh = new THREE.Mesh(geometry, material);
        return mesh ;
    }

    //
    var bolides = [];
    //
    function addBolide(bol) {

        //if( bol.Latitude != "54.8N" ) return;

        var bolideSize = 0.01;
        var bolideRadius = 0.54;

        
        var phi = parseFloat( bol.Latitude.slice(0, -1) );
        var theta = parseFloat( bol.Longitude.slice(0, -1) );

        if( bol.Latitude.slice(-1) == "S" ) phi = -phi;
        if( bol.Longitude.slice(-1) == "W" ) theta = -theta;

        theta += 90;

        //phi = 0; theta = 90;

        console.log( phi + " : " + theta );

        for( var i = 0; i < 1; i++ ) {

        var bolide = createBolide();
        scene.add(bolide);
        bolide.scale.set(bolideSize, bolideSize, bolideSize);

        bolide.position.x = bolideRadius * Math.sin(theta * Math.PI / 180) * Math.cos(phi * Math.PI / 180);
        bolide.position.y = bolideRadius * Math.sin(phi * Math.PI / 180);
        bolide.position.z = bolideRadius * Math.cos(theta * Math.PI / 180) * Math.cos(phi * Math.PI / 180);
        bolide.updateMatrix();

            theta+=1.5;

        }
    }

    // other

    /*
    scene.add( new THREE.Mesh( new THREE.CubeGeometry(5, 0.01, 0.01), new THREE.MeshBasicMaterial({ color: 0x0000FF }) ) );
    scene.add( new THREE.Mesh( new THREE.CubeGeometry(0.01, 5, 0.01), new THREE.MeshBasicMaterial({ color: 0x00FF00 }) ) );
    scene.add( new THREE.Mesh( new THREE.CubeGeometry(0.01, 0.01, 5), new THREE.MeshBasicMaterial({ color: 0xFF0000 }) ) );
    */

    $.getJSON("data/bolides.json", function (data) {
        //alert(data);
        
        for(var i=0;i<data.length; i++){
            bolides.push(data[i]);
            addBolide(data[i]);
            //break;
        }

    });
})
