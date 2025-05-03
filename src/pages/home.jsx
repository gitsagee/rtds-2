import { useState } from 'react';
import { AlertCircle, CheckCircle, Loader2, Cpu, Database, DollarSign } from 'lucide-react';
import '../css/home.css';

export default function GPURecommender() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);
  const handleButtonClick = (type, gpuId) => {
    if (type === 'reserve') {
      setError(null); // Ensure it's not treated as an error
    } else if (type === 'request') {
      setError(null); // Again, reset any existing error
    }
  
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };
  

  // Sample values to show as hints
  const sampleValues = {
    modelType: 'transformer',
    workloadType: 'training',
    datasetSize: 'medium (10-100GB)',
    budget: '$500',
    region: 'US East',
    framework: 'PyTorch'
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call the FastAPI backend with the raw prompt
      const response = await fetch('http://localhost:8000/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      
      // Transform API response to match our frontend structure
      const processedRecommendations = data.results.map((result, index) => {
        const instance = result.match;
        console.log(instance)
        return {
          id: index + 1,
          name: instance.name || `GPU Instance ${index + 1}`,
          vcpus: instance.vcpus || 0,
          ram: `${instance.ram || 0} GB`,
          hourlyPrice: instance.price_per_hour || 0,
          monthlyPrice: instance.price_per_month || 0,
          explanation: instance.gpu_description || 'No description available.',
          performanceScore: Math.round(100 - (result.distance * 10)) 
        };
      });

      setRecommendations(processedRecommendations);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError("Failed to fetch recommendations. Please try again.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPricing = (gpuId) => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  return (
    <div className="container">
      {/* New Header */}
      <header className="site-header">
        <div className="logo">
          <img src="/api/placeholder/40/40" alt="Logo" />
          <h1>GPU Optimizer</h1>
        </div>
        <nav className="nav-links">
          <a href="#" className="nav-link">Home</a>
          <a href="#" className="nav-link">Pricing</a>
          <a href="#" className="nav-link">Contact</a>
          <a href="#" className="nav-link highlight">Login</a>
        </nav>
      </header>

      <div className="wrapper">
        <div className="header">
          <h1 className="title">GPU Cost Optimizer & Recommender</h1>
          <p className="subtitle">Find the perfect GPU for your machine learning workloads using natural language</p>
        </div>

        <div className="card">
          <h2 className="section-title">Describe Your ML Workload</h2>
          
          <div className="prompt-container">
            <textarea
              className="prompt-textarea"
              value={prompt}
              onChange={handlePromptChange}
              placeholder={`Describe your GPU needs in natural language. For example:

I need a GPU for training a transformer model with a medium-sized dataset (around 50GB).
My monthly budget is $500, and I prefer the US East region.
I'm using PyTorch for development.`}
              rows={6}
            />
            
            <div className="hints-container">
              <h3 className="hints-title">Suggested Parameters to Include:</h3>
              <ul className="hints-list">
                <li><strong>Model Type:</strong> {sampleValues.modelType}</li>
                <li><strong>Workload Type:</strong> {sampleValues.workloadType}</li>
                <li><strong>Dataset Size:</strong> {sampleValues.datasetSize}</li>
                <li><strong>Budget:</strong> {sampleValues.budget}</li>
                <li><strong>Region:</strong> {sampleValues.region}</li>
                <li><strong>Framework:</strong> {sampleValues.framework}</li>
              </ul>
            </div>

            <div className="button-container">
              <button
                onClick={handleSubmit}
                disabled={isLoading || !prompt.trim()}
                className={`button ${isLoading || !prompt.trim() ? 'disabled' : ''}`}
                onMouseEnter={() => setHoveredButton('submit')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="spin" style={{marginRight: '0.5rem'}} />
                    Getting Recommendations...
                  </>
                ) : (
                  "Get Recommendations"
                )}
              </button>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="loading-container">
            <Loader2 size={40} className="spin" />
            <p className="loading-text">Analyzing optimal GPU configurations...</p>
          </div>
        )}

        {recommendations && !isLoading && (
          <div style={{marginBottom: '3rem'}}>
            <h2 className="section-title">Recommended GPU Configurations</h2>
            <div className="recommendations-grid">
              {recommendations.map((gpu) => (
                <div 
                  key={gpu.id} 
                  className="gpu-card"
                  onMouseEnter={() => setHoveredCard(gpu.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="gpu-header">
                    <h3 className="gpu-title">{gpu.name}</h3>
                  </div>
                  
                  <div className="gpu-content">
                    <div style={{marginBottom: '1.5rem'}}>
                      <div className="spec-item">
                        <Cpu size={18} className="spec-icon" />
                        <span className="spec-text">{gpu.vcpus} vCPUs</span>
                      </div>
                      
                      <div className="spec-item">
                        <Database size={18} className="spec-icon" />
                        <span className="spec-text">{gpu.ram} RAM</span>
                      </div>
                      
                      <div className="pricing-section">
                        <div className="pricing-row">
                          <span className="pricing-label">Hourly:</span>
                          <span className="pricing-value">${gpu.hourlyPrice.toFixed(2)}</span>
                        </div>
                        <div className="pricing-row">
                          <span className="pricing-label">Monthly:</span>
                          <span className="pricing-value">${gpu.monthlyPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    
                    </div>
                  </div>
                  
                  <div className="gpu-footer">
                    {gpu.hourlyPrice === 0 ? (
                      <button
                      onClick={() => handleButtonClick('request', gpu.id)}
                      className="outline-button"
                        onMouseEnter={() => setHoveredButton(`request-${gpu.id}`)}
                        onMouseLeave={() => setHoveredButton(null)}
                      >
                        Request Pricing
                      </button>
                    ) : (
                      <button 
                        className="primary-button"
                        onMouseEnter={() => setHoveredButton(`reserve-${gpu.id}`)}
                        onMouseLeave={() => setHoveredButton(null)}
                        onClick={() => handleButtonClick('reserve', gpu.id)}
                      >
                        Reserve Instance
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New Footer */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>GPU Optimizer</h3>
            <p>Finding the perfect GPU for your machine learning workloads at the best price.</p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Pricing</a></li>
              <li><a href="#">Documentation</a></li>
              <li><a href="#">Support</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Contact</h3>
            <p>Email: sujalgp2003@gmail.com</p>
            <p>Phone: 9718836800</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 GPU Optimizer. All rights reserved.</p>
        </div>
      </footer>

      {/* Toast notification */}
      {showToast && (
  <div className="toast">
    {error ? (
      <>
        <div className={`toast-icon error-icon`}>
          <AlertCircle size={16} />
        </div>
        <div className="toast-message">{error}</div>
      </>
    ) : (
      <>
        <div className={`toast-icon success-icon`}>
          <CheckCircle size={16} />
        </div>
        <div className="toast-message">
          {hoveredButton?.startsWith('reserve')
            ? 'You will be notified soon.'
            : 'Pricing request submitted successfully. Our team will contact you shortly.'}
        </div>
      </>
    )}
    <button
      type="button"
      className="close-button"
      onClick={() => setShowToast(false)}
    >
      <span className="sr-only">Close</span>
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
      </svg>
    </button>
  </div>
)}

    </div>
  );
}