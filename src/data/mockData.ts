import { User, Evidence, Project, Opportunity, Application, ProjectProposal, InAppNotification } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'std-1',
    name: 'Alex Rivera',
    email: 'alex.rivera@stanford.edu',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=280&q=80',
    college: 'Stanford University',
    department: 'Computer Science & AI',
    headline: 'AI Systems Researcher & Full-Stack Builder',
    bio: 'Senior building scalable machine learning pipelines, multimodal LLM architectures, and real-time distributed backends. Looking for research fellow & systems engineering roles.',
    github: 'https://github.com/alexrivera-ai',
    linkedin: 'https://linkedin.com/in/alex-rivera-cs',
    website: 'https://alexrivera.dev',
    batch: 'Class of 2026',
    isVerifiedStudent: true,
    publicProfileSettings: {
      showProofScore: true,
      showGpa: false,
      showCertificates: true,
      allowDirectInquiries: true,
    }
  },
  {
    id: 'std-2',
    name: 'Maya Chen',
    email: 'maya.chen@berkeley.edu',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=280&q=80',
    college: 'UC Berkeley',
    department: 'EECS - Software Engineering',
    headline: 'Cloud Architect & Interactive Web Systems Engineer',
    bio: 'Junior specializing in distributed microservices, edge computing, TypeScript ecosystems, and high-performance frontend engineering.',
    github: 'https://github.com/mayachen-cloud',
    linkedin: 'https://linkedin.com/in/mayachen-eecs',
    batch: 'Class of 2027',
    isVerifiedStudent: true,
    publicProfileSettings: {
      showProofScore: true,
      showGpa: false,
      showCertificates: true,
      allowDirectInquiries: true,
    }
  },
  {
    id: 'std-3',
    name: 'Dev Patel',
    email: 'dev.patel@mit.edu',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=280&q=80',
    college: 'MIT',
    department: 'Electrical Engineering & Computer Science',
    headline: 'IoT Hardware Hacker & Data Pipeline Specialist',
    bio: 'Sophomore bridging low-power embedded sensor networks with cloud-scale telemetry pipelines and real-time anomaly detection.',
    github: 'https://github.com/devpatel-iot',
    linkedin: 'https://linkedin.com/in/devpatel-mit',
    batch: 'Class of 2028',
    isVerifiedStudent: true,
    publicProfileSettings: {
      showProofScore: true,
      showGpa: false,
      showCertificates: true,
      allowDirectInquiries: true,
    }
  },
  {
    id: 'fac-1',
    name: 'Prof. Alan Vance',
    email: 'alan.vance@stanford.edu',
    role: 'faculty',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=280&q=80',
    college: 'Stanford University',
    department: 'Department of Computer Science',
    headline: 'Associate Professor & AI Systems Lab Director',
    bio: 'Researching neural compiler architectures, edge inference, and academic proposal rigor.',
  },
  {
    id: 'plc-1',
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@stanford.edu',
    role: 'placement',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=280&q=80',
    college: 'Stanford University',
    department: 'University Career & Placement Office',
    headline: 'Director of Industry Partnerships & Placements',
    bio: 'Connecting proven engineering talent with top-tier research labs and technology ventures.',
  }
];

export const MOCK_EVIDENCES: Evidence[] = [
  // Evidences for Alex Rivera (std-1)
  {
    id: 'ev-1',
    studentId: 'std-1',
    title: 'Research Engineering Internship: Distributed Model Inference',
    type: 'Internship',
    description: 'Designed asynchronous TensorRT inference microservices reducing p99 latency by 34% on 8x H100 clusters. Co-authored internal benchmarking whitepaper.',
    date: '2026-08-15',
    url: 'https://github.com/alexrivera-ai/distributed-inference-bench',
    fileName: 'internship_evaluation_report_signed.pdf',
    fileSize: '1.8 MB',
    verificationStatus: 'verified',
    verifiedBy: 'Prof. Alan Vance',
    verifiedAt: '2026-08-28',
    skillsTagged: ['Python', 'PyTorch', 'Docker', 'Machine Learning', 'Team Leadership'],
    metrics: '34% p99 latency reduction across 12M daily requests',
    organizationOrEvent: 'Cerebras Systems & Stanford AI Lab'
  },
  {
    id: 'ev-2',
    studentId: 'std-1',
    title: 'SynapseNet: Sparse Attention Visual Transformer',
    type: 'Project',
    description: 'Implemented novel linear-time sparse attention kernel in CUDA/C++ and PyTorch. Published reproducible benchmark repository with 840+ GitHub stars.',
    date: '2026-05-10',
    url: 'https://github.com/alexrivera-ai/synapsenet-transformer',
    fileName: 'synapsenet_ieee_submission.pdf',
    fileSize: '3.4 MB',
    verificationStatus: 'verified',
    verifiedBy: 'Prof. Alan Vance',
    verifiedAt: '2026-05-20',
    skillsTagged: ['Python', 'PyTorch', 'C++', 'Machine Learning', 'Technical Writing'],
    metrics: '2.8x speedup over standard MultiheadAttention on 4K sequences',
    organizationOrEvent: 'Independent Senior Capstone'
  },
  {
    id: 'ev-3',
    studentId: 'std-1',
    title: '1st Place Winner - HackMIT: EduPulse Multimodal Scribe',
    type: 'Hackathon',
    description: 'Built real-time classroom speech-to-diagram generation engine using Whisper, Gemini API, and React SVG canvas in 36 hours. Selected as Grand Prize among 240 teams.',
    date: '2025-11-20',
    url: 'https://devpost.com/software/edupulse-scribe',
    verificationStatus: 'verified',
    verifiedBy: 'Dr. Sarah Jenkins',
    verifiedAt: '2025-11-25',
    skillsTagged: ['Python', 'React', 'TypeScript', 'Machine Learning', 'Presentation & Speaking'],
    metrics: 'Grand Champion / 1st of 240 collegiate teams',
    organizationOrEvent: 'HackMIT 2025'
  },
  {
    id: 'ev-4',
    studentId: 'std-1',
    title: 'NeurIPS 2025 Workshop Best Student Paper Award',
    type: 'Achievement',
    description: 'Awarded Best Student Paper at NeurIPS Workshop on Efficient Deep Learning for paper titled "Quantized Routing in Sparse Mixture-of-Experts".',
    date: '2025-12-14',
    url: 'https://openreview.net/forum?id=synapse-moe',
    fileName: 'neurips_award_certificate.pdf',
    verificationStatus: 'verified',
    verifiedBy: 'Prof. Alan Vance',
    verifiedAt: '2025-12-18',
    skillsTagged: ['Machine Learning', 'Technical Writing', 'Python'],
    metrics: 'Top 1% of accepted workshop papers',
    organizationOrEvent: 'NeurIPS Foundation'
  },
  {
    id: 'ev-5',
    studentId: 'std-1',
    title: 'AWS Certified Machine Learning - Specialty',
    type: 'Certificate',
    description: 'Validated advanced expertise in designing, implementing, deploying, and maintaining ML solutions on AWS architecture.',
    date: '2026-02-04',
    url: 'https://aws.amazon.com/verification/cred-8842',
    fileName: 'aws_certified_ml_specialty.pdf',
    verificationStatus: 'verified',
    verifiedBy: 'Prof. Alan Vance',
    verifiedAt: '2026-02-10',
    skillsTagged: ['AWS', 'Cloud', 'Docker', 'Machine Learning'],
    metrics: 'Scored 912 / 1000',
    organizationOrEvent: 'Amazon Web Services'
  },
  {
    id: 'ev-6',
    studentId: 'std-1',
    title: 'Full-Stack Telemetry Observability Suite for Autonomous Rovers',
    type: 'Project',
    description: 'Built high-throughput WebSocket telemetry ingestion engine with TimescaleDB / PostgreSQL, React dashboard, and MapLibre tracking.',
    date: '2026-09-02',
    url: 'https://github.com/alexrivera-ai/rover-telemetry-suite',
    verificationStatus: 'pending',
    skillsTagged: ['TypeScript', 'React', 'PostgreSQL', 'Docker', 'UI/UX Design'],
    metrics: 'Handles 45,000 telemetry points/sec with <15ms render latency',
    organizationOrEvent: 'Stanford Robotics Club'
  },
  {
    id: 'ev-7',
    studentId: 'std-1',
    title: 'ACM ICPC Regional Contest - Top 5 Finalist',
    type: 'Competition',
    description: 'Competed in Pacific Northwest Regional round, solving 8 complex algorithmic graph and dynamic programming challenges under tight time limits.',
    date: '2025-10-18',
    url: 'https://icpc.global/regionals/pnw-2025',
    verificationStatus: 'verified',
    verifiedBy: 'Prof. Alan Vance',
    verifiedAt: '2025-10-24',
    skillsTagged: ['C++', 'Python', 'Agile & Scrum'],
    metrics: 'Ranked 4th out of 72 university teams',
    organizationOrEvent: 'International Collegiate Programming Contest'
  },

  // Evidences for Maya Chen (std-2)
  {
    id: 'ev-10',
    studentId: 'std-2',
    title: 'Cloud Infrastructure Intern at Cloudflare',
    type: 'Internship',
    description: 'Engineered zero-trust worker caching rules and distributed KV storage optimization for high-traffic edge nodes.',
    date: '2026-07-20',
    verificationStatus: 'verified',
    verifiedBy: 'Prof. Alan Vance',
    skillsTagged: ['TypeScript', 'Node.js', 'AWS', 'Docker', 'CI/CD'],
    metrics: 'Decreased edge lookup times by 18ms',
    organizationOrEvent: 'Cloudflare Inc.'
  },
  {
    id: 'ev-11',
    studentId: 'std-2',
    title: 'CalHacks 2025 Winner: MicroState Interactive Engine',
    type: 'Hackathon',
    description: 'Architected real-time canvas collaboration system with CRDTs and WebSockets.',
    date: '2025-10-25',
    verificationStatus: 'verified',
    verifiedBy: 'Prof. Alan Vance',
    skillsTagged: ['TypeScript', 'React', 'UI/UX Design', 'Node.js'],
    metrics: 'Best Developer Tool Category Winner',
    organizationOrEvent: 'CalHacks'
  },

  // Evidences for Dev Patel (std-3)
  {
    id: 'ev-20',
    studentId: 'std-3',
    title: 'Smart Campus LoRa Mesh Telemetry Node',
    type: 'Project',
    description: 'Designed solar-powered soil & air telemetry node with custom PCB and ESP32 firmware transmitting 4km to campus base station.',
    date: '2026-04-12',
    verificationStatus: 'verified',
    verifiedBy: 'Prof. Alan Vance',
    skillsTagged: ['Internet of Things', 'Embedded Systems', 'Python', 'Data Analysis'],
    metrics: '99.4% packet reception rate across 90 continuous days',
    organizationOrEvent: 'MIT Media Lab Student Project'
  }
];

export const INSTITUTIONAL_PROJECT_ARCHIVE: Project[] = [
  {
    id: 'inst-1',
    studentId: 'alum-01',
    studentName: 'Julian Thorne',
    title: 'NeuroSync: Low-Latency EEG Brain-Computer Interface',
    description: 'A 16-channel EEG streaming pipeline running continuous wavelet transforms and real-time motor imagery classification on NVIDIA Jetson embedded GPUs.',
    domain: 'Biomedical Signal Processing & Embedded AI',
    problem: 'High temporal jitter and classification latency (>120ms) preventing reliable assistive prosthetic control.',
    technology: ['Python', 'PyTorch', 'C++', 'CUDA', 'Docker', 'Embedded Systems'],
    methodology: ['Wavelet Packet Decomposition', 'Spatial Filtering (CSP)', 'Lightweight Temporal Convolutional Networks'],
    metrics: '38ms roundtrip latency with 92.4% binary motor classification accuracy',
    verified: true,
    facultyVerifier: 'Prof. Alan Vance',
    date: '2024-05-18'
  },
  {
    id: 'inst-2',
    studentId: 'alum-02',
    studentName: 'Elena Rostova',
    title: 'CampusFlow: Graph-Based Transit Route Optimization',
    description: 'Real-time university shuttle scheduling and occupancy predictor based on multi-source Bluetooth beacon traces and schedule graph modeling.',
    domain: 'Urban Informatics & Graph Algorithms',
    problem: 'Overcrowded campus shuttles causing student delays during peak class transitions.',
    technology: ['Python', 'PostgreSQL', 'NetworkX', 'Docker', 'React', 'FastAPI'],
    methodology: ['Dynamic Shortest Path Routing (A*)', 'Markov Arrival Chains', 'Spatial Clustering'],
    metrics: 'Reduced average student wait times by 22% during peak 9am and 2pm rush',
    verified: true,
    facultyVerifier: 'Prof. Alan Vance',
    date: '2024-11-12'
  },
  {
    id: 'inst-3',
    studentId: 'alum-03',
    studentName: 'Marcus Vance',
    title: 'Decentralized Peer-to-Peer Academic Credential Ledger',
    description: 'Cryptographically verifiable student credential issuance protocol using zero-knowledge proofs and tamper-proof storage.',
    domain: 'Applied Cryptography & Distributed Systems',
    problem: 'Widespread resume fraud and cumbersome manual university registrar transcript verifications.',
    technology: ['Rust', 'TypeScript', 'PostgreSQL', 'Docker'],
    methodology: ['zk-SNARKs for credential verification', 'Merkle Tree Batching', 'DID Standards'],
    metrics: 'Instant sub-second verification with zero personal data leakage',
    verified: true,
    date: '2025-02-10'
  },
  {
    id: 'inst-4',
    studentId: 'alum-04',
    studentName: 'Aria Takahashi',
    title: 'Autonomous Quadcopter Navigation via Monocular Depth Estimation',
    description: 'Vision-only indoor collision avoidance for sub-250g quadcopters using distilled depth neural networks and optical flow.',
    domain: 'Robotics & Computer Vision',
    problem: 'GPS-denied indoor drone navigation where LiDAR sensors are too heavy and power-hungry.',
    technology: ['Python', 'PyTorch', 'ROS2', 'C++', 'Computer Vision'],
    methodology: ['Depth Distillation', 'Lucas-Kanade Optical Flow', 'Potential Field Trajectory Planning'],
    metrics: 'Zero collisions in 150 flight obstacle course trials at 3.5 m/s',
    verified: true,
    facultyVerifier: 'Prof. Alan Vance',
    date: '2025-04-22'
  },
  {
    id: 'inst-5',
    studentId: 'alum-05',
    studentName: 'Liam O’Connor',
    title: 'LLM-Driven Automated Grading & Formative Feedback System',
    description: 'Static analysis and LLM-assisted rubrics generator that flags logic bugs in introductory computer science programming submissions.',
    domain: 'AI in Education & Natural Language Processing',
    problem: 'Teaching assistants overwhelmed by grading 600+ weekly programming assignments with generic feedback.',
    technology: ['Python', 'Transformers', 'FastAPI', 'React', 'PostgreSQL'],
    methodology: ['Abstract Syntax Tree (AST) Diffing', 'Few-Shot Chain-of-Thought Rubric Scoring', 'Deterministic Lint Sandbox'],
    metrics: '94% alignment with senior instructor grading scores across 1,800 submissions',
    verified: true,
    facultyVerifier: 'Prof. Alan Vance',
    date: '2025-06-15'
  },
  {
    id: 'inst-6',
    studentId: 'alum-06',
    studentName: 'Tara Gupta',
    title: 'Energy-Harvesting LoRaWAN Sensor Mesh for Microclimate Monitoring',
    description: 'Ultra-low-power environmental telemetry mesh powered by ambient solar and RF harvesting across campus arboretum.',
    domain: 'Internet of Things & Wireless Sensor Networks',
    problem: 'Battery replacement overhead in remote research outdoor sensor deployments.',
    technology: ['Embedded Systems', 'C++', 'Internet of Things', 'Python', 'MQTT'],
    methodology: ['Duty-Cycled Sleep Scheduling', 'LoRaWAN Adaptive Data Rate', 'Time-Synchronized Channel Hopping'],
    metrics: 'Perpetual zero-battery operation across 14 months continuous outdoors',
    verified: true,
    date: '2025-08-30'
  },
  {
    id: 'inst-7',
    studentId: 'alum-07',
    studentName: 'Kavita Sundaram',
    title: 'Sub-Linear Streaming Cardinality Estimation for Large Data Pipelines',
    description: 'Hardware-accelerated HyperLogLog and Count-Min sketch implementations handling multi-gigabit campus firewall packet logs.',
    domain: 'High-Performance Data Engineering',
    problem: 'Memory exhaustion when computing unique IP and flow counts across 10Gbps backbone links.',
    technology: ['Go', 'C++', 'SQL', 'Docker', 'Data Analysis'],
    methodology: ['HyperLogLog++', 'Count-Min Sketch', 'SIMD Vectorized Hash Pipelines'],
    metrics: '0.8% error rate using only 12KB memory at 8.4 Gbps sustained traffic',
    verified: true,
    date: '2025-09-18'
  },
  {
    id: 'inst-8',
    studentId: 'alum-08',
    studentName: 'Zackariah Al-Mansoor',
    title: 'Federated Learning for Privacy-Preserving Health Analytics',
    description: 'Decentralized federated averaging framework allowing campus health clinics to train diagnostic models without aggregating patient EHR data.',
    domain: 'Privacy-Preserving Machine Learning & Healthcare',
    problem: 'HIPAA and student privacy restrictions preventing pooled data training for disease outbreak prediction.',
    technology: ['Python', 'PyTorch', 'Docker', 'Machine Learning', 'SQL'],
    methodology: ['Differential Privacy (DP-SGD)', 'Federated Averaging (FedAvg)', 'Homomorphic Encryption'],
    metrics: 'Achieved 89.2% diagnostic F1 score within epsilon=1.2 privacy budget',
    verified: true,
    facultyVerifier: 'Prof. Alan Vance',
    date: '2025-11-05'
  },
  {
    id: 'inst-9',
    studentId: 'alum-09',
    studentName: 'Chloe Dubois',
    title: 'Interactive 3D Molecular Docking Simulation for Drug Discovery',
    description: 'Browser-based WebGL simulation platform evaluating protein-ligand binding affinities with GPU-computed force fields.',
    domain: 'Computational Biophysics & Web Graphics',
    problem: 'Complex desktop molecular modeling software unusable by undergraduate biochemistry students.',
    technology: ['TypeScript', 'Three.js', 'React', 'Python', 'UI/UX Design'],
    methodology: ['CHARMM Force Field Approximation', 'Octree Spatial Partitioning', 'GLSL Compute Shaders'],
    metrics: 'Renders 120,000 atom macromolecules at smooth 60fps in Chrome browser',
    verified: true,
    date: '2025-12-02'
  },
  {
    id: 'inst-10',
    studentId: 'alum-10',
    studentName: 'Samir Ghosh',
    title: 'Real-Time Multi-Object Tracking for Campus Safety Analytics',
    description: 'Edge-computed pedestrian flow density and bicycle lane collision warning system utilizing privacy-masking optical sensors.',
    domain: 'Computer Vision & Edge Computing',
    problem: 'Pedestrian and micromobility collisions at busy campus intersections.',
    technology: ['Python', 'PyTorch', 'Computer Vision', 'Docker', 'C++'],
    methodology: ['YOLOv8 Edge Quantization', 'DeepSORT Kalman Filtering', 'On-Device Edge Anonymization'],
    metrics: '30fps edge processing on 15W Jetson Orin Nano with 0 face retention',
    verified: true,
    date: '2026-01-14'
  },
  {
    id: 'inst-11',
    studentId: 'alum-11',
    studentName: 'Nadia Becker',
    title: 'Quantum Circuit Synthesis via Reinforcement Learning',
    description: 'Deep reinforcement learning agent synthesizing minimal-gate Clifford+T quantum fault-tolerant circuits.',
    domain: 'Quantum Computing & Reinforcement Learning',
    problem: 'Exponential gate count overhead in compiling quantum algorithms to fault-tolerant hardware.',
    technology: ['Python', 'PyTorch', 'C++', 'Machine Learning'],
    methodology: ['Monte Carlo Tree Search (MCTS)', 'Proximal Policy Optimization (PPO)', 'ZX-Calculus Simplification'],
    metrics: '19.4% gate reduction compared to state-of-the-art Qiskit transpiler',
    verified: true,
    date: '2026-03-08'
  },
  {
    id: 'inst-12',
    studentId: 'alum-12',
    studentName: 'Felix Braun',
    title: 'Microservice Latency Anomaly Detection via GNN Telemetry',
    description: 'Graph neural network analyzing distributed OpenTelemetry traces to isolate root-cause service degradations in real time.',
    domain: 'Cloud Systems Observability & Graph AI',
    problem: 'Cascading timeout failures in cloud-native microservices taking hours to manually troubleshoot.',
    technology: ['Go', 'Python', 'PyTorch', 'Kubernetes', 'Docker'],
    methodology: ['Spatio-Temporal Graph Neural Networks (ST-GNN)', 'Distributed Trace DAG Reconstruction', 'Variational Autoencoders'],
    metrics: 'Identified root-cause failure service within 1.8 seconds of anomaly trigger',
    verified: true,
    date: '2026-04-19'
  }
];

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-1',
    title: 'Machine Learning Research Fellow - Multimodal Models',
    company: 'DeepMind Campus Lab',
    type: 'research',
    location: 'Mountain View, CA / Hybrid',
    workplaceType: 'Hybrid',
    stipendOrSalary: '$58 / hr + Housing Stipend',
    deadline: '2026-11-30',
    description: 'Work alongside world-class scientists training high-efficiency transformer architectures, sparse mixture-of-experts, and scalable multimodal reasoning systems.',
    requiredSkills: [
      { skillName: 'Python', weight: 5 },
      { skillName: 'PyTorch', weight: 5 },
      { skillName: 'Machine Learning', weight: 5 },
      { skillName: 'Docker', weight: 3 },
      { skillName: 'Technical Writing', weight: 4 },
      { skillName: 'C++', weight: 3 }
    ],
    postedBy: 'DeepMind University Relations',
    status: 'open',
    applicantCount: 38
  },
  {
    id: 'opp-2',
    title: 'Software Engineering Intern - Payment Systems & Reliability',
    company: 'Stripe',
    type: 'internship',
    location: 'San Francisco, CA / On-site',
    workplaceType: 'On-site',
    stipendOrSalary: '$62 / hr ($10,750 / mo)',
    deadline: '2026-11-15',
    description: 'Design fault-tolerant APIs, distributed transactional databases, and resilient settlement pipelines processing hundreds of billions in global commerce.',
    requiredSkills: [
      { skillName: 'TypeScript', weight: 4 },
      { skillName: 'React', weight: 3 },
      { skillName: 'PostgreSQL', weight: 5 },
      { skillName: 'Docker', weight: 4 },
      { skillName: 'Go', weight: 3 }
    ],
    postedBy: 'Stripe University Talent',
    status: 'open',
    applicantCount: 82
  },
  {
    id: 'opp-3',
    title: 'Product Engineering Intern - Systems & Collaboration Engine',
    company: 'Figma',
    type: 'internship',
    location: 'San Francisco, CA / Hybrid',
    workplaceType: 'Hybrid',
    stipendOrSalary: '$60 / hr + Relocation',
    deadline: '2026-12-05',
    description: 'Build lightning-fast canvas rendering systems, real-time multiplayer CRDT sync protocols, and intuitive interaction tooling for millions of product designers.',
    requiredSkills: [
      { skillName: 'TypeScript', weight: 5 },
      { skillName: 'React', weight: 5 },
      { skillName: 'UI/UX Design', weight: 4 },
      { skillName: 'C++', weight: 3 }
    ],
    postedBy: 'Figma Emerging Talent',
    status: 'open',
    applicantCount: 65
  },
  {
    id: 'opp-4',
    title: 'Data Systems & Query Engine Intern',
    company: 'Databricks',
    type: 'internship',
    location: 'Seattle, WA / On-site',
    workplaceType: 'On-site',
    stipendOrSalary: '$64 / hr',
    deadline: '2026-11-28',
    description: 'Contribute to next-generation Apache Spark and Photon vectorised execution engines, optimizing columnar file formats and distributed query planning.',
    requiredSkills: [
      { skillName: 'C++', weight: 5 },
      { skillName: 'Python', weight: 4 },
      { skillName: 'SQL', weight: 4 },
      { skillName: 'Docker', weight: 3 }
    ],
    postedBy: 'Databricks Engineering Recruitment',
    status: 'open',
    applicantCount: 44
  },
  {
    id: 'opp-5',
    title: 'Graduate / Senior Research Assistant - Tangible AI & Robotics',
    company: 'MIT Media Lab',
    type: 'research',
    location: 'Cambridge, MA / On-site',
    workplaceType: 'On-site',
    stipendOrSalary: '$44,000 / yr + Full Tuition Remission',
    deadline: '2026-12-15',
    description: 'Explore the intersection of physical interfaces, distributed sensor mesh networks, and generative interaction paradigms.',
    requiredSkills: [
      { skillName: 'Python', weight: 4 },
      { skillName: 'Embedded Systems', weight: 4 },
      { skillName: 'Internet of Things', weight: 4 },
      { skillName: 'React', weight: 3 },
      { skillName: 'Presentation & Speaking', weight: 3 }
    ],
    postedBy: 'MIT Media Lab Academic Office',
    status: 'open',
    applicantCount: 29
  },
  {
    id: 'opp-6',
    title: 'Machine Learning Engineer - Autonomous Perception',
    company: 'Scale AI',
    type: 'full-time',
    location: 'San Francisco, CA / On-site',
    workplaceType: 'On-site',
    stipendOrSalary: '$165,000 - $190,000 + Equity',
    deadline: '2027-01-10',
    description: 'Scale 3D sensor fusion pipelines, zero-shot visual question answering models, and automated synthetic data generation for autonomous vehicles.',
    requiredSkills: [
      { skillName: 'Python', weight: 5 },
      { skillName: 'PyTorch', weight: 5 },
      { skillName: 'Computer Vision', weight: 5 },
      { skillName: 'Docker', weight: 4 },
      { skillName: 'AWS', weight: 3 }
    ],
    postedBy: 'Scale AI Campus Recruiting',
    status: 'open',
    applicantCount: 51
  },
  {
    id: 'opp-7',
    title: 'Systems & Edge Networking Intern',
    company: 'Cloudflare',
    type: 'internship',
    location: 'Austin, TX / Hybrid',
    workplaceType: 'Hybrid',
    stipendOrSalary: '$56 / hr',
    deadline: '2026-12-20',
    description: 'Build edge workers, QUIC / HTTP3 protocol analyzers, and global DDoS mitigation heuristics across 300+ city data centers.',
    requiredSkills: [
      { skillName: 'Rust', weight: 4 },
      { skillName: 'TypeScript', weight: 4 },
      { skillName: 'Docker', weight: 4 },
      { skillName: 'CI/CD', weight: 3 }
    ],
    postedBy: 'Cloudflare University Program',
    status: 'open',
    applicantCount: 37
  },
  {
    id: 'opp-8',
    title: 'Front-End Architect Intern - Craft & Motion',
    company: 'Linear',
    type: 'internship',
    location: 'Remote',
    workplaceType: 'Remote',
    stipendOrSalary: '$55 / hr ($9,500 / mo)',
    deadline: '2026-12-10',
    description: 'Craft high-performance, keyboard-first desktop applications with ultra-fluid animations, offline-first sync engines, and obsessive typographic discipline.',
    requiredSkills: [
      { skillName: 'TypeScript', weight: 5 },
      { skillName: 'React', weight: 5 },
      { skillName: 'UI/UX Design', weight: 5 },
      { skillName: 'Design Systems', weight: 4 }
    ],
    postedBy: 'Linear Design & Engineering',
    status: 'open',
    applicantCount: 94
  },
  {
    id: 'opp-9',
    title: 'AI Alignment & Interpretability Scholar',
    company: 'Anthropic',
    type: 'research',
    location: 'San Francisco, CA / Hybrid',
    workplaceType: 'Hybrid',
    stipendOrSalary: '$65 / hr',
    deadline: '2026-11-25',
    description: 'Investigate feature representations inside large language models, mechanistic interpretability of circuit activations, and scalable oversight mechanisms.',
    requiredSkills: [
      { skillName: 'Python', weight: 5 },
      { skillName: 'PyTorch', weight: 5 },
      { skillName: 'Machine Learning', weight: 5 },
      { skillName: 'Technical Writing', weight: 5 }
    ],
    postedBy: 'Anthropic Academic Fellowships',
    status: 'open',
    applicantCount: 71
  },
  {
    id: 'opp-10',
    title: 'Computer Vision & Autopilot Intern',
    company: 'Tesla',
    type: 'internship',
    location: 'Palo Alto, CA / On-site',
    workplaceType: 'On-site',
    stipendOrSalary: '$58 / hr + Housing Assistance',
    deadline: '2026-12-01',
    description: 'Train spatial temporal occupancy networks running on Tesla Full Self-Driving computers at 36fps with real-time video inputs.',
    requiredSkills: [
      { skillName: 'Python', weight: 5 },
      { skillName: 'PyTorch', weight: 5 },
      { skillName: 'Computer Vision', weight: 5 },
      { skillName: 'C++', weight: 4 }
    ],
    postedBy: 'Tesla Autopilot Team',
    status: 'open',
    applicantCount: 110
  }
];

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    opportunityId: 'opp-1',
    studentId: 'std-1',
    status: 'Interview',
    appliedDate: '2026-09-12',
    updatedDate: '2026-10-18',
    history: [
      { status: 'Saved', timestamp: '2026-09-10T14:22:00Z', note: 'Bookmarked opportunity based on 92% match score.' },
      { status: 'Applied', timestamp: '2026-09-12T09:15:00Z', note: 'Submitted profile with verified PyTorch & NeurIPS evidence attached.' },
      { status: 'Shortlisted', timestamp: '2026-09-28T16:40:00Z', note: 'Reviewer commended faculty-verified Cerebras internship.' },
      { status: 'Interview', timestamp: '2026-10-18T11:00:00Z', note: 'Technical deep-dive scheduled on Sparse Attention kernels.' }
    ]
  },
  {
    id: 'app-2',
    opportunityId: 'opp-2',
    studentId: 'std-1',
    status: 'Shortlisted',
    appliedDate: '2026-09-20',
    updatedDate: '2026-10-05',
    history: [
      { status: 'Saved', timestamp: '2026-09-18T11:00:00Z' },
      { status: 'Applied', timestamp: '2026-09-20T17:30:00Z', note: 'Highlighted telemetry engine and PostgreSQL experience.' },
      { status: 'Shortlisted', timestamp: '2026-10-05T14:10:00Z', note: 'Recruiter reached out for initial phone screen.' }
    ]
  },
  {
    id: 'app-3',
    opportunityId: 'opp-9',
    studentId: 'std-1',
    status: 'Applied',
    appliedDate: '2026-10-02',
    updatedDate: '2026-10-02',
    history: [
      { status: 'Saved', timestamp: '2026-09-30T20:10:00Z' },
      { status: 'Applied', timestamp: '2026-10-02T13:45:00Z', note: 'Application submitted with verified research paper.' }
    ]
  },
  {
    id: 'app-4',
    opportunityId: 'opp-8',
    studentId: 'std-1',
    status: 'Saved',
    appliedDate: '',
    updatedDate: '2026-10-15',
    history: [
      { status: 'Saved', timestamp: '2026-10-15T19:00:00Z', note: 'Saved to review UI/UX requirements before applying.' }
    ]
  }
];

export const MOCK_PROPOSALS: ProjectProposal[] = [
  {
    id: 'prop-1',
    studentId: 'std-1',
    studentName: 'Alex Rivera',
    title: 'Adaptive Sparse Kernel Synthesis for Monocular Depth Estimation on Edge GPUs',
    domain: 'Computer Vision & Edge Computing',
    problem: 'Standard dense vision transformers consume excessive memory (>4GB) on mobile robotics edge compute, preventing real-time 60fps obstacle avoidance.',
    technology: ['Python', 'PyTorch', 'C++', 'CUDA', 'Docker'],
    methodology: ['Sparse Matrix Multi-Head Attention', 'Knowledge Distillation', 'TensorRT Int8 Quantization'],
    description: 'Developing a hardware-aware sparse transformer compiler that dynamically prunes inactive spatial tokens based on saliency gradients, deploying on Jetson Orin Nano.',
    submittedAt: '2026-10-20T10:30:00Z',
    status: 'pending',
    similarityMatches: [
      {
        matchedProjectId: 'inst-4',
        matchedTitle: 'Autonomous Quadcopter Navigation via Monocular Depth Estimation',
        matchedAuthor: 'Aria Takahashi (2025)',
        overallSimilarity: 78,
        breakdown: {
          domain: 85,
          problem: 75,
          technology: 80,
          methodology: 70
        }
      },
      {
        matchedProjectId: 'inst-1',
        matchedTitle: 'NeuroSync: Low-Latency EEG Brain-Computer Interface',
        matchedAuthor: 'Julian Thorne (2024)',
        overallSimilarity: 52,
        breakdown: {
          domain: 40,
          problem: 50,
          technology: 75,
          methodology: 45
        }
      }
    ]
  },
  {
    id: 'prop-2',
    studentId: 'std-2',
    studentName: 'Maya Chen',
    title: 'Zero-Knowledge Credential Issuer for Cross-Institutional Credit Transfer',
    domain: 'Applied Cryptography & Distributed Systems',
    problem: 'University registrars require 4-6 weeks to manually certify course equivalency and syllabus authenticity across universities.',
    technology: ['Rust', 'TypeScript', 'PostgreSQL', 'Docker'],
    methodology: ['zk-SNARKs for credential verification', 'Merkle Tree Batching', 'DID Standards'],
    description: 'A decentralized protocol enabling students to cryptographically prove course completion without revealing full academic transcripts.',
    submittedAt: '2026-10-19T14:15:00Z',
    status: 'flagged',
    feedback: 'High institutional overlap with Marcus Vance (2025) thesis. Please clearly articulate what novel cryptographic primitives or performance improvements differentiate your work.',
    reviewedBy: 'Prof. Alan Vance',
    reviewedAt: '2026-10-21T09:00:00Z',
    similarityMatches: [
      {
        matchedProjectId: 'inst-3',
        matchedTitle: 'Decentralized Peer-to-Peer Academic Credential Ledger',
        matchedAuthor: 'Marcus Vance (2025)',
        overallSimilarity: 88,
        breakdown: {
          domain: 95,
          problem: 90,
          technology: 85,
          methodology: 85
        }
      }
    ]
  }
];

export const MOCK_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif-1',
    userId: 'std-1',
    title: 'Skill Level Up: Advanced Machine Learning',
    message: 'Your Machine Learning confidence reached 89/100 following faculty verification of your Cerebras internship.',
    type: 'verification',
    timestamp: '2 hours ago',
    read: false,
    linkTab: 'skills'
  },
  {
    id: 'notif-2',
    userId: 'std-1',
    title: 'High Fit Match: DeepMind Campus Lab',
    message: 'You have a 92% match for Machine Learning Research Fellow. 4 of 5 required skills have faculty-verified proof.',
    type: 'match',
    timestamp: '1 day ago',
    read: false,
    linkTab: 'opportunities'
  },
  {
    id: 'notif-3',
    userId: 'std-1',
    title: 'Interview Stage Updated',
    message: 'Stripe moved your application for Software Engineering Intern to Shortlisted status.',
    type: 'application',
    timestamp: '3 days ago',
    read: true,
    linkTab: 'applications'
  }
];
