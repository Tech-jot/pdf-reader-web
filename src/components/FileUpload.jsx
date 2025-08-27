import { useRef, useState } from 'react';

const FileUpload = ({ onFileSelect }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleFileSelection = (file) => {
    if (file.type === 'application/pdf' || file.name.endsWith('.docx')) {
      setSelectedFileName(file.name);
      setSelectedFile(file);
      console.log('File selected:', file.name);
    } else {
      alert('Please select a PDF or DOCX file only.');
    }
  };

  const handleViewFile = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="card fade-in">
          <div className="card-body p-5">
            <div
              className={`upload-area d-flex flex-column justify-content-center align-items-center p-5 ${
                isDragOver ? 'dragover' : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              style={{ cursor: 'pointer' }}
            >
              <i className="bi bi-cloud-upload display-1 text-primary mb-4"></i>

              <h3 className="text-center mb-3">
                Drop your PDF or DOCX file here
              </h3>

              <p className="text-muted text-center mb-4">
                or click to browse from your computer
              </p>

              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.docx"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              <button
                type="button"
                className="btn btn-primary btn-lg px-5"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerFileInput();
                }}
              >
                <i className="bi bi-folder2-open me-2"></i>
                Browse Files
              </button>
            </div>

            {selectedFileName && (
              <div className="mt-4 fade-in">
                <div className="alert alert-success d-flex align-items-center">
                  <i className="bi bi-check-circle-fill me-3"></i>
                  <div className="flex-grow-1">
                    <strong>File Selected:</strong> {selectedFileName}
                  </div>
                </div>

                <div className="text-center">
                  <button
                    className="btn btn-success btn-lg px-5"
                    onClick={handleViewFile}
                  >
                    <i className="bi bi-eye me-2"></i>
                    View File
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4">
              <div className="row text-center">
                <div className="col-md-4">
                  <i className="bi bi-shield-check display-6 text-success"></i>
                  <h5 className="mt-2">Secure</h5>
                  <p className="text-muted small">Your files are processed securely</p>
                </div>
                <div className="col-md-4">
                  <i className="bi bi-lightning-charge display-6 text-warning"></i>
                  <h5 className="mt-2">Fast</h5>
                  <p className="text-muted small">Quick loading and rendering</p>
                </div>
                <div className="col-md-4">
                  <i className="bi bi-phone display-6 text-info"></i>
                  <h5 className="mt-2">Responsive</h5>
                  <p className="text-muted small">Works on all devices</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
