export function load(key, defaults){try{return Object.assign({},defaults,JSON.parse(localStorage.getItem(key)||'{}'))}catch{return {...defaults}}}
export function save(key, state){localStorage.setItem(key, JSON.stringify(state))}
export function reset(key){localStorage.removeItem(key)}
