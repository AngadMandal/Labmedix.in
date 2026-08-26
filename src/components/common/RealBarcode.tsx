import React from 'react';
import { encodeCode128 } from '../../utils/barcode';

export interface RealBarcodeProps {
  value: string;
  height?: number;
  barWidth?: number;
  showText?: boolean;
  className?: string;
  lightColor?: string;
  darkColor?: string;
}

/**
 * High-Precision Vector SVG Barcode Component
 * Generates 100% compliant, real scannable Code 128 Barcodes.
 */
export const RealBarcode: React.FC<RealBarcodeProps> = ({
  value,
  height = 42,
  barWidth = 1.5,
  showText = true,
  className = '',
  lightColor = '#FFFFFF',
  darkColor = '#000000'
}) => {
  const encoded = encodeCode128(value);
  const totalSvgWidth = encoded.width * barWidth;
  const barHeight = showText ? height - 14 : height;

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        width={totalSvgWidth}
        height={height}
        viewBox={`0 0 ${totalSvgWidth} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
        shapeRendering="crispEdges"
      >
        <rect width={totalSvgWidth} height={height} fill={lightColor} />
        {encoded.barBlocks.map((block) => (
          <rect
            key={block.start}
            x={block.start * barWidth}
            y={0}
            width={block.width * barWidth}
            height={barHeight}
            fill={darkColor}
          />
        ))}
        {showText && (
          <text
            x={totalSvgWidth / 2}
            y={height - 2}
            textAnchor="middle"
            fill={darkColor}
            fontSize="10"
            fontFamily="'Courier New', Courier, monospace"
            fontWeight="bold"
            letterSpacing="1.5"
          >
            *{encoded.text}*
          </text>
        )}
      </svg>
    </div>
  );
};
