import html2canvas from 'html2canvas';

export interface ExportOptions {
  format: 'png' | 'svg';
  filename?: string;
  scale?: number;
  backgroundColor?: string;
}

export const exportDiagram = async (
  element: HTMLElement, 
  options: ExportOptions = { format: 'png' }
): Promise<void> => {
  const { format, filename = `mermaid-diagram-${Date.now()}`, scale = 2, backgroundColor = '#ffffff' } = options;

  try {
    if (format === 'svg') {
      await exportAsSVG(element, filename);
    } else {
      await exportAsPNG(element, filename, scale, backgroundColor);
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error(`Failed to export diagram as ${format.toUpperCase()}`);
  }
};

const exportAsSVG = async (element: HTMLElement, filename: string): Promise<void> => {
  // Find the SVG element within the mermaid diagram
  const svgElement = element.querySelector('svg');
  if (!svgElement) {
    throw new Error('No SVG found in the diagram');
  }

  // Clone the SVG to avoid modifying the original
  const clonedSvg = svgElement.cloneNode(true) as SVGElement;
  
  // Ensure the SVG has proper dimensions
  const rect = svgElement.getBoundingClientRect();
  clonedSvg.setAttribute('width', rect.width.toString());
  clonedSvg.setAttribute('height', rect.height.toString());
  
  // Add XML declaration and DOCTYPE
  const svgData = new XMLSerializer().serializeToString(clonedSvg);
  const svgBlob = new Blob(
    [`<?xml version="1.0" encoding="UTF-8"?>\n${svgData}`], 
    { type: 'image/svg+xml;charset=utf-8' }
  );
  
  downloadFile(svgBlob, `${filename}.svg`);
};

const exportAsPNG = async (
  element: HTMLElement, 
  filename: string, 
  scale: number, 
  backgroundColor: string
): Promise<void> => {
  const canvas = await html2canvas(element, {
    scale,
    backgroundColor,
    useCORS: true,
    allowTaint: true,
    logging: false,
    width: element.offsetWidth,
    height: element.offsetHeight
  });

  canvas.toBlob((blob) => {
    if (blob) {
      downloadFile(blob, `${filename}.png`);
    } else {
      throw new Error('Failed to create PNG blob');
    }
  }, 'image/png');
};

const downloadFile = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Utility to check if export is supported
export const isExportSupported = (): boolean => {
  return typeof document !== 'undefined' && 
         typeof URL !== 'undefined' && 
         typeof Blob !== 'undefined';
};
