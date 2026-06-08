// All site-wide content lives here. Edit this file to update the bio,
// title, navigation, or links — no need to touch component code.

export const site = {
  // <head> metadata
  title: 'Yanjun Chen',
  description:
    'Yanjun Chen — Ph.D. student in Electrical and Computer Engineering at the University of Illinois Urbana-Champaign. Research in human-computer interaction, haptic feedback, and novel sensing.',
  url: 'https://chen-yanjun.com',

  // Header
  brand: 'Yanjun Chen',
  nav: [
    { label: 'Home', href: '#' },
    { label: 'Publication', href: '#publication' },
  ],

  // Header logo image (placed in public/uploads/). Set to '' to use brand text instead.
  logoImage: '/uploads/title_LOGO.png',

  // Hero / About section
  hero: {
    name: 'Hi, I am Yanjun Chen.',
    photo: '/uploads/cropped-me.png',
    cvUrl: '/uploads/Yanjun_Chen.pdf',
    googleScholarUrl: 'https://scholar.google.com/citations?user=EvPrj_QAAAAJ',
    linkedinUrl: 'https://www.linkedin.com/in/yanjunc/',
    githubUrl: 'https://github.com/YanjunChenPocket',
    email: 'yanjunc2@illinois.edu',
    bio: `I am a second-year Ph.D. student in <a href="https://ece.illinois.edu/" target="_blank" rel="noopener">Electrical and Computer Engineering</a> at the University of Illinois Urbana-Champaign, working with <a href="https://www.craig-shultz.com/" target="_blank" rel="noopener">Prof. Craig Shultz</a> in the <a href="https://www.interactivedisplaylab.com/" target="_blank" rel="noopener">Interactive Display Lab</a>. Previously, I served as a Research Assistant at the <a href="http://english.is.cas.cn/" target="_blank" rel="noopener">Institute of Software, Chinese Academy of Sciences</a>, under the guidance of <a href="https://scholar.google.co.jp/citations?user=kHKwQ9gAAAAJ&hl=en" target="_blank" rel="noopener">Prof. Teng Han</a>. I received my B.E. in Computer Science and Technology from Chengdu University of Information Technology, China.`,
    interests: `My research interests lie in the area of human-computer interaction (HCI). I am currently exploring haptic feedback and novel sensing technologies, including compact actuators/sensors, wearables, and interactive interfaces.`,
  },

  // Footer
  footer: `© ${new Date().getFullYear()} by Yanjun Chen | Last updated: 06/2026`,
};
