
function applyFlowCurve(curve){
    var comp = app.project.activeItem;
    if(!(comp instanceof CompItem)){alert("Open comp");return;}
    var layer=comp.selectedLayers[0];
    if(!layer){alert("Select layer");return;}
    var prop=layer.selectedProperties[0];
    if(!prop||!prop.isTimeVarying){alert("Select animated property");return;}

    app.beginUndoGroup("Flow Killer Apply");

    for(var i=1;i<=prop.numKeys;i++){
        var influenceIn = Math.max(1,Math.min(100,100-curve.p1.y/2));
        var influenceOut = Math.max(1,Math.min(100,100-curve.p2.y/2));
        var easeIn = new KeyframeEase(0,influenceIn);
        var easeOut = new KeyframeEase(0,influenceOut);
        prop.setTemporalEaseAtKey(i,[easeIn],[easeOut]);
    }

    app.endUndoGroup();
}
