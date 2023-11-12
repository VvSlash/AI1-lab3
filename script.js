window.onload = function () {
    let map = L.map('map').setView([53.430127, 14.564802], 13); // 13 to poziom zoomu
    L.tileLayer.provider('Esri.WorldImagery').addTo(map);

    document.getElementById("getLocation").addEventListener("click", function (event) {
        if (!navigator.geolocation) {
            console.log("No geolocation.");
            return;
        }
        navigator.geolocation.getCurrentPosition(position => {
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;

            // Ustawianie widoku mapy na aktualną lokalizację
            map.setView([lat, lon], 16);

            // Tworzenie pinezki i dodawanie jej do mapy
            L.marker([lat, lon]).addTo(map)
                .bindPopup('Tutaj jestem!') // Etykieta
                .openPopup();
        }, console.error);
    });


    document.getElementById("saveButton").addEventListener("click", function () {
        leafletImage(map, function (err, canvas) {
            let rasterMap = document.getElementById("rasterMap");
            let rasterContext = rasterMap.getContext("2d");
            rasterContext.drawImage(canvas, 0, 0, 600, 400);
            createPuzzle();
        });
    });

    function createPuzzle() {
        let rasterMap = document.getElementById("rasterMap");
        let rasterContext = rasterMap.getContext("2d");
        let puzzleArea = document.getElementById("puzzleArea");

        for (let i = 0; i < 16; i++) {
            let x = (i % 4) * 150;
            let y = Math.floor(i / 4) * 100;

            let pieceCanvas = document.createElement("canvas");
            pieceCanvas.id = 'piece' + i;
            pieceCanvas.width = 150;
            pieceCanvas.height = 100;
            let pieceContext = pieceCanvas.getContext("2d");
            pieceContext.drawImage(rasterMap, x, y, 150, 100, 0, 0, 150, 100);
            pieceCanvas.classList.add("puzzle-piece");
            pieceCanvas.draggable = true;
            //let targetDiv = document.createElement("div");
            //targetDiv.classList.add("puzzle-target");
            //targetDiv.dataset.targetId = i;
            //puzzleArea.appendChild(targetDiv);

            document.getElementById("puzzlePieces").appendChild(pieceCanvas);
        }
        setupDragAndDrop();
    }
    function setupDragAndDrop() {
        let pieces = document.querySelectorAll('.puzzle-piece');
        pieces.forEach(piece => {
            piece.addEventListener('dragstart', dragStart);
        });

        let targets = document.querySelectorAll('.puzzle-target');
        targets.forEach(target => {
            target.addEventListener('dragover', dragOver);
            target.addEventListener('drop', drop);
        });
        let puzzlePieces = document.querySelector("#puzzlePieces");
        for (var i = puzzlePieces.children.length; i >= 0; i--) {
            puzzlePieces.appendChild(puzzlePieces.children[Math.random() * i | 0]);
        }
    }

    function dragStart(event) {
        event.dataTransfer.setData("text/plain", this.id);
    }

    function dragOver(event) {
        event.preventDefault();
    }

    function drop(event) {
        event.preventDefault();
        let pieceId = event.dataTransfer.getData("text/plain");
        let piece = document.getElementById(pieceId);
        this.appendChild(piece);
        piece.style.border = "1px solid green";
        checkCompletion();
    }

    function checkCompletion() {
        let targets = document.querySelectorAll('.puzzle-target');
        let completed = true;
        targets.forEach(target => {
            if (target.children.length == 0 || target.children[0].id.replace('piece', '') !== target.dataset.targetId) {
                completed = false;
            }
        });

        if (completed) {
            //alert("Puzzle Completed!");
            console.log("Układanka ułożona!");
            if (!window.Notification) {
                console.log('Browser does not support notifications.');
            } else {
                // Sprawdzenie czy jest pozwolenie na powiadomienia
                if (Notification.permission === 'granted') {
                    var notify = new Notification('Układanka ułożona!');
                } else {
                    // Prośba o uprawnienia
                    Notification.requestPermission().then(function (p) {
                        if (p === 'granted') {
                            var notify = new Notification('Układanka ułożona!');
                        } else {
                            console.log('Użytkownik nie zezwolił na pokazywanie powiadomień');
                        }
                    }).catch(function (err) {
                        console.error(err);
                    });
                }
            }
        }
    }
};