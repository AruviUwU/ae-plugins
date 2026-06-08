
var canvas = document.getElementById("curve");
var ctx = canvas.getContext("2d");

var p1={x:80,y:150}
var p2={x:220,y:50}
var drag=null

function draw(){
 ctx.clearRect(0,0,300,200)
 ctx.strokeStyle="#888"
 ctx.beginPath()
 ctx.moveTo(0,200)
 ctx.bezierCurveTo(p1.x,p1.y,p2.x,p2.y,300,0)
 ctx.stroke()

 ctx.fillStyle="red"
 ctx.beginPath();ctx.arc(p1.x,p1.y,6,0,Math.PI*2);ctx.fill()
 ctx.beginPath();ctx.arc(p2.x,p2.y,6,0,Math.PI*2);ctx.fill()
}

canvas.onmousedown=e=>{
 var r=canvas.getBoundingClientRect()
 var x=e.clientX-r.left
 var y=e.clientY-r.top
 if(Math.hypot(x-p1.x,y-p1.y)<10)drag=p1
 else if(Math.hypot(x-p2.x,y-p2.y)<10)drag=p2
}

canvas.onmousemove=e=>{
 if(!drag)return
 var r=canvas.getBoundingClientRect()
 drag.x=e.clientX-r.left
 drag.y=e.clientY-r.top
 draw()
}

canvas.onmouseup=()=>drag=null
canvas.onmouseleave=()=>drag=null

draw()

function apply(){
 var cs=new CSInterface()
 var data={p1:p1,p2:p2}
 cs.evalScript("applyFlowCurve("+JSON.stringify(data)+")")
}
