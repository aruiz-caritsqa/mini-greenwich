import Player from './Player.js'; 
import Vec from './Vec.js'; 
import Coin from './Coin.js'; 
import Lava from './Lava.js'; 

export default class Level {
  constructor(plan) {
    const rows = plan.trim().split('\n').map((l) => [...l]);
    this.height = rows.length;
    this.width = rows[0].length;
    this.startActors = [];
    const levelChars = {
      '.': 'empty',
      '#': 'wall',
      '+': 'lava',
      '@': Player,
      o: Coin,
      '=': Lava,
      '|': Lava,
      v: Lava,
    };

    this.rows = rows.map((row, y) => row.map((ch, x) => {
      const type = levelChars[ch];
      if (typeof type === 'string') return type;
      this.startActors.push(
        type.create(new Vec(x, y), ch),
      );
      return 'empty';
    }));
  }
}
