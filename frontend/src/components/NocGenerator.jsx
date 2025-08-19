import React, { useRef, useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import NocPdfGenerator from './nocpdf.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
import './NocGenerator.css';

const NocGenerator = () => {
  const pdfRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const { studentData } = location.state || {};

  const [studentName, setStudentName] = useState(studentData?.studentName || '');
  const [rollNo, setRollNo] = useState(studentData?.rollNo || '');
  const [branch, setBranch] = useState(studentData?.branch || '');

  useEffect(() => {
    if (studentData) {
      setStudentName(studentData.studentName || '');
      setRollNo(studentData.rollNo || '');
      setBranch(studentData.branch || '');
    }
  }, [studentData]);

  const handleDownloadPdf = async () => {
    const element = pdfRef.current;
    if (!element) {
      console.error('Error: PDF target element not found.');
      alert('Failed to generate PDF: Content not ready.');
      return;
    }
    const opt = {
      margin: 0.5,
      filename: `NOC_${studentName.replace(/ /g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };

    try {
      const pdfBlob = await html2pdf().from(element).set(opt).output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="noc-generator-container">
      <div className="noc-generator-header">
        <h2>Generate NOC</h2>
        <button onClick={() => navigate(-1)} className="close-button">Close</button>
      </div>
      <div className="noc-form-fields">
        <label>
          Student Name:
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Enter Student Name"
          />
        </label>
        <label>
          Roll Number:
          <input
            type="text"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            placeholder="Enter Roll Number"
          />
        </label>
        <label>
          Branch:
          <input
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="Enter Branch"
          />
        </label>
      </div>
      <button onClick={handleDownloadPdf} className="download-pdf-button">
        Download PDF
      </button>

      <div style={{ position: 'absolute', left: '-9999px' }}>
        <NocPdfGenerator ref={pdfRef} studentName={studentName} rollNo={rollNo} branch={branch} />
      </div>
    </div>
  );
};

export default NocGenerator;