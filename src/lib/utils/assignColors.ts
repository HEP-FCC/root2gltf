import { addColor } from "jsroot/colors";

import { K_BLACK, K_FILL, K_LINE, K_WHITE } from "../constants.js";
import type { TGeoNodeMatrix, TGeoVolume } from "../types/root.js";

const assignColors = (node: TGeoNodeMatrix): void => {
  const generateValue = (): number => Math.floor(Math.random() * 256);
  const stack: TGeoNodeMatrix[] = [node];
  const seen = new Set<TGeoVolume>();
  const mappedColors = new Map<string, number>();

  while (stack.length) {
    const { fVolume: volume } = stack.pop()!;

    if (!seen.has(volume)) {
      seen.add(volume);

      // If volume color is undefined, black or white
      if (
        (volume.fLineColor === K_LINE && volume.fFillColor === K_FILL) ||
        ((volume.fLineColor === K_WHITE || volume.fLineColor === K_BLACK) &&
          (volume.fFillColor === K_WHITE || volume.fFillColor === K_BLACK))
      ) {
        // And name has no color mapped
        if (!mappedColors.has(volume.fName))
          mappedColors.set(
            volume.fName,
            addColor(
              `rgb(${generateValue()}, ${generateValue()}, ${generateValue()})`,
            ),
          );

        // Assign generated color to volume with that name
        volume.fLineColor = mappedColors.get(volume.fName)!;
        volume.fFillColor = volume.fLineColor;
      }

      // Add children volumes to the stack
      if (volume.fNodes)
        for (const child of volume.fNodes.arr) stack.push(child);
    }
  }
};

export default assignColors;
