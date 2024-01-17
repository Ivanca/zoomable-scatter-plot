import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { ScatterplotProps } from "../types";
import { Axes } from "../Axes";
import styles from "./scatterplot.module.css";
import { PlotSquare } from "./PlotSquare";
import { Annotation } from "./Annotation";
import { ZoomTransform } from "d3";

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

  const squares = sortedData.map((data, i) => {
    return <PlotSquare
      key={i}
      name={data.name}
      color={data.color}
      size={sizeScale(data.size)}
      xPos={xScale(data.x)}
      yPos={yScale(data.y)}
      scale={transform.k}
      setHoveredLabel={setHoveredLabel}
      className={styles.scatterplotSquare}
    />
  });

  // Build the annotations (black rectangle and country name)
  // This is made separately, because it needs to appear on top of all colored rectangles
  const annotations = sortedData
    .filter((d) => d.annotation || hoveredLabel === d.name)
    .sort((a, b) => a.name === hoveredLabel ? 1 : -1)
    .map(({name, x, y, size, annotation, color}, i) => {
      const isHovered = hoveredLabel === name;
      const newColor = isHovered ? DARKER[color as keyof typeof DARKER] : color;
      return <Annotation
        key={name}
        name={name}
        x={xScale(x)}
        y={yScale(y)}
        size={sizeScale(size)}
        color={newColor}
        isHovered={isHovered}
        annotation={annotation}
        scale={transform.k}
      />
    });
  
  const hovered = sortedData.find((d) => d.name === hoveredLabel);
  let cityAnnotations = null;
  if (hovered) {
    const cities = hovered.cities;
    cityAnnotations = cities
      .sort((a, b) => b.size - a.size)
      .map(({name, size, x, y}, i) => {
        const newSize = sizeScale(hovered.size * size) / 5;
        let xPos = xScale(hovered.x) - sizeScale(hovered.size) / 2;
        let yPos = yScale(hovered.y) + sizeScale(hovered.size) / 2;
        xPos += x * (sizeScale(hovered.size) - newSize * 2) + newSize;
        yPos -= y * (sizeScale(hovered.size) - newSize * 2) + newSize;
        return <Annotation
          key={name}
          name={name + ": " + size * 100 + "%"}
          x={xPos}
          y={yPos}
          size={newSize}
          isCity={true}
          color={BRIGHTER[hovered.color as keyof typeof BRIGHTER]}
          annotation={i % 2 ? "center-top" : "center-bottom"}
          scale={transform.k}
        />
      });
  }

  return (
    <div className={ styles.container }>
    <svg ref={svgRef} width={window.innerWidth} height={window.innerHeight} shapeRendering={"crispEdges"}>
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
            {cityAnnotations}
          </g>
        </g>
      </svg>
    </div>
  );
};
