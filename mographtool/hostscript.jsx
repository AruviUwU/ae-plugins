// =========================================
// AE TOOLPACK — Auto Stagger, BG From Text,
// Bounce In, Auto Null Controller
// =========================================

// ================================
// 1. AUTO NULL CONTROLLER
// ================================
function autoNullController() {
    var comp = app.project.activeItem;

    if (!(comp instanceof CompItem)) {
        alert("Please select a composition.");
        return;
    }
    if (comp.selectedLayers.length === 0) {
        alert("Please select a layer.");
        return;
    }

    app.beginUndoGroup("Auto Null Controller");

    var sel = comp.selectedLayers;

    for (var i = 0; i < sel.length; i++) {
        var layer = sel[i];

        var nullLayer = comp.layers.addNull();
        nullLayer.name = "CTRL_" + layer.name;
        nullLayer.property("Scale").setValue([60, 60]);

        var pos = layer.property("Position").value;
        nullLayer.property("Position").setValue(pos);

        if (layer.threeDLayer) {
            nullLayer.threeDLayer = true;
            var p = nullLayer.property("Position").value;
            nullLayer.property("Position").setValue([p[0], p[1], layer.property("Position").value[2]]);
        }

        layer.parent = nullLayer;
    }

    app.endUndoGroup();
}




// ================================
// 2. AUTO STAGGER (offset layer)
// ================================
function autoStagger(offsetFrames) {

    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("Please select a composition.");
        return;
    }
    if (comp.selectedLayers.length < 2) {
        alert("Please select at least TWO layers.");
        return;
    }

    app.beginUndoGroup("Auto Stagger");

    var sel = comp.selectedLayers;
    sel.sort(function(a, b) { return a.index - b.index; });

    var offset = offsetFrames / comp.frameRate;

    for (var i = 0; i < sel.length; i++) {
        sel[i].startTime += offset * i;
    }

    app.endUndoGroup();
}




// ===================================
// 3. AUTO BG FROM TEXT
// ===================================
function autoBGFromText(padding) {

    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("Please select a composition.");
        return;
    }

    if (comp.selectedLayers.length === 0 ||
        !(comp.selectedLayers[0] instanceof TextLayer))
    {
        alert("Please select a TEXT layer.");
        return;
    }

    app.beginUndoGroup("Auto BG From Text");

    var textLayer = comp.selectedLayers[0];
    var rect = textLayer.sourceRectAtTime(comp.time, false);

    // Create BG Shape
    var shapeLayer = comp.layers.addShape();
    shapeLayer.name = "BG_" + textLayer.name;

    var contents = shapeLayer.property("Contents");
    var rectGrp = contents.addProperty("ADBE Vector Group");
    rectGrp.name = "BG";

    var rectPath = rectGrp.property("Contents").addProperty("ADBE Vector Shape - Rect");
    var fill = rectGrp.property("Contents").addProperty("ADBE Vector Graphic - Fill");

    fill.property("Color").setValue([0, 0, 0]); // hitam default
    fill.property("Opacity").setValue(80);      // 80% opacity

    rectPath.property("Size").setValue([
        rect.width + padding * 2,
        rect.height + padding * 2
    ]);

    shapeLayer.property("Position").setValue([
        rect.left + rect.width / 2 + padding,
        rect.top + rect.height / 2 + padding
    ]);

    shapeLayer.moveBefore(textLayer);

    app.endUndoGroup();
}




// =======================================
// 4. BOUNCE IN ANIMATION (scale bounce)
// =======================================
function bounceIn() {

    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("Please select a composition.");
        return;
    }
    if (comp.selectedLayers.length === 0) {
        alert("Select a layer first.");
        return;
    }

    app.beginUndoGroup("Bounce In Animation");

    var layer = comp.selectedLayers[0];
    var scale = layer.property("Scale");

    scale.setValueAtTime(comp.time, [0, 0]);
    scale.setValueAtTime(comp.time + 0.3, [110, 110]);
    scale.setValueAtTime(comp.time + 0.45, [90, 90]);
    scale.setValueAtTime(comp.time + 0.6, [100, 100]);

    // Easy Ease for smooth animation
    var k = scale.numKeys;
    for (var i = 1; i <= k; i++) {
        scale.setInterpolationTypeAtKey(i, KeyframeInterpolationType.BEZIER);
    }

    app.endUndoGroup();
}