// Personal details in one place. Edit here, not in the pages.
export const SITE = {
  name: 'Waasila Asif',
  title: 'Waasila Asif',
  tagline: 'Systems and security, from the bytes up.',
  description:
    'Waasila Asif writes about what happens below the abstraction: processes, binaries, memory, and how they break.',
  email: '', // add a public contact address if you want one on the site
  github: 'https://github.com/WaasilaAsif',
  medium: 'https://medium.com/@wasif.bscs24seecs',
  linkedin: '', // add your public LinkedIn URL
  location: 'Islamabad, Pakistan',
};

// The hero hexdump. Each region is a run of the text below, annotated like a
// field in a binary header. Keep the whole string under ~96 bytes so it stays
// at six rows.
export const HEADER_FIELDS: { label: string; text: string }[] = [
  { label: 'name', text: 'Waasila Asif' },
  { label: 'role', text: ' / CS @ NUST SEECS' },
  { label: 'focus', text: ' / systems, security, binaries' },
  { label: 'status', text: ' / writing it all down.' },
];

export const PROJECTS = [
  {
    name: 'pyelf-teach',
    url: 'https://github.com/WaasilaAsif/pyelf-teach',
    blurb:
      'A Python library that reads ELF binaries and explains what it finds, field by field, for people learning how executables are laid out.',
    stack: 'Python, ELF',
    state: 'In development',
  },
  {
    name: 'Cross-OS C++ shell',
    url: 'https://github.com/WaasilaAsif/Cross-OS-Cpp-Shell',
    blurb:
      'A shell that runs on Linux and Windows, built to see exactly where fork() and _spawnvp() part ways. Listed in build-your-own-x.',
    stack: 'C++, POSIX, Win32',
    state: 'Shipped',
  },
  {
    name: 'Hybrid IDPS',
    url: 'https://github.com/WaasilaAsif/IS_IDPS',
    blurb:
      'Intrusion detection and prevention: a Random Forest on CICIDS2017 plus behavioural rules, threat-intel lookups, and automatic firewall blocking.',
    stack: 'Python, scikit-learn, Streamlit',
    state: 'Shipped',
  },
  {
    name: 'pwntools contribution',
    url: 'https://github.com/Gallopsled/pwntools/pull/2768',
    blurb:
      'Merged documentation fix for installing the exploit-development library on macOS via Homebrew.',
    stack: 'Open source',
    state: 'Merged',
  },
  {
    name: 'Social Graph Explorer',
    url: 'https://github.com/WaasilaAsif/Social-Graph-Explorer',
    blurb: 'A social network with a graph visualiser, CRUD, and real-time messaging.',
    stack: 'MERN',
    state: 'Shipped',
  },
  {
    name: 'BillSplit',
    url: 'https://github.com/WaasilaAsif/BillSplit',
    blurb: 'Expense splitting for students who share rent, food, and rides. Built during an Android internship.',
    stack: 'Android',
    state: 'Shipped',
  },
];
