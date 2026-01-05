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
    embedUrl: 'https://www.youtube.com/embed/8VeEdWfDx_c',
  },
  {
    id: 'network-security',
    title: 'Network Security Fundamentals',
    section: 'Network Security',
    description: 'Understanding network security, firewalls, encryption, and how to protect network infrastructure.',
    embedUrl: 'https://www.youtube.com/embed/inWWhr5n280',
  },
  {
    id: 'password-security',
    title: 'Password Security Best Practices',
    section: 'Cybersecurity Foundations',
    description: 'Learn about password hashing, salting, and best practices for secure password management.',
    embedUrl: 'https://www.youtube.com/embed/8VeEdWfDx_c',
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
    embedUrl: 'https://www.youtube.com/embed/rWHvp7rUka8',
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
    embedUrl: 'https://www.youtube.com/embed/0ZXiHISfQbs',
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
    embedUrl: 'https://www.youtube.com/embed/rWHvp7rUka8',
  },
  {
    id: 'social-engineering',
    title: 'Social Engineering Attacks',
    section: 'Social Engineering',
    description: 'Learn about social engineering techniques, how attackers manipulate people, and how to defend against them.',
    embedUrl: 'https://www.youtube.com/embed/Urk5OKA-sX0',
  },
  {
    id: 'linux-security',
    title: 'Linux Security Fundamentals',
    section: 'System Security',
    description: 'Understanding Linux security, file permissions, user management, and system hardening.',
    embedUrl: 'https://www.youtube.com/embed/inWWhr5n280',
  },
  {
    id: 'wireless-security',
    title: 'Wireless Network Security',
    section: 'Network Security',
    description: 'Learn about Wi-Fi security protocols, vulnerabilities, and how to secure wireless networks.',
    embedUrl: 'https://www.youtube.com/embed/0ZXiHISfQbs',
  },
  {
    id: 'bug-bounty-basics',
    title: 'Bug Bounty Hunting for Beginners',
    section: 'Ethical Hacking',
    description: 'Introduction to bug bounty programs, finding vulnerabilities, and responsible disclosure.',
    embedUrl: 'https://www.youtube.com/embed/3Kq1MIfTWCE',
  },
  {
    id: 'docker-security',
    title: 'Docker Container Security',
    section: 'DevOps Security',
    description: 'Understanding container security, Docker best practices, and securing containerized applications.',
    embedUrl: 'https://www.youtube.com/embed/rWHvp7rUka8',
  },
].filter(video => {
  // Only include videos with valid embed URLs
  return video.embedUrl && video.embedUrl.trim() !== '' && video.embedUrl.includes('youtube.com/embed/');
});

// Unavailable/upcoming videos - shown at bottom
const upcomingVideos = [
  {
    id: 'advanced-ctf',
    title: 'Advanced CTF Techniques',
    section: 'CTF Challenges',
    description: 'Advanced strategies and techniques for solving complex CTF challenges.',
    embedUrl: '',
  },
  {
    id: 'ai-cybersecurity',
    title: 'AI in Cybersecurity',
    section: 'Emerging Technologies',
    description: 'How artificial intelligence is being used in cybersecurity and threat detection.',
    embedUrl: '',
  },
  {
    id: 'incident-response',
    title: 'Incident Response Procedures',
    section: 'Security Operations',
    description: 'Learn how to respond to security incidents and breaches effectively.',
    embedUrl: '',
  },
  {
    id: 'bug-bounty',
    title: 'Bug Bounty Hunting Guide',
    section: 'Ethical Hacking',
    description: 'Introduction to bug bounty programs and how to find security vulnerabilities responsibly.',
    embedUrl: '',
  },
  {
    id: 'cloud-security',
    title: 'Cloud Security Fundamentals',
    section: 'Cloud Security',
    description: 'Understanding cloud security models, shared responsibility, and securing cloud infrastructure.',
    embedUrl: '',
  },
];

export default function Tutorials() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-300 mb-2">Tutorials & Learning Resources</h1>
        <p className="text-slate-400">
          Watch educational videos about cybersecurity concepts, vulnerabilities, and best practices. 
          These tutorials will help you understand the challenges in CyberSec Arena.
        </p>
      </div>

      {/* Available Videos Section */}
      <div>
        <h2 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
          <span>📹</span>
          <span>Available Tutorials</span>
        </h2>
        <div className="space-y-6">
          {videos.map((video) => (
            <section
              key={video.id}
              className="border border-slate-800 rounded-lg bg-gradient-to-br from-white/[0.03] to-white/[0.01] overflow-hidden hover:border-slate-700 transition-colors"
            >
              <div className="p-4 border-b border-slate-800">
                <div className="text-xs uppercase tracking-wide text-cyan-400 mb-1">{video.section}</div>
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
                    <div className="text-cyan-300 font-semibold mb-2">Video Coming Soon</div>
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

      {/* Upcoming Videos Section */}
      {upcomingVideos.length > 0 && (
        <div className="mt-8 pt-8 border-t border-slate-800">
          <h2 className="text-xl font-semibold text-slate-400 mb-4 flex items-center gap-2">
            <span>🔜</span>
            <span>Coming Soon</span>
          </h2>
          <div className="space-y-4">
            {upcomingVideos.map((video) => (
              <section
                key={video.id}
                className="border border-slate-800/50 rounded-lg bg-slate-900/20 overflow-hidden opacity-75"
              >
                <div className="p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">{video.section}</div>
                  <h2 className="text-base font-semibold text-slate-400 mb-2">{video.title}</h2>
                  <p className="text-sm text-slate-500">{video.description}</p>
                </div>
                <div className="aspect-video bg-black/80 flex flex-col items-center justify-center p-6 text-center">
                  <div className="text-4xl mb-3">🎬</div>
                  <div className="text-cyan-300 font-semibold mb-2">Video Coming Soon</div>
                  <div className="text-xs text-slate-500 max-w-md">
                    This tutorial is currently being prepared. Check back soon!
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
