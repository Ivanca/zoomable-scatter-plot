import { PlotSquareProps } from "../types";

export const PlotSquare = ({name, color, size, xPos, yPos, scale, setHoveredLabel, className}: PlotSquareProps) => {
    return (
      <g key={name}>
        <rect
          x={xPos}
          y={yPos}
          strokeWidth={1 / scale}
          fill={color}
          width={size}
          height={size}
          className={className}
          onMouseEnter={(event) => {
            setHoveredLabel(name || "");
          }}
          onMouseLeave={() => {
            setHoveredLabel("");
          }}
        />
      </g>
    );
}
