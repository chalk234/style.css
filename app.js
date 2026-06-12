// app.js

let stage, layer, markers = [], selectedMarker = null;
let showMarkers = true;

// 页面标题输入
const pageTitleInput = document.getElementById('pageTitleInput');
pageTitleInput.addEventListener('input', () => document.title = pageTitleInput.value);

// 初始化 Konva 舞台
function init() {
    stage = new Konva.Stage({
        container: 'container',
        width: window.innerWidth,
        height: window.innerHeight
    });
    layer = new Konva.Layer();
    stage.add(layer);

    // 默认背景矩形
    layer.add(new Konva.Rect({
        x: 0, y: 0,
        width: stage.width(),
        height: stage.height(),
        fill: '#0a0f1e',
        id: 'bgRect'
    }));
    layer.draw();

    // 鼠标滚轮缩放
    stage.on('wheel', e => {
        e.evt.preventDefault();
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();
        const scaleBy = 1.05;
        const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
        stage.scale({ x: newScale, y: newScale });
        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale
        };
        stage.position({
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale
        });
        stage.batchDraw();
    });

    // 双击地图新增标注
    stage.on('dblclick', () => {
        const pos = stage.getPointerPosition();
        createMarker(pos.x, pos.y);
    });
}

// 上传本地图片
document.getElementById('mapUpload').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
        const img = new Image();
        img.src = evt.target.result;
        img.onload = () => {
            layer.findOne('#bgRect').destroy(); // 删除旧背景
            const ratio = img.width / img.height;
            let w = stage.width();
            let h = stage.width() / ratio;
            if (h > stage.height()) {
                h = stage.height();
                w = h * ratio;
            }
            const bg = new Konva.Image({
                x: (stage.width() - w) / 2,
                y: (stage.height() - h) / 2,
                image: img,
                width: w,
                height: h,
                id: 'bgRect'
            });
            layer.add(bg);
            bg.moveToBottom();
            layer.draw();
        };
    };
    reader.readAsDataURL(file);
});

// 修改背景颜色
document.getElementById('bgColorPicker').addEventListener('input', e => {
    const color = e.target.value;
    const bg = layer.findOne('#bgRect');
    if (bg && bg.className === 'Rect') { // 只改纯色背景
        bg.fill(color);
        layer.draw();
    }
});

// 创建标注
function createMarker(x, y, title = '新标注', content = '描述文字', color = getComputedStyle(document.documentElement).getPropertyValue('--main-color')) {
    const circle = new Konva.Circle({
        x, y, radius: 15,
        fill: color, stroke: '#fff', strokeWidth: 2,
        draggable: true
    });
    circle.title = title;
    circle.content = content;

    circle.on('click', () => {
        selectedMarker = circle;
        document.getElementById('infoCard').style.display = 'flex';
        document.getElementById('markerTitle').value = circle.title;
        document.getElementById('markerContent').value = circle.content;
        document.getElementById('markerColor').value = circle.fill();
    });

    layer.add(circle);
    markers.push(circle);
    layer.draw();
}

// 保存标注
function saveMarker() {
    if (!selectedMarker) return;
    selectedMarker.title = document.getElementById('markerTitle').value;
    selectedMarker.content = document.getElementById('markerContent').value;
    selectedMarker.fill(document.getElementById('markerColor').value);
    document.getElementById('infoCard').style.display = 'none';
    layer.draw();
}

// 切换标注显示
function toggleMarkers() {
    showMarkers = !showMarkers;
    markers.forEach(m => m.visible(showMarkers));
    layer.draw();
}

// 导出 JSON
function exportData() {
    const data = {
        title: pageTitleInput.value,
        bgColor: layer.findOne('#bgRect').fill(),
        markers: markers.map(m => ({
            x: m.x(), y: m.y(), radius: m.radius(),
            fill: m.fill(), title: m.title, content: m.content
        }))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'map-data.json';
    a.click();
}

// 自动调整舞台尺寸
window.addEventListener('resize', () => {
    stage.width(window.innerWidth);
    stage.height(window.innerHeight);
    layer.draw();
});

// 初始化
init();

// 示例标注
createMarker(300, 300, '示例标注1', '描述文字1');
createMarker(700, 500, '示例标注2', '描述文字2');
