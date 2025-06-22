import React, { useEffect, useState, useRef } from 'react';
import { fetchHistory } from '../services/historyAPI';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import Chart from 'chart.js/auto';

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token');
      const data = await fetchHistory(token);
      setHistory(data);
    };
    load();
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      const ctx = document.getElementById('myChart');
      if (chartRef.current) chartRef.current.destroy();

      chartRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: history.map(h => h.xAxis),
          datasets: [{
            label: 'Y Axis Value',
            data: history.map(h => parseInt(h.yAxis)),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
          }],
        },
      });
    }
  }, [history]);

  const handleDownload = async () => {
    const canvasElement = document.getElementById('myChart');
    const canvas = await html2canvas(canvasElement);

    canvas.toBlob(blob => saveAs(blob, 'chart.png'));

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    pdf.addImage(imgData, 'PNG', 10, 10, 180, 100);
    pdf.save('chart.pdf');
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Your Analysis History</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 shadow rounded">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>File</th>
                <th>X Axis</th>
                <th>Y Axis</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.fileName}</td>
                  <td>{item.xAxis}</td>
                  <td>{item.yAxis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-4 shadow rounded">
          <canvas id="myChart"></canvas>
          <button onClick={handleDownload} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
            Download PNG/PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;