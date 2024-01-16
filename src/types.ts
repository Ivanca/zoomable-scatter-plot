export type DataItem = {
  name: string;
  x: number; // vulnerability
  y: number; // readiness
  size: number; // CO2 emission
  color: string;
  categoryy: "RED" | "GREEN" | "YELLOW" | "BLUE";
  annotation?: "top" | "right" | "left" | "bottom";
};

export type AnnotationProps = {
  x: number;
  y: number;
  color: string;
  name: string;
  isHovered: boolean;
  size: number;
  annotation: DataItem["annotation"];
  scale: number;
}

export type PlotSquareProps = {
  name: string;
  size: number;
  xPos: number;
  yPos: number;
  scale: number;
  color: string;
  className: string;
  setHoveredLabel: (label: string) => void;
}

export type ScatterplotProps = {
  width: number;
  height: number;
  data: DataItem[];
};
