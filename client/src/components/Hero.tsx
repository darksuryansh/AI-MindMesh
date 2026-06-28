// The Explain "page" header: topic title + the signature neural-mesh with a
// signal flowing through it. Shown only on the Explain view.

const LAYERS = [3, 4, 4, 2];
const VB_W = 360;
const VB_H = 200;
const PAD_X = 30;
const PAD_Y = 30;

const layerX = (i: number) =>
  PAD_X + ((VB_W - 2 * PAD_X) * i) / (LAYERS.length - 1);
const nodeY = (count: number, idx: number) =>
  count <= 1 ? VB_H / 2 : PAD_Y + ((VB_H - 2 * PAD_Y) * idx) / (count - 1);

const layers = LAYERS.map((count, li) =>
  Array.from({ length: count }, (_, ni) => ({
    x: layerX(li),
    y: nodeY(count, ni),
  })),
);

interface Edge {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay: number;
}

const edges: Edge[] = [];
layers.forEach((layer, li) => {
  if (li === layers.length - 1) return;
  const next = layers[li + 1];
  layer.forEach((a, ai) =>
    next.forEach((b, bi) => {
      edges.push({
        key: `${li}-${ai}-${bi}`,
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
        delay: li * 0.18 + (ai + bi) * 0.05,
      });
    }),
  );
});

function NeuralMesh() {
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className="h-auto w-full"
      role="img"
      aria-label="A small neural network with a signal flowing left to right through its layers."
    >
      <g stroke="var(--color-primary)" strokeOpacity="0.32" strokeWidth="1">
        {edges.map((e) => (
          <line
            key={e.key}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            className="mesh-edge"
            style={{ animationDelay: `${e.delay}s` }}
          />
        ))}
      </g>
      {layers.map((layer, li) =>
        layer.map((n, ni) => {
          const isOutput = li === layers.length - 1;
          return (
            <circle
              key={`${li}-${ni}`}
              cx={n.x}
              cy={n.y}
              r={isOutput ? 6 : 5}
              fill={isOutput ? "var(--color-signal)" : "var(--color-primary)"}
              className="mesh-node"
              style={{ animationDelay: `${li * 0.2 + ni * 0.12}s` }}
            />
          );
        }),
      )}
    </svg>
  );
}

export function Hero({ topic }: { topic: string }) {
  return (
    <section className="flex shrink-0 items-center justify-between gap-6">
      <div className="min-w-0">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
          Interactive AI explainer
        </p>
        <h1 className="mt-1.5 font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl md:text-4xl">
          {topic}
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
          Read it at two depths, quiz yourself, and ask the tutor follow-ups.
        </p>
      </div>

      <div className="hidden shrink-0 rounded-xl border bg-surface p-3 shadow-sm md:block md:w-52 lg:w-64">
        <NeuralMesh />
        <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted">
          <span>input</span>
          <span className="text-signal">output</span>
        </div>
      </div>
    </section>
  );
}
