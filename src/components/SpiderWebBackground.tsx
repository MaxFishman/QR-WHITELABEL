import { useEffect, useRef } from 'react';
import p5 from 'p5';

interface Point {
  x: number;
  y: number;
  age: number;
  vx: number;
  vy: number;
}

export default function SpiderWebBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sketchRef = useRef<p5 | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      const points: Point[] = [];
      const maxPoints = 80;
      const maxDistance = 150;
      const fadeSpeed = 0.015;

      const colors = [
        [59, 130, 246],
        [139, 92, 246],
        [34, 197, 94],
        [96, 165, 250],
        [168, 85, 247],
        [74, 222, 128]
      ];

      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.background(15, 23, 42);
      };

      p.draw = () => {
        p.background(15, 23, 42, 12);

        if (p.mouseX > 0 && p.mouseY > 0 && p.mouseX < p.width && p.mouseY < p.height) {
          if (p.frameCount % 3 === 0) {
            const colorSet = colors[Math.floor(Math.random() * colors.length)];
            points.push({
              x: p.mouseX + p.random(-8, 8),
              y: p.mouseY + p.random(-8, 8),
              age: 0,
              vx: p.random(-0.5, 0.5),
              vy: p.random(-0.5, 0.5)
            });
          }
        }

        for (let i = points.length - 1; i >= 0; i--) {
          const point = points[i];

          point.x += point.vx;
          point.y += point.vy;
          point.age += fadeSpeed;

          if (point.age >= 1) {
            points.splice(i, 1);
            continue;
          }

          const alpha = (1 - point.age) * 255;
          const colorIndex = i % colors.length;
          const [r, g, b] = colors[colorIndex];

          p.noStroke();
          p.fill(r, g, b, alpha * 0.7);
          p.circle(point.x, point.y, 4 * (1 - point.age * 0.5));

          for (let j = i + 1; j < points.length; j++) {
            const other = points[j];
            const d = p.dist(point.x, point.y, other.x, other.y);

            if (d < maxDistance) {
              const lineAlpha = ((1 - d / maxDistance) * (1 - point.age) * (1 - other.age)) * 150;

              const midColorIndex = Math.floor((i + j) / 2) % colors.length;
              const [lr, lg, lb] = colors[midColorIndex];

              p.stroke(lr, lg, lb, lineAlpha);
              p.strokeWeight(1 + (1 - d / maxDistance) * 2);
              p.line(point.x, point.y, other.x, other.y);
            }
          }
        }

        if (points.length > maxPoints) {
          points.splice(0, points.length - maxPoints);
        }
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };
    };

    sketchRef.current = new p5(sketch, containerRef.current);

    return () => {
      sketchRef.current?.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
