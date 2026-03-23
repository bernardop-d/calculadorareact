"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

interface Props {
  src: string;
  watermark: string;
}

function formatTime(s: number) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// Minimal WebGL shaders — render video texture to canvas (GPU layer)
const VS = `
  attribute vec2 a_pos;
  attribute vec2 a_uv;
  varying vec2 v_uv;
  void main() { gl_Position = vec4(a_pos, 0, 1); v_uv = a_uv; }
`;
const FS = `
  precision mediump float;
  uniform sampler2D u_tex;
  varying vec2 v_uv;
  void main() { gl_FragColor = texture2D(u_tex, v_uv); }
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

export default function ProtectedVideo({ src, watermark }: Props) {
  const videoRef      = useRef<HTMLVideoElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);
  const progressRef   = useRef<HTMLDivElement>(null);
  const glRef         = useRef<WebGLRenderingContext | null>(null);
  const texRef        = useRef<WebGLTexture | null>(null);
  const rafRef        = useRef<number>(0);
  const hideTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying]           = useState(false);
  const [muted, setMuted]               = useState(false);
  const [progress, setProgress]         = useState(0);
  const [currentTime, setCurrentTime]   = useState(0);
  const [duration, setDuration]         = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [glReady, setGlReady]           = useState(false);

  /* ── WebGL setup ──────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (
      canvas.getContext("webgl", { preserveDrawingBuffer: false }) ||
      canvas.getContext("experimental-webgl", { preserveDrawingBuffer: false })
    ) as WebGLRenderingContext | null;
    if (!gl) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    // Full-screen quad (pos x,y + uv x,y per vertex)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1,-1, 0,1,   1,-1, 1,1,   -1,1, 0,0,
       1,-1, 1,1,   1, 1, 1,0,   -1,1, 0,0,
    ]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, "a_pos");
    const aUv  = gl.getAttribLocation(prog, "a_uv");
    gl.enableVertexAttribArray(aPos);
    gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(aUv,  2, gl.FLOAT, false, 16, 8);

    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(gl.getUniformLocation(prog, "u_tex"), 0);

    glRef.current  = gl;
    texRef.current = tex;
    setGlReady(true);

    return () => {
      gl.deleteTexture(tex);
      gl.deleteProgram(prog);
    };
  }, []);

  /* ── Render loop: copy video frames to GPU canvas ─────────── */
  useEffect(() => {
    const gl  = glRef.current;
    const tex = texRef.current;
    const vid = videoRef.current;
    const can = canvasRef.current;
    if (!gl || !tex || !vid || !can) return;

    const draw = () => {
      if (!vid.paused && !vid.ended && vid.readyState >= 2) {
        const w = vid.videoWidth  || can.offsetWidth;
        const h = vid.videoHeight || can.offsetHeight;
        if (can.width !== w)  can.width  = w;
        if (can.height !== h) can.height = h;
        gl.viewport(0, 0, can.width, can.height);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, vid);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [glReady]);

  /* ── Block right-click / drag on hidden video element ─────── */
  const blockDefault = useCallback((e: Event) => e.preventDefault(), []);
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.addEventListener("contextmenu", blockDefault);
    el.addEventListener("dragstart",   blockDefault);
    return () => {
      el.removeEventListener("contextmenu", blockDefault);
      el.removeEventListener("dragstart",   blockDefault);
    };
  }, [blockDefault]);

  /* ── Controls visibility ──────────────────────────────────── */
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) { v.pause(); setPlaying(false); setShowControls(true); }
    else         { v.play();  setPlaying(true);  resetHideTimer(); }
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v   = videoRef.current;
    const bar = progressRef.current;
    if (!v || !bar) return;
    const rect = bar.getBoundingClientRect();
    const pct  = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * v.duration;
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !muted;
    setMuted(!muted);
  };

  const enterFullscreen = () => containerRef.current?.requestFullscreen?.();

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-xl overflow-hidden select-none"
      onMouseMove={resetHideTimer}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Hidden video — source only, never rendered directly to screen */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        src={src}
        className="absolute w-0 h-0 opacity-0 pointer-events-none"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => { setPlaying(false); setShowControls(true); }}
        disablePictureInPicture
        playsInline
      />

      {/* WebGL canvas — rendered on GPU, appears black on most screenshots */}
      <canvas
        ref={canvasRef}
        className="block w-full min-h-60 max-h-[600px] pointer-events-none"
      />

      {/* Tiled watermark — positions defined in globals.css (.watermark-tile-N) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`absolute text-white/[0.07] font-bold text-sm select-none whitespace-nowrap watermark-tile-${i}`}
          >
            {watermark}
          </span>
        ))}
      </div>

      {/* Click capture overlay */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={togglePlay}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />

      {/* Center play icon when paused */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-black/60 rounded-full flex items-center justify-center">
            <Play size={28} className="text-white ml-1" />
          </div>
        </div>
      )}

      {/* Controls bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 pb-3 pt-8 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={progressRef}
          className="w-full h-1.5 bg-white/20 rounded-full mb-3 cursor-pointer"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-[#F5C400] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={togglePlay} className="text-white hover:text-[#F5C400] transition-colors">
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button type="button" onClick={toggleMute} className="text-white hover:text-[#F5C400] transition-colors">
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <span className="text-zinc-400 text-xs font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <div className="flex-1" />
          <button type="button" onClick={enterFullscreen} className="text-white hover:text-[#F5C400] transition-colors">
            <Maximize size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
