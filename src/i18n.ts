import { site } from './config';

export type Locale = 'en' | 'zh-CN';

const chineseSite = {
  ...site,
  title: '陈彦君',
  brand: '陈彦君',
  logoImage: '',
  description: '陈彦君，伊利诺伊大学厄巴纳-香槟分校电气与计算机工程专业博士三年级学生，研究方向为人机交互、触觉技术与可穿戴感知。',
  url: 'https://chen-yanjun.cn',
  nav: [
    { label: '首页', href: '#' },
    { label: '学术论文', href: '#publication' },
  ],
  hero: {
    ...site.hero,
    name: '你好，我是陈彦君。',
    bio: `我目前是伊利诺伊大学厄巴纳-香槟分校（UIUC）<a href="https://ece.illinois.edu/" target="_blank" rel="noopener">电气与计算机工程</a>专业的博士三年级学生，在 <a href="https://www.interactivedisplaylab.com/" target="_blank" rel="noopener">Interactive Display Lab</a> 从事研究，导师是 <a href="https://www.craig-shultz.com/" target="_blank" rel="noopener">Craig Shultz 教授</a>。`,
    interests: '我的研究方向是人机交互（HCI），重点关注触觉技术与可穿戴感知。我设计并开发小型化的感知与触觉系统，用于感知人的交互行为并提供物理反馈，让人与数字及物理环境之间的交互更加自然。',
    background: `此前，我曾在<a href="https://www.iscas.ac.cn/" target="_blank" rel="noopener">中国科学院软件研究所</a>担任研究助理，与<a href="https://scholar.google.co.jp/citations?user=kHKwQ9gAAAAJ&hl=en" target="_blank" rel="noopener">韩腾教授</a>合作。我本科毕业于成都信息工程大学计算机科学与技术专业，获工学学士学位。`,
  },
  footer: `© ${new Date().getFullYear()} 陈彦君 | 最后更新：2026年10月`,
};

const messages = {
  en: {
    publications: 'Publications', demonstrations: 'Demonstrations',
    news: 'NEWS', newsScroll: 'Recent news. Scroll for more.',
    email: 'Email', emailTitle: 'Send Email', cv: 'CV', cvTitle: 'Download CV',
    scholar: 'Google Scholar', video: 'video', playVideo: 'Play video',
    pdfSoon: 'PDF coming soon', doiSoon: 'DOI coming soon',
    previewSoon: 'preview coming soon', soon: 'SOON',
    notFoundTitle: 'Page Not Found', notFound: 'Page not found.', backHome: '← Back to home',
  },
  'zh-CN': {
    publications: '学术论文', demonstrations: '项目展示',
    news: '最新动态', newsScroll: '最新动态，滚动查看更多。',
    email: '邮箱', emailTitle: '发送邮件', cv: '简历', cvTitle: '下载简历（英文）',
    scholar: 'Google 学术', video: '视频', playVideo: '播放视频',
    pdfSoon: '论文 PDF 即将公开', doiSoon: 'DOI 即将公开',
    previewSoon: '预览即将公开', soon: '敬请期待',
    notFoundTitle: '页面未找到', notFound: '抱歉，未找到此页面。', backHome: '← 返回首页',
  },
};

export function getSite(locale: Locale = 'en') {
  return locale === 'zh-CN' ? chineseSite : site;
}

export function getMessages(locale: Locale = 'en') {
  return messages[locale];
}

// Use only Chinese names explicitly supplied by the site owner.
// Preserve all other author names, ordering, bold markers, and contribution stars.
export function localizeAuthors(authors: string, locale: Locale = 'en') {
  if (locale === 'en') return authors;
  return authors.replace(/\bYanjun Chen\b/g, '陈彦君').replace(/\bTeng Han\b/g, '韩腾');
}

export function formatNewsDate(date: string, locale: Locale) {
  if (locale === 'en') return date;
  const [month, day, year] = date.split('/');
  return `${year}.${month.padStart(2, '0')}.${day.padStart(2, '0')}`;
}
