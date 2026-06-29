export function toLatin(input: string): string {
  if (!input) return 'user';
  try{
    let s = decodeURIComponent(String(input));
    s = s.trim();
    const map: Record<string,string> = {
      'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'
    };
    // replace chars
    s = s.split('').map(ch=>{
      const lower = ch.toLowerCase();
      if(map[lower] !== undefined){
        // preserve basic case by uppercasing first letter if original was uppercase
        const rep = map[lower];
        return (ch === lower) ? rep : (rep.charAt(0).toUpperCase() + rep.slice(1));
      }
      return ch;
    }).join('');
    // remove any non-latin/alphanumeric characters, replace spaces with underscore
    s = s.replace(/\s+/g,'_').replace(/[^A-Za-z0-9_\-]/g,'');
    if(!s) return 'user';
    return s;
  }catch(e){
    return 'user';
  }
}
