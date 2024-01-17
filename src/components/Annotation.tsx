import React from "react";
import { AnnotationProps } from "../types";
import styles from "./Annotation.module.css";


export const Annotation = (
  { name, x, y, size, color, annotation, scale, isCity, isHovered }
    : AnnotationProps) => {

  let xText = x;
  let yText = y;
  let textAnchor = "middle";
  // lets do the same but avoid ternaries:
  if (annotation === "left") {
    xText = x - size / 2 - 10 / scale;
    textAnchor = "end";
  } else if (annotation === "right" || (isHovered && !annotation)) {
    xText = x + size / 2 + 10 / scale;
    textAnchor = "start";
  } else if (annotation === "top") {
    yText = y - size / 2 - 14 / scale;
  } else if (annotation === "bottom") {
    yText = y + size / 2 + 14 / scale;
  }

  const f = (scale - 4) / 4;
  const opacity = isCity || isHovered ? Math.min(Math.max(f, 0), 1) : 1;
  const fontSize = isCity
    ? Math.max((14 * Math.min(Math.max(f / 2, 0), 1)) / scale, 0.85)
    : 14 / scale;

  let Shape: React.ElementType = isCity ? "circle" : "rect";
  return (
    <g className={styles.annotationContainer}>
      <Shape
        x={x - size / 2}
        y={y - size / 2}
        fill={isCity || isHovered ? color : 'none'}
        strokeWidth={1 / scale}
        width={size}
        height={size}
        fillOpacity={isHovered ? opacity : 1}
        opacity={isCity ? opacity : 1}
        className={isCity ? styles.annotationCircle : styles.annotationRect}
        r={isCity ? size : 0}
        cx={isCity ? x : 0}
        cy={isCity ? y : 0}
      />
      <text
        x={xText}
        y={yText}
        opacity={isCity ? opacity : 1}
        fontSize={fontSize}
        fontWeight={500}
        textAnchor={textAnchor} // horizontal alignment
        dominantBaseline={"middle"} // vertical alignment
        className={isHovered ? styles.hoveredLabel : ""}
        strokeWidth={fontSize / 7}
      >
        {name}
      </text>
    </g>
  );
}