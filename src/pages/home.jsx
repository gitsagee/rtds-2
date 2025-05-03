import { useState } from 'react';
import { AlertCircle, CheckCircle, ChevronDown, Cpu, Database, DollarSign, Loader2 } from 'lucide-react';
import '../css/home.css'

export default function GPURecommender() {
  const [formData, setFormData] = useState({
    modelType: '',
    workloadType: 'training',
    datasetSize: 'medium',
    budget: 500,
    region: '',
    framework: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build a comprehensive prompt based on the form data
      const promptText = `
        I need a GPU instance with these requirements:
        - Model Type: ${formData.modelType || 'Any'}
        - Workload Type: ${formData.workloadType}
        - Dataset Size: ${formData.datasetSize}
        - Monthly Budget: $${formData.budget}
        - Region: ${formData.region || 'Any'}
        - Framework: ${formData.framework || 'Any'}
        
        Please recommend GPU configurations that would work well for this use case.
      `;

      // Call the FastAPI backend
      const response = await fetch('/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      
      // Transform API response to match our frontend structure
      const processedRecommendations = data.results.map((result, index) => {
        const instance = result.match;
        return {
          id: index + 1,
          name: instance.name || `GPU Instance ${index + 1}`,
          vcpus: instance.vcpus || 0,
          ram: `${instance.ram || 0} GB`,
          hourlyPrice: instance.price_per_hour || 0,
          monthlyPrice: instance.price_per_month || 0,
          spotPrice: instance.price_per_spot || 0,
          explanation: instance.description || 'No description available.',
          performanceScore: Math.round(100 - (result.distance * 10)) // Convert distance to a score
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
      <div className="wrapper">
        <div className="header">
          <h1 className="title">GPU Cost Optimizer & Recommender</h1>
          <p className="subtitle">Find the perfect GPU for your machine learning workloads</p>
        </div>

        <div className="card">
          <h2 className="section-title">Workload Configuration</h2>
          
          <div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="modelType" className="label">
                  Model Type
                </label>
                <div style={{position: 'relative'}}>
                  <select
                    id="modelType"
                    name="modelType"
                    value={formData.modelType}
                    onChange={handleInputChange}
                    className="select"
                  >
                    <option value="" disabled>Select model type</option>
                    <option value="cnn">CNN</option>
                    <option value="transformer">Transformer</option>
                    <option value="rnn">RNN/LSTM</option>
                    <option value="diffusion">Diffusion Model</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="label">
                  Workload Type
                </label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="workloadType"
                      value="training"
                      checked={formData.workloadType === 'training'}
                      onChange={handleInputChange}
                      className="radio"
                    />
                    <span>Training</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="workloadType"
                      value="inference"
                      checked={formData.workloadType === 'inference'}
                      onChange={handleInputChange}
                      className="radio"
                    />
                    <span>Inference</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="datasetSize" className="label">
                  Dataset Size
                </label>
                <div style={{position: 'relative'}}>
                  <select
                    id="datasetSize"
                    name="datasetSize"
                    value={formData.datasetSize}
                    onChange={handleInputChange}
                    className="select"
                  >
                    <option value="small">Small (&lt; 10GB)</option>
                    <option value="medium">Medium (10-100GB)</option>
                    <option value="large">Large (100GB-1TB)</option>
                    <option value="xlarge">X-Large (&gt; 1TB)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="budget" className="label">
                  Monthly Budget (USD)
                </label>
                <div className="input-group">
                  <div className="input-icon">
                    <DollarSign size={16} color="#9ca3af" />
                  </div>
                  <input
                    type="number"
                    name="budget"
                    id="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    min="0"
                    step="50"
                    className="icon-input"
                    placeholder="500"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="region" className="label">
                  Preferred Region
                </label>
                <div style={{position: 'relative'}}>
                  <select
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className="select"
                  >
                    <option value="" disabled>Select region</option>
                    <option value="mumbai">Mumbai</option>
                    <option value="delhi">Delhi</option>
                    <option value="bangalore">Bangalore</option>
                    <option value="asia-east">Asia East</option>
                    <option value="us-east">US East</option>
                    <option value="us-west">US West</option>
                    <option value="eu-central">EU Central</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="framework" className="label">
                  Framework (Optional)
                </label>
                <div style={{position: 'relative'}}>
                  <select
                    id="framework"
                    name="framework"
                    value={formData.framework}
                    onChange={handleInputChange}
                    className="select"
                  >
                    <option value="">Select framework (optional)</option>
                    <option value="pytorch">PyTorch</option>
                    <option value="tensorflow">TensorFlow</option>
                    <option value="jax">JAX</option>
                    <option value="mxnet">MXNet</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="button-container">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`button ${isLoading ? 'disabled' : ''}`}
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
                        <div className="pricing-row">
                          <span className="pricing-label">Spot:</span>
                          <span className="pricing-value">${gpu.spotPrice.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="performance-section">
                        <div className="progress-container">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{width: `${gpu.performanceScore}%`}}
                            ></div>
                          </div>
                          <span className="progress-value">{gpu.performanceScore}%</span>
                        </div>
                        <p className="explanation">{gpu.explanation}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="gpu-footer">
                    {gpu.hourlyPrice === 0 ? (
                      <button
                        onClick={() => handleRequestPricing(gpu.id)}
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
                Pricing request submitted successfully. Our team will contact you shortly.
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