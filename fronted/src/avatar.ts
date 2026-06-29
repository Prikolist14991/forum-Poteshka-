import { toLatin } from './utils'

export function getAvatarFor(name: string): string | null {
  try{
    const candidates = [name, toLatin(name)];
    for(const n of candidates){
      const k = 'avatar_' + n;
      const v = localStorage.getItem(k);
      if(v) return v;
    }
    return null;
  }catch(e){return null}
}
