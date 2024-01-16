import { AnnotationProps } from "../types";
import styles from "./annotation.module.css";


export const Annotation = ({ name, x, y, size, color, isHovered, annotation, scale }: AnnotationProps) => {

      const xText =
        annotation === "left"
          ? x - size / 2 - 5
          : annotation === "right" || (isHovered && !annotation)
            ? x + size / 2 + 5
            : x;

      const yText =
        annotation === "top"
          ? y - size / 2 - 7
          : annotation === "bottom"
            ? y + size / 2 + 7
            : y;

      const textAnchor =
        annotation === "left"
          ? "end"
          : annotation === "right" || (isHovered && !annotation)
            ? "start"
            : "middle";
    
      return (
        <g key={name}>
          <rect
            x={x - size / 2}
            y={y - size / 2}
            fill={color}
            strokeWidth={1 / scale}
            width={size}
            height={size}
            className={styles.annotationRect}
          />
          <text
            x={xText}
            y={yText}
            fontSize={14 / scale}
            fontWeight={500}
            textAnchor={textAnchor} // horizontal alignment
            dominantBaseline={"middle"} // vertical alignment
            className={isHovered ? styles.hoveredLabel : ""}
            strokeWidth={2 / scale}
          >
            {name}
          </text>
        </g>
    );
}