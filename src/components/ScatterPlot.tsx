import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { InteractionData, ScatterplotProps } from "../types";
import { Axes } from "../Axes";
import styles from "./scatterplot.module.css";

// Import d3 types:
import { ZoomTransform } from "d3";
import { Annotation } from "./Annotation";

export const ScatterPlot = ({ width, height, data }: ScatterplotProps) => {

  // State
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredLabel, setHoveredLabel] = useState("");
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 } as ZoomTransform);

  // Scales
  const xScale = d3.scaleLinear().domain([0, 0.9]).range([0, width]);
  const yScale = d3.scaleLinear().domain([0, 0.85]).range([height, 0]);
  const sizeScale = d3.scaleSqrt().domain([0, 32]).range([3, 40]);

  // Sort the data: bigger squares must appear at the bottom
  const sortedData = data.sort((a, b) => b.size - a.size);

  useEffect(() => {
    if (!svgRef.current) {
      return;
    }
    const zoom = d3.zoom()
      .scaleExtent([1, 32])
      .on("zoom", (event) => {
        setTransform(event.transform);
      });

    d3.select(svgRef.current).call(zoom as any);
  }, [svgRef]);

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
          strokeWidth={1 / transform.k}
          fill={d.color}
          width={size}
          height={size}
          className={className}
          onMouseEnter={(event) => {
            setHoveredLabel(d.name || "");
          }}
          onMouseLeave={() => {
            setHoveredLabel("");
          }}
        />
      </g>
    );
  });

  // Build the annotations (black rectangle and country name)
  // This is made separately, because it needs to appear on top of all colored rectangles
  const annotations = sortedData
    .filter((d) => d.annotation || hoveredLabel === d.name)
    .sort((a, b) => a.name === hoveredLabel ? 1 : -1)
    .map((data, i) => 
      <Annotation
        key={i}
        name={data.name}
        x={xScale(data.x)}
        y={yScale(data.y)}
        size={sizeScale(data.size)}
        color={data.color}
        isHovered={hoveredLabel === data.name}
        annotation={data.annotation}
        scale={transform.k}
      />
    );

  return (
    <div className={ styles.container }>
      <svg ref={svgRef} width={width} height={height} shapeRendering={"crispEdges"}>
        <g>
          <g
            transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}
            strokeWidth={5 / transform.k}>
            <Axes
              x={xScale(0.43)}
              y={yScale(0.41)}
              width={width}
              height={height}
              strokeWidth={1 / transform.k}
            />
            {squares}
            {annotations}
          </g>
        </g>
      </svg>
    </div>
  );
};
