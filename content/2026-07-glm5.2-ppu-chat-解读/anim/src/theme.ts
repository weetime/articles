// ModelDoctor 品牌 token —— 支持 light / dark 两套主题
// 切换主题：改下面这一行 MODE
export const MODE: 'light' | 'dark' = 'dark';

const LIGHT = {
  pageGrad:
    'radial-gradient(900px 520px at 80% -6%, #6d4bff12, transparent 60%),' +
    'radial-gradient(760px 480px at 6% 104%, #0891b20d, transparent 60%),' +
    'linear-gradient(170deg,#ffffff 0%,#f5f6fb 75%)',
  gridLine: '#00000005',
  panel: '#ffffff',
  line2: '#e2e3ed',
  line: '#ececf2',
  track: '#eef0f5',
  shadow: '0 8px 24px #12122610',
  ink: '#16161a',
  ink2: '#41414e',
  ink3: '#6b6b78',
  ink4: '#9a9aa8',
  violet: '#6d4bff',
  violet2: '#8b6dff',
  cyan: '#0891b2',
  green: '#16a34a',
  green2: '#22c55e',
  amber: '#d97706',
  rose: '#e11d48',
  off: '#9aa0b4',
  offDeep: '#c2c6d4',
  // 渐变填充
  fillViolet: 'linear-gradient(90deg,#6d4bff,#8b6dff)',
  fillGreen: 'linear-gradient(90deg,#15a04a,#22c55e)',
  fillCyan: 'linear-gradient(90deg,#0e7490,#0891b2)',
  fillOff: 'linear-gradient(90deg,#b9bdcc,#9aa0b4)',
  prefix: ['#6d4bff', '#0891b2', '#d97706', '#e11d48'],
};

const DARK = {
  // 电影级深底(辉光光斑放在 Bg.tsx 里做,便于动画)
  pageGrad: 'linear-gradient(168deg,#0b1020 0%,#080a14 55%,#0a0812 100%)',
  gridLine: '#ffffff08',
  // 卡片改渐变面板 + 玻璃高光,层次更强
  panel: 'linear-gradient(180deg,#18202f 0%,#121826 100%)',
  panelSolid: '#151c2a',
  line2: '#2b3546',
  line: '#232c3b',
  track: '#1a2130',
  shadow: '0 14px 42px #00000070, inset 0 1px 0 #ffffff0c',
  ink: '#f3f6fc',
  ink2: '#cdd5e4',
  ink3: '#8a97ad',
  ink4: '#5c6779',
  // 更饱和、更亮的强调色(贴近 ModelDoctor 海报)
  violet: '#8b7bff',
  violet2: '#b4a7ff',
  blue: '#5a9cff',
  cyan: '#34d3ec',
  green: '#3fe892',
  green2: '#5cf0a6',
  amber: '#f7b73c',
  rose: '#ff6b86',
  off: '#6b7484',
  offDeep: '#4b5360',
  fillViolet: 'linear-gradient(90deg,#6d5bff,#9c8bff)',
  fillGreen: 'linear-gradient(90deg,#22c46f,#4dee97)',
  fillCyan: 'linear-gradient(90deg,#1f9fbd,#34d3ec)',
  fillBlue: 'linear-gradient(90deg,#3f7fe6,#5a9cff)',
  fillRose: 'linear-gradient(90deg,#e8425f,#ff6b86)',
  fillOff: 'linear-gradient(90deg,#3f4856,#5b6473)',
  prefix: ['#8b7bff', '#34d3ec', '#f7b73c', '#ff6b86'],
};

export const C = MODE === 'dark' ? DARK : LIGHT;
export const PREFIX = C.prefix;

export const FONT =
  '"PingFang SC","Microsoft YaHei","Segoe UI",system-ui,-apple-system,sans-serif';
