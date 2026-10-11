import { encodeQr, type QrModules, type ReportPixels } from './qr';

export type { ReportPixels };

export const REPORT_IMAGE_WIDTH = 1080;
export const REPORT_IMAGE_HEIGHT = 1350;

const CENTER = REPORT_IMAGE_WIDTH / 2;
const MARGIN = 72;
const CONTENT_WIDTH = REPORT_IMAGE_WIDTH - 2 * MARGIN;
const QR_TOP = 640;
const QR_MAX_EXTENT = 520;
/** The four-module white border scanners need around a QR code. */
const QR_QUIET_MODULES = 4;
/** Below this, a code recompressed as JPG and shrunk by a chat app stops being readable. */
const MIN_MODULE_PIXELS = 5;
const INDICATOR_GAP = 24;
const MOTTO_BASELINE = 1300;

/** Text baselines and bar tops, from the top of the image down. */
const ROW = {
  nickname: 120,
  week: 180,
  score: 330,
  verdict: 400,
  indicatorBar: 450,
  indicatorLabel: 505,
  indicatorValue: 550,
  weight: 610,
} as const;
const INDICATOR_BAR_HEIGHT = 10;
/** Baselines of the owner lines, measured from the bottom of the QR code. */
const OWNER_LINE_OFFSET = 50;
const USER_ID_LINE_OFFSET = 92;

export type PillarColor = 'sleep' | 'training' | 'food' | 'sun';

export type ReportColor =
  'background' | 'text' | 'textMuted' | 'primary' | 'qrDark' | 'qrLight' | PillarColor;

/** Colours and font come from the design tokens; core never knows their values (G4.1). */
export interface ReportImageTheme {
  readonly fontFamily: string;
  readonly colors: Readonly<Record<ReportColor, string>>;
}

export interface ReportIndicator {
  readonly pillar: PillarColor;
  readonly label: string;
  readonly value: string;
}

/** What the image shows, already translated and formatted by the screen (G3.5). */
export interface ReportCard {
  readonly content: Uint8Array;
  readonly nickname: string;
  readonly userId: string;
  readonly weekLabel: string;
  readonly periodLabel: string;
  readonly scoreLabel: string;
  readonly verdictLabel: string;
  readonly indicators: readonly ReportIndicator[];
  /** Missing when the user hides their weight and has no change to show. */
  readonly weightLabel?: string;
  readonly motto: string;
}

export interface RectItem {
  readonly kind: 'rect';
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly color: ReportColor;
}

/** Centred on `x`, drawn on its baseline `y`, squeezed to `maxWidth` when longer. */
export interface TextItem {
  readonly kind: 'text';
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly bold: boolean;
  readonly color: ReportColor;
  readonly maxWidth: number;
}

/** A square of side `extent` with the quiet zone included. */
export interface QrItem {
  readonly kind: 'qr';
  readonly x: number;
  readonly y: number;
  readonly extent: number;
  readonly moduleSize: number;
  readonly modules: QrModules;
}

export type ReportImageItem = RectItem | TextItem | QrItem;

export type ReportDrawingContext = Pick<
  CanvasRenderingContext2D,
  'fillStyle' | 'font' | 'textAlign' | 'textBaseline' | 'fillRect' | 'fillText'
>;

type TextStyle = Pick<TextItem, 'size' | 'bold' | 'color'>;

function centredText(
  text: string,
  y: number,
  style: TextStyle,
  maxWidth = CONTENT_WIDTH,
): TextItem {
  return { kind: 'text', text, x: CENTER, y, maxWidth, ...style };
}

function indicatorItems(indicators: readonly ReportIndicator[]): ReportImageItem[] {
  const columnWidth = CONTENT_WIDTH / indicators.length;
  return indicators.flatMap(({ pillar, label, value }, index) => {
    const left = MARGIN + index * columnWidth;
    const x = left + columnWidth / 2;
    const width = columnWidth - INDICATOR_GAP;
    const bar: RectItem = {
      kind: 'rect',
      x: x - width / 2,
      y: ROW.indicatorBar,
      width,
      height: INDICATOR_BAR_HEIGHT,
      color: pillar,
    };
    return [
      bar,
      {
        ...centredText(
          label,
          ROW.indicatorLabel,
          { size: 28, bold: false, color: 'textMuted' },
          width,
        ),
        x,
      },
      {
        ...centredText(value, ROW.indicatorValue, { size: 30, bold: true, color: 'text' }, width),
        x,
      },
    ];
  });
}

function qrItem(content: Uint8Array): QrItem {
  const modules = encodeQr(content);
  const moduleSize = Math.floor(QR_MAX_EXTENT / (modules.size + 2 * QR_QUIET_MODULES));
  if (moduleSize < MIN_MODULE_PIXELS) {
    throw new RangeError(`${content.length} bytes make a QR code too dense to read from a chat`);
  }
  const extent = moduleSize * (modules.size + 2 * QR_QUIET_MODULES);
  return { kind: 'qr', x: Math.floor(CENTER - extent / 2), y: QR_TOP, extent, moduleSize, modules };
}

function ownerItems(card: ReportCard, qrBottom: number): TextItem[] {
  return [
    centredText(`${card.nickname} · ${card.periodLabel}`, qrBottom + OWNER_LINE_OFFSET, {
      size: 30,
      bold: true,
      color: 'text',
    }),
    centredText(card.userId, qrBottom + USER_ID_LINE_OFFSET, {
      size: 26,
      bold: false,
      color: 'textMuted',
    }),
    centredText(card.motto, MOTTO_BASELINE, { size: 30, bold: true, color: 'primary' }),
  ];
}

/** RF-10, RF-11: where everything goes on the 1080 × 1350 image shared in chats. */
export function layoutReportImage(card: ReportCard): ReportImageItem[] {
  const qr = qrItem(card.content);
  return [
    {
      kind: 'rect',
      x: 0,
      y: 0,
      width: REPORT_IMAGE_WIDTH,
      height: REPORT_IMAGE_HEIGHT,
      color: 'background',
    },
    centredText(card.nickname, ROW.nickname, { size: 64, bold: true, color: 'text' }),
    centredText(card.weekLabel, ROW.week, { size: 34, bold: false, color: 'textMuted' }),
    centredText(card.scoreLabel, ROW.score, { size: 150, bold: true, color: 'primary' }),
    centredText(card.verdictLabel, ROW.verdict, { size: 44, bold: true, color: 'text' }),
    ...indicatorItems(card.indicators),
    ...(card.weightLabel === undefined
      ? []
      : [centredText(card.weightLabel, ROW.weight, { size: 34, bold: false, color: 'text' })]),
    qr,
    ...ownerItems(card, qr.y + qr.extent),
  ];
}

function drawQr(context: ReportDrawingContext, item: QrItem, theme: ReportImageTheme) {
  const { x, y, extent, moduleSize, modules } = item;
  const origin = QR_QUIET_MODULES * moduleSize;
  context.fillStyle = theme.colors.qrLight;
  context.fillRect(x, y, extent, extent);
  context.fillStyle = theme.colors.qrDark;
  for (let row = 0; row < modules.size; row += 1) {
    for (let column = 0; column < modules.size; column += 1) {
      if (!modules.isDark(row, column)) continue;
      context.fillRect(
        x + origin + column * moduleSize,
        y + origin + row * moduleSize,
        moduleSize,
        moduleSize,
      );
    }
  }
}

function drawRect(context: ReportDrawingContext, item: RectItem, theme: ReportImageTheme) {
  context.fillStyle = theme.colors[item.color];
  context.fillRect(item.x, item.y, item.width, item.height);
}

function drawText(context: ReportDrawingContext, item: TextItem, theme: ReportImageTheme) {
  context.font = `${item.bold ? 'bold ' : ''}${item.size}px ${theme.fontFamily}`;
  context.fillStyle = theme.colors[item.color];
  context.fillText(item.text, item.x, item.y, item.maxWidth);
}

export function drawReportImage(
  context: ReportDrawingContext,
  items: readonly ReportImageItem[],
  theme: ReportImageTheme,
): void {
  context.textAlign = 'center';
  context.textBaseline = 'alphabetic';
  for (const item of items) {
    if (item.kind === 'qr') drawQr(context, item, theme);
    else if (item.kind === 'text') drawText(context, item, theme);
    else drawRect(context, item, theme);
  }
}
