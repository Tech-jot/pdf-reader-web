import { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";

const DOCXViewer = ({ file, onBack }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1.0);
  const [pages, setPages] = useState([]); // simulated pages
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const buffer = e.target.result;
        try {
          containerRef.current.innerHTML = "";
          await renderAsync(buffer, containerRef.current);

          // Simulate page breaks (every ~1200px height as one "page")
          const content = containerRef.current;
          const contentHeight = content.scrollHeight;
          const pageHeight = 1200; // adjust to your needs
          const pageCount = Math.ceil(contentHeight / pageHeight);

          const simulatedPages = Array.from({ length: pageCount }, (_, i) => ({
            id: i + 1,
            top: i * pageHeight,
          }));

          setPages(simulatedPages);
        } catch (err) {
          console.error("Error rendering DOCX:", err);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }, [file]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1.0);
  };

  const scrollToPage = (pageNum) => {
    const page = pages[pageNum - 1];
    if (page) {
      containerRef.current.scrollTo({
        top: page.top,
        behavior: "smooth",
      });
      setCurrentPage(pageNum);
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body py-3 d-flex justify-content-between align-items-center">
              <button className="btn btn-outline-primary" onClick={onBack}>
                <i className="bi bi-arrow-left me-2"></i>
                Back to Upload
              </button>
              <h5 className="mb-0">
                <i className="bi bi-file-earmark-word text-primary me-2"></i>
                {file.name}
              </h5>
              <div className="btn-group">
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

      {/* Layout: Sidebar + Viewer */}
      <div className="row">
        {/* Page Navigation */}
        <div className="col-lg-3 mb-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-list-ol me-2"></i> Pages
              </h6>
            </div>
            <div
              className="card-body p-2"
              style={{ maxHeight: "70vh", overflowY: "auto" }}
            >
              {pages.map((p) => (
                <button
                  key={p.id}
                  className={`btn btn-sm w-100 mb-1 ${
                    currentPage === p.id ? "btn-primary" : "btn-outline-secondary"
                  }`}
                  onClick={() => scrollToPage(p.id)}
                >
                  Page {p.id}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* DOCX Viewer */}
        <div className="col-lg-9">
          <div className="card">
            <div
              ref={containerRef}
              className="card-body"
              style={{
                height: "80vh",
                overflowY: "auto",
                background: "white",
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
              onScroll={(e) => {
                const scrollTop = e.target.scrollTop;
                const pageHeight = 1200;
                const pageIndex = Math.floor(scrollTop / pageHeight) + 1;
                setCurrentPage(pageIndex);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DOCXViewer;
