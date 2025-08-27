
import { useState, useEffect, useRef } from 'react';

const PDFViewer = ({ file, onBack }) => {
  const [pdf, setPdf] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1.0);
  const canvasRefs = useRef([]);

  useEffect(() => {
    if (file) {
      loadPDF();
    }
  }, [file]);

  const loadPDF = async () => {
    try {
      setIsLoading(true);
      console.log('Loading PDF:', file.name);
      
      // Set PDF.js worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      
      const fileReader = new FileReader();
      fileReader.onload = async function() {
        const typedarray = new Uint8Array(this.result);
        
        try {
          const pdfDoc = await pdfjsLib.getDocument(typedarray).promise;
          setPdf(pdfDoc);
          setNumPages(pdfDoc.numPages);
          console.log('PDF loaded successfully. Pages:', pdfDoc.numPages);
          
          // Initialize canvas refs array
          canvasRefs.current = Array(pdfDoc.numPages).fill(null).map(() => ({ current: null }));
          
          setIsLoading(false);
        } catch (error) {
          console.error('Error loading PDF:', error);
          alert('Error loading PDF. Please try again.');
          setIsLoading(false);
        }
      };
      
      fileReader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error in loadPDF:', error);
      setIsLoading(false);
    }
  };

  const renderPage = async (pageNumber) => {
    if (!pdf) return;
    
    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      
      const canvas = canvasRefs.current[pageNumber - 1]?.current;
      if (!canvas) return;
      
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      console.log(`Page ${pageNumber} rendered successfully`);
    } catch (error) {
      console.error(`Error rendering page ${pageNumber}:`, error);
    }
  };

  useEffect(() => {
    if (pdf && numPages > 0) {
      // Render all pages
      for (let i = 1; i <= numPages; i++) {
        setTimeout(() => renderPage(i), i * 100); // Stagger rendering
      }
    }
  }, [pdf, numPages, scale]);

  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1.0);
  };

  const scrollToPage = (pageNum) => {
    const canvas = canvasRefs.current[pageNum - 1]?.current;
    if (canvas) {
      canvas.scrollIntoView({ behavior: 'smooth' });
      setCurrentPage(pageNum);
    }
  };

  if (isLoading) {
    return (
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card fade-in">
            <div className="card-body text-center p-5">
              <div className="loading-spinner"></div>
              <h4 className="mt-3">Loading PDF...</h4>
              <p className="text-muted">Please wait while we prepare your document</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header Controls */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body py-3">
              <div className="row align-items-center">
                <div className="col-md-4">
                  <button 
                    className="btn btn-outline-primary"
                    onClick={onBack}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Upload
                  </button>
                </div>
                
                <div className="col-md-4 text-center">
                  <h5 className="mb-0">
                    <i className="bi bi-file-earmark-pdf me-2 text-danger"></i>
                    {file.name}
                  </h5>
                  <small className="text-muted">{numPages} pages</small>
                </div>
                
                <div className="col-md-4">
                  <div className="btn-group float-end">
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={handleZoomOut}
                      disabled={scale <= 0.5}
                    >
                      <i className="bi bi-zoom-out"></i>
                    </button>
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={handleResetZoom}
                    >
                      {Math.round(scale * 100)}%
                    </button>
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={handleZoomIn}
                      disabled={scale >= 3.0}
                    >
                      <i className="bi bi-zoom-in"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Page Navigation Sidebar */}
        <div className="col-lg-3 mb-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-list-ol me-2"></i>
                Pages
              </h6>
            </div>
            <div className="card-body p-2" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  className={`btn btn-sm w-100 mb-1 ${
                    currentPage === pageNum ? 'btn-primary' : 'btn-outline-secondary'
                  }`}
                  onClick={() => scrollToPage(pageNum)}
                >
                  Page {pageNum}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PDF Display Area */}
        <div className="col-lg-9">
          <div className="card">
            <div className="card-body p-0">
              <div className="pdf-container">
                {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                  <div key={pageNum} className="text-center pdf-page">
                    <div className="mb-2">
                      <small className="badge bg-secondary">Page {pageNum}</small>
                    </div>
                    <canvas
                      ref={(el) => {
                        if (canvasRefs.current[pageNum - 1]) {
                          canvasRefs.current[pageNum - 1].current = el;
                        }
                      }}
                      className="border rounded shadow-sm"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
