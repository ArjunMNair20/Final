export type CTFTask = {
  id: string;
  title: string;
  category: 'Web' | 'Cryptography' | 'Forensics' | 'Reverse' | 'Binary';
  difficulty: 'easy' | 'medium' | 'hard';
  prompt: string;
  flag: string; // expected exact match, demo only
  hints: string[]; // progressive hints
  seriesId?: string; // Optional: belongs to a series/campaign
  stepNumber?: number; // Optional: step number in a series (1, 2, 3...)
  requiresStep?: string; // Optional: requires this challenge ID to be solved first
  image?: string; // Optional: data URL or path to an image to display with the challenge
};

export const CTF_TASKS: CTFTask[] = [
  // ==================== EASY CHALLENGES ====================
  {
    id: 'web-hello',
    title: 'Cookie Value',
    category: 'Web',
    difficulty: 'easy',
    prompt: 'A cookie has value "ZmFsc2U=". Decode it to find the flag.',
    flag: 'CSA{false}',
    hints: [
      'The value looks like base64 encoding.',
      'Decode "ZmFsc2U=" using base64 decoder.',
      'The decoded value is your flag.'
    ],
  },
  {
    id: 'crypto-caesar',
    title: 'Caesar Cipher',
    category: 'Cryptography',
    difficulty: 'easy',
    prompt: 'Decode this message: "MJQQT". It was shifted forward by 5 letters.',
    flag: 'CSA{HELLO}',
    hints: [
      'Caesar cipher shifts letters. To decode, shift backward.',
      'Shift each letter back by 5: M→H, J→E, Q→L, Q→L, T→O.',
      'The decoded message is "HELLO". Format as flag.'
    ],
  },
  {
    id: 'forensics-hex',
    title: 'Hex to Text',
    category: 'Forensics',
    difficulty: 'easy',
    prompt: 'Convert this hex to text: 43 53 41 7B 68 69 64 64 65 6E 7D',
    flag: 'CSA{hidden}',
    hints: [
      'Each pair of hex digits is one character.',
      '43 = C, 53 = S, 41 = A, 7B = {, 68 = h, 69 = i, 64 = d, 64 = d, 65 = e, 6E = n, 7D = }',
      'Put it all together to get the flag.'
    ],
  },
  {
    id: 'bin-ascii',
    title: 'Binary to Text',
    category: 'Binary',
    difficulty: 'easy',
    prompt: 'Convert this binary to text: 01000011 01010011 01000001 01111011 01100010 01101001 01101110 01100001 01110010 01111001 01111101',
    flag: 'CSA{binary}',
    hints: [
      'Each 8-digit binary number is one character.',
      '01000011 = 67 = C, 01010011 = 83 = S, 01000001 = 65 = A',
      'Continue converting all binary numbers to get the full flag.'
    ],
  },
  {
    id: 'web-source',
    title: 'Page Source',
    category: 'Web',
    difficulty: 'easy',
    prompt: 'Check the page source. Look for a comment with the flag.',
    flag: 'CSA{source_code}',
    hints: [
      'Right-click and select "View Page Source" or press Ctrl+U.',
      'Look for HTML comments: <!-- -->',
      'The flag is inside a comment.'
    ],
  },
  {
    id: 'crypto-base64',
    title: 'Base64 Decode',
    category: 'Cryptography',
    difficulty: 'easy',
    prompt: 'Decode this: Q1NBe2JpbmFyeV9mbGFnfQ==',
    flag: 'CSA{binary_flag}',
    hints: [
      'This is base64 encoded text.',
      'Use a base64 decoder online or in your code.',
      'The decoded text is your flag.'
    ],
  },
  {
    id: 'forensics-morse',
    title: 'Morse Code',
    category: 'Forensics',
    difficulty: 'easy',
    prompt: 'Decode this morse code: "-.-. ... .- / ... . -.-. .-. . -"',
    flag: 'CSA{SECRET}',
    hints: [
      'Morse code uses dots and dashes. "/" is a space.',
      'Use a morse code decoder or chart.',
      'The decoded message is your flag.'
    ],
  },
  {
    id: 'reverse-simple',
    title: 'Simple Math',
    category: 'Reverse',
    difficulty: 'easy',
    prompt: 'A number is multiplied by 5 and becomes 25. What was the original number?',
    flag: 'CSA{5}',
    hints: [
      'Reverse the operation: if result = number × 5, then number = result ÷ 5.',
      '25 ÷ 5 = 5',
      'The answer is 5. Format as flag.'
    ],
  },
  {
    id: 'web-robots',
    title: 'Robots File',
    category: 'Web',
    difficulty: 'easy',
    prompt: 'Check the /robots.txt file. What does it say?',
    flag: 'CSA{robots_txt}',
    hints: [
      'Visit /robots.txt on the website.',
      'The file contains information about the flag.',
      'Read the contents to find the flag.'
    ],
  },
  {
    id: 'crypto-rot13',
    title: 'ROT13',
    category: 'Cryptography',
    difficulty: 'easy',
    prompt: 'Decode this ROT13: "PFN{ebg13}"',
    flag: 'CSA{rot13}',
    hints: [
      'ROT13 shifts each letter by 13 positions.',
      'P→C, F→S, N→A, e→r, b→o, g→t, 1→1, 3→3',
      'The decoded text is your flag.'
    ],
  },
  {
    id: 'forensics-strings',
    title: 'Find Text',
    category: 'Forensics',
    difficulty: 'easy',
    prompt: 'A file contains the text "CSA{strings_found}". Extract it.',
    flag: 'CSA{strings_found}',
    hints: [
      'Use the strings command or open the file as text.',
      'Search for text that starts with "CSA"',
      'The flag is directly in the file.'
    ],
  },
  {
    id: 'bin-unicode',
    title: 'Unicode Values',
    category: 'Binary',
    difficulty: 'easy',
    prompt: 'Convert these Unicode values: U+0043 U+0053 U+0041 U+007B U+0066 U+006C U+0061 U+0067 U+007D',
    flag: 'CSA{flag}',
    hints: [
      'Unicode U+0043 is decimal 67, which is "C".',
      'U+0053 = 83 = S, U+0041 = 65 = A, U+007B = 123 = {, U+0066 = 102 = f, etc.',
      'Convert all values to get the flag.'
    ],
  },
  {
    id: 'web-cookie',
    title: 'Cookie Change',
    category: 'Web',
    difficulty: 'easy',
    prompt: 'Change the cookie named "access" to value "admin" to get the flag.',
    flag: 'CSA{cookie_admin}',
    hints: [
      'Use browser developer tools to edit cookies.',
      'Find the "access" cookie and change its value to "admin".',
      'Refresh the page to see the flag.'
    ],
  },
  {
    id: 'crypto-substitution',
    title: 'Letter Shift',
    category: 'Cryptography',
    difficulty: 'easy',
    prompt: 'Each letter is shifted forward by 1. Decode: "DSB{tvctfuibo}"',
    flag: 'CSA{substitution}',
    hints: [
      'Shift each letter backward by 1: D→C, S→S, B→A',
      'Continue: t→s, v→u, c→b, t→s, f→e, u→t, i→h, b→a, o→n',
      'The decoded text is your flag.'
    ],
  },
  {
    id: 'reverse-string',
    title: 'Reverse String',
    category: 'Reverse',
    difficulty: 'easy',
    prompt: 'A string was reversed. The result is "}galf{ASC". What was the original?',
    flag: 'CSA{flag}',
    hints: [
      'To reverse a reversed string, reverse it again.',
      'Reverse "}galf{ASC" to get the original.',
      'The original string is your flag.'
    ],
  },
  {
    id: 'forensics-exif',
    title: 'Image Metadata',
    category: 'Forensics',
    difficulty: 'easy',
    prompt: 'Check the EXIF data of an image. Look for the Artist field.',
    flag: 'CSA{exif_data}',
    hints: [
      'EXIF data is metadata stored in images.',
      'Use a tool like exiftool or check image properties.',
      'The Artist field contains the flag.'
    ],
  },
  {
    id: 'web-header',
    title: 'HTTP Header',
    category: 'Web',
    difficulty: 'easy',
    prompt: 'Check the HTTP response headers. Look for a custom header.',
    flag: 'CSA{header_flag}',
    hints: [
      'Open browser developer tools and go to Network tab.',
      'Check response headers for any custom headers.',
      'The flag is in a custom header.'
    ],
  },
  {
    id: 'crypto-xor-simple',
    title: 'Simple XOR',
    category: 'Cryptography',
    difficulty: 'easy',
    prompt: 'A number XORed with 10 gives 15. What was the original number?',
    flag: 'CSA{5}',
    hints: [
      'XOR is reversible: if A XOR B = C, then A = C XOR B.',
      'Original = 15 XOR 10 = 5',
      'The answer is 5. Format as flag.'
    ],
  },
  {
    id: 'bin-magic',
    title: 'File Header',
    category: 'Binary',
    difficulty: 'easy',
    prompt: 'File header bytes: 43 53 41 7B 6D 61 67 69 63 7D. Convert to text.',
    flag: 'CSA{magic}',
    hints: [
      'Each hex pair is one character.',
      '43 = C, 53 = S, 41 = A, 7B = {, 6D = m, 61 = a, 67 = g, 69 = i, 63 = c, 7D = }',
      'Put it together to get the flag.'
    ],
  },
  {
    id: 'reverse-add',
    title: 'Addition Reverse',
    category: 'Reverse',
    difficulty: 'easy',
    prompt: 'A number plus 7 equals 20. What was the original number?',
    flag: 'CSA{13}',
    hints: [
      'Reverse the operation: if result = number + 7, then number = result - 7.',
      '20 - 7 = 13',
      'The answer is 13. Format as flag.'
    ],
  },

  // ==================== MEDIUM CHALLENGES ====================
  {
    id: 'web-jwt',
    title: 'JWT Token',
    category: 'Web',
    difficulty: 'medium',
    prompt: 'A JWT token has three parts. Decode the middle part (payload) to find the flag.',
    flag: 'CSA{jwt_token}',
    hints: [
      'JWT tokens have format: header.payload.signature',
      'The middle part (payload) is base64url encoded.',
      'Decode the payload to get JSON with the flag.'
    ],
  },
  {
    id: 'crypto-double',
    title: 'Double Encoding',
    category: 'Cryptography',
    difficulty: 'medium',
    prompt: 'Text was encoded twice: first base64, then hex. Encoded: 3433417b646f75626c657d. Decode it.',
    flag: 'CSA{double}',
    hints: [
      'Decode in reverse order: first hex, then base64.',
      'Hex "3433417b646f75626c657d" decodes to base64 text.',
      'Decode the base64 to get the original flag.'
    ],
  },
  {
    id: 'forensics-lsb',
    title: 'Hidden Bits',
    category: 'Forensics',
    difficulty: 'medium',
    prompt: 'The least significant bits of image pixels spell: "01000011 01010011 01000001 01111011 01101100 01110011 01100010 01111101". Convert to text.',
    flag: 'CSA{lsb}',
    hints: [
      'Each 8-bit binary number is one character.',
      '01000011 = 67 = C, 01010011 = 83 = S, 01000001 = 65 = A',
      'Continue converting all binary to get the flag.'
    ],
  },
  {
    id: 'reverse-xor',
    title: 'XOR Reverse',
    category: 'Reverse',
    difficulty: 'medium',
    prompt: 'A value XORed with 0x42 gives 0x2E. What was the original? Convert to ASCII.',
    flag: 'CSA{l}',
    hints: [
      'XOR is reversible: original = result XOR key.',
      '0x2E XOR 0x42 = 0x6C = 108 in decimal.',
      'ASCII 108 is "l". Format as flag.'
    ],
  },
  {
    id: 'crypto-vigenere',
    title: 'Vigenère Cipher',
    category: 'Cryptography',
    difficulty: 'medium',
    prompt: 'Decode Vigenère cipher: "XZQ" with key "KEY".',
    flag: 'CSA{KEY}',
    hints: [
      'Vigenère shifts each letter by the corresponding key letter.',
      'X shifted by K, Z by E, Q by Y.',
      'Decode each letter to get the flag.'
    ],
  },
  {
    id: 'web-url',
    title: 'URL Encoding',
    category: 'Web',
    difficulty: 'medium',
    prompt: 'Decode this URL encoding: "%43%53%41%7B%75%72%6C%7D"',
    flag: 'CSA{url}',
    hints: [
      'URL encoding uses %XX where XX is hex.',
      '%43 = 67 = C, %53 = 83 = S, %41 = 65 = A, %7B = 123 = {',
      'Continue decoding all %XX values to get the flag.'
    ],
  },
  {
    id: 'forensics-pattern',
    title: 'Number Pattern',
    category: 'Forensics',
    difficulty: 'medium',
    prompt: 'These numbers are ASCII codes: 67, 83, 65, 123, 112, 97, 116, 116, 101, 114, 110, 125. Convert to text.',
    flag: 'CSA{pattern}',
    hints: [
      'Each number is an ASCII decimal code.',
      '67 = C, 83 = S, 65 = A, 123 = {, 112 = p, 97 = a, 116 = t, etc.',
      'Convert all numbers to get the flag.'
    ],
  },
  {
    id: 'reverse-fibonacci',
    title: 'Fibonacci Number',
    category: 'Reverse',
    difficulty: 'medium',
    prompt: 'The 10th Fibonacci number is 34. Convert 34 to ASCII character.',
    flag: 'CSA{"}',
    hints: [
      'Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34...',
      'The 10th number is 34.',
      'ASCII 34 is the double quote character ". Format as flag.'
    ],
  },
  {
    id: 'crypto-atbash',
    title: 'Atbash Cipher',
    category: 'Cryptography',
    difficulty: 'medium',
    prompt: 'Decode Atbash: "XZH{gsv}". Atbash reverses alphabet (A=Z, B=Y, etc.)',
    flag: 'CSA{the}',
    hints: [
      'Atbash maps A↔Z, B↔Y, C↔X, etc.',
      'X→C, Z→A, H→S, g→t, s→h, v→e',
      'The decoded text is your flag.'
    ],
  },
  {
    id: 'bin-endian',
    title: 'Byte Order',
    category: 'Binary',
    difficulty: 'medium',
    prompt: 'Little-endian bytes: 7B 41 53 43. Convert to big-endian and read as text.',
    flag: 'CSA{',
    hints: [
      'Little-endian: least significant byte first. Big-endian: most significant byte first.',
      'Little-endian "7B 41 53 43" in big-endian is "43 53 41 7B".',
      'Convert hex to ASCII: 43=C, 53=S, 41=A, 7B={'
    ],
  },

  // ==================== HARD CHALLENGES ====================
  {
    id: 'crypto-rsa-small-e',
    title: 'RSA Small Exponent (e=3)',
    category: 'Cryptography',
    difficulty: 'hard',
    prompt: 'A small RSA setup used e=3 and the ciphertext appears to be a direct cube of the message (no padding). Recover the message and format it as CSA{message}. (This is a theoretical challenge — use integer cube root techniques.)',
    flag: 'CSA{rsa_cube_root}',
    hints: [
      'Small public exponent attacks exist when messages are not padded correctly.',
      'If m^e < n then c = m^e (mod n) is simply m^e — take the integer cube root.',
      'Compute the integer cube root of the ciphertext to recover the original message string.',
    ],
  },
  {
    id: 'web-ssti',
    title: 'Server-Side Template Injection',
    category: 'Web',
    difficulty: 'hard',
    prompt: 'A template rendering endpoint reflects your input into a server-side template engine. Find a payload that executes code or reads a secret variable containing the flag.',
    flag: 'CSA{ssti_executed}',
    hints: [
      'Identify the template engine in use (Jinja2, Twig, etc.) by testing expression syntax.',
      'Try payloads that access attributes, call functions, or import modules to read server variables.',
      'Carefully craft a payload that prints the secret variable containing the flag.',
    ],
  },
  {
    id: 'reverse-obfuscated',
    title: 'Obfuscated Binary Reverse',
    category: 'Reverse',
    difficulty: 'hard',
    prompt: 'A stripped, obfuscated binary performs a complex check and prints the flag when the correct input is provided. Reverse the binary to find the required input.',
    flag: 'CSA{reverse_hard}',
    hints: [
      'Use static analysis tools (strings, objdump, radare2, Ghidra) to locate comparison logic.',
      'Identify the checksum/transform routines and recreate them in your environment.',
      'Feed the reversed input to the binary to obtain the flag.',
    ],
  },
  {
    id: 'binary-rop',
    title: 'ROP Gadget Chain',
    category: 'Binary',
    difficulty: 'hard',
    prompt: 'A vulnerable binary with NX enabled and ASLR disabled contains useful ROP gadgets. Build a ROP chain to call system("/bin/sh") or to reveal the flag stored in memory.',
    flag: 'CSA{rop_master}',
    hints: [
      'Find gadgets using ROP gadget-finders (ROPgadget, rp++).',
      'Leak an address if necessary, then compute offsets and build a payload to pivot to a chain that calls system().',
      'Test locally with the same libc version to craft a working exploit.',
    ],
  },
  // LSB Steganography challenge removed
  {
    id: 'crypto-padding-oracle',
    title: 'Padding Oracle',
    category: 'Cryptography',
    difficulty: 'hard',
    prompt: 'A web endpoint decrypts AES-CBC encrypted cookies and returns distinct error messages when padding is invalid. Exploit this oracle to decrypt a ciphertext and recover the flag.',
    flag: 'CSA{padding_oracle}',
    hints: [
      'Padding oracle attacks manipulate ciphertext blocks to discover plaintext one byte at a time.',
      'Automate the attack to iterate over possible byte values and observe server responses.',
      'Reconstruct the plaintext and extract the flag string.',
    ],
  },
  {
    id: 'exploit-format-string',
    title: 'Format String Vulnerability',
    category: 'Web',
    difficulty: 'hard',
    prompt: 'An application logs user-supplied input using an unsafe printf-style function. Use format string exploitation to read a stack value that contains the flag.',
    flag: 'CSA{fmt_vuln}',
    hints: [
      'Format string specifiers like %x and %s can read stack memory when incorrectly used.',
      'Find the correct offset to the stack location containing the flag and use %s to print it.',
      'Be cautious: some servers sanitize % characters — try combinations and offsets to locate the flag.',
    ],
  },
  {
    id: 'reverse-asm-crack',
    title: 'Assembly Crackme',
    category: 'Reverse',
    difficulty: 'hard',
    prompt: 'A small crackme binary asks for a serial number. Reverse the assembly to compute the serial that satisfies the check and reveals the flag.',
    flag: 'CSA{asm_crack}',
    hints: [
      'Disassemble the binary and find the check routine that processes the input.',
      'Trace the arithmetic/bitwise operations applied to each character to derive the inverse.',
      'Compute the serial offline and provide it to the program to get the flag.',
    ],
  },

  // ==================== SERIES/CAMPAIGNS ====================
  // Series 1: "The Hidden Message" - Multi-step Web Security Campaign
  {
    id: 'series1-step1',
    title: 'The Hidden Message - Part 1: Discovery',
    category: 'Web',
    difficulty: 'easy',
    prompt: 'You found a suspicious website. Check the page source for hidden comments. What is the first clue?',
    flag: 'clue1',
    hints: [
      'Right-click and view page source.',
      'Look for HTML comments <!-- -->',
      'The clue is hidden in a comment.'
    ],
    seriesId: 'hidden-message',
    stepNumber: 1,
  },
  {
    id: 'series1-step2',
    title: 'The Hidden Message - Part 2: Decode',
    category: 'Web',
    difficulty: 'easy',
    prompt: 'You found "Y2x1ZTI=" in the source. Decode it to find the next clue.',
    flag: 'clue2',
    hints: [
      'This looks like base64 encoding.',
      'Decode "Y2x1ZTI=" using base64.',
      'The decoded value is your answer.'
    ],
    seriesId: 'hidden-message',
    stepNumber: 2,
    requiresStep: 'series1-step1',
  },
  {
    id: 'series1-step3',
    title: 'The Hidden Message - Part 3: Final Flag',
    category: 'Web',
    difficulty: 'medium',
    prompt: 'The decoded message says "Check /robots.txt". Visit that path to find the final flag.',
    flag: 'final_flag',
    hints: [
      'Navigate to /robots.txt on the website.',
      'The flag is in the robots.txt file.',
      'Read the file contents to find the flag.'
    ],
    seriesId: 'hidden-message',
    stepNumber: 3,
    requiresStep: 'series1-step2',
  },

  // Series 2: "Crypto Mystery" - Cryptography Campaign
  {
    id: 'series2-step1',
    title: 'Crypto Mystery - Part 1: Caesar',
    category: 'Cryptography',
    difficulty: 'easy',
    prompt: 'Decode this Caesar cipher (shift 3): "FDOO"',
    flag: 'caesar_key',
    hints: [
      'Caesar cipher shifts letters. Shift backward by 3.',
      'F→C, D→A, O→L, O→L',
      'The decoded word is your answer.'
    ],
    seriesId: 'crypto-mystery',
    stepNumber: 1,
  },
  {
    id: 'series2-step2',
    title: 'Crypto Mystery - Part 2: Base64',
    category: 'Cryptography',
    difficulty: 'easy',
    prompt: 'Use the previous answer as a key. Decode this base64: "U0dWc2JHOGdWMjl5YkdRaA=="',
    flag: 'base64_key',
    hints: [
      'Decode the base64 string first.',
      'The previous answer might be needed for the next step.',
      'The decoded value is your answer.'
    ],
    seriesId: 'crypto-mystery',
    stepNumber: 2,
    requiresStep: 'series2-step1',
  },
  {
    id: 'series2-step3',
    title: 'Crypto Mystery - Part 3: Final Decode',
    category: 'Cryptography',
    difficulty: 'medium',
    prompt: 'Combine both previous answers and decode this hex: "66696e616c5f666c6167"',
    flag: 'final_flag',
    hints: [
      'Convert hex to ASCII.',
      'Each pair of hex digits is one character.',
      'The decoded text is your final flag.'
    ],
    seriesId: 'crypto-mystery',
    stepNumber: 3,
    requiresStep: 'series2-step2',
  },

  // Series 3: "Forensic Investigation" - Forensics Campaign
  {
    id: 'series3-step1',
    title: 'Forensic Investigation - Part 1: Metadata',
    category: 'Forensics',
    difficulty: 'easy',
    prompt: 'An image file has metadata. The Artist field contains: "step1_complete". What is the next step?',
    flag: 'check_exif',
    hints: [
      'The Artist field contains a clue.',
      'The clue says "step1_complete".',
      'Your answer is the next action: "check_exif"'
    ],
    seriesId: 'forensic-investigation',
    stepNumber: 1,
  },
  {
    id: 'series3-step2',
    title: 'Forensic Investigation - Part 2: EXIF Data',
    category: 'Forensics',
    difficulty: 'medium',
    prompt: 'The EXIF GPS coordinates are: 40.7128, -74.0060. Convert these to a city name (lowercase, no spaces).',
    flag: 'newyork',
    hints: [
      'These are GPS coordinates.',
      '40.7128°N, 74.0060°W is New York City.',
      'Answer in lowercase, no spaces: "newyork"'
    ],
    seriesId: 'forensic-investigation',
    stepNumber: 2,
    requiresStep: 'series3-step1',
  },
  {
    id: 'series3-step3',
    title: 'Forensic Investigation - Part 3: Hidden Data',
    category: 'Forensics',
    difficulty: 'medium',
    prompt: 'The LSB (Least Significant Bit) of the image contains: "01000110 01001001 01001110 01000001 01001100". Decode it.',
    flag: 'FINAL',
    hints: [
      'Each 8-bit binary number is one ASCII character.',
      '01000110 = 70 = F, 01001001 = 73 = I, 01001110 = 78 = N, etc.',
      'Convert all binary to get the final flag.'
    ],
    seriesId: 'forensic-investigation',
    stepNumber: 3,
    requiresStep: 'series3-step2',
  },
];

// Series metadata for display
export type CTFSeries = {
  id: string;
  title: string;
  description: string;
  category: 'Web' | 'Cryptography' | 'Forensics' | 'Reverse' | 'Binary';
  difficulty: 'easy' | 'medium' | 'hard';
  totalSteps: number;
  challengeIds: string[];
};

export const CTF_SERIES: CTFSeries[] = [
  {
    id: 'hidden-message',
    title: 'The Hidden Message',
    description: 'A multi-step web security investigation. Follow the clues through page sources, encoding, and hidden files. Story: You\'re investigating a suspicious website that might contain hidden information. Each step reveals a new clue leading to the final secret.',
    category: 'Web',
    difficulty: 'medium',
    totalSteps: 3,
    challengeIds: ['series1-step1', 'series1-step2', 'series1-step3'],
  },
  {
    id: 'crypto-mystery',
    title: 'Crypto Mystery',
    description: 'Unlock the secrets of cryptography. Decode Caesar ciphers, base64, and hex to solve the mystery. Story: An encrypted message was intercepted. Decode each layer to uncover the hidden truth behind the cryptographic puzzle.',
    category: 'Cryptography',
    difficulty: 'medium',
    totalSteps: 3,
    challengeIds: ['series2-step1', 'series2-step2', 'series2-step3'],
  },
  {
    id: 'forensic-investigation',
    title: 'Forensic Investigation',
    description: 'Investigate digital evidence. Analyze metadata, GPS coordinates, and hidden data in images. Story: A digital forensics case requires you to extract hidden information from an image file. Follow the trail of metadata and steganography.',
    category: 'Forensics',
    difficulty: 'medium',
    totalSteps: 3,
    challengeIds: ['series3-step1', 'series3-step2', 'series3-step3'],
  },
];
