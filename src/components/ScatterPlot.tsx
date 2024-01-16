import { useRef, useState } from "react";
import * as d3 from "d3";
import { InteractionData, ScatterplotProps } from "../types";
import { Axes } from "../Axes";
import styles from "./scatterplot.module.css";

// Import d3 types:
import { ZoomTransform } from "d3";

// create alias for d3.Selection<SVGGElement, unknown, null, undefined>
type d3GSelection = d3.Selection<SVGGElement, unknown, null, undefined>;

export const ScatterPlot = ({ width, height, data }: ScatterplotProps) => {
  // Sort the data: bigger squares must appear at the bottom
  const sortedData = data.sort((a, b) => b.size - a.size);

  // State
  const svgRef = useRef<SVGSVGElement>(null);

  // Scales
  const xScale = d3.scaleLinear().domain([0, 0.9]).range([0, width]);
  const yScale = d3.scaleLinear().domain([0, 0.85]).range([height, 0]);
  const sizeScale = d3.scaleSqrt().domain([0, 32]).range([3, 40]);
  const [zoomedStrokeWidth, setZoomedStrokeWidth] = useState(1);

  const zoom = d3.zoom()
    .scaleExtent([1, 32])
    .on("zoom", (event) => {
      if (!svgRef.current) {
        return;
      }
      const k = height / width;
      const svg = d3.select(svgRef.current);
      let gSquares = svg.select("#gSquares") as d3GSelection;
      const transform = event.transform as ZoomTransform;
      setZoomedStrokeWidth(1 / transform.k);
      gSquares.attr("transform", transform as any).attr("stroke-width", 5 / transform.k);
    });

  if (svgRef.current) {
    d3.select(svgRef.current).call(zoom as any);
  }

  const squares = sortedData.map((d, i) => {
    const size = sizeScale(d.size);

    const xPos = xScale(d.x) - size / 2;
    const yPos = yScale(d.y) - size / 2;

    const className = styles.scatterplotSquare;

    return (
      <g key={i}>
        <rect
          x={xPos}
          y={yPos}
          opacity={1}
          strokeWidth={zoomedStrokeWidth}
          fill={d.color}
          width={size}
          height={size}
          className={className}
          data-country={d.name}

        />
      </g>
    );
  });

  // Build the annotations (black rectangle and country name)
  // This is made separately, because it needs to appear on top of all colored rectangles
  const annotations = sortedData
    .filter((d) => d.annotation)
    .map((d, i) => {
      const size = sizeScale(d.size);

      const x = xScale(d.x); // position of the baricenter of the square
      const y = yScale(d.y);

      const xText =
        d.annotation === "left"
          ? x - size / 2 - 5
          : d.annotation === "right"
            ? x + size / 2 + 5
            : x;

      const yText =
        d.annotation === "top"
          ? y - size / 2 - 7
          : d.annotation === "bottom"
            ? y + size / 2 + 7
            : y;

      const textAnchor =
        d.annotation === "left"
          ? "end"
          : d.annotation === "right"
            ? "start"
            : "middle";

      return (
        <g key={i}>
          <rect
            x={x - size / 2}
            y={y - size / 2}
            opacity={1}
            fill={"none"}
            strokeWidth={zoomedStrokeWidth}
            stroke={"black"}
            width={size}
            height={size}
          />
          <text
            x={xText}
            y={yText}
            fontSize={12}
            fontWeight={500}
            textAnchor={textAnchor} // horizontal alignment
            dominantBaseline={"middle"} // vertical alignment
          >
            {d.name}
          </text>
        </g>
      );
    });

  return (
    <div className={ styles.container }>
      <svg ref={svgRef} width={width} height={height} shapeRendering={"crispEdges"}>
        <g>

          <g id="gSquares">
          <Axes
            x={xScale(0.43)}
            y={yScale(0.41)}
            width={width}
            height={height}
            strokeWidth={zoomedStrokeWidth}
          />
            {squares}
            {annotations}
          </g>
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          width,
          height,
          top: 0,
          left: 0,
          pointerEvents: "none",
        }}
      >

      </div>
    </div>
  );
};
