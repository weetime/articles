// ModelDoctor 品牌 token —— 支持 light / dark 两套主题
// 切换主题：改下面这一行 MODE
export const MODE: 'light' | 'dark' = 'light';

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
  pageGrad:
    'radial-gradient(1000px 560px at 80% -8%, #6d4bff22, transparent 60%),' +
    'radial-gradient(820px 520px at 4% 106%, #22b8d815, transparent 60%),' +
    'linear-gradient(170deg,#0c1018 0%,#0a0d14 78%)',
  gridLine: '#ffffff0a',
  panel: '#141a24',
  line2: '#252d3a',
  line: '#222a36',
  track: '#1b2230',
  shadow: '0 10px 30px #00000055',
  ink: '#eef1f7',
  ink2: '#c2c9d6',
  ink3: '#8b94a4',
  ink4: '#5e6677',
  violet: '#9d8bff',
  violet2: '#b3a6ff',
  cyan: '#2bc4e6',
  green: '#3ddc84',
  green2: '#4ae88f',
  amber: '#f0a93b',
  rose: '#ff5d7a',
  off: '#6b7484',
  offDeep: '#4b5360',
  fillViolet: 'linear-gradient(90deg,#7d68ff,#a394ff)',
  fillGreen: 'linear-gradient(90deg,#2bb96a,#46e58c)',
  fillCyan: 'linear-gradient(90deg,#1796b4,#2bc4e6)',
  fillOff: 'linear-gradient(90deg,#3f4856,#5b6473)',
  prefix: ['#9d8bff', '#2bc4e6', '#f0a93b', '#ff5d7a'],
};

export const C = MODE === 'dark' ? DARK : LIGHT;
export const PREFIX = C.prefix;

export const FONT =
  '"PingFang SC","Microsoft YaHei","Segoe UI",system-ui,-apple-system,sans-serif';
