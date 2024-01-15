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
  const [interactionData, setInteractionData] = useState<InteractionData>();
  const svgRef = useRef<SVGSVGElement>(null);

  // Scales
  const xScale = d3.scaleLinear().domain([0.23, 0.69]).range([0, width]);
  const yScale = d3.scaleLinear().domain([0.12, 0.83]).range([height, 0]);
  const sizeScale = d3.scaleSqrt().domain([0, 32]).range([3, 40]);

  const zoom = d3.zoom()
    .scaleExtent([0.5, 32])
    .on("zoom", (event) => {
      if (!svgRef.current) {
        return;
      }
      const k = height / width;
      const xAxis = (
        g: d3GSelection,
        x: d3.AxisScale<d3.AxisDomain>) => g
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisTop(x).ticks(12))
          .call((g: any) => g.select(".domain").attr("display", "none"));

      const yAxis = (g: d3GSelection, y: any) => g
        .call(d3.axisRight(y).ticks(12 * k as any))
        .call((g: any) => g.select(".domain").attr("display", "none"))

      let gDot = d3.select(svgRef.current).select("g");
      let gx = d3.select(svgRef.current).select("#gx") as d3GSelection;
      let gy = d3.select(svgRef.current).select("#gy") as d3GSelection;
      const transform = event.transform as ZoomTransform;
      const zx = transform.rescaleX(xScale).interpolate(d3.interpolateRound) as d3.AxisScale<d3.AxisDomain>;
      const zy = transform.rescaleY(yScale).interpolate(d3.interpolateRound) as d3.AxisScale<d3.AxisDomain>;
      gDot.attr("transform", transform as any).attr("stroke-width", 5 / transform.k);
      gx.call(xAxis, zx);
      gy.call(yAxis, zy);
    });


  if (svgRef.current) {
    d3.select(svgRef.current).call(zoom as any);
  }


  const squares = sortedData.map((d, i) => {
    const size = sizeScale(d.size);

    const xPos = xScale(d.x) - size / 2;
    const yPos = yScale(d.y) - size / 2;

    const isDimmed = interactionData && interactionData.color !== d.color;
    const className = isDimmed
      ? styles.scatterplotSquare + " " + styles.dimmed
      : styles.scatterplotSquare;

    return (
      <g
        key={i}
        onMouseMove={() =>
          setInteractionData({
            xPos,
            yPos,
            ...d,
          })
        }
        onMouseLeave={() => setInteractionData(undefined)}
      >
        <rect
          x={xPos}
          y={yPos}
          opacity={1}
          fill={d.color}
          width={size}
          height={size}
          className={className}
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

      const isDimmed = interactionData && interactionData.color !== d.color;
      const className = isDimmed ? styles.dimmed : "";

      const textAnchor =
        d.annotation === "left"
          ? "end"
          : d.annotation === "right"
            ? "start"
            : "middle";

      return (
        <g key={i} className={className}>
          <rect
            x={x - size / 2}
            y={y - size / 2}
            opacity={1}
            fill={"none"}
            strokeWidth={1}
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
    <div style={{ position: "relative" }}>
      <svg ref={svgRef} width={width} height={height} shapeRendering={"crispEdges"}>
        <g>
          <Axes
            x={xScale(0.43)}
            y={yScale(0.41)}
            width={width}
            height={height}
          />
          {squares}
          {annotations}
        </g>
        <g id="gx"></g>
        <g id="gy"></g>
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
