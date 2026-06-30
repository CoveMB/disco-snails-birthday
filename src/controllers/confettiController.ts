export type ConfettiController = {
  burst: () => void;
  destroy: () => void;
};

type Flake = {
  x: number;
  y: number;
  size: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  spin: number;
  color: string;
};

const colors = ["#7de7ff", "#ff4fd8", "#ffe66b", "#9fffc8", "#fffaf2"];

function createFlake(width: number, height: number): Flake {
  return {
    x: Math.random() * width,
    y: -Math.random() * height * 0.35,
    size: 4 + Math.random() * 7,
    velocityX: -0.7 + Math.random() * 1.4,
    velocityY: 1.2 + Math.random() * 2.8,
    rotation: Math.random() * 180,
    spin: -5 + Math.random() * 10,
    color: colors[Math.floor(Math.random() * colors.length)] ?? colors[0],
  };
}

export function createConfettiController(canvas: HTMLCanvasElement): ConfettiController {
  const context = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!context || reduceMotion) {
    return {
      burst: () => undefined,
      destroy: () => undefined,
    };
  }

  const drawingContext = context;
  let animationFrame = 0;
  let flakes: Flake[] = [];

  function resize(): void {
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * pixelRatio);
    canvas.height = Math.floor(window.innerHeight * pixelRatio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    drawingContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function drawFlake(flake: Flake): void {
    drawingContext.save();
    drawingContext.translate(flake.x, flake.y);
    drawingContext.rotate((flake.rotation * Math.PI) / 180);
    drawingContext.fillStyle = flake.color;
    drawingContext.fillRect(-flake.size / 2, -flake.size / 2, flake.size, flake.size * 0.52);
    drawingContext.restore();
  }

  function draw(): void {
    drawingContext.clearRect(0, 0, window.innerWidth, window.innerHeight);

    flakes = flakes
      .map((flake) => ({
        ...flake,
        x: flake.x + flake.velocityX,
        y: flake.y + flake.velocityY,
        rotation: flake.rotation + flake.spin,
      }))
      .filter((flake) => flake.y < window.innerHeight + 20);

    for (const flake of flakes) {
      drawFlake(flake);
    }

    animationFrame = window.requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", resize);

  return {
    burst: () => {
      flakes = Array.from({ length: 120 }, () => createFlake(window.innerWidth, window.innerHeight));
    },
    destroy: () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    },
  };
}
