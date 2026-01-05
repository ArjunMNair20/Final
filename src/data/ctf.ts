export type CTFTask = {
  id: string;
  title: string;
  category: 'Web' | 'Cryptography' | 'Forensics' | 'Reverse' | 'Binary';
  difficulty: 'easy' | 'medium' | 'hard';
  prompt: string;
  flag: string; // expected exact match, demo only
  hints: string[]; // progressive hints
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
];
