// @target aftereffects
// Flow Killer v2.2 — Host ExtendScript
// AE CC 2020+ — fixes selection loss on panel focus

function ok(data) { return JSON.stringify({ ok: true,  data: data }); }
function err(msg)  { return JSON.stringify({ ok: false, data: msg  }); }

function getPropDim(prop) {
  try { var v = prop.value; return (v instanceof Array) ? v.length : 1; }
  catch(e) { return 1; }
}

function walkProps(layer, fn) {
  function walk(pg) {
    try {
      for (var i = 1; i <= pg.numProperties; i++) {
        var p = pg.property(i);
        try { fn(p); } catch(e) {}
        try { if (p.numProperties > 0) walk(p); } catch(e) {}
      }
    } catch(e) {}
  }
  walk(layer);
}

function findPropByMatchName(layer, mn) {
  var found = null;
  walkProps(layer, function(p) {
    if (!found && p.matchName === mn) found = p;
  });
  return found;
}

function getLayerProps(layer) {
  var props = [];
  walkProps(layer, function(p) {
    try {
      if (p.canVaryOverTime && p.numKeys > 0) {
        var outSpd = 0, outInf = 33.33, inSpd = 0, inInf = 33.33;
        try { var oe = p.keyOutTemporalEase(1); outSpd = oe[0].speed; outInf = oe[0].influence; } catch(e) {}
        try { var ie = p.keyInTemporalEase(p.numKeys); inSpd = ie[0].speed; inInf = ie[0].influence; } catch(e) {}
        props.push({
          name: p.name, matchName: p.matchName, numKeys: p.numKeys, dim: getPropDim(p),
          outSpeed: outSpd, outInf: outInf, inSpeed: inSpd, inInf: inInf
        });
      }
    } catch(e) {}
  });
  return props;
}

// ── Read selection — falls back to ALL layers if nothing selected ──

function fk_readSelection() {
  var comp = app.project.activeItem;
  if (!comp || !(comp instanceof CompItem))
    return err('No active composition. Double-click a comp in the Project panel.');

  // Try selected layers first, fall back to all layers
  var selected = comp.selectedLayers;
  var layersToScan = (selected && selected.length > 0) ? selected : null;

  // If nothing selected, scan all layers
  if (!layersToScan) {
    layersToScan = [];
    for (var i = 1; i <= comp.numLayers; i++) {
      try { layersToScan.push(comp.layer(i)); } catch(e) {}
    }
  }

  var out = {
    compName: comp.name,
    fps: comp.frameRate,
    duration: comp.duration,
    layers: []
  };

  for (var li = 0; li < layersToScan.length; li++) {
    var layer = layersToScan[li];
    var props = getLayerProps(layer);
    if (props.length > 0) {
      out.layers.push({ name: layer.name, index: layer.index, props: props });
    }
  }

  if (out.layers.length === 0)
    return err('No keyframed properties found in this comp. Add at least 2 keyframes to a property.');

  return ok(out);
}

// ── Apply easing LIVE ─────────────────────────────────────

function fk_applyEasing(jsonStr) {
  var p;
  try { p = JSON.parse(jsonStr); } catch(e) { return err('JSON: ' + e.message); }

  var comp = app.project.activeItem;
  if (!comp || !(comp instanceof CompItem)) return err('No active comp.');

  var layer;
  try { layer = comp.layer(p.layerIndex); } catch(e) { return err('Layer not found.'); }

  var prop = findPropByMatchName(layer, p.matchName);
  if (!prop) return err('Property not found: ' + p.matchName);
  if (prop.numKeys < 1) return err('No keyframes on property.');

  var dim    = getPropDim(prop);
  var outSpd = Math.max(0, Math.min(10000, p.outSpeed || 0));
  var outInf = Math.max(0.1, Math.min(100, p.outInf   || 33.33));
  var inSpd  = Math.max(0, Math.min(10000, p.inSpeed  || 0));
  var inInf  = Math.max(0.1, Math.min(100, p.inInf    || 33.33));
  var midSpd = (outSpd + inSpd) / 2;
  var midInf = (outInf + inInf) / 2;

  app.beginUndoGroup('Flow Killer');
  try {
    for (var ki = 1; ki <= prop.numKeys; ki++) {
      prop.setInterpolationTypeAtKey(ki, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
      var isFirst = (ki === 1), isLast = (ki === prop.numKeys);
      var tos = isLast  ? 0     : (isFirst ? outSpd : midSpd);
      var toi = isLast  ? 33.33 : (isFirst ? outInf : midInf);
      var tis = isFirst ? 0     : (isLast  ? inSpd  : midSpd);
      var tii = isFirst ? 33.33 : (isLast  ? inInf  : midInf);
      var inArr = [], outArr = [];
      for (var d = 0; d < dim; d++) {
        inArr.push(new KeyframeEase(tis, tii));
        outArr.push(new KeyframeEase(tos, toi));
      }
      prop.setTemporalEaseAtKey(ki, inArr, outArr);
    }
    app.endUndoGroup();
    return ok('OK · ' + prop.numKeys + ' keys on "' + prop.name + '"');
  } catch(e) {
    app.endUndoGroup();
    return err('Error: ' + e.message);
  }
}

// ── Apply to ALL layers in comp ───────────────────────────

function fk_applyToAll(jsonStr) {
  var p;
  try { p = JSON.parse(jsonStr); } catch(e) { return err('JSON parse error.'); }

  var comp = app.project.activeItem;
  if (!comp || !(comp instanceof CompItem)) return err('No active comp.');

  // Use selected layers, or fall back to all
  var selected = comp.selectedLayers;
  var layers = (selected && selected.length > 0) ? selected : [];
  if (layers.length === 0) {
    for (var i = 1; i <= comp.numLayers; i++) {
      try { layers.push(comp.layer(i)); } catch(e) {}
    }
  }

  var outSpd = Math.max(0, Math.min(10000, p.outSpeed || 0));
  var outInf = Math.max(0.1, Math.min(100, p.outInf   || 33.33));
  var inSpd  = Math.max(0, Math.min(10000, p.inSpeed  || 0));
  var inInf  = Math.max(0.1, Math.min(100, p.inInf    || 33.33));
  var midSpd = (outSpd + inSpd) / 2;
  var midInf = (outInf + inInf) / 2;

  app.beginUndoGroup('Flow Killer — Apply All');
  var total = 0;
  for (var li = 0; li < layers.length; li++) {
    walkProps(layers[li], function(prop) {
      try {
        if (!prop.canVaryOverTime || prop.numKeys === 0) return;
        var dim = getPropDim(prop);
        for (var ki = 1; ki <= prop.numKeys; ki++) {
          prop.setInterpolationTypeAtKey(ki, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
          var isFirst = (ki === 1), isLast = (ki === prop.numKeys);
          var inArr = [], outArr = [];
          for (var d = 0; d < dim; d++) {
            inArr.push(new KeyframeEase(
              isFirst ? 0     : (isLast ? inSpd  : midSpd),
              isFirst ? 33.33 : (isLast ? inInf  : midInf)
            ));
            outArr.push(new KeyframeEase(
              isLast  ? 0     : (isFirst ? outSpd : midSpd),
              isLast  ? 33.33 : (isFirst ? outInf : midInf)
            ));
          }
          prop.setTemporalEaseAtKey(ki, inArr, outArr);
          total++;
        }
      } catch(e) {}
    });
  }
  app.endUndoGroup();
  return ok('Applied to ' + total + ' keyframe(s).');
}

function _setAllKeys(fn, label) {
  var comp = app.project.activeItem;
  if (!comp || !(comp instanceof CompItem)) return err('No active comp.');
  var selected = comp.selectedLayers;
  var layers = (selected && selected.length > 0) ? selected : [];
  if (layers.length === 0) {
    for (var i = 1; i <= comp.numLayers; i++) {
      try { layers.push(comp.layer(i)); } catch(e) {}
    }
  }
  app.beginUndoGroup('Flow Killer — ' + label);
  var n = 0;
  for (var li = 0; li < layers.length; li++) {
    walkProps(layers[li], function(prop) {
      try {
        if (!prop.canVaryOverTime || !prop.numKeys) return;
        var dim = getPropDim(prop);
        for (var ki = 1; ki <= prop.numKeys; ki++) { fn(prop, ki, dim); n++; }
      } catch(e) {}
    });
  }
  app.endUndoGroup();
  return ok(n + ' keyframes → ' + label);
}

function fk_easyEase() {
  return _setAllKeys(function(prop, ki, dim) {
    prop.setInterpolationTypeAtKey(ki, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
    var arr = []; for (var d = 0; d < dim; d++) arr.push(new KeyframeEase(0, 33.33));
    prop.setTemporalEaseAtKey(ki, arr, arr);
  }, 'Easy Ease');
}

function fk_setLinear() {
  return _setAllKeys(function(prop, ki) {
    prop.setInterpolationTypeAtKey(ki, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
  }, 'Linear');
}

function fk_setHold() {
  return _setAllKeys(function(prop, ki) {
    prop.setInterpolationTypeAtKey(ki, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD);
  }, 'Hold');
}

function fk_getComp() {
  var comp = app.project.activeItem;
  if (!comp || !(comp instanceof CompItem)) return err('No active comp.');
  return ok({ name: comp.name, fps: comp.frameRate, duration: comp.duration, numLayers: comp.numLayers });
}
