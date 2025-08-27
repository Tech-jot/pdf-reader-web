import { useState } from 'react';
import PDFViewer from './components/PDFViewer.jsx';
import DOCXViewer from './components/DOCXViewer.jsx';
import FileUpload from './components/FileUpload.jsx';

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showViewer, setShowViewer] = useState(false);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setShowViewer(true);
  };

  const handleBackToUpload = () => {
    setSelectedFile(null);
    setShowViewer(false);
  };

  const getFileType = (file) => {
    if (!file) return null;
    if (file.type === 'application/pdf') return 'pdf';
    if (
      file.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx')
    ) {
      return 'docx';
    }
    return null;
  };

  const fileType = getFileType(selectedFile);

  return (
    <div className="min-vh-100 py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold text-white mb-3">
                <i className="bi bi-file-earmark-text me-3"></i>
                Document Viewer App
              </h1>
              <p className="lead text-white-50">
                Upload and view your PDF or DOCX files with our modern, responsive viewer
              </p>
            </div>

            {!showViewer ? (
              <FileUpload onFileSelect={handleFileSelect} />
            ) : (
              <>
                {fileType === 'pdf' && (
                  <PDFViewer file={selectedFile} onBack={handleBackToUpload} />
                )}
                {fileType === 'docx' && (
                  <DOCXViewer file={selectedFile} onBack={handleBackToUpload} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
