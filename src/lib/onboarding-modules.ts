/**
 * Onboarding training modules for new AIMED lab members.
 * Content and quiz questions are defined here (server-side source of truth).
 * correctIndex is NEVER sent to the client — only used for grading in API routes.
 */

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number // 0-3
}

export interface OnboardingModule {
  id: string
  title: string
  description: string
  icon: string // lucide icon name
  estimatedMinutes: number
  content: string // markdown-like content (rendered with simple HTML)
  quiz: QuizQuestion[]
}

export const PASS_THRESHOLD = 80

export const ONBOARDING_MODULES: OnboardingModule[] = [
  {
    id: "lab-history",
    title: "Lab History & Culture",
    description: "Lab mission, research focus, PI background, and how we work together",
    icon: "BookOpen",
    estimatedMinutes: 10,
    content: `
<h2>Welcome to the AI.MED Lab</h2>
<p>The <strong>AI.MED (Artificial Intelligence in Medicine)</strong> lab at the University of Alabama at Birmingham (UAB) is led by <strong>Prof. Jake Y. Chen, PhD</strong>, the Triton Endowed Professor and Founding Director of the Biomedical Data Science and Informatics (SPARC) Center.</p>

<h3>Our Mission</h3>
<p>We develop and apply cutting-edge AI, machine learning, and data science methods to solve real-world biomedical problems. Our work spans computational biology, drug discovery, precision medicine, and health informatics.</p>

<h3>Research Lineage</h3>
<p>Prof. Chen received his B.S. from Peking University, M.S. and Ph.D. from the University of Minnesota, and held faculty positions at Indiana University/Purdue University before joining UAB. The lab has trained over 80 researchers across two decades and multiple institutions.</p>

<h3>Research Focus Areas</h3>
<ul>
<li><strong>Network Medicine & Systems Biology</strong> - Protein interaction networks, disease module discovery</li>
<li><strong>AI-Driven Drug Discovery</strong> - Target identification, drug repurposing, ADMET prediction</li>
<li><strong>Biomedical NLP</strong> - Mining literature, clinical notes, and multi-omics data</li>
<li><strong>Precision Medicine</strong> - Patient stratification, biomarker discovery, clinical decision support</li>
<li><strong>Health Informatics</strong> - Electronic health records, population health analytics</li>
</ul>

<h3>Lab Culture</h3>
<ul>
<li><strong>Collaboration</strong> - We work as a team. Help each other, share knowledge, and celebrate together.</li>
<li><strong>Rigor</strong> - Every experiment is reproducible. Every claim is evidence-based.</li>
<li><strong>Growth</strong> - We invest in your development. Expect regular feedback and mentoring.</li>
<li><strong>Integrity</strong> - Honest science, honest communication. No shortcuts.</li>
<li><strong>Work-life balance</strong> - Sustainable productivity beats burnout. Take care of yourself.</li>
</ul>

<h3>Lab Meetings & Communication</h3>
<p>Weekly lab meetings include research presentations, journal clubs, and project updates. We use Slack for day-to-day communication, Notion for project documentation, and GitHub for code collaboration.</p>
`,
    quiz: [
      {
        id: "lh-1",
        question: "What is the full name of the AIMED lab?",
        options: [
          "Advanced Imaging and Medical Engineering Design",
          "Artificial Intelligence in Medicine",
          "Analytical Informatics for Medical Evidence Discovery",
          "Applied Intelligence for Medical Data",
        ],
        correctIndex: 1,
      },
      {
        id: "lh-2",
        question: "At which university is the AIMED lab currently located?",
        options: [
          "Indiana University",
          "University of Minnesota",
          "University of Alabama at Birmingham",
          "Purdue University",
        ],
        correctIndex: 2,
      },
      {
        id: "lh-3",
        question: "Which of the following is NOT a core research area of the lab?",
        options: [
          "Network Medicine & Systems Biology",
          "AI-Driven Drug Discovery",
          "Quantum Computing for Genomics",
          "Biomedical NLP",
        ],
        correctIndex: 2,
      },
      {
        id: "lh-4",
        question: "What is the lab's stance on reproducibility?",
        options: [
          "Only required for publications",
          "Every experiment should be reproducible",
          "Optional for internal projects",
          "Only required for funded projects",
        ],
        correctIndex: 1,
      },
      {
        id: "lh-5",
        question: "Approximately how many researchers has Prof. Chen trained over his career?",
        options: ["About 20", "About 50", "Over 80", "Over 200"],
        correctIndex: 2,
      },
    ],
  },

  {
    id: "it-tools",
    title: "IT Tools & Infrastructure",
    description: "Box, GitHub, Notion, development environments, and computing resources",
    icon: "Monitor",
    estimatedMinutes: 12,
    content: `
<h2>Lab IT Infrastructure</h2>
<p>The AIMED lab uses several key platforms for collaboration, data management, and code development. You are expected to set up access to all of these within your first week.</p>

<h3>Box (Cloud Storage)</h3>
<ul>
<li>All lab data, documents, and shared files are stored in <strong>UAB Box</strong>.</li>
<li>Each member gets a personal folder within the lab's Box structure.</li>
<li>Sensitive data (PHI, patient data) must <strong>only</strong> be stored in Box — never on personal devices or GitHub.</li>
<li>Use Box for sharing large files, datasets, and draft manuscripts.</li>
</ul>

<h3>GitHub</h3>
<ul>
<li>All code is version-controlled using Git and hosted on <strong>GitHub</strong> under the <code>aimed-lab</code> organization.</li>
<li>Follow our branching strategy: <code>main</code> for releases, feature branches for development.</li>
<li>Write meaningful commit messages. Include issue references when applicable.</li>
<li>Never commit sensitive data, API keys, or credentials to repositories.</li>
<li>Code reviews are required before merging to main.</li>
</ul>

<h3>Notion</h3>
<ul>
<li><strong>Notion</strong> is our knowledge base and project management hub.</li>
<li>Maintain your project notes, meeting notes, and literature reviews in Notion.</li>
<li>Use the lab's templates for project pages and weekly updates.</li>
</ul>

<h3>Development Environment</h3>
<ul>
<li>Python (3.10+) and R are our primary programming languages.</li>
<li>Use virtual environments (<code>conda</code> or <code>venv</code>) for all projects.</li>
<li>VS Code is recommended. PyCharm and RStudio are also common.</li>
<li>GPU computing is available via UAB's research computing cluster (Cheaha).</li>
</ul>

<h3>Communication</h3>
<ul>
<li>Slack for real-time messaging (check daily).</li>
<li>Email for formal communications and external collaborators.</li>
<li>Respond to messages within 24 hours on business days.</li>
</ul>

<h3>Security Essentials</h3>
<ul>
<li>Enable two-factor authentication (2FA) on all accounts.</li>
<li>Use strong, unique passwords (a password manager is recommended).</li>
<li>Lock your workstation when stepping away.</li>
<li>Report any security incidents to the lab admin immediately.</li>
</ul>
`,
    quiz: [
      {
        id: "it-1",
        question: "Where should sensitive patient data (PHI) be stored?",
        options: [
          "Personal Google Drive",
          "GitHub private repository",
          "UAB Box only",
          "Local hard drive with encryption",
        ],
        correctIndex: 2,
      },
      {
        id: "it-2",
        question: "What should NEVER be committed to a GitHub repository?",
        options: [
          "README files",
          "API keys and credentials",
          "Python requirements files",
          "Unit tests",
        ],
        correctIndex: 1,
      },
      {
        id: "it-3",
        question: "Which platform serves as the lab's knowledge base and project management hub?",
        options: ["Slack", "Box", "Notion", "Google Docs"],
        correctIndex: 2,
      },
      {
        id: "it-4",
        question: "What is required before merging code to the main branch?",
        options: [
          "PI approval only",
          "A code review",
          "Running on the GPU cluster",
          "Writing a paper about it",
        ],
        correctIndex: 1,
      },
      {
        id: "it-5",
        question: "What security measure should be enabled on all accounts?",
        options: [
          "VPN at all times",
          "Two-factor authentication (2FA)",
          "Fingerprint scanning",
          "Weekly password rotation",
        ],
        correctIndex: 1,
      },
    ],
  },

  {
    id: "ip-policy",
    title: "Intellectual Property Policy",
    description: "Publication authorship, IP ownership, data sharing, and open science",
    icon: "Scale",
    estimatedMinutes: 10,
    content: `
<h2>Intellectual Property & Publication Policy</h2>
<p>Understanding IP rights and publication practices is essential for every lab member. These policies protect both your work and the lab's interests.</p>

<h3>Authorship Guidelines</h3>
<p>We follow the <strong>ICMJE (International Committee of Medical Journal Editors)</strong> guidelines for authorship:</p>
<ul>
<li><strong>Substantial contribution</strong> to conception, design, data acquisition, or analysis</li>
<li><strong>Drafting or critical revision</strong> of the manuscript</li>
<li><strong>Final approval</strong> of the version to be published</li>
<li><strong>Accountability</strong> for all aspects of the work</li>
</ul>
<p>Authorship is discussed early and transparently for every project. If you believe your contributions warrant authorship, raise it directly with Prof. Chen.</p>

<h3>IP Ownership</h3>
<ul>
<li>Work produced as part of your lab duties generally belongs to <strong>UAB</strong> under the university IP policy.</li>
<li>If you develop software or tools using lab resources, these are lab assets and must be documented.</li>
<li>Inventions with commercial potential should be disclosed to UAB's Office of Technology Transfer.</li>
<li>You retain the right to use skills and general knowledge gained in the lab.</li>
</ul>

<h3>Data Sharing & Open Science</h3>
<ul>
<li>We believe in <strong>open science</strong>. Code and data should be shared whenever possible.</li>
<li>All published papers should have associated code repositories (preferably public GitHub).</li>
<li>Datasets should be deposited in appropriate repositories (GEO, PDB, Zenodo, etc.).</li>
<li>Always check data use agreements before sharing — some datasets have restrictions.</li>
<li>Embargo periods may apply before public release.</li>
</ul>

<h3>Confidential Information</h3>
<ul>
<li>Do not share unpublished results, grant proposals, or proprietary data outside the lab without permission.</li>
<li>NDA-covered collaborations have special handling requirements — ask before sharing anything.</li>
<li>Peer review materials are strictly confidential.</li>
</ul>
`,
    quiz: [
      {
        id: "ip-1",
        question: "Which guidelines does the lab follow for determining authorship?",
        options: [
          "First-come, first-served",
          "ICMJE guidelines",
          "Alphabetical order",
          "Seniority-based",
        ],
        correctIndex: 1,
      },
      {
        id: "ip-2",
        question: "Who generally owns IP produced during lab work?",
        options: [
          "The individual researcher",
          "The funding agency",
          "UAB (the university)",
          "The journal that publishes it",
        ],
        correctIndex: 2,
      },
      {
        id: "ip-3",
        question: "What should accompany all published papers?",
        options: [
          "A press release",
          "Associated code repositories",
          "A patent filing",
          "A video presentation",
        ],
        correctIndex: 1,
      },
      {
        id: "ip-4",
        question: "What should you do before sharing a dataset externally?",
        options: [
          "Post it on social media first",
          "Check data use agreements for restrictions",
          "Get approval from coauthors only",
          "Wait until the paper is accepted",
        ],
        correctIndex: 1,
      },
      {
        id: "ip-5",
        question: "What should you do if you develop something with commercial potential?",
        options: [
          "File a patent independently",
          "Disclose it to UAB's Office of Technology Transfer",
          "Sell it directly",
          "Keep it confidential indefinitely",
        ],
        correctIndex: 1,
      },
    ],
  },

  {
    id: "ethics",
    title: "Research Ethics",
    description: "IRB requirements, data privacy, responsible conduct of research, and AI ethics",
    icon: "ShieldCheck",
    estimatedMinutes: 15,
    content: `
<h2>Research Ethics & Responsible Conduct</h2>
<p>Ethical research is the foundation of scientific credibility. Every lab member must understand and uphold these standards.</p>

<h3>Responsible Conduct of Research (RCR)</h3>
<p>All trainees funded by NIH or NSF are required to complete formal <strong>RCR training</strong> (via CITI). Key principles include:</p>
<ul>
<li><strong>Honesty</strong> - Report findings truthfully. Never fabricate or falsify data.</li>
<li><strong>Objectivity</strong> - Avoid bias in design, analysis, interpretation, and review.</li>
<li><strong>Integrity</strong> - Keep promises, act consistently, be sincere.</li>
<li><strong>Openness</strong> - Share data, methods, and ideas.</li>
</ul>

<h3>IRB & Human Subjects Research</h3>
<ul>
<li>Any research involving human subjects (including de-identified health records) requires <strong>IRB approval</strong> before starting.</li>
<li>Complete CITI Human Subjects training before working with any patient data.</li>
<li>Always check whether your project falls under IRB jurisdiction — even secondary data analysis may require it.</li>
<li>Informed consent protocols must be followed strictly.</li>
</ul>

<h3>Data Privacy & HIPAA</h3>
<ul>
<li><strong>HIPAA</strong> applies to all protected health information (PHI).</li>
<li>PHI includes: names, dates, phone numbers, emails, SSNs, medical record numbers, and 14 other identifiers.</li>
<li>De-identification must follow Safe Harbor or Expert Determination methods.</li>
<li>Never discuss identifiable patient information in public spaces or unsecured channels.</li>
<li>Data breaches must be reported immediately to UAB's privacy officer and Prof. Chen.</li>
</ul>

<h3>AI Ethics in Biomedical Research</h3>
<ul>
<li><strong>Fairness</strong> - Check for bias in training data and model outputs across demographic groups.</li>
<li><strong>Transparency</strong> - Document model architectures, training data, and limitations.</li>
<li><strong>Accountability</strong> - AI-assisted decisions in healthcare must have human oversight.</li>
<li><strong>Privacy</strong> - Use privacy-preserving techniques (federated learning, differential privacy) when applicable.</li>
</ul>

<h3>Research Misconduct</h3>
<p>Fabrication, falsification, and plagiarism (FFP) are the three categories of research misconduct. They are career-ending. If you witness potential misconduct, report it to Prof. Chen or UAB's Research Integrity Officer.</p>
`,
    quiz: [
      {
        id: "eth-1",
        question: "What training is required before working with patient data?",
        options: [
          "Python programming",
          "CITI Human Subjects training",
          "Machine learning certification",
          "First aid training",
        ],
        correctIndex: 1,
      },
      {
        id: "eth-2",
        question: "What are the three categories of research misconduct (FFP)?",
        options: [
          "Fraud, Forgery, Piracy",
          "Fabrication, Falsification, Plagiarism",
          "Faking, Fudging, Photocopying",
          "Failure, Fiction, Pretense",
        ],
        correctIndex: 1,
      },
      {
        id: "eth-3",
        question: "When is IRB approval required?",
        options: [
          "Only for clinical trials",
          "Only for funded research",
          "Before any research involving human subjects (including de-identified records)",
          "Only when publishing results",
        ],
        correctIndex: 2,
      },
      {
        id: "eth-4",
        question: "What should you do if you discover a data breach involving patient information?",
        options: [
          "Fix it quietly and move on",
          "Wait until the next lab meeting to discuss it",
          "Report it immediately to UAB's privacy officer and Prof. Chen",
          "Post about it on the lab Slack channel",
        ],
        correctIndex: 2,
      },
      {
        id: "eth-5",
        question: "Which is NOT a key principle of AI ethics in biomedical research?",
        options: [
          "Fairness — check for demographic bias",
          "Transparency — document models and limitations",
          "Speed — prioritize fast results over validation",
          "Privacy — use privacy-preserving techniques",
        ],
        correctIndex: 2,
      },
    ],
  },

  {
    id: "reporting",
    title: "Reporting & Review",
    description: "Quarterly goals, project updates, performance reviews, and lab meetings",
    icon: "ClipboardCheck",
    estimatedMinutes: 8,
    content: `
<h2>Reporting, Reviews & Goal Setting</h2>
<p>Regular reporting keeps everyone aligned and ensures you get the support you need to succeed.</p>

<h3>Quarterly Goals</h3>
<ul>
<li>At the start of each quarter, you'll set <strong>3-5 measurable goals</strong> with Prof. Chen.</li>
<li>Goals should be SMART: Specific, Measurable, Achievable, Relevant, Time-bound.</li>
<li>Track progress via the <strong>Member Portal</strong> (Projects & Goals dashboard).</li>
<li>Goals are reviewed at the end of each quarter.</li>
</ul>

<h3>Weekly Updates</h3>
<ul>
<li>Submit a brief weekly update (via Notion or Slack) covering:
  <ul>
  <li>What you accomplished this week</li>
  <li>What you plan to do next week</li>
  <li>Any blockers or help needed</li>
  </ul>
</li>
<li>This helps Prof. Chen provide timely guidance and identify bottlenecks.</li>
</ul>

<h3>Lab Meetings</h3>
<ul>
<li>Attend all weekly lab meetings (excused absences with advance notice).</li>
<li>Present your research on a rotating schedule (roughly every 4-6 weeks).</li>
<li>Participate actively in discussions and provide constructive feedback to peers.</li>
<li>Journal club presentations are assigned periodically — come prepared.</li>
</ul>

<h3>Annual Performance Reviews</h3>
<ul>
<li>A formal review meeting with Prof. Chen occurs annually.</li>
<li>Reviews cover: research progress, publications, skills development, and professional growth.</li>
<li>Prepare a self-assessment before the meeting.</li>
<li>This is also your chance to discuss career goals, concerns, and resource needs.</li>
</ul>

<h3>Milestones & Deliverables</h3>
<ul>
<li><strong>PhD Students</strong>: qualifying exam, proposal defense, dissertation chapters, final defense</li>
<li><strong>Postdocs</strong>: manuscripts submitted, grants applied for, career development activities</li>
<li><strong>Staff</strong>: project deliverables, software releases, documentation</li>
<li><strong>All members</strong>: at least one conference presentation or paper submission per year is expected.</li>
</ul>
`,
    quiz: [
      {
        id: "rp-1",
        question: "How many quarterly goals should you typically set?",
        options: ["1-2", "3-5", "8-10", "As many as possible"],
        correctIndex: 1,
      },
      {
        id: "rp-2",
        question: "What framework should goals follow?",
        options: [
          "FAST (Frequent, Ambitious, Specific, Transparent)",
          "OKR (Objectives and Key Results)",
          "SMART (Specific, Measurable, Achievable, Relevant, Time-bound)",
          "KPI (Key Performance Indicators)",
        ],
        correctIndex: 2,
      },
      {
        id: "rp-3",
        question: "What should a weekly update include?",
        options: [
          "Only completed tasks",
          "Accomplishments, next week's plan, and blockers",
          "A detailed time log",
          "Only problems encountered",
        ],
        correctIndex: 1,
      },
      {
        id: "rp-4",
        question: "How often should you expect to present at lab meetings?",
        options: [
          "Once a year",
          "Every week",
          "Every 4-6 weeks on a rotating schedule",
          "Only when you have results to share",
        ],
        correctIndex: 2,
      },
      {
        id: "rp-5",
        question: "What is the minimum expected output for all lab members annually?",
        options: [
          "Two grant applications",
          "At least one conference presentation or paper submission",
          "Three software releases",
          "Monthly publications",
        ],
        correctIndex: 1,
      },
    ],
  },
]

export const MODULE_IDS = ONBOARDING_MODULES.map((m) => m.id)
