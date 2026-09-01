export type PixelCharacterState = {
  color: string;
  seed: number;
  seatNumber: string;
  selected: boolean;
  hovered: boolean;
  inFocusedGroup: boolean;
  seatmate: boolean;
  related: boolean;
  muted: boolean;
  lifeFrame: number;
  reducedMotion: boolean;
};

const SKIN_TONES = ["#F0C5A8", "#DFAE8D", "#C88E6D", "#A96F51"] as const;
const HAIR_TONES = ["#2D2927", "#49372F", "#6B4B35", "#263642"] as const;
const TROUSER_TONES = ["#334654", "#4A4A56", "#4B5948"] as const;

function pixelRect(
  context: CanvasRenderingContext2D,
  unit: number,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
) {
  context.fillStyle = color;
  context.fillRect(x * unit, y * unit, width * unit, height * unit);
}

function paintFocusBrackets(
  context: CanvasRenderingContext2D,
  unit: number,
  color: string,
  strong: boolean,
) {
  context.strokeStyle = color;
  context.lineWidth = (strong ? 2 : 1) * unit;
  context.beginPath();
  context.moveTo(-16 * unit, -17 * unit);
  context.lineTo(-16 * unit, -11 * unit);
  context.moveTo(-16 * unit, -17 * unit);
  context.lineTo(-10 * unit, -17 * unit);
  context.moveTo(16 * unit, -17 * unit);
  context.lineTo(16 * unit, -11 * unit);
  context.moveTo(16 * unit, -17 * unit);
  context.lineTo(10 * unit, -17 * unit);
  context.moveTo(-16 * unit, 16 * unit);
  context.lineTo(-16 * unit, 10 * unit);
  context.moveTo(-16 * unit, 16 * unit);
  context.lineTo(-10 * unit, 16 * unit);
  context.moveTo(16 * unit, 16 * unit);
  context.lineTo(16 * unit, 10 * unit);
  context.moveTo(16 * unit, 16 * unit);
  context.lineTo(10 * unit, 16 * unit);
  context.stroke();
}

export function paintPixelStudent(
  context: CanvasRenderingContext2D,
  globalScale: number,
  state: PixelCharacterState,
) {
  const unit = 1 / globalScale;
  const skin = SKIN_TONES[state.seed % SKIN_TONES.length];
  const hair = HAIR_TONES[(state.seed * 3) % HAIR_TONES.length];
  const trousers = TROUSER_TONES[(state.seed * 5) % TROUSER_TONES.length];
  const hairStyle = state.seed % 4;
  const facing = state.seatmate ? -1 : state.seed % 3 - 1;
  const blink =
    !state.reducedMotion &&
    (state.lifeFrame + state.seed * 2) % 13 === 0;
  const pageTurn =
    !state.reducedMotion &&
    (state.lifeFrame + state.seed) % 9 === 0;
  const headLift =
    !state.reducedMotion &&
    (state.lifeFrame + state.seed * 3) % 11 === 0;
  const headY = -10 - (headLift ? 1 : 0);

  context.save();
  context.imageSmoothingEnabled = false;
  context.globalAlpha = state.muted ? 0.34 : 1;

  if (state.selected || state.seatmate || state.inFocusedGroup || state.related) {
    const bracketColor = state.seatmate || state.related ? "#D5912A" : state.selected ? "#19232E" : state.color;
    paintFocusBrackets(context, unit, bracketColor, state.selected || state.seatmate);
  }

  // Chair and floor shadow.
  pixelRect(context, unit, -9, -2, 18, 18, state.seatmate ? "#E2BD78" : "#B7AA98");
  pixelRect(context, unit, -7, 0, 14, 14, "#E9E1D4");
  pixelRect(context, unit, -12, 13, 24, 2, "#CFC4B4");

  // Legs and shoes.
  pixelRect(context, unit, -6, 2, 5, 9, trousers);
  pixelRect(context, unit, 2, 2, 5, 9, trousers);
  pixelRect(context, unit, -7, 10, 6, 3, "#24313A");
  pixelRect(context, unit, 2, 10, 6, 3, "#24313A");

  // Torso, collar, and cluster-color shirt.
  pixelRect(context, unit, -7, -4, 14, 9, "#19232E");
  pixelRect(context, unit, -6, -3, 12, 8, state.color);
  pixelRect(context, unit, -2, -3, 4, 3, "#F7F1E6");

  // Arms: selected students raise a hand; Seatmate turns toward the new desk.
  if (state.selected) {
    pixelRect(context, unit, -10, -2, 4, 7, skin);
    pixelRect(context, unit, 6, -9, 4, 10, skin);
    pixelRect(context, unit, 7, -12, 3, 4, skin);
  } else if (state.seatmate) {
    pixelRect(context, unit, -10, -6, 4, 8, skin);
    pixelRect(context, unit, 6, -2, 4, 7, skin);
  } else {
    pixelRect(context, unit, -10, -2, 4, 7, skin);
    pixelRect(context, unit, 6, -2, 4, 7, skin);
  }

  // Square head and four low-cost hair silhouettes.
  pixelRect(context, unit, -6 + facing, headY - 7, 12, 12, "#19232E");
  pixelRect(context, unit, -5 + facing, headY - 6, 10, 10, skin);
  if (hairStyle === 0) {
    pixelRect(context, unit, -6 + facing, headY - 8, 12, 4, hair);
    pixelRect(context, unit, -6 + facing, headY - 4, 3, 5, hair);
  } else if (hairStyle === 1) {
    pixelRect(context, unit, -5 + facing, headY - 8, 10, 3, hair);
    pixelRect(context, unit, -7 + facing, headY - 6, 4, 8, hair);
    pixelRect(context, unit, 4 + facing, headY - 5, 3, 7, hair);
  } else if (hairStyle === 2) {
    pixelRect(context, unit, -6 + facing, headY - 8, 5, 4, hair);
    pixelRect(context, unit, -2 + facing, headY - 9, 8, 5, hair);
  } else {
    pixelRect(context, unit, -6 + facing, headY - 8, 12, 3, hair);
    pixelRect(context, unit, -7 + facing, headY - 6, 3, 5, hair);
    pixelRect(context, unit, 4 + facing, headY - 6, 3, 5, hair);
  }

  if (!blink) {
    pixelRect(context, unit, -3 + facing, headY - 2, 2, 2, "#19232E");
    pixelRect(context, unit, 2 + facing, headY - 2, 2, 2, "#19232E");
  } else {
    pixelRect(context, unit, -3 + facing, headY - 1, 2, 1, "#19232E");
    pixelRect(context, unit, 2 + facing, headY - 1, 2, 1, "#19232E");
  }

  // Shared desk plus one of four study props.
  pixelRect(context, unit, -13, 3, 26, 3, "#796B59");
  pixelRect(context, unit, -12, 6, 24, 5, state.seatmate ? "#F1D39A" : "#D8CCBA");
  pixelRect(context, unit, -11, 11, 3, 6, "#796B59");
  pixelRect(context, unit, 8, 11, 3, 6, "#796B59");

  const prop = state.seed % 4;
  if (prop === 0) {
    pixelRect(context, unit, -7, 4 + (pageTurn ? -1 : 0), 6, 3, "#FFFCF6");
    pixelRect(context, unit, 1, 4, 6, 3, "#FFFCF6");
    pixelRect(context, unit, 0, 4, 1, 3, state.color);
  } else if (prop === 1) {
    pixelRect(context, unit, -6, 1, 12, 6, "#314756");
    pixelRect(context, unit, -5, 2, 10, 4, "#D7E5E3");
  } else if (prop === 2) {
    pixelRect(context, unit, -6, 4, 12, 3, "#FFFCF6");
    pixelRect(context, unit, -4, 3, 8, 1, state.color);
    if (pageTurn) pixelRect(context, unit, 5, 2, 2, 5, "#D5912A");
  } else {
    pixelRect(context, unit, -5, 2, 10, 5, "#E8DFC9");
    pixelRect(context, unit, -3, 1, 6, 1, state.color);
  }

  // Number plate and role badge deliberately use shape plus text, not color alone.
  pixelRect(context, unit, -7, 14, 14, 7, state.seatmate ? "#D5912A" : "#19232E");
  context.fillStyle = "#FFFCF6";
  context.font = `700 ${7 * unit}px ui-monospace, SFMono-Regular, Consolas, monospace`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(state.seatNumber, 0, 17.5 * unit);

  if (state.seatmate) {
    pixelRect(context, unit, 10, -19, 16, 8, "#D5912A");
    context.fillStyle = "#FFFCF6";
    context.font = `700 ${6 * unit}px ui-sans-serif, system-ui`;
    context.fillText("同桌", 18 * unit, -15 * unit);
  }

  context.restore();
}

/**
 * 入席后的用户角色：复用学生绘制语言，琥珀色 shirt + “你”字名牌。
 * progress 驱动一次轻微下落淡入；Reduced Motion 直接以 progress=1 调用。
 */
export function paintPixelSeatedUser(
  context: CanvasRenderingContext2D,
  globalScale: number,
  progress: number,
  lifeFrame: number,
  reducedMotion: boolean,
) {
  const unit = 1 / globalScale;
  const eased = 1 - Math.pow(1 - progress, 3);

  context.save();
  context.imageSmoothingEnabled = false;
  context.globalAlpha = eased;
  context.translate(0, (1 - eased) * -10 * unit);

  paintPixelStudent(context, globalScale, {
    color: "#D5912A",
    seed: 3,
    seatNumber: "你",
    selected: false,
    hovered: false,
    inFocusedGroup: false,
    seatmate: false,
    related: false,
    muted: false,
    lifeFrame,
    reducedMotion,
  });

  context.fillStyle = "#8A5A16";
  context.font = `700 ${8 * unit}px ui-sans-serif, system-ui`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("你的一席 · 已入席", 0, 25 * unit);
  context.restore();
}

export function paintPixelCandidateSeat(
  context: CanvasRenderingContext2D,
  globalScale: number,
  progress: number,
) {
  const unit = 1 / globalScale;
  const eased = 1 - Math.pow(1 - progress, 3);

  context.save();
  context.imageSmoothingEnabled = false;
  context.globalAlpha = eased;
  context.scale(0.9 + eased * 0.1, 0.9 + eased * 0.1);

  if (progress < 1) {
    context.strokeStyle = `rgba(213, 145, 42, ${0.42 * (1 - progress)})`;
    context.lineWidth = 3 * unit;
    context.strokeRect(-18 * unit, -18 * unit, 36 * unit, 38 * unit);
  }

  pixelRect(context, unit, -9, -3, 18, 17, "#D5912A");
  pixelRect(context, unit, -7, -1, 14, 13, "#FFF4DE");
  pixelRect(context, unit, -13, 4, 26, 4, "#D5912A");
  pixelRect(context, unit, -12, 8, 24, 5, "#FFF8E9");
  pixelRect(context, unit, -11, 13, 3, 6, "#D5912A");
  pixelRect(context, unit, 8, 13, 3, 6, "#D5912A");
  pixelRect(context, unit, -7, -15, 14, 8, "#D5912A");
  context.fillStyle = "#FFFCF6";
  context.font = `700 ${7 * unit}px ui-monospace, SFMono-Regular, Consolas, monospace`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("YOU", 0, -11 * unit);
  context.fillStyle = "#8A5A16";
  context.font = `700 ${8 * unit}px ui-sans-serif, system-ui`;
  context.fillText("你的一席", 0, 25 * unit);
  context.restore();
}
