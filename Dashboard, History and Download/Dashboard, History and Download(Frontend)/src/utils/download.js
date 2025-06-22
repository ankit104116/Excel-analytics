import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";

export const downloadChart = async (id = 'myChart') => {
  const chart = document.getElementById(id);
  if (!chart) {
    console.error("Chart element not found");
    return;
  }

  const canvas = await html2canvas(chart);

  canvas.toBlob(blob => {
    if (blob) {
      saveAs(blob, 'chart.png');
    }
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF();
  pdf.addImage(imgData, 'PNG', 10, 10, 180, 100);
  pdf.save('chart.pdf');
};