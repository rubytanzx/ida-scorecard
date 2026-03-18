export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'typing';
  content: string;
  timestamp: string;
  actions?: MessageAction[];
}

export interface MessageAction {
  label: string;
  variant: 'outlined' | 'filled';
}

export const USER_MESSAGE: Message = {
  id: 'msg-1',
  role: 'user',
  content:
    'I am an Operations Officer writing the new CPF for Mexico. Using FY25 scorecard data, give me a ranked list of 3–5 priority Outcome Areas where Mexico has the biggest gaps compared to Chile, Brazil, Colombia and Peru. For each gap, show me which projects in the current portfolio are contributing to that indicator, how much, and whether that contribution is growing or stalling. Flag where evidence is limited. I need this as a brief I can take into a decision meeting.',
  timestamp: 'Just now',
};

export const TYPING_MESSAGE: Message = {
  id: 'msg-typing',
  role: 'typing',
  content: '',
  timestamp: '',
};

export const AI_MESSAGE: Message = {
  id: 'msg-2',
  role: 'assistant',
  content:
    "I've added 3 priority gap cards to your canvas based on FY25 data.\n\nMexico's biggest gaps vs its peer group are in **Learning Poverty**, **Social Protection Coverage**, and **Financial Account Ownership**.\n\nFor each, I've shown the current portfolio contribution and whether it's growing or stalling. The education gap has limited evidence — flagged on the card.\n\nScroll right on the canvas to see all three.",
  timestamp: 'Just now',
  actions: [
    { label: 'Add remaining gaps →', variant: 'outlined' },
    { label: 'Generate brief', variant: 'filled' },
  ],
};
