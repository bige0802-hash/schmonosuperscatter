export const CONFIG = {
  cols: 6,
  rows: 5,
  startCoins: 100000,
  dailyCoins: 10000,
  minBet: 100,
  maxBet: 3000,
  betStep: 100,
  freeSpinsAward: 15,
  hiddenTarget: 100,
  saveKey: 'schmono_studio_modular_v1',
  symbols: [
    { id:'p1', image:'assets/symbols/premium_1.jpeg', weight:6, pay:12 },
    { id:'p2', image:'assets/symbols/premium_2.jpeg', weight:6, pay:10 },
    { id:'p3', image:'assets/symbols/premium_3.jpeg', weight:7, pay:9 },
    { id:'p4', image:'assets/symbols/premium_4.jpeg', weight:7, pay:8 },
    { id:'p5', image:'assets/symbols/premium_5.jpeg', weight:7, pay:7 },
    { id:'bananaLow', text:'🍌', weight:10, pay:5, cls:'gem' },
    { id:'ring', text:'💍', weight:10, pay:4, cls:'gem' },
    { id:'diamond', text:'💎', weight:10, pay:5, cls:'gem' },
    { id:'A', text:'A', weight:13, pay:4, cls:'letter red' },
    { id:'K', text:'K', weight:13, pay:4, cls:'letter gold' },
    { id:'Q', text:'Q', weight:13, pay:3, cls:'letter green' },
    { id:'J', text:'J', weight:13, pay:3, cls:'letter blue' },
    { id:'10', text:'10', weight:13, pay:2, cls:'letter purple' },
    { id:'scatter', image:'assets/symbols/regular_scatter.jpeg', weight:3, pay:0, cls:'scatter' },
    { id:'super', image:'assets/symbols/super_scatter.jpeg', weight:1, pay:0, cls:'super' }
  ]
};
