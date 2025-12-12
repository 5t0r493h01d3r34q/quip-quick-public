
import { DialogNode } from './types';

export const FPS_DIALOGS: DialogNode[] = [
  {
    id: 'cat-1',
    key: '1',
    text: 'Positive Vibes',
    children: [
      { 
        id: 'var-1-1', 
        key: '1', 
        text: 'Hype',
        children: [
          { id: 'msg-1-1-1', key: '1', text: 'Amazing work!' },
          { id: 'msg-1-1-2', key: '2', text: 'You\'re on fire!' },
          { id: 'msg-1-1-3', key: '3', text: 'LET\'S GOOO!' },
          { id: 'msg-1-1-4', key: '4', text: 'Sheeesh!' },
        ]
      },
      { 
        id: 'var-1-2', 
        key: '2', 
        text: 'Chill',
        children: [
          { id: 'msg-1-2-1', key: '1', text: 'nice one' },
          { id: 'msg-1-2-2', key: '2', text: 'good job' },
          { id: 'msg-1-2-3', key: '3', text: 'solid play' },
        ]
      },
    ],
  },
  {
    id: 'cat-2',
    key: '2',
    text: 'Tactical',
    children: [
      {
        id: 'var-2-1',
        key: '1',
        text: 'Enemy Info',
        children: [
          { id: 'msg-2-1-1', key: '1', text: 'Enemy right there!' },
          { id: 'msg-2-1-2', key: '2', text: 'One HP!' },
          { id: 'msg-2-1-3', key: '3', text: 'Multiple enemies.' },
          { id: 'msg-2-1-4', key: '4', text: 'Flanking us.' },
        ],
      },
      {
        id: 'var-2-2',
        key: '2',
        text: 'Status',
        children: [
          { id: 'msg-2-2-1', key: '1', text: "Need backup!" },
          { id: 'msg-2-2-2', key: '2', text: "I'm healing." },
          { id: 'msg-2-2-3', key: '3', text: "Reloading / Resetting." },
        ],
      },
      {
        id: 'var-2-3',
        key: '3',
        text: 'Objective',
        children: [
            { id: 'msg-2-3-1', key: '1', text: 'Push the objective!' },
            { id: 'msg-2-3-2', key: '2', text: 'Defend here.' },
            { id: 'msg-2-3-3', key: '3', text: 'Don\'t overextend.' },
        ]
      }
    ],
  },
  {
      id: 'cat-3',
      key: '3',
      text: 'Post Game',
      children: [
          { id: 'msg-3-1', key: '1', text: 'GG WP' },
          { id: 'msg-3-2', key: '2', text: 'Close game!' },
          { id: 'msg-3-3', key: '3', text: 'Nice try team.' },
      ]
  }
];

export const MOBA_DIALOGS: DialogNode[] = [
    {
        id: 'moba-1', key: '1', text: 'Lane Calls', children: [
            { id: 'm-1-1', key: '1', text: 'Missing (SS)', children: [
                { id: 'm-ss-1', key: '1', text: 'SS Top' },
                { id: 'm-ss-2', key: '2', text: 'SS Mid' },
                { id: 'm-ss-3', key: '3', text: 'SS Bot' },
                { id: 'm-ss-4', key: '4', text: 'Re (They returned)' }
            ]},
            { id: 'm-1-2', key: '2', text: 'State', children: [
                { id: 'm-st-1', key: '1', text: 'Pushing lane' },
                { id: 'm-st-2', key: '2', text: 'Freezing' },
                { id: 'm-st-3', key: '3', text: 'Recalling / B' },
            ]}
        ]
    },
    {
        id: 'moba-2', key: '2', text: 'Objectives', children: [
            { id: 'm-obj-1', key: '1', text: 'Major Boss', children: [
                { id: 'm-b-1', key: '1', text: 'Start Baron/Roshan?' },
                { id: 'm-b-2', key: '2', text: 'Contest them!' },
                { id: 'm-b-3', key: '3', text: 'Give it, don\'t fight.' }
            ]},
            { id: 'm-obj-2', key: '2', text: 'Towers', children: [
                { id: 'm-t-1', key: '1', text: 'Defend Tower' },
                { id: 'm-t-2', key: '2', text: 'Trade Towers' },
                { id: 'm-t-3', key: '3', text: 'Split push' }
            ]}
        ]
    },
    {
        id: 'moba-3', key: '3', text: 'Teamfights', children: [
            { id: 'm-tf-1', key: '1', text: 'Focus Carry' },
            { id: 'm-tf-2', key: '2', text: 'Peel for me' },
            { id: 'm-tf-3', key: '3', text: 'Engage now!' },
            { id: 'm-tf-4', key: '4', text: 'Back / Disengage' }
        ]
    }
];

export const SOCIAL_DIALOGS: DialogNode[] = [
    {
        id: 'soc-1', key: '1', text: 'Greetings', children: [
            { id: 's-g-1', key: '1', text: 'GL HF everyone' },
            { id: 's-g-2', key: '2', text: 'Hi team' },
            { id: 's-g-3', key: '3', text: 'Let\'s get this win' }
        ]
    },
    {
        id: 'soc-2', key: '2', text: 'During Game', children: [
            { id: 's-d-1', key: '1', text: 'mb (my bad)' },
            { id: 's-d-2', key: '2', text: 'np (no problem)' },
            { id: 's-d-3', key: '3', text: 'lagging sorry' },
            { id: 's-d-4', key: '4', text: 'brb 1 min' },
            { id: 's-d-5', key: '5', text: 'lol' },
            { id: 's-d-6', key: '6', text: '?' }
        ]
    },
    {
        id: 'soc-3', key: '3', text: 'Ending', children: [
            { id: 's-e-1', key: '1', text: 'GG WP' },
            { id: 's-e-2', key: '2', text: 'BG (bad game)' },
            { id: 's-e-3', key: '3', text: 'Diff' },
            { id: 's-e-4', key: '4', text: 'Add me after' }
        ]
    }
];

export const BR_DIALOGS: DialogNode[] = [
    {
        id: 'br-1', key: '1', text: 'Loot & Gear', children: [
            { id: 'br-l-1', key: '1', text: 'I need ammo' },
            { id: 'br-l-2', key: '2', text: 'I need shields/meds' },
            { id: 'br-l-3', key: '3', text: 'Extra weapon here' },
            { id: 'br-l-4', key: '4', text: 'Found level 3 vest' }
        ]
    },
    {
        id: 'br-2', key: '2', text: 'Movement', children: [
            { id: 'br-m-1', key: '1', text: 'Zone is closing' },
            { id: 'br-m-2', key: '2', text: 'Rotate to circle' },
            { id: 'br-m-3', key: '3', text: 'Let\'s take high ground' },
            { id: 'br-m-4', key: '4', text: 'Hold this building' }
        ]
    },
    {
        id: 'br-3', key: '3', text: 'Combat', children: [
            { id: 'br-c-1', key: '1', text: 'Enemy knocked!' },
            { id: 'br-c-2', key: '2', text: 'Cracked shield' },
            { id: 'br-c-3', key: '3', text: 'Pushing now!' },
            { id: 'br-c-4', key: '4', text: 'Third party incoming!' }
        ]
    }
];

export const MMO_DIALOGS: DialogNode[] = [
    {
        id: 'mmo-1', key: '1', text: 'Dungeon/Raid', children: [
            { id: 'mmo-d-1', key: '1', text: 'Pulling in 3, 2, 1...' },
            { id: 'mmo-d-2', key: '2', text: 'Mana break please' },
            { id: 'mmo-d-3', key: '3', text: 'Focus the adds' },
            { id: 'mmo-d-4', key: '4', text: 'Wipe it / Reset' }
        ]
    },
    {
        id: 'mmo-2', key: '2', text: 'Loot', children: [
            { id: 'mmo-l-1', key: '1', text: 'Need (Main Spec)' },
            { id: 'mmo-l-2', key: '2', text: 'Greed (Off Spec)' },
            { id: 'mmo-l-3', key: '3', text: 'Passing' },
            { id: 'mmo-l-4', key: '4', text: 'Can I trade for that?' }
        ]
    },
    {
        id: 'mmo-3', key: '3', text: 'LFG/Trade', children: [
            { id: 'mmo-t-1', key: '1', text: 'LFG Tank' },
            { id: 'mmo-t-2', key: '2', text: 'LFG Healer' },
            { id: 'mmo-t-3', key: '3', text: 'LFG DPS' },
            { id: 'mmo-t-4', key: '4', text: 'WTS [Item] PM me' }
        ]
    }
];

export const RTS_DIALOGS: DialogNode[] = [
    {
        id: 'rts-1', key: '1', text: 'Economy', children: [
            { id: 'rts-e-1', key: '1', text: 'Expanding now' },
            { id: 'rts-e-2', key: '2', text: 'I need resources' },
            { id: 'rts-e-3', key: '3', text: 'Sending workers' }
        ]
    },
    {
        id: 'rts-2', key: '2', text: 'Military', children: [
            { id: 'rts-m-1', key: '1', text: 'Attack move!' },
            { id: 'rts-m-2', key: '2', text: 'Defend base' },
            { id: 'rts-m-3', key: '3', text: 'Build Anti-Air' },
            { id: 'rts-m-4', key: '4', text: 'Detectors needed' }
        ]
    },
    {
        id: 'rts-3', key: '3', text: 'Info', children: [
            { id: 'rts-i-1', key: '1', text: 'Scouting...' },
            { id: 'rts-i-2', key: '2', text: 'Rush incoming!' },
            { id: 'rts-i-3', key: '3', text: 'They are teching up' }
        ]
    }
];

export const FIGHTING_DIALOGS: DialogNode[] = [
    {
        id: 'fg-1', key: '1', text: 'Matches', children: [
            { id: 'fg-m-1', key: '1', text: 'Run it back?' },
            { id: 'fg-m-2', key: '2', text: 'One more set' },
            { id: 'fg-m-3', key: '3', text: 'Lag / Rollback spike' },
            { id: 'fg-m-4', key: '4', text: 'Ggs shake my hand' }
        ]
    },
    {
        id: 'fg-2', key: '2', text: 'Reactions', children: [
            { id: 'fg-r-1', key: '1', text: 'Nice combo' },
            { id: 'fg-r-2', key: '2', text: 'That was cheap' },
            { id: 'fg-r-3', key: '3', text: 'Good read' },
            { id: 'fg-r-4', key: '4', text: 'Whiff punish!' }
        ]
    }
];

export const TF2_DIALOGS: DialogNode[] = [
    {
        id: 'tf2-1', key: '1', text: 'Calls', children: [
            { id: 'tf2-c-1', key: '1', text: 'Medic!', children: [
                { id: 'tf2-med-1', key: '1', text: 'MEDIC!' },
                { id: 'tf2-med-2', key: '2', text: 'Charge me!' },
                { id: 'tf2-med-3', key: '3', text: 'Uber Ready!' },
                { id: 'tf2-med-4', key: '4', text: 'Pop it! Don\'t drop it!' }
            ]},
            { id: 'tf2-c-2', key: '2', text: 'Warnings', children: [
                { id: 'tf2-w-1', key: '1', text: 'Spy!' },
                { id: 'tf2-w-2', key: '2', text: 'Sentry Ahead!' },
                { id: 'tf2-w-3', key: '3', text: 'Sniper watching!' },
                { id: 'tf2-w-4', key: '4', text: 'Incoming!' }
            ]}
        ]
    },
    {
        id: 'tf2-2', key: '2', text: 'Objectives', children: [
            { id: 'tf2-o-1', key: '1', text: 'Offense', children: [
                { id: 'tf2-off-1', key: '1', text: 'Push the cart!' },
                { id: 'tf2-off-2', key: '2', text: 'Get on the point!' },
                { id: 'tf2-off-3', key: '3', text: 'Move up!' }
            ]},
            { id: 'tf2-o-2', key: '2', text: 'Defense', children: [
                { id: 'tf2-def-1', key: '1', text: 'Hold here!' },
                { id: 'tf2-def-2', key: '2', text: 'Don\'t let them push!' },
                { id: 'tf2-def-3', key: '3', text: 'Sentry down!' }
            ]}
        ]
    },
    {
        id: 'tf2-3', key: '3', text: 'Class/Meme', children: [
            { id: 'tf2-cl-1', key: '1', text: 'Engineer', children: [
                { id: 'tf2-eng-1', key: '1', text: 'Need a dispenser here!' },
                { id: 'tf2-eng-2', key: '2', text: 'Teleporter coming up' },
                { id: 'tf2-eng-3', key: '3', text: 'Spy sapping my sentry!' }
            ]},
            { id: 'tf2-cl-2', key: '2', text: 'Funny', children: [
                { id: 'tf2-fun-1', key: '1', text: 'Pootis' },
                { id: 'tf2-fun-2', key: '2', text: 'Nope.avi' },
                { id: 'tf2-fun-3', key: '3', text: 'That Heavy is a Spy!' },
                { id: 'tf2-fun-4', key: '4', text: 'Thanks pally!' }
            ]}
        ]
    }
];

export const DIALOGS = FPS_DIALOGS; // Fallback default
