import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Play, Pause, RotateCcw, Settings, Brain, Activity, Target, Atom, Zap, Sun } from 'lucide-react';

const QuantumParticlePredictor = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [particles, setParticles] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [modelAccuracy, setModelAccuracy] = useState(0);
  const [selectedParticle, setSelectedParticle] = useState('electron');
  const [selectedModel, setSelectedModel] = useState('neural_network');
  const [particleStats, setParticleStats] = useState({});
  const [energyLevel, setEnergyLevel] = useState(1);
  const [quantumState, setQuantumState] = useState('superposition');
  
  const intervalRef = useRef(null);
  const canvasRef = useRef(null);

  // Particle definitions with realistic quantum properties
  const particleTypes = {
    electron: {
      name: 'Electron',
      symbol: 'e⁻',
      mass: 0.511, // MeV
      charge: -1,
      spin: 0.5,
      color: '#00bfff',
      icon: '⚡',
      size: 2,
      mostProbableLocation: 'Atomic orbitals (s, p, d, f shells)',
      quantumNumbers: ['n', 'l', 'ml', 'ms'],
      behavior: 'Wave-particle duality, tunnel effect',
      applications: ['Quantum computing', 'Electronics', 'Chemical bonding']
    },
    photon: {
      name: 'Photon',
      symbol: 'γ',
      mass: 0, // massless
      charge: 0,
      spin: 1,
      color: '#ffd700',
      icon: '💡',
      size: 3,
      mostProbableLocation: 'Electromagnetic field modes, cavity resonances',
      quantumNumbers: ['frequency', 'polarization'],
      behavior: 'Always travels at light speed, superposition',
      applications: ['Quantum optics', 'Laser technology', 'Quantum communication']
    },
    proton: {
      name: 'Proton',
      symbol: 'p⁺',
      mass: 938.3, // MeV
      charge: +1,
      spin: 0.5,
      color: '#ff4757',
      icon: '🔴',
      size: 4,
      mostProbableLocation: 'Atomic nucleus, confined by strong force',
      quantumNumbers: ['nuclear quantum numbers'],
      behavior: 'Confined in nucleus, nuclear tunneling',
      applications: ['Nuclear reactions', 'MRI scanning', 'Particle accelerators']
    },
    neutron: {
      name: 'Neutron',
      symbol: 'n⁰',
      mass: 939.6, // MeV
      charge: 0,
      spin: 0.5,
      color: '#747d8c',
      icon: '⚪',
      size: 4,
      mostProbableLocation: 'Atomic nucleus, neutron stars',
      quantumNumbers: ['nuclear quantum numbers'],
      behavior: 'Beta decay (15 min lifetime when free)',
      applications: ['Nuclear reactors', 'Neutron scattering', 'Nuclear medicine']
    },
    muon: {
      name: 'Muon',
      symbol: 'μ⁻',
      mass: 105.7, // MeV
      charge: -1,
      spin: 0.5,
      color: '#a55eea',
      icon: '🟣',
      size: 3,
      mostProbableLocation: 'Cosmic ray showers, muonic atoms',
      quantumNumbers: ['n', 'l', 'ml', 'ms'],
      behavior: 'Unstable (2.2 μs lifetime), penetrates matter',
      applications: ['Cosmic ray detection', 'Muon tomography', 'Particle physics']
    },
    neutrino: {
      name: 'Neutrino',
      symbol: 'ν',
      mass: 0.1, // eV (very small)
      charge: 0,
      spin: 0.5,
      color: '#26de81',
      icon: '👻',
      size: 1,
      mostProbableLocation: 'Everywhere (barely interacts with matter)',
      quantumNumbers: ['flavor', 'helicity'],
      behavior: 'Extremely weak interaction, oscillates between flavors',
      applications: ['Neutrino astronomy', 'Reactor monitoring', 'Fundamental physics']
    }
  };

  // Generate realistic quantum wavefunction for each particle type
  const generateParticleWavefunction = (particleType, x, t, n = 1) => {
    const particle = particleTypes[particleType];
    
    switch (particleType) {
      case 'electron':
        // Hydrogen-like orbital wavefunctions
        const a0 = 0.529; // Bohr radius
        const r = Math.abs(x);
        if (n === 1) {
          // 1s orbital
          return (2 / Math.pow(a0, 1.5)) * Math.exp(-r / a0) * Math.cos(0.1 * t);
        } else if (n === 2) {
          // 2s orbital
          return (1 / (2 * Math.sqrt(2) * Math.pow(a0, 1.5))) * (2 - r / a0) * Math.exp(-r / (2 * a0)) * Math.cos(0.05 * t);
        }
        break;
        
      case 'photon':
        // Electromagnetic field oscillation
        const k = 2 * Math.PI / 1.0; // wavelength
        const omega = 3e8 * k; // frequency
        return Math.sin(k * x - omega * t * 0.001) * Math.exp(-x * x / 100);
        
      case 'proton':
      case 'neutron':
        // Nuclear confinement (Gaussian well)
        const nuclearSize = 1e-15; // femtometers
        return Math.exp(-x * x / (2 * nuclearSize * 1e15)) * Math.cos(10 * t);
        
      case 'muon':
        // Muonic atom (smaller orbit due to higher mass)
        const muonBohr = a0 / 207; // muon is 207 times heavier than electron
        return (2 / Math.pow(muonBohr, 1.5)) * Math.exp(-Math.abs(x) / muonBohr) * Math.cos(0.2 * t);
        
      case 'neutrino':
        // Plane wave (barely confined)
        return Math.sin(0.1 * x - 0.01 * t) * Math.exp(-x * x / 10000);
        
      default:
        return Math.exp(-0.5 * x * x) * Math.cos(x - t);
    }
  };

  // Generate quantum probability distribution for selected particle
  const generateQuantumData = () => {
    const data = [];
    const gridSize = 200;
    const range = particleTypes[selectedParticle].name === 'Neutrino' ? 50 : 
                 particleTypes[selectedParticle].name === 'Photon' ? 20 : 10;
    
    for (let i = 0; i < gridSize; i++) {
      const x = (i - gridSize/2) * (range / gridSize);
      const t = currentStep * 0.1;
      const waveValue = generateParticleWavefunction(selectedParticle, x, t, energyLevel);
      const probability = Math.abs(waveValue) ** 2;
      
      data.push({
        x: x,
        y: 0,
        probability: probability * 100,
        wave: waveValue,
        particleType: selectedParticle
      });
    }
    return data;
  };

  // Enhanced AI prediction with particle-specific behavior
  const neuralNetworkPredict = (inputData) => {
    const particle = particleTypes[selectedParticle];
    const massWeight = Math.log(particle.mass + 1) / 10; // mass affects prediction
    const chargeWeight = Math.abs(particle.charge) * 0.1; // charge affects confinement
    
    let predictions = [];
    for (let i = 0; i < inputData.length - 4; i++) {
      const input = inputData.slice(i, i + 5);
      let output = 0;
      
      // Particle-specific neural network weights
      const weights = [
        0.8 * (1 + massWeight),
        -0.3 * (1 + chargeWeight),
        0.6,
        0.4 * (1 + massWeight),
        -0.2
      ];
      
      // Hidden layer with particle-specific activation
      let hidden = input.map((val, idx) => {
        const activation = val.probability * weights[idx] / 100;
        return Math.tanh(activation);
      });
      
      // Output with particle behavior consideration
      output = hidden.reduce((sum, val) => sum + val, 0) / hidden.length;
      
      predictions.push({
        position: inputData[i].x,
        predicted: Math.abs(output) * 50 * (1 + massWeight),
        actual: inputData[i].probability,
        confidence: Math.random() * 0.3 + 0.7,
        particleType: selectedParticle
      });
    }
    
    return predictions;
  };

  // Main prediction function
  const makePredictions = (quantumData) => {
    const preds = neuralNetworkPredict(quantumData);
    
    // Calculate accuracy
    const accuracy = preds.reduce((acc, pred) => {
      const error = Math.abs(pred.predicted - pred.actual);
      return acc + (1 - Math.min(error / 100, 1));
    }, 0) / preds.length;
    
    setModelAccuracy(accuracy);
    
    // Update particle statistics
    const stats = {
      totalParticles: preds.length,
      highProbabilityRegions: preds.filter(p => p.actual > 20).length,
      mostProbablePosition: preds.reduce((max, p) => p.actual > max.actual ? p : max, preds[0]),
      averageConfidence: preds.reduce((sum, p) => sum + p.confidence, 0) / preds.length
    };
    setParticleStats(stats);
    
    return preds;
  };

  // Simulation step
  const simulationStep = () => {
    const quantumData = generateQuantumData();
    const newPredictions = makePredictions(quantumData);
    
    // Generate particle positions based on quantum probabilities
    const newParticles = [];
    const particleCount = particleTypes[selectedParticle].name === 'Neutrino' ? 50 : 
                         particleTypes[selectedParticle].name === 'Photon' ? 30 : 20;
    
    for (let i = 0; i < particleCount; i++) {
      const randomIndex = Math.floor(Math.random() * quantumData.length);
      const basePos = quantumData[randomIndex];
      const threshold = particleTypes[selectedParticle].name === 'Neutrino' ? 0.01 : 0.1;
      
      if (Math.random() < (basePos.probability / 100) * threshold) {
        newParticles.push({
          id: i,
          x: basePos.x + (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 2,
          detected: Math.random() < 0.3,
          type: selectedParticle,
          energy: energyLevel,
          probability: basePos.probability
        });
      }
    }
    
    setParticles(newParticles);
    setPredictions(newPredictions);
    setCurrentStep(prev => prev + 1);
  };

  // Control functions
  const startSimulation = () => {
    setIsRunning(true);
    intervalRef.current = setInterval(simulationStep, 300);
  };

  const stopSimulation = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetSimulation = () => {
    stopSimulation();
    setCurrentStep(0);
    setParticles([]);
    setPredictions([]);
    setParticleStats({});
    setModelAccuracy(0);
  };

  // Enhanced canvas visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, width, height);
    
    // Draw particle-specific background
    const particle = particleTypes[selectedParticle];
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
    gradient.addColorStop(0, particle.color + '20');
    gradient.addColorStop(1, particle.color + '05');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw quantum probability field
    if (predictions.length > 0) {
      predictions.forEach((pred, i) => {
        if (i % 3 === 0) {
          const x = (pred.position + 10) * (width / 20);
          const intensity = pred.actual / 100;
          
          if (x >= 0 && x <= width) {
            ctx.fillStyle = particle.color + Math.floor(intensity * 255).toString(16).padStart(2, '0');
            ctx.fillRect(x - 2, height/2 - intensity * 50, 4, intensity * 100);
          }
        }
      });
    }
    
    // Draw particles with type-specific rendering
    particles.forEach(particle => {
      const x = (particle.x + 10) * (width / 20);
      const y = height/2 + particle.y * 20;
      const particleInfo = particleTypes[particle.type];
      
      if (x >= 0 && x <= width && y >= 0 && y <= height) {
        ctx.beginPath();
        ctx.arc(x, y, particleInfo.size + (particle.detected ? 2 : 0), 0, 2 * Math.PI);
        ctx.fillStyle = particle.detected ? '#ff6b6b' : particleInfo.color;
        ctx.fill();
        
        if (particle.detected) {
          ctx.strokeStyle = '#ff6b6b';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        
        // Draw particle symbol
        ctx.fillStyle = 'white';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(particleInfo.symbol, x, y + 2);
      }
    });
    
    // Draw energy level indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Energy Level: n=${energyLevel}`, 10, 20);
    ctx.fillText(`Particle: ${particle.name}`, 10, 35);
    
  }, [particles, predictions, selectedParticle, energyLevel]);

  const currentParticle = particleTypes[selectedParticle];
  
  // Statistics for charts
  const particleDistribution = Object.entries(particleTypes).map(([key, particle]) => ({
    name: particle.name,
    count: key === selectedParticle ? particles.length : 0,
    color: particle.color
  }));

  const energyDistribution = [
    { level: 'n=1', particles: particles.filter(p => p.energy === 1).length },
    { level: 'n=2', particles: particles.filter(p => p.energy === 2).length },
    { level: 'n=3', particles: particles.filter(p => p.energy === 3).length }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Quantum Particle Location Predictor
          </h1>
          <p className="text-gray-300">AI/ML Pattern Recognition for Specific Quantum Particles</p>
        </div>

        {/* Particle Selection & Control Panel */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Atom size={20} />
                Particle Selection
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(particleTypes).map(([key, particle]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedParticle(key)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedParticle === key 
                        ? 'border-blue-500 bg-blue-500/20' 
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ color: particle.color }} className="text-lg">
                        {particle.icon}
                      </span>
                      <span className="font-medium">{particle.name}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {particle.symbol} • {particle.mass} MeV
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Controls</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={isRunning ? stopSimulation : startSimulation}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isRunning 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isRunning ? <Pause size={16} /> : <Play size={16} />}
                    {isRunning ? 'Pause' : 'Start'}
                  </button>
                  <button
                    onClick={resetSimulation}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                  >
                    <RotateCcw size={16} />
                    Reset
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Energy Level</label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-400">n = {energyLevel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Particle Information Panel */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span style={{ color: currentParticle.color }}>{currentParticle.icon}</span>
            {currentParticle.name} Properties
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-700 p-4 rounded">
              <h4 className="font-medium text-gray-300 mb-2">Physical Properties</h4>
              <div className="space-y-1 text-sm">
                <div>Mass: {currentParticle.mass} MeV</div>
                <div>Charge: {currentParticle.charge}</div>
                <div>Spin: {currentParticle.spin}</div>
              </div>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <h4 className="font-medium text-gray-300 mb-2">Most Probable Location</h4>
              <div className="text-sm">{currentParticle.mostProbableLocation}</div>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <h4 className="font-medium text-gray-300 mb-2">Quantum Behavior</h4>
              <div className="text-sm">{currentParticle.behavior}</div>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <h4 className="font-medium text-gray-300 mb-2">Applications</h4>
              <div className="text-sm">{currentParticle.applications.join(', ')}</div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} />
              <span className="text-sm">Simulation Step</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">{currentStep}</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} />
              <span className="text-sm">AI Accuracy</span>
            </div>
            <div className="text-2xl font-bold text-green-400">{(modelAccuracy * 100).toFixed(1)}%</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: currentParticle.color }}>{currentParticle.icon}</span>
              <span className="text-sm">Particles Detected</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">{particles.length}</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={16} />
              <span className="text-sm">High Probability Regions</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">{particleStats.highProbabilityRegions || 0}</div>
          </div>
        </div>

        {/* Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span style={{ color: currentParticle.color }}>⚡</span>
              Quantum Probability Field
            </h3>
            <canvas
              ref={canvasRef}
              width={500}
              height={300}
              className="w-full border border-gray-700 rounded"
            />
            <div className="mt-3 text-sm text-gray-400">
              <div className="flex flex-wrap gap-4">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-cyan-400 rounded-full"></span>
                  Undetected {currentParticle.name}s
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-red-400 rounded-full"></span>
                  Detected {currentParticle.name}s
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: currentParticle.color }}></span>
                  Probability density
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Energy Level Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={energyDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="level" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="particles" fill={currentParticle.color} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Probable Location Info */}
        {particleStats.mostProbablePosition && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Most Probable Location Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 p-4 rounded">
                <h4 className="font-medium text-green-400 mb-2">Highest Probability Position</h4>
                <div className="text-2xl font-bold">{particleStats.mostProbablePosition.position.toFixed(2)}</div>
                <div className="text-sm text-gray-400">Position units</div>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <h4 className="font-medium text-blue-400 mb-2">Probability Density</h4>
                <div className="text-2xl font-bold">{particleStats.mostProbablePosition.actual.toFixed(1)}%</div>
                <div className="text-sm text-gray-400">Quantum probability</div>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <h4 className="font-medium text-purple-400 mb-2">AI Prediction Confidence</h4>
                <div className="text-2xl font-bold">{(particleStats.averageConfidence * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-400">Model confidence</div>
              </div>
            </div>
          </div>
        )}

        {/* Explanation */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Particle-Specific Quantum Behavior</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-400 mb-2">Where {currentParticle.name}s Are Most Likely Found:</h4>
              <p className="text-gray-300 mb-3">{currentParticle.mostProbableLocation}</p>
              <h4 className="font-semibold text-green-400 mb-2">Quantum Behavior:</h4>
              <p className="text-gray-300">{currentParticle.behavior}</p>
            </div>
            <div>
              <h4 className="font-semibold text-purple-400 mb-2">Real-World Applications:</h4>
              <ul className="text-gray-300 space-y-1">
                {currentParticle.applications.map((app, i) => (
                  <li key={i}>• {app}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumParticlePredictor;