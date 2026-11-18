import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { JewelryStudio, type JewelryStageProps } from "../jewelry";
import "./preview.css";

function PlaceholderStage({onReady,design,finish,piece}: JewelryStageProps) {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{onReady()},[onReady,piece]);
  useEffect(()=>{
    const canvas=ref.current,ctx=canvas?.getContext("2d");
    if(!canvas||!ctx)return;
    ctx.clearRect(0,0,640,640);
    ctx.fillStyle=design.tone;ctx.strokeStyle=design.tone;
    ctx.lineWidth=12;ctx.beginPath();
    if(piece===0){ctx.ellipse(320,345,125,158,0,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle=design.gem;ctx.beginPath();ctx.moveTo(320,130);ctx.lineTo(367,171);ctx.lineTo(320,218);ctx.lineTo(273,171);ctx.closePath();ctx.fill();
    }else if(piece===1){ctx.moveTo(225,130);ctx.quadraticCurveTo(320,350,415,130);ctx.stroke();ctx.beginPath();ctx.ellipse(320,345,55,80,0,0,Math.PI*2);ctx.stroke();
    }else{for(let i=0;i<16;i++){const a=i*Math.PI*2/16;ctx.beginPath();ctx.arc(320+Math.cos(a)*140,320+Math.sin(a)*145,piece===2?13:8,0,Math.PI*2);ctx.fill();}}
    ctx.fillStyle="#d8c6e8";ctx.textAlign="center";ctx.font="16px sans-serif";
    ctx.fillText(`${design.metal} / ${finish}`,320,550);
    if(piece===0&&design.engraving)ctx.fillText(design.engraving,320,585);
  },[design,finish,piece]);
  return <div className="demo-stage"><div className="demo-label"><strong>UI KIT PREVIEW</strong><span>2D placeholder only · No 3D engine</span></div><canvas ref={ref} width={640} height={640} aria-label="Neutral 2D jewelry placeholder"/><p>Try the controls, color picker, tools and cart.</p></div>;
}
function capturePlaceholder(){
  const canvas=document.querySelector<HTMLCanvasElement>(".demo-stage canvas");
  if(!canvas)throw Error("Preview is loading");
  return canvas.toDataURL("image/png");
}
createRoot(document.getElementById("root")!).render(<JewelryStudio renderStage={props=><PlaceholderStage {...props}/>} captureFrame={capturePlaceholder}/>);
