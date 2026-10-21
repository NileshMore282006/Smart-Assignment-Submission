/**
 * Initial Demo Data for Smart Assignment Portal
 * Seeded with realistic academic data across CS & Engineering domains.
 */

export const INITIAL_USERS = [
  {
    id: 'usr-stu-1',
    name: 'Alex Johnson',
    email: 'student@demo.com',
    role: 'student',
    studentId: 'CS-2024-8841',
    department: 'Computer Science & Engineering',
    semester: '6th Semester',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Junior undergraduate researching distributed systems and cloud microservices.',
    notifications: {
      emailOnSubmission: true,
      emailOnReportReady: true,
      deadlineAlerts: true,
    }
  },
  {
    id: 'usr-stu-2',
    name: 'Priya Sharma',
    email: 'priya.s@demo.com',
    role: 'student',
    studentId: 'CS-2024-8812',
    department: 'Computer Science & Engineering',
    semester: '6th Semester',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Database systems and big data pipeline enthusiast.',
    notifications: {
      emailOnSubmission: true,
      emailOnReportReady: true,
      deadlineAlerts: true,
    }
  },
  {
    id: 'usr-stu-3',
    name: 'Marcus Chen',
    email: 'marcus.c@demo.com',
    role: 'student',
    studentId: 'CS-2024-8899',
    department: 'Information Technology',
    semester: '6th Semester',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'Full-stack engineering & network security specialist.',
    notifications: {
      emailOnSubmission: false,
      emailOnReportReady: true,
      deadlineAlerts: true,
    }
  },
  {
    id: 'usr-tea-1',
    name: 'Dr. Alan Vance',
    email: 'teacher@demo.com',
    role: 'teacher',
    department: 'Faculty of Computer Science',
    designation: 'Professor & Department Chair',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    bio: 'Tenured faculty focusing on High-Performance Distributed Computing and Automated Document Analysis.',
    notifications: {
      emailOnSubmission: true,
      emailOnReportReady: true,
      deadlineAlerts: true,
    }
  }
];

export const INITIAL_ASSIGNMENTS = [
  {
    id: 'asg-101',
    title: 'Cloud Architecture & Microservices Resilience Design',
    subject: 'Cloud Computing',
    courseCode: 'CS-601',
    teacherId: 'usr-tea-1',
    teacherName: 'Dr. Alan Vance',
    description: 'Design and document a high-availability cloud architecture deployed across multiple AWS regions. Your report must evaluate trade-offs between Amazon S3 standard tier and Glacier archive storage, formulate failover protocols, and specify automated document processing using Amazon Textract and AWS Lambda.',
    instructions: '1. Structure your submission in formal IEEE conference style.\n2. Include an AWS architecture diagram.\n3. Clearly cite all external academic papers and cloud benchmarks.\n4. Ensure your document is original work.',
    postedDate: '2026-10-10T09:00:00Z',
    dueDate: '2026-10-28T23:59:00Z',
    maxMarks: 100,
    allowedFormats: ['PDF', 'DOCX'],
    maxFileSizeMb: 10,
    status: 'published', // 'draft' | 'published' | 'archived'
    attachment: {
      name: 'Cloud_Resilience_Rubric_v2.pdf',
      size: '1.4 MB',
      url: '#'
    }
  },
  {
    id: 'asg-102',
    title: 'Relational vs NoSQL Schema Optimization & Benchmarking',
    subject: 'Database Management',
    courseCode: 'CS-504',
    teacherId: 'usr-tea-1',
    teacherName: 'Dr. Alan Vance',
    description: 'Comparative performance evaluation of PostgreSQL B-Tree indexing versus MongoDB compound document indexing under high-throughput concurrent write workloads.',
    instructions: 'Submit your benchmark methodologies, data modeling rationale, query execution plans (EXPLAIN ANALYZE), and synthesis of write amplification findings.',
    postedDate: '2026-10-12T10:30:00Z',
    dueDate: '2026-10-31T23:59:00Z',
    maxMarks: 100,
    allowedFormats: ['PDF', 'DOCX', 'TXT'],
    maxFileSizeMb: 10,
    status: 'published',
    attachment: {
      name: 'Dataset_Benchmark_Specification.pdf',
      size: '890 KB',
      url: '#'
    }
  },
  {
    id: 'asg-103',
    title: 'Modern Single Page Application State Machine Patterns',
    subject: 'Web Development',
    courseCode: 'CS-403',
    teacherId: 'usr-tea-1',
    teacherName: 'Dr. Alan Vance',
    description: 'Analyze state management paradigms in client-side web applications comparing Redux Toolkit, Zustand, and React Context + Reducer.',
    instructions: 'Include architectural diagrams of state flow, memory consumption benchmarks, and re-rendering profiles.',
    postedDate: '2026-10-05T08:00:00Z',
    dueDate: '2026-10-24T23:59:00Z',
    maxMarks: 50,
    allowedFormats: ['PDF', 'DOCX', 'TXT'],
    maxFileSizeMb: 10,
    status: 'published',
    attachment: {
      name: 'SPA_Benchmark_Template.docx',
      size: '520 KB',
      url: '#'
    }
  },
  {
    id: 'asg-104',
    title: 'TCP/IP Congestion Control in Low-Earth Orbit Satellites',
    subject: 'Computer Networks',
    courseCode: 'CS-502',
    teacherId: 'usr-tea-1',
    teacherName: 'Dr. Alan Vance',
    description: 'Evaluate BBRv2 versus Cubic TCP congestion algorithms under high packet jitter and intermittent satellite inter-link handover latency.',
    instructions: 'Include ns-3 or Mininet simulation traces and packet flight window graphs.',
    postedDate: '2026-09-20T11:00:00Z',
    dueDate: '2026-10-15T23:59:00Z', // Past deadline
    maxMarks: 100,
    allowedFormats: ['PDF'],
    maxFileSizeMb: 15,
    status: 'published',
    attachment: null
  },
  {
    id: 'asg-105',
    title: 'Distributed Consensus & Raft Log Compaction Implementation',
    subject: 'Operating Systems',
    courseCode: 'CS-506',
    teacherId: 'usr-tea-1',
    teacherName: 'Dr. Alan Vance',
    description: 'Formal verification and memory safety review of leader election and log compaction algorithms in replicated state machines.',
    instructions: 'Provide theoretical proofs, snapshot memory layouts, and fault-injection test scenarios.',
    postedDate: '2026-10-18T14:00:00Z',
    dueDate: '2026-11-08T23:59:00Z',
    maxMarks: 100,
    allowedFormats: ['PDF', 'DOCX', 'TXT'],
    maxFileSizeMb: 10,
    status: 'published',
    attachment: {
      name: 'Raft_Log_Compaction_Spec.pdf',
      size: '2.1 MB',
      url: '#'
    }
  },
  {
    id: 'asg-106',
    title: 'Kernel Space Memory Allocation & eBPF Observability',
    subject: 'Operating Systems',
    courseCode: 'CS-506',
    teacherId: 'usr-tea-1',
    teacherName: 'Dr. Alan Vance',
    description: 'Draft assignment exploring Linux SLUB allocator performance using eBPF probes.',
    instructions: 'Draft instructions for upcoming semester lab module.',
    postedDate: '2026-10-19T16:00:00Z',
    dueDate: '2026-11-20T23:59:00Z',
    maxMarks: 50,
    allowedFormats: ['PDF', 'TXT'],
    maxFileSizeMb: 10,
    status: 'draft',
    attachment: null
  }
];

export const INITIAL_SUBMISSIONS = [
  {
    id: 'sub-8001',
    assignmentId: 'asg-103',
    assignmentTitle: 'Modern Single Page Application State Machine Patterns',
    subject: 'Web Development',
    studentId: 'usr-stu-1',
    studentName: 'Alex Johnson',
    studentNumber: 'CS-2024-8841',
    fileName: 'Alex_Johnson_SPA_State_Machine.pdf',
    fileSize: '2.4 MB',
    fileType: 'application/pdf',
    submittedAt: '2026-10-20T14:22:10Z',
    status: 'completed', // 'processing' | 'completed' | 'under_review' | 'failed' | 'late'
    similarityScore: 8,
    similarityReportId: 'rep-9001',
    reviewStatus: 'reviewed', // 'pending_review' | 'reviewed' | 'needs_further_review'
    teacherNotes: 'Clean, original analysis. Good citations of reactive state paradigms.'
  },
  {
    id: 'sub-8002',
    assignmentId: 'asg-104',
    assignmentTitle: 'TCP/IP Congestion Control in Low-Earth Orbit Satellites',
    subject: 'Computer Networks',
    studentId: 'usr-stu-1',
    studentName: 'Alex Johnson',
    studentNumber: 'CS-2024-8841',
    fileName: 'Alex_Johnson_LEO_TCP_BBR.pdf',
    fileSize: '3.8 MB',
    fileType: 'application/pdf',
    submittedAt: '2026-10-14T19:05:00Z',
    status: 'completed',
    similarityScore: 24,
    similarityReportId: 'rep-9002',
    reviewStatus: 'reviewed',
    teacherNotes: 'Standard protocol equation quotes detected. Permissible technical citations.'
  },
  {
    id: 'sub-8003',
    assignmentId: 'asg-101',
    assignmentTitle: 'Cloud Architecture & Microservices Resilience Design',
    subject: 'Cloud Computing',
    studentId: 'usr-stu-2',
    studentName: 'Priya Sharma',
    studentNumber: 'CS-2024-8812',
    fileName: 'Priya_Sharma_Cloud_Resilience.pdf',
    fileSize: '4.1 MB',
    fileType: 'application/pdf',
    submittedAt: '2026-10-19T11:45:30Z',
    status: 'completed',
    similarityScore: 12,
    similarityReportId: 'rep-9003',
    reviewStatus: 'reviewed',
    teacherNotes: 'Excellent multi-region failover diagram.'
  },
  {
    id: 'sub-8004',
    assignmentId: 'asg-101',
    assignmentTitle: 'Cloud Architecture & Microservices Resilience Design',
    subject: 'Cloud Computing',
    studentId: 'usr-stu-3',
    studentName: 'Marcus Chen',
    studentNumber: 'CS-2024-8899',
    fileName: 'Marcus_Chen_Cloud_Arch.docx',
    fileSize: '1.9 MB',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    submittedAt: '2026-10-21T08:15:00Z',
    status: 'under_review',
    similarityScore: 68,
    similarityReportId: 'rep-9004',
    reviewStatus: 'needs_further_review',
    teacherNotes: 'Flagged for high overlap with published IEEE 2022 survey paper. Schedule meeting.'
  },
  {
    id: 'sub-8005',
    assignmentId: 'asg-102',
    assignmentTitle: 'Relational vs NoSQL Schema Optimization & Benchmarking',
    subject: 'Database Management',
    studentId: 'usr-stu-2',
    studentName: 'Priya Sharma',
    studentNumber: 'CS-2024-8812',
    fileName: 'Priya_Sharma_DB_Benchmarking.pdf',
    fileSize: '2.8 MB',
    fileType: 'application/pdf',
    submittedAt: '2026-10-21T18:30:15Z',
    status: 'completed',
    similarityScore: 19,
    similarityReportId: 'rep-9005',
    reviewStatus: 'pending_review',
    teacherNotes: null
  },
  {
    id: 'sub-8006',
    assignmentId: 'asg-105',
    assignmentTitle: 'Distributed Consensus & Raft Log Compaction Implementation',
    subject: 'Operating Systems',
    studentId: 'usr-stu-3',
    studentName: 'Marcus Chen',
    studentNumber: 'CS-2024-8899',
    fileName: 'Raft_Consensus_Implementation.txt',
    fileSize: '142 KB',
    fileType: 'text/plain',
    submittedAt: '2026-10-21T21:00:00Z',
    status: 'processing',
    similarityScore: null,
    similarityReportId: null,
    reviewStatus: 'pending_review',
    teacherNotes: 'Document queued in Amazon Textract OCR pipeline.'
  }
];

export const INITIAL_REPORTS = [
  {
    id: 'rep-9001',
    submissionId: 'sub-8001',
    assignmentId: 'asg-103',
    assignmentTitle: 'Modern Single Page Application State Machine Patterns',
    studentId: 'usr-stu-1',
    studentName: 'Alex Johnson',
    studentNumber: 'CS-2024-8841',
    generatedAt: '2026-10-20T14:26:45Z',
    overallScore: 8,
    category: 'low', // 'low' (0-15) | 'moderate' (16-35) | 'high' (36+)
    status: 'completed',
    reviewStatus: 'reviewed',
    textractMetadata: {
      pagesExtracted: 12,
      wordsCount: 4210,
      charactersCount: 26840,
      detectedLanguage: 'English (en-US)',
      confidenceScore: '99.4%'
    },
    matchedDocuments: [
      {
        id: 'doc-m1',
        title: 'React Documentation: State and Lifecycle Architecture',
        sourceType: 'Web Documentation / Official Specs',
        url: 'https://react.dev/learn/state-a-components-memory',
        matchPercentage: 4.8,
        matchedWordCount: 202
      },
      {
        id: 'doc-m2',
        title: 'Zustand: Bearbones State Management in React',
        sourceType: 'Open Source Repository / Whitepaper',
        url: 'https://github.com/pmndrs/zustand',
        matchPercentage: 3.2,
        matchedWordCount: 135
      }
    ],
    matchingPassages: [
      {
        id: 'pas-1',
        page: 3,
        paragraph: 2,
        studentExcerpt: 'State in modern component trees is structured as immutable snapshots where re-render cycles trigger deterministic reconciliation across the virtual DOM representation.',
        sourceExcerpt: 'Component state represents immutable snapshots in memory, whereby each render cycle deterministically reconciles UI nodes in the virtual DOM representation.',
        sourceTitle: 'React Documentation: State and Lifecycle Architecture',
        similarity: 88,
        matchType: 'Quotation / Paraphrase'
      },
      {
        id: 'pas-2',
        page: 6,
        paragraph: 1,
        studentExcerpt: 'The primary trade-off of global store subscriptions is avoiding unnecessary context-provider re-renders by executing granular selector equality checks.',
        sourceExcerpt: 'Store subscriptions bypass React context provider re-rendering by applying selector equality checks to determine if the subscribed slice has mutated.',
        sourceTitle: 'Zustand: Bearbones State Management in React',
        similarity: 82,
        matchType: 'Technical Definition'
      }
    ],
    summaryNotes: 'Document demonstrates high academic integrity. The minor matching text consists of standard front-end terminology and accurately attributed library definitions.'
  },
  {
    id: 'rep-9002',
    submissionId: 'sub-8002',
    assignmentId: 'asg-104',
    assignmentTitle: 'TCP/IP Congestion Control in Low-Earth Orbit Satellites',
    studentId: 'usr-stu-1',
    studentName: 'Alex Johnson',
    studentNumber: 'CS-2024-8841',
    generatedAt: '2026-10-14T19:12:30Z',
    overallScore: 24,
    category: 'moderate',
    status: 'completed',
    reviewStatus: 'reviewed',
    textractMetadata: {
      pagesExtracted: 18,
      wordsCount: 6890,
      charactersCount: 44120,
      detectedLanguage: 'English (en-US)',
      confidenceScore: '98.9%'
    },
    matchedDocuments: [
      {
        id: 'doc-m3',
        title: 'RFC 9002: Using BBR Congestion Control in High-BDP Satellite Links',
        sourceType: 'IETF Standards RFC',
        url: 'https://datatracker.ietf.org/doc/rfc9002/',
        matchPercentage: 14.5,
        matchedWordCount: 998
      },
      {
        id: 'doc-m4',
        title: 'Performance Analysis of LEO Satellite Constellation Topologies',
        sourceType: 'IEEE Communications Letters (2023)',
        url: 'https://doi.org/10.1109/LCOMM.2023.00192',
        matchPercentage: 9.5,
        matchedWordCount: 654
      }
    ],
    matchingPassages: [
      {
        id: 'pas-3',
        page: 4,
        paragraph: 3,
        studentExcerpt: 'Bottleneck Bandwidth and Round-trip propagation time (BBR) models network delivery rate and minimum round-trip time without interpreting packet loss as immediate buffer overflow.',
        sourceExcerpt: 'BBR models the network path by measuring maximum delivery rate and minimum round-trip time, explicitly decoupling congestion response from isolated packet loss events.',
        sourceTitle: 'RFC 9002: Using BBR Congestion Control in High-BDP Satellite Links',
        similarity: 91,
        matchType: 'Direct RFC Definition'
      },
      {
        id: 'pas-4',
        page: 9,
        paragraph: 2,
        studentExcerpt: 'During inter-satellite link (ISL) handovers, Doppler shift and orbital relative velocity create severe carrier frequency offset and transient round-trip delay spikes.',
        sourceExcerpt: 'Inter-satellite link handovers introduce carrier frequency offsets driven by orbital velocity differentials, producing severe transient latency spikes across routing nodes.',
        sourceTitle: 'IEEE Communications Letters (2023)',
        similarity: 86,
        matchType: 'Academic Citation'
      }
    ],
    summaryNotes: 'Moderate similarity is attributable to verbatim formulas, RFC definitions, and technical parameters standard in aerospace communications research.'
  },
  {
    id: 'rep-9003',
    submissionId: 'sub-8003',
    assignmentId: 'asg-101',
    assignmentTitle: 'Cloud Architecture & Microservices Resilience Design',
    studentId: 'usr-stu-2',
    studentName: 'Priya Sharma',
    studentNumber: 'CS-2024-8812',
    generatedAt: '2026-10-19T11:51:10Z',
    overallScore: 12,
    category: 'low',
    status: 'completed',
    reviewStatus: 'reviewed',
    textractMetadata: {
      pagesExtracted: 15,
      wordsCount: 5120,
      charactersCount: 32900,
      detectedLanguage: 'English (en-US)',
      confidenceScore: '99.1%'
    },
    matchedDocuments: [
      {
        id: 'doc-m5',
        title: 'AWS Well-Architected Framework: Reliability Pillar',
        sourceType: 'Cloud Provider Whitepaper',
        url: 'https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/',
        matchPercentage: 7.2,
        matchedWordCount: 368
      },
      {
        id: 'doc-m6',
        title: 'Building Resilient Microservices with Circuit Breaker Patterns',
        sourceType: 'ACM Queue Software Engineering',
        url: 'https://queue.acm.org/detail.cfm?id=3028689',
        matchPercentage: 4.8,
        matchedWordCount: 245
      }
    ],
    matchingPassages: [
      {
        id: 'pas-5',
        page: 5,
        paragraph: 1,
        studentExcerpt: 'The circuit breaker transitions to a half-open state after a cooldown threshold, permitting a controlled canary percentage of requests to evaluate upstream dependency health.',
        sourceExcerpt: 'Upon elapsed cooldown timeout, circuit breakers enter the half-open state, dispatching a canary subset of traffic to test whether underlying services have recovered.',
        sourceTitle: 'Building Resilient Microservices with Circuit Breaker Patterns',
        similarity: 89,
        matchType: 'Standard Engineering Pattern'
      }
    ],
    summaryNotes: 'Well-structured paper with thorough citations. Clear original writing.'
  },
  {
    id: 'rep-9004',
    submissionId: 'sub-8004',
    assignmentId: 'asg-101',
    assignmentTitle: 'Cloud Architecture & Microservices Resilience Design',
    studentId: 'usr-stu-3',
    studentName: 'Marcus Chen',
    studentNumber: 'CS-2024-8899',
    generatedAt: '2026-10-21T08:24:00Z',
    overallScore: 68,
    category: 'high',
    status: 'completed',
    reviewStatus: 'needs_further_review',
    textractMetadata: {
      pagesExtracted: 8,
      wordsCount: 3100,
      charactersCount: 19800,
      detectedLanguage: 'English (en-US)',
      confidenceScore: '97.8%'
    },
    matchedDocuments: [
      {
        id: 'doc-m7',
        title: 'Comprehensive Survey on Multi-Region Disaster Recovery in Public Cloud Infrastructures',
        sourceType: 'IEEE Transactions on Services Computing (2022)',
        url: 'https://ieeexplore.ieee.org/document/9842104',
        matchPercentage: 46.5,
        matchedWordCount: 1441
      },
      {
        id: 'doc-m8',
        title: 'University Student Archive Paper: Cloud Failover Mechanisms (2023)',
        sourceType: 'Institutional Academic Repository',
        url: 'https://repository.university.edu/theses/cs-2023-412',
        matchPercentage: 21.5,
        matchedWordCount: 666
      }
    ],
    matchingPassages: [
      {
        id: 'pas-6',
        page: 2,
        paragraph: 2,
        studentExcerpt: 'Multi-region disaster recovery requires balancing Recovery Time Objective (RTO) and Recovery Point Objective (RPO) against cross-region egress transfer pricing and asynchronous replication lag across storage backends.',
        sourceExcerpt: 'Multi-region disaster recovery mandates a strict trade-off between Recovery Time Objective (RTO) and Recovery Point Objective (RPO) against cross-region network egress tariffs and asynchronous replication lag across distributed object stores.',
        sourceTitle: 'IEEE Transactions on Services Computing (2022)',
        similarity: 94,
        matchType: 'Direct Uncited Text Match'
      },
      {
        id: 'pas-7',
        page: 4,
        paragraph: 3,
        studentExcerpt: 'When DNS health probes detect region collapse, Amazon Route 53 latency routing policies dynamically reroute ingress edge traffic toward secondary warm-standby container clusters.',
        sourceExcerpt: 'Upon failure confirmation via external Route 53 health checkers, traffic steering policies automatically shift public ingress towards warm-standby container instances in secondary availability zones.',
        sourceTitle: 'University Student Archive Paper: Cloud Failover Mechanisms (2023)',
        similarity: 92,
        matchType: 'Consecutive Paragraph Match'
      },
      {
        id: 'pas-8',
        page: 7,
        paragraph: 1,
        studentExcerpt: 'Our automated test harness injected artificial network partition partitions across the VPC peering links, observing a 420ms delay before split-brain mitigation locks were engaged.',
        sourceExcerpt: 'Our testing harness systematically severed VPC peering connections, observing a 420ms latency duration before split-brain distributed mutex locks were engaged.',
        sourceTitle: 'IEEE Transactions on Services Computing (2022)',
        similarity: 96,
        matchType: 'Verbatim Experimental Findings'
      }
    ],
    summaryNotes: 'Substantial multi-paragraph overlap (68%) identified across several sections with published academic literature and an institutional archive thesis without attribution. Manual instructor review strongly advised.'
  },
  {
    id: 'rep-9005',
    submissionId: 'sub-8005',
    assignmentId: 'asg-102',
    assignmentTitle: 'Relational vs NoSQL Schema Optimization & Benchmarking',
    studentId: 'usr-stu-2',
    studentName: 'Priya Sharma',
    studentNumber: 'CS-2024-8812',
    generatedAt: '2026-10-21T18:36:00Z',
    overallScore: 19,
    category: 'moderate',
    status: 'completed',
    reviewStatus: 'pending_review',
    textractMetadata: {
      pagesExtracted: 11,
      wordsCount: 3950,
      charactersCount: 25100,
      detectedLanguage: 'English (en-US)',
      confidenceScore: '98.7%'
    },
    matchedDocuments: [
      {
        id: 'doc-m9',
        title: 'PostgreSQL Manual: Index Types and Performance Characterization',
        sourceType: 'Official Database Documentation',
        url: 'https://www.postgresql.org/docs/current/indexes-types.html',
        matchPercentage: 11.2,
        matchedWordCount: 442
      },
      {
        id: 'doc-m10',
        title: 'MongoDB Architecture Guide: WiredTiger Storage Engine Internals',
        sourceType: 'Vendor Technical Whitepaper',
        url: 'https://www.mongodb.com/docs/manual/core/wiredtiger/',
        matchPercentage: 7.8,
        matchedWordCount: 308
      }
    ],
    matchingPassages: [
      {
        id: 'pas-9',
        page: 3,
        paragraph: 2,
        studentExcerpt: 'B-tree index lookups require O(log N) comparisons as nodes traverse downward from root to leaf, where write concurrency is governed by latch coupling protocols.',
        sourceExcerpt: 'B-tree searches execute in O(log N) depth iterations traversing from root page to target leaf, protected against concurrent modification via latch coupling protocols.',
        sourceTitle: 'PostgreSQL Manual: Index Types and Performance Characterization',
        similarity: 87,
        matchType: 'Algorithmic Standard Text'
      }
    ],
    summaryNotes: 'Clear benchmarking data. Matched segments represent standard algorithmic asymptotic complexity descriptions.'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    userId: 'usr-tea-1',
    title: 'High Similarity Alert',
    message: 'Marcus Chen submitted Cloud Architecture & Microservices Resilience Design with 68% similarity.',
    timestamp: '2026-10-21T08:24:00Z',
    read: false,
    type: 'warning',
    link: '/teacher/reports/rep-9004'
  },
  {
    id: 'notif-2',
    userId: 'usr-tea-1',
    title: 'New Submission Received',
    message: 'Priya Sharma submitted Relational vs NoSQL Schema Optimization & Benchmarking.',
    timestamp: '2026-10-21T18:30:15Z',
    read: false,
    type: 'info',
    link: '/teacher/submissions'
  },
  {
    id: 'notif-3',
    userId: 'usr-stu-1',
    title: 'Similarity Report Ready',
    message: 'Your report for Modern Single Page Application State Machine Patterns is ready (8% match).',
    timestamp: '2026-10-20T14:26:45Z',
    read: false,
    type: 'success',
    link: '/student/reports/rep-9001'
  },
  {
    id: 'notif-4',
    userId: 'usr-stu-1',
    title: 'Upcoming Deadline Warning',
    message: 'Cloud Architecture & Microservices Resilience Design is due in 7 days.',
    timestamp: '2026-10-21T09:00:00Z',
    read: true,
    type: 'info',
    link: '/student/assignments/asg-101'
  }
];

export const INITIAL_ACTIVITY_TIMELINE = [
  {
    id: 'act-1',
    user: 'Marcus Chen',
    action: 'submitted',
    target: 'Distributed Consensus & Raft Log Compaction Implementation',
    timestamp: '2026-10-21T21:00:00Z',
    role: 'student',
    icon: 'upload'
  },
  {
    id: 'act-2',
    user: 'Priya Sharma',
    action: 'submitted',
    target: 'Relational vs NoSQL Schema Optimization & Benchmarking',
    timestamp: '2026-10-21T18:30:15Z',
    role: 'student',
    icon: 'upload'
  },
  {
    id: 'act-3',
    user: 'System (AWS Pipeline)',
    action: 'generated report',
    target: 'rep-9004 (68% similarity detected)',
    timestamp: '2026-10-21T08:24:00Z',
    role: 'system',
    icon: 'alert'
  },
  {
    id: 'act-4',
    user: 'Dr. Alan Vance',
    action: 'created assignment',
    target: 'Kernel Space Memory Allocation & eBPF Observability (Draft)',
    timestamp: '2026-10-19T16:00:00Z',
    role: 'teacher',
    icon: 'plus'
  },
  {
    id: 'act-5',
    user: 'Dr. Alan Vance',
    action: 'reviewed report',
    target: 'Alex Johnson - Modern Single Page Application (8%)',
    timestamp: '2026-10-20T15:10:00Z',
    role: 'teacher',
    icon: 'check'
  }
];
