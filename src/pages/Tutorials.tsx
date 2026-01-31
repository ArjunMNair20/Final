import { useState, useEffect } from 'react';

// Videos with actual YouTube embed URLs - shown at top
// Format: 'https://www.youtube.com/embed/VIDEO_ID'
const videos = [
  {
    id: 'cyber-basics',
    title: 'Cybersecurity Basics – Introduction to Cybersecurity',
    section: 'Cybersecurity Foundations',
    description: 'Learn the fundamentals of cybersecurity, including threats, vulnerabilities, and basic security practices.',
    embedUrl: 'https://www.youtube.com/embed/inWWhr5n280',
  },
  {
    id: 'sql-injection',
    title: 'SQL Injection Explained',
    section: 'Web Security',
    description: 'Understanding SQL injection attacks, how they work, and how to prevent them in your applications.',
    embedUrl: 'https://www.youtube.com/embed/ciNHn38EyRc',
  },
  {
    id: 'xss-attacks',
    title: 'Cross-Site Scripting (XSS) Attacks',
    section: 'Web Security',
    description: 'Learn about XSS vulnerabilities, different types of XSS attacks, and how to protect against them.',
    embedUrl: 'https://www.youtube.com/embed/EoaDgUgS6QA',
  },
  {
    id: 'phishing',
    title: 'Phishing Attacks Explained',
    section: 'Social Engineering',
    description: 'Understanding phishing attacks, how to identify suspicious emails, and best practices to stay safe.',
    embedUrl: 'https://www.youtube.com/embed/Urk5OKA-sX0',
  },
  {
    id: 'ctf-intro',
    title: 'CTF (Capture The Flag) for Beginners',
    section: 'CTF Challenges',
    description: 'Introduction to CTF competitions, common challenge types, and how to get started with cybersecurity challenges.',
    embedUrl: 'https://www.youtube.com/embed/8VeEdWfDx_c',
  },
  {
    id: 'secure-coding',
    title: 'Secure Coding Practices',
    section: 'Code & Secure',
    description: 'Learn secure coding principles, common vulnerabilities, and how to write secure code.',
    embedUrl: 'https://www.youtube.com/embed/bnlmKX-t3p0',
  },
  {
    id: 'network-security',
    title: 'Network Security Fundamentals',
    section: 'Network Security',
    description: 'Understanding network security, firewalls, encryption, and how to protect network infrastructure.',
    embedUrl: 'https://www.youtube.com/embed/ZhMw53kqaO0',
  },
  {
    id: 'password-security',
    title: 'Password Security Best Practices',
    section: 'Cybersecurity Foundations',
    description: 'Learn about password hashing, salting, and best practices for secure password management.',
    embedUrl: 'https://www.youtube.com/embed/Jq3TjCPw-Zw',
  },
  {
    id: 'cryptography-basics',
    title: 'Cryptography Basics',
    section: 'Cryptography',
    description: 'Introduction to cryptography, encryption algorithms, and how encryption protects data.',
    embedUrl: 'https://www.youtube.com/embed/jhXCTbFnK8o',
  },
  {
    id: 'penetration-testing',
    title: 'Introduction to Penetration Testing',
    section: 'Ethical Hacking',
    description: 'Learn about penetration testing, ethical hacking methodologies, and security assessment techniques.',
    embedUrl: 'https://www.youtube.com/embed/3Kq1MIfTWCE',
  },
  {
    id: 'web-security-basics',
    title: 'Web Application Security Basics',
    section: 'Web Security',
    description: 'Learn about common web vulnerabilities, OWASP Top 10, and how to secure web applications.',
    embedUrl: 'https://www.youtube.com/embed/Jzr0Jdnq_EI',
  },
  {
    id: 'malware-analysis',
    title: 'Introduction to Malware Analysis',
    section: 'Forensics',
    description: 'Understanding malware types, analysis techniques, and how to identify malicious software.',
    embedUrl: 'https://www.youtube.com/embed/1Tp6inwLU_4',
  },
  {
    id: 'reverse-engineering',
    title: 'Reverse Engineering Basics',
    section: 'Reverse Engineering',
    description: 'Introduction to reverse engineering, binary analysis, and understanding how software works.',
    embedUrl: 'https://www.youtube.com/embed/3NTXFUxcKPc',
  },
  {
    id: 'firewall-config',
    title: 'Firewall Configuration and Management',
    section: 'Network Security',
    description: 'Learn how to configure firewalls, set up rules, and protect your network from threats.',
    embedUrl: 'https://www.youtube.com/embed/kDEX1HQAeZ8',
  },
  {
    id: 'encryption',
    title: 'Encryption and Data Protection',
    section: 'Cryptography',
    description: 'Understanding encryption algorithms, symmetric vs asymmetric encryption, and data protection methods.',
    embedUrl: 'https://www.youtube.com/embed/jhXCTbFnK8o',
  },
  {
    id: 'owasp-top10',
    title: 'OWASP Top 10 Vulnerabilities',
    section: 'Web Security',
    description: 'Comprehensive overview of the OWASP Top 10 most critical web application security risks.',
    embedUrl: 'https://www.youtube.com/embed/uHKuOzDMqXo',
  },
  {
    id: 'social-engineering',
    title: 'Social Engineering Attacks',
    section: 'Social Engineering',
    description: 'Learn about social engineering techniques, how attackers manipulate people, and how to defend against them.',
    embedUrl: 'https://www.youtube.com/embed/EZnwQpJIiKc',
  },
  {
    id: 'linux-security',
    title: 'Linux Security Fundamentals',
    section: 'System Security',
    description: 'Understanding Linux security, file permissions, user management, and system hardening.',
    embedUrl: 'https://www.youtube.com/embed/V0ifp4HqD6U',
  },
  {
    id: 'wireless-security',
    title: 'Wireless Network Security',
    section: 'Network Security',
    description: 'Learn about Wi-Fi security protocols, vulnerabilities, and how to secure wireless networks.',
    embedUrl: 'https://www.youtube.com/embed/qzFEiTxRKSo',
  },
  {
    id: 'bug-bounty-basics',
    title: 'Bug Bounty Hunting for Beginners',
    section: 'Ethical Hacking',
    description: 'Introduction to bug bounty programs, finding vulnerabilities, and responsible disclosure.',
    embedUrl: 'https://www.youtube.com/embed/pWi6j6GIWtE',
  },
  {
    id: 'docker-security',
    title: 'Docker Container Security',
    section: 'DevOps Security',
    description: 'Understanding container security, Docker best practices, and securing containerized applications.',
    embedUrl: 'https://www.youtube.com/embed/SJY5t8Imt1U',
  },
].filter(video => {
  // Only include videos with embed URLs (basic filter) and exclude known-problematic entries
  return (
    video.embedUrl &&
    video.embedUrl.trim() !== '' &&
    video.embedUrl.includes('youtube.com/embed/') &&
    ![
      'cyber-basics',
      'phishing',
      'ctf-intro',
      'secure-coding',
      'network-security',
      'password-security',
      'social-engineering',
      'malware-analysis',
      'firewall-config',
      'owasp-top10',
      'linux-security',
      'wireless-security',
      'bug-bounty-basics',
      'docker-security',
    ].includes(video.id)
  );
});

// Recommended resources to show when a video is unavailable
const recommendedResources = [
  { title: 'LiveOverflow (CTF & security)', url: 'https://www.youtube.com/@LiveOverflow' },
  { title: 'NetworkChuck (Practical Security)', url: 'https://www.youtube.com/@NetworkChuck' },
  { title: 'The Cyber Mentor (Pentesting)', url: 'https://www.youtube.com/@TheCyberMentor' },
  { title: 'OWASP Foundation (Web Security)', url: 'https://www.youtube.com/@OWASPFoundation' },
  { title: 'Computerphile (Security Concepts)', url: 'https://www.youtube.com/@Computerphile' },
];

// Unavailable/upcoming videos removed — only available videos are displayed

interface InteractiveTutorial {
  id: string;
  title: string;
  description: string;
  steps: {
    title: string;
    content: string;
    code?: string;
    tip?: string;
  }[];
}

const interactiveTutorials: InteractiveTutorial[] = [
  {
    id: 'sql-injection-guide',
    title: 'SQL Injection - Step by Step Guide',
    description: 'Learn how to identify and exploit SQL injection vulnerabilities through interactive steps.',
    steps: [
      {
        title: 'Step 1: Understanding SQL Injection',
        content: 'SQL Injection occurs when user input is not properly sanitized and is directly used in SQL queries. This allows attackers to manipulate database queries.',
        tip: 'Always use parameterized queries to prevent SQL injection.',
      },
      {
        title: 'Step 2: Identifying Vulnerable Input',
        content: 'Look for input fields that interact with a database: login forms, search boxes, URL parameters, etc.',
        code: "SELECT * FROM users WHERE username = '" + "[user_input]" + "'",
        tip: 'If user input is concatenated directly into SQL, it\'s vulnerable.',
      },
      {
        title: 'Step 3: Testing for Vulnerability',
        content: 'Try injecting SQL code. Common test: Enter " OR 1=1 -- in a username field.',
        code: "SELECT * FROM users WHERE username = '' OR 1=1 --'",
        tip: 'The -- comments out the rest of the query, and OR 1=1 makes the condition always true.',
      },
      {
        title: 'Step 4: Exploiting the Vulnerability',
        content: 'Once confirmed, you can extract data. Example: " UNION SELECT username, password FROM users --',
        code: "SELECT * FROM users WHERE username = '' UNION SELECT username, password FROM users --'",
        tip: 'UNION allows you to combine results from multiple SELECT statements.',
      },
      {
        title: 'Step 5: Prevention',
        content: 'Use parameterized queries (prepared statements) that separate SQL code from data.',
        code: 'SELECT * FROM users WHERE username = ?',
        tip: 'Most programming languages support parameterized queries. Never concatenate user input into SQL.',
      },
    ],
  },
  {
    id: 'xss-guide',
    title: 'Cross-Site Scripting (XSS) - Interactive Guide',
    description: 'Master XSS attacks through hands-on learning with step-by-step instructions.',
    steps: [
      {
        title: 'Step 1: What is XSS?',
        content: 'XSS allows attackers to inject malicious scripts into web pages viewed by other users. The script executes in the victim\'s browser.',
        tip: 'XSS is one of the most common web vulnerabilities.',
      },
      {
        title: 'Step 2: Types of XSS',
        content: 'Reflected XSS: Script is reflected from the server (via URL parameters). Stored XSS: Script is stored on the server (in database). DOM XSS: Script manipulates the DOM directly.',
        tip: 'Stored XSS is more dangerous as it affects all users who view the page.',
      },
      {
        title: 'Step 3: Testing for XSS',
        content: 'Try injecting a simple script in input fields: <script>alert("XSS")</script>',
        code: '<script>alert("XSS")</script>',
        tip: 'If an alert box appears, the site is vulnerable to XSS.',
      },
      {
        title: 'Step 4: Advanced XSS Payloads',
        content: 'Bypass filters with encoded payloads: <img src=x onerror=alert(1)> or <svg onload=alert(1)>',
        code: '<img src=x onerror=alert(1)>',
        tip: 'Many sites filter <script> tags but miss event handlers like onerror or onload.',
      },
      {
        title: 'Step 5: Prevention',
        content: 'Escape user input, use Content Security Policy (CSP), and validate/sanitize all input.',
        tip: 'Output encoding is crucial. HTML entities like &lt; and &gt; prevent script execution.',
      },
    ],
  },
  {
    id: 'phishing-detection-guide',
    title: 'Phishing Detection - Step by Step',
    description: 'Learn to identify phishing emails through systematic analysis techniques.',
    steps: [
      {
        title: 'Step 1: Check the Sender',
        content: 'Examine the sender\'s email address carefully. Look for misspellings, suspicious domains, or mismatched sender names.',
        tip: 'Legitimate companies use their official domain. Watch for typosquatting (amaz0n instead of amazon).',
      },
      {
        title: 'Step 2: Analyze the Subject Line',
        content: 'Phishing emails often use urgency, threats, or too-good-to-be-true offers. Be suspicious of "URGENT", "Action Required", or "You\'ve Won!"',
        tip: 'Legitimate companies rarely use extreme urgency in emails.',
      },
      {
        title: 'Step 3: Inspect Links',
        content: 'Hover over links (don\'t click!) to see the actual URL. Check if it matches the displayed text and the company\'s official domain.',
        tip: 'Always verify URLs before clicking. Look for HTTPS and correct domain spelling.',
      },
      {
        title: 'Step 4: Check for Grammar and Spelling',
        content: 'Phishing emails often contain grammar mistakes, spelling errors, or awkward phrasing. Legitimate companies proofread their communications.',
        tip: 'Professional companies have quality control. Multiple errors are a red flag.',
      },
      {
        title: 'Step 5: Verify Requests',
        content: 'Legitimate companies rarely ask for sensitive information via email. If asked for passwords, credit cards, or SSN, it\'s likely phishing.',
        tip: 'When in doubt, contact the company directly through their official website or phone number.',
      },
    ],
  },
];

export default function Tutorials() {
  const [expandedTutorial, setExpandedTutorial] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Record<string, number>>({});
  const [visibleVideos, setVisibleVideos] = useState(() => videos);
  const [checkedOnce, setCheckedOnce] = useState(false);

  useEffect(() => {
    // Verify each YouTube embed using oEmbed; do not block UI — run in background
    if (checkedOnce) return;
    let cancelled = false;

    const getYouTubeId = (embedUrl: string) => {
      const m = embedUrl.match(/embed\/([a-zA-Z0-9_-]{6,})/);
      return m ? m[1] : null;
    };

    const check = async () => {
      try {
        const checks = await Promise.all(
          videos.map(async (v) => {
            const id = v.embedUrl ? getYouTubeId(v.embedUrl) : null;
            if (!id) return { ok: false, v };
            try {
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 3000);
              const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`, { signal: controller.signal });
              clearTimeout(timeout);
              return { ok: res.ok, v };
            } catch (_err) {
              return { ok: false, v };
            }
          })
        );

        if (cancelled) return;
        const okVideos = checks.filter(c => c.ok).map(c => c.v);
        setVisibleVideos(okVideos.length ? okVideos : videos);
      } catch (_e) {
        // If anything fails, keep original list to avoid hiding content
        setVisibleVideos(videos);
      } finally {
        setCheckedOnce(true);
      }
    };

    check();

    return () => { cancelled = true; };
  }, [checkedOnce]);

  const nextStep = (tutorialId: string) => {
    const tutorial = interactiveTutorials.find(t => t.id === tutorialId);
    if (!tutorial) return;
    const current = currentStep[tutorialId] || 0;
    if (current < tutorial.steps.length - 1) {
      setCurrentStep(prev => ({ ...prev, [tutorialId]: current + 1 }));
    }
  };

  const prevStep = (tutorialId: string) => {
    const current = currentStep[tutorialId] || 0;
    if (current > 0) {
      setCurrentStep(prev => ({ ...prev, [tutorialId]: current - 1 }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-purple-400 mb-2">Tutorials & Learning Resources</h1>
        <p className="text-slate-400">
          Watch educational videos about cybersecurity concepts, vulnerabilities, and best practices. 
          These tutorials will help you understand the challenges in CyberSec Arena.
        </p>
      </div>

      {/* Interactive Tutorials Section */}
      <div>
        <h2 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
          <span>🎯</span>
          <span>Interactive Step-by-Step Guides</span>
        </h2>
        <div className="space-y-4 mb-8">
          {interactiveTutorials.map((tutorial) => {
            const isExpanded = expandedTutorial === tutorial.id;
            const stepIndex = currentStep[tutorial.id] || 0;
            const currentStepData = tutorial.steps[stepIndex];
            const isFirstStep = stepIndex === 0;
            const isLastStep = stepIndex === tutorial.steps.length - 1;

            return (
              <div
                key={tutorial.id}
                className="border border-slate-800 rounded-lg bg-gradient-to-br from-white/[0.03] to-white/[0.01] overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                  onClick={() => setExpandedTutorial(isExpanded ? null : tutorial.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-fuchsia-300 mb-1">{tutorial.title}</h3>
                      <p className="text-sm text-slate-400">{tutorial.description}</p>
                    </div>
                    <button className="px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-400/30 text-purple-400 hover:bg-purple-500/30 transition-colors text-sm">
                      {isExpanded ? 'Collapse' : 'Start Guide'}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-800 p-6 space-y-4">
                    {/* Progress Indicator */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex-1 bg-slate-800 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-fuchsia-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((stepIndex + 1) / tutorial.steps.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400">
                        Step {stepIndex + 1} of {tutorial.steps.length}
                      </span>
                    </div>

                    {/* Current Step Content */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-lg font-semibold text-purple-400 mb-2">{currentStepData.title}</h4>
                        <p className="text-slate-300 mb-3">{currentStepData.content}</p>
                        
                        {currentStepData.code && (
                          <div className="bg-black/40 border border-slate-700 rounded-lg p-4 mb-3">
                            <pre className="text-xs text-green-300 font-mono overflow-x-auto">
                              <code>{currentStepData.code}</code>
                            </pre>
                          </div>
                        )}

                        {currentStepData.tip && (
                          <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-3">
                            <p className="text-xs text-yellow-300">
                              <span className="font-semibold">💡 Tip:</span> {currentStepData.tip}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Navigation Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                        <button
                          onClick={() => prevStep(tutorial.id)}
                          disabled={isFirstStep}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                            isFirstStep
                              ? 'bg-slate-700/30 text-slate-500 border-slate-600 cursor-not-allowed'
                              : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30 hover:bg-cyan-500/30'
                          }`}
                        >
                          ← Previous
                        </button>
                        <div className="flex gap-2">
                          {tutorial.steps.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentStep(prev => ({ ...prev, [tutorial.id]: idx }))}
                              className={`w-2 h-2 rounded-full transition-all ${
                                idx === stepIndex
                                  ? 'bg-cyan-400 w-8'
                                  : 'bg-slate-600 hover:bg-slate-500'
                              }`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => nextStep(tutorial.id)}
                          disabled={isLastStep}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                            isLastStep
                              ? 'bg-slate-700/30 text-slate-500 border-slate-600 cursor-not-allowed'
                              : 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/30 hover:bg-fuchsia-500/30'
                          }`}
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Videos Section */}
      <div>
        <h2 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
          <span>📹</span>
          <span>Available Tutorials</span>
        </h2>
        <div className="space-y-6">
          {visibleVideos.map((video) => (
            <section
              key={video.id}
              className="border border-slate-800 rounded-lg bg-gradient-to-br from-white/[0.03] to-white/[0.01] overflow-hidden hover:border-slate-700 transition-colors"
            >
              <div className="p-4 border-b border-slate-800">
                <div className="text-xs uppercase tracking-wide text-purple-400 mb-1">{video.section}</div>
                <h2 className="text-lg font-semibold text-fuchsia-300 mb-2">{video.title}</h2>
                <p className="text-sm text-slate-400">{video.description}</p>
              </div>
              <div className="aspect-video bg-black/60">
                {video.embedUrl ? (
                  <iframe
                    className="w-full h-full"
                    src={video.embedUrl}
                    title={video.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="text-4xl mb-3">🎬</div>
                    <div className="text-purple-400 font-semibold mb-2">Video Coming Soon</div>
                    <div className="text-xs text-slate-400 max-w-md">
                      This tutorial is currently being prepared. Check back soon!
                    </div>
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Recommended Videos & Guides (shown when some embeds are unavailable) */}
      <div className="mt-8 pt-8 border-t border-slate-800">
        <h2 className="text-xl font-semibold text-slate-400 mb-4 flex items-center gap-2">
          <span>🎥</span>
          <span>Recommended Videos & Guides</span>
        </h2>
        <div className="space-y-3">
          {recommendedResources.map((r) => (
            <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="block px-4 py-3 rounded-lg border border-slate-800 bg-slate-900/20 text-purple-400 hover:bg-slate-800/30">
              {r.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
