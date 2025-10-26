import Assistant_box1 from '@/assets/images/Assistant/Assistant-box1@2x.png';
import Assistant_box2 from '@/assets/images/Assistant/Assistant-box2@2x.png';
import Assistant_box3 from '@/assets/images/Assistant/Assistant-box3@2x.png';
import Assistant_box4 from '@/assets/images/Assistant/Assistant-box4@2x.png';

export const quickButtons: Array<{
  title: string;
  icon: string; // image src
  desc?: string;
  onClick?: () => void;
}> = [
  { title: '财报指标查询助手', icon: Assistant_box3 },
  { title: '大宗原材料行情助手', icon: Assistant_box4 },
  { title: '会议室助手', icon: Assistant_box1 },
  { title: '待办生成助手', icon: Assistant_box2 },
];

export const chips: string[] = ['今日集团要闻', '我的公休假', '帮我查询某人的联系方式'];
