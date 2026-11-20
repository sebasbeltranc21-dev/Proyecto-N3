// Online conditional action frequencies with back-off from two, one or zero prior events.
export class EchoMemory {
  constructor(snapshot = {}) {
    this.tables = snapshot.tables || {};
    this.samples = snapshot.samples || 0;
    this.hits = snapshot.hits || 0;
    this.scored = snapshot.scored || 0;
    this.recent = [];
  }
  contexts(distance, hp) {
    const state = (distance < 70 ? 'near' : 'far') + (hp < 40 ? '-low' : '-well');
    const keys = [];
    for (let n = Math.min(2, this.recent.length); n >= 0; n--) {
      const history = n ? this.recent.slice(-n).join('/') : '*';
      keys.push(state + '|' + history, 'any|' + history);
    }
    return keys;
  }
  predict(distance, hp) {
    for (const key of this.contexts(distance, hp)) {
      const row = this.tables[key];
      if (!row) continue;
      const entries = Object.entries(row).sort((a,b) => b[1] - a[1]);
      const mass = entries.reduce((sum,pair) => sum + pair[1], 0);
      if (mass >= 2.7 && entries.length) {
        return {action: entries[0][0], confidence: entries[0][1] / mass};
      }
    }
    return {action: '', confidence: 0};
  }
  observe(action, distance, hp) {
    const forecast = this.predict(distance, hp);
    if (forecast.action) {
      this.scored++;
      if (forecast.action === action) this.hits++;
    }
    for (const key of this.contexts(distance,hp)) {
      const row = this.tables[key] ||= {};
      for (const token of Object.keys(row)) row[token] *= 0.94;
      row[action] = (row[action] || 0) + 1;
    }
    this.recent = [...this.recent.slice(-1), action];
    this.samples++;
  }
  snapshot() {
    return {tables:this.tables,samples:this.samples,hits:this.hits,scored:this.scored};
  }
}
export const directions = {E:[1,0], O:[-1,0], N:[0,-1], S:[0,1]};
export function sector(dx,dy) {
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? 'E' : 'O';
  return dy >= 0 ? 'S' : 'N';
}
export function habit(action) {
  if (!action) return 'Reuniendo recuerdos';
  const [move,arg,side] = action.split(':');
  const direction = {E:'derecha',O:'izquierda',N:'arriba',S:'abajo'};
  if (move === 'roll') return 'Esquive hacia ' + direction[arg];
  if (move === 'heal') return 'Intento de curación';
  return ['Espada','Caballero','Dagas','Martillo','Rúnica'][arg] + ' desde ' + direction[side];
}
