const mapData = {
title: "我的地图",
theme: {
primary: "#3b82f6",
bg: "#020817",
panel: "rgba(15,23,42,0.75)"
},
image: null,
markers: []
};

const imageInput = document.getElementById("imageInput");
const mapImage = document.getElementById("mapImage");
const markerLayer = document.getElementById("markerLayer");
const infoPanel = document.getElementById("infoPanel");
const mapTitle = document.getElementById("mapTitle");

let markersVisible = true;

function saveState() {
localStorage.setItem(
"interactiveMapData",
JSON.stringify(mapData)
);
}

function loadState() {
const saved = localStorage.getItem("interactiveMapData");

```
if (!saved) return;

const data = JSON.parse(saved);

Object.assign(mapData, data);

mapTitle.value = mapData.title || "我的地图";

if (mapData.image) {
    mapImage.src = mapData.image;
}

renderMarkers();
```

}

imageInput.addEventListener("change", e => {

```
const file = e.target.files[0];

if (!file) return;

const reader = new FileReader();

reader.onload = function(evt) {

    mapData.image = evt.target.result;

    mapImage.src = mapData.image;

    saveState();
};

reader.readAsDataURL(file);
```

});

mapTitle.addEventListener("input", () => {

```
mapData.title = mapTitle.value;

document.title = mapTitle.value;

saveState();
```

});

function renderMarkers() {

```
markerLayer.innerHTML = "";

mapData.markers.forEach((m,index)=>{

    const marker = document.createElement("div");

    marker.className = "marker";

    marker.style.left = m.x + "%";

    marker.style.top = m.y + "%";

    marker.style.background = m.color;

    marker.onclick = ()=>{

        infoPanel.innerHTML = `
            <h2>${m.title}</h2>
            <p>${m.desc}</p>
            <button onclick="deleteMarker(${index})">
            删除标注
            </button>
        `;
    };

    markerLayer.appendChild(marker);
});
```

}

window.deleteMarker = function(index){

```
mapData.markers.splice(index,1);

renderMarkers();

saveState();
```

}

document.getElementById("mapContainer")
.addEventListener("dblclick",(e)=>{

```
if(!mapData.image) return;

const rect =
e.currentTarget.getBoundingClientRect();

const x =
((e.clientX-rect.left)/rect.width)*100;

const y =
((e.clientY-rect.top)/rect.height)*100;

const title =
prompt("标注标题");

if(!title) return;

const desc =
prompt("标注内容");

const color =
prompt(
    "颜色HEX",
    "#3b82f6"
);

mapData.markers.push({
    x,
    y,
    title,
    desc,
    color
});

renderMarkers();

saveState();
```

});

document.getElementById("toggleMarkers")
.addEventListener("click",()=>{

```
markersVisible=!markersVisible;

markerLayer.style.display =
markersVisible ? "block":"none";
```

});

document.getElementById("exportBtn")
.addEventListener("click",()=>{

```
const data =
JSON.stringify(mapData,null,2);

const blob =
new Blob([data],{
    type:"application/json"
});

const url =
URL.createObjectURL(blob);

const a =
document.createElement("a");

a.href=url;

a.download="map-data.json";

a.click();
```

});

loadState();
