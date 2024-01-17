import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { DataItem, ScatterplotProps } from "../types";
import { Axes } from "../Axes";
import styles from "./ScatterPlot.module.css";
import { PlotSquare } from "./PlotSquare";
import { Annotation } from "./Annotation";
import { ZoomTransform } from "d3";

const BRIGHTER = {
  "#00dca6": "#33FFD9",
  "#c71e1d": "#f76e6e",
  "#fa8c00": "#ffbf6b",
  "#18a1cd": "#7EFFFF"
}

const DARKER = {
  "#00dca6": "#00b386",
  "#c71e1d": "#9c1616",
  "#fa8c00": "#cc7400",
  "#18a1cd": "#137da0"
}

export const ScatterPlot = ({ width, height, data }: ScatterplotProps) => {

  // State
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredLabel, setHoveredLabel] = useState("");
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 } as ZoomTransform);

  // Scales as refs for performance
  const xScale = useMemo(() => d3.scaleLinear().domain([0, 0.9]).range([0, width]), [width]);
  const yScale = useMemo(() => d3.scaleLinear().domain([0, 0.85]).range([height, 0]), [height]);
  const sizeScale = useMemo(() => d3.scaleSqrt().domain([0, 32]).range([3, 40]), []);

  // Sort the data: bigger squares must appear at the bottom
  const [sortedData, setSortedData] = useState<DataItem[]>([]);

  useEffect(() => {
    if (!svgRef.current || svgRef.current.classList.contains('zoomable')) {
      return;
    }
    svgRef.current.classList.add('zoomable');
    const zoom = d3.zoom()
      .scaleExtent([1, 32])
      .on("zoom", (event) => {
        setTransform(event.transform);
      });
    // set initial transfor to center the plot:
    const initialTransform = d3.zoomIdentity.translate(
      window.innerWidth / 2 - width / 2,
      window.innerHeight / 2 - height / 2
    );
    d3.select(svgRef.current)
      .call(zoom.transform as any, initialTransform)
      .call(zoom as any);
    
  }, [svgRef]);

  useEffect(() => {
    setSortedData(data.sort((a, b) => b.size - a.size));
  }, [data]);

  const squares = sortedData.map((data, i) => {
    return <PlotSquare
      key={'square-' + data.name}
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
