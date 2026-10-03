/**
 * A very small, very fake Ruby — just enough to make the resume console feel
 * like irb. It tokenises, parses and evaluates a sliver of the language
 * (literals, arrays, arithmetic with real Integer semantics, method chains,
 * `&:sym` block-pass, indexing, local variables) against an `esteban` object.
 * Nothing here ever reaches `eval`.
 */

/* ------------------------------------------------------------------ data */

export interface IrbJob {
	role: string;
	company: string;
	summary?: string;
	start: string;
	end: string | null;
	months: number;
	span: string;
	url: string;
}

export interface IrbData {
	name: string;
	firstName: string;
	role: string;
	location: string;
	age: number;
	experience: string;
	skills: string[];
	hobbies: string[];
	jobs: IrbJob[];
	education: { title: string; institution: string; period?: string }[];
	contact: Record<string, string>;
}

/* ---------------------------------------------------------------- values */

export class Sym {
	constructor(readonly name: string) {}
}
class RHash {
	constructor(readonly entries: [string, Val][]) {}
}
class RClass {
	constructor(readonly name: string) {}
}
class BlockPass {
	constructor(readonly sym: string) {}
}
class RObject {
	constructor(
		readonly cls: string,
		readonly methods: Record<string, Method>,
		readonly insp: () => string,
	) {}
}

type Val = bigint | number | string | boolean | null | Sym | Val[] | RHash | RClass | RObject;
type Arg = Val | BlockPass;

interface Method {
	arity?: number | [number, number];
	fn: (self: any, args: Arg[], ctx: Ctx) => Val;
}

interface Ctx {
	out: (text: string, tone?: 'out' | 'note') => void;
}

export class RubyError extends Error {
	constructor(
		readonly cls: string,
		message: string,
	) {
		super(message);
	}
}

const noMethod = (name: string, self: Val) =>
	new RubyError(
		'NoMethodError',
		self === null
			? `undefined method '${name}' for nil`
			: self instanceof RClass
				? `undefined method '${name}' for class ${self.name}`
				: `undefined method '${name}' for an instance of ${classOf(self)}`,
	);

export function classOf(v: Val): string {
	if (v === null) return 'NilClass';
	if (v === true) return 'TrueClass';
	if (v === false) return 'FalseClass';
	if (typeof v === 'bigint') return 'Integer';
	if (typeof v === 'number') return 'Float';
	if (typeof v === 'string') return 'String';
	if (Array.isArray(v)) return 'Array';
	if (v instanceof Sym) return 'Symbol';
	if (v instanceof RHash) return 'Hash';
	if (v instanceof RClass) return 'Class';
	return v.cls;
}

function inspectFloat(n: number) {
	if (Number.isNaN(n)) return 'NaN';
	if (!Number.isFinite(n)) return n > 0 ? 'Infinity' : '-Infinity';
	return Number.isInteger(n) && Math.abs(n) < 1e16 ? n.toFixed(1) : String(n);
}

export function inspect(v: Val): string {
	if (v === null) return 'nil';
	if (typeof v === 'boolean' || typeof v === 'bigint') return String(v);
	if (typeof v === 'number') return inspectFloat(v);
	if (typeof v === 'string') return JSON.stringify(v);
	if (Array.isArray(v)) return `[${v.map(inspect).join(', ')}]`;
	if (v instanceof Sym) return `:${v.name}`;
	if (v instanceof RHash) return `{${v.entries.map(([k, x]) => `${k}: ${inspect(x)}`).join(', ')}}`;
	if (v instanceof RClass) return v.name;
	return v.insp();
}

function toS(v: Val): string {
	if (v === null) return '';
	if (typeof v === 'string') return v;
	if (v instanceof Sym) return v.name;
	return inspect(v);
}

const flatDeep = (list: Val[]): Val[] => list.flatMap((v) => (Array.isArray(v) ? flatDeep(v) : [v]));
const truthy = (v: Val) => v !== null && v !== false;
const isNum = (v: Val): v is bigint | number => typeof v === 'bigint' || typeof v === 'number';
const equal = (a: Val, b: Val) =>
	isNum(a) && isNum(b) ? Number(a) === Number(b) : classOf(a) === classOf(b) && inspect(a) === inspect(b);

/* ------------------------------------------------------------- tokenizer */

type Tok =
	| { t: 'int'; v: bigint }
	| { t: 'float'; v: number }
	| { t: 'str'; v: string }
	| { t: 'sym'; v: string }
	| { t: 'ident'; v: string }
	| { t: 'const'; v: string }
	| { t: 'op'; v: string };

const OPS = ['**', '==', '!=', '<=', '>=', '::', '+', '-', '*', '/', '%', '<', '>', '(', ')', '[', ']', ',', '.', '&', '=', '!', ':'];

function syntaxError(): never {
	throw new RubyError('SyntaxError', 'syntax error found (this little irb only speaks a little Ruby — try `help`)');
}

function tokenize(src: string): Tok[] {
	const toks: Tok[] = [];
	let i = 0;
	while (i < src.length) {
		const rest = src.slice(i);
		let m: RegExpMatchArray | null;
		if ((m = rest.match(/^\s+/))) {
			i += m[0].length;
		} else if (rest[0] === '#') {
			break; // comment
		} else if ((m = rest.match(/^\d[\d_]*\.\d+/))) {
			toks.push({ t: 'float', v: Number(m[0].replace(/_/g, '')) });
			i += m[0].length;
		} else if ((m = rest.match(/^\d[\d_]*/))) {
			toks.push({ t: 'int', v: BigInt(m[0].replace(/_/g, '')) });
			i += m[0].length;
		} else if ((m = rest.match(/^"((?:[^"\\]|\\.)*)"/))) {
			toks.push({ t: 'str', v: m[1].replace(/\\n/g, '\n').replace(/\\(.)/g, '$1') });
			i += m[0].length;
		} else if ((m = rest.match(/^'((?:[^'\\]|\\.)*)'/))) {
			toks.push({ t: 'str', v: m[1].replace(/\\(['\\])/g, '$1') });
			i += m[0].length;
		} else if ((m = rest.match(/^:([a-zA-Z_]\w*[?!]?)/))) {
			toks.push({ t: 'sym', v: m[1] });
			i += m[0].length;
		} else if ((m = rest.match(/^[a-z_]\w*(?:[?!](?!=))?/))) {
			toks.push({ t: 'ident', v: m[0] });
			i += m[0].length;
		} else if ((m = rest.match(/^[A-Z]\w*/))) {
			toks.push({ t: 'const', v: m[0] });
			i += m[0].length;
		} else {
			const op = OPS.find((o) => rest.startsWith(o));
			if (!op) syntaxError();
			toks.push({ t: 'op', v: op });
			i += op.length;
		}
	}
	return toks;
}

/* ---------------------------------------------------------------- parser */

type Node =
	| { k: 'lit'; v: Val }
	| { k: 'array'; items: Node[] }
	| { k: 'var'; name: string }
	| { k: 'const'; name: string }
	| { k: 'assign'; name: string; value: Node }
	| { k: 'call'; recv: Node | null; name: string; args: (Node | BlockPass)[]; kwargs?: [string, Node][] }
	| { k: 'index'; recv: Node; index: Node }
	| { k: 'bin'; op: string; l: Node; r: Node }
	| { k: 'not'; v: Node }
	| { k: 'neg'; v: Node };

const KERNEL = new Set(['puts', 'p', 'print', 'pp', 'rand']);

function parse(toks: Tok[]): Node {
	let pos = 0;
	const peek = (o = 0) => toks[pos + o];
	const isOp = (v: string, o = 0) => peek(o)?.t === 'op' && peek(o)!.v === v;
	const expectOp = (v: string) => {
		if (!isOp(v)) syntaxError();
		pos++;
	};

	function statement(): Node {
		if (peek()?.t === 'ident' && isOp('=', 1)) {
			const name = peek()!.v as string;
			pos += 2;
			return { k: 'assign', name, value: expr() };
		}
		return expr();
	}

	function expr(): Node {
		const l = add();
		for (const op of ['==', '!=', '<=', '>=', '<', '>']) {
			if (isOp(op)) {
				pos++;
				return { k: 'bin', op, l, r: add() };
			}
		}
		return l;
	}

	function add(): Node {
		let l = mul();
		while (isOp('+') || isOp('-')) {
			const op = (toks[pos++] as { v: string }).v;
			l = { k: 'bin', op, l, r: mul() };
		}
		return l;
	}

	function mul(): Node {
		let l = unary();
		while (isOp('*') || isOp('/') || isOp('%')) {
			const op = (toks[pos++] as { v: string }).v;
			l = { k: 'bin', op, l, r: unary() };
		}
		return l;
	}

	function unary(): Node {
		if (isOp('-')) {
			pos++;
			return { k: 'neg', v: unary() };
		}
		if (isOp('!')) {
			pos++;
			return { k: 'not', v: unary() };
		}
		const base = postfix();
		if (isOp('**')) {
			pos++;
			return { k: 'bin', op: '**', l: base, r: unary() };
		}
		return base;
	}

	function args(): { args: (Node | BlockPass)[]; kwargs: [string, Node][] } {
		const list: (Node | BlockPass)[] = [];
		const kwargs: [string, Node][] = [];
		expectOp('(');
		while (!isOp(')')) {
			if (isOp('&') && peek(1)?.t === 'sym') {
				list.push(new BlockPass(peek(1)!.v as string));
				pos += 2;
			} else if (peek()?.t === 'ident' && isOp(':', 1)) {
				const key = peek()!.v as string;
				pos += 2;
				kwargs.push([key, expr()]);
			} else {
				list.push(expr());
			}
			if (!isOp(',')) break;
			pos++;
		}
		expectOp(')');
		return { args: list, kwargs };
	}

	function postfix(): Node {
		let node = primary();
		for (;;) {
			if (isOp('.')) {
				pos++;
				const name = peek();
				if (name?.t !== 'ident' && name?.t !== 'const') syntaxError();
				pos++;
				const call: Node = { k: 'call', recv: node, name: name.v as string, args: [] };
				if (isOp('(')) Object.assign(call, args());
				node = call;
			} else if (isOp('[')) {
				pos++;
				const index = expr();
				expectOp(']');
				node = { k: 'index', recv: node, index };
			} else {
				return node;
			}
		}
	}

	function primary(): Node {
		const tok = peek();
		if (!tok) syntaxError();
		pos++;
		switch (tok.t) {
			case 'int':
			case 'float':
			case 'str':
				return { k: 'lit', v: tok.v };
			case 'sym':
				return { k: 'lit', v: new Sym(tok.v) };
			case 'const': {
				let name = tok.v;
				while (isOp('::') && peek(1)?.t === 'const') {
					name += `::${peek(1)!.v}`;
					pos += 2;
				}
				return { k: 'const', name };
			}
			case 'ident': {
				if (tok.v === 'nil') return { k: 'lit', v: null };
				if (tok.v === 'true') return { k: 'lit', v: true };
				if (tok.v === 'false') return { k: 'lit', v: false };
				if (KERNEL.has(tok.v)) {
					if (isOp('(')) return { k: 'call', recv: null, name: tok.v, ...args() };
					// Command-call style: `puts esteban.name`.
					const startsExpr = peek() && !(peek()!.t === 'op' && !['(', '[', '-', '!'].includes(peek()!.v as string));
					const list: Node[] = startsExpr ? [expr()] : [];
					while (startsExpr && isOp(',')) {
						pos++;
						list.push(expr());
					}
					return { k: 'call', recv: null, name: tok.v, args: list };
				}
				return { k: 'var', name: tok.v };
			}
			case 'op':
				if (tok.v === '(') {
					const inner = statement();
					expectOp(')');
					return inner;
				}
				if (tok.v === '[') {
					const items: Node[] = [];
					while (!isOp(']')) {
						items.push(expr());
						if (!isOp(',')) break;
						pos++;
					}
					expectOp(']');
					return { k: 'array', items };
				}
		}
		syntaxError();
	}

	const root = statement();
	if (pos < toks.length) syntaxError();
	return root;
}

/* ------------------------------------------------------------ arithmetic */

const MAX_STRING = 100_000;

function arith(op: string, a: Val, b: Val): Val {
	if (typeof a === 'bigint' && typeof b === 'bigint') {
		switch (op) {
			case '+':
				return a + b;
			case '-':
				return a - b;
			case '*':
				return a * b;
			case '/': {
				if (b === 0n) throw new RubyError('ZeroDivisionError', 'divided by 0');
				const q = a / b;
				return a % b !== 0n && a < 0n !== b < 0n ? q - 1n : q;
			}
			case '%': {
				if (b === 0n) throw new RubyError('ZeroDivisionError', 'divided by 0');
				const r = a % b;
				return r !== 0n && r < 0n !== b < 0n ? r + b : r;
			}
			case '**':
				if (b < 0n) return Number(a) ** Number(b);
				if (b > 4096n) throw new RubyError('ArgumentError', 'exponent too big for this little irb');
				return a ** b;
		}
	}
	if (isNum(a) && isNum(b)) {
		const x = Number(a);
		const y = Number(b);
		switch (op) {
			case '+':
				return x + y;
			case '-':
				return x - y;
			case '*':
				return x * y;
			case '/':
				return x / y;
			case '%':
				return ((x % y) + y) % y;
			case '**':
				return x ** y;
		}
	}
	if (typeof a === 'string') {
		if (op === '+' && typeof b === 'string') return a + b;
		if (op === '*' && typeof b === 'bigint') {
			if (b < 0n) throw new RubyError('ArgumentError', 'negative argument');
			if (BigInt(a.length) * b > MAX_STRING) throw new RubyError('ArgumentError', 'argument too big');
			return a.repeat(Number(b));
		}
		if (op === '+') throw new RubyError('TypeError', `no implicit conversion of ${classOf(b)} into String`);
	}
	if (Array.isArray(a)) {
		if (op === '+' && Array.isArray(b)) return [...a, ...b];
		if (op === '-' && Array.isArray(b)) return a.filter((x) => !b.some((y) => equal(x, y)));
		if (op === '*' && typeof b === 'bigint' && b >= 0n && b < 1000n) {
			return Array.from({ length: Number(b) }, () => a).flat();
		}
	}
	if (isNum(a)) throw new RubyError('TypeError', `${classOf(b)} can't be coerced into ${classOf(a)}`);
	throw noMethod(op, a);
}

function compare(op: string, a: Val, b: Val): Val {
	if (op === '==') return equal(a, b);
	if (op === '!=') return !equal(a, b);
	const ok = (isNum(a) && isNum(b)) || (typeof a === 'string' && typeof b === 'string');
	if (!ok) {
		throw new RubyError('ArgumentError', `comparison of ${classOf(a)} with ${inspect(b)} failed`);
	}
	const [x, y] = isNum(a) ? [Number(a), Number(b)] : [a, b];
	return op === '<' ? x < y : op === '>' ? x > y : op === '<=' ? x <= y : x >= y;
}

/* --------------------------------------------------------------- methods */

const sym = (name: string) => new Sym(name);
const int = (n: number) => BigInt(Math.trunc(n));

function checkArity(m: Method, given: number) {
	const [min, max] = Array.isArray(m.arity) ? m.arity : [m.arity ?? 0, m.arity ?? 0];
	if (given < min || given > max) {
		const expected = min === max ? `${min}` : `${min}..${max}`;
		throw new RubyError('ArgumentError', `wrong number of arguments (given ${given}, expected ${expected})`);
	}
}

const blockOf = (args: Arg[], name: string, ctx: Ctx) => {
	const b = args[0];
	if (!(b instanceof BlockPass)) {
		throw new RubyError('ArgumentError', `${name} needs a block — try ${name}(&:something)`);
	}
	return (v: Val) => send(v, b.sym, [], ctx);
};

const COMMON: Record<string, Method> = {
	class: { fn: (s) => new RClass(classOf(s)) },
	inspect: { fn: (s) => inspect(s) },
	to_s: { fn: (s) => toS(s) },
	'nil?': { fn: (s) => s === null },
	methods: { fn: (s) => methodsOf(s).map(sym) },
	'respond_to?': {
		arity: 1,
		fn: (s, [name]) => methodsOf(s).includes(toS(name as Val)),
	},
	'is_a?': { arity: 1, fn: (s, [c]) => c instanceof RClass && c.name === classOf(s) },
	'frozen?': { fn: (s) => typeof s !== 'object' || s === null || s instanceof Sym },
	object_id: { fn: (s) => int(inspect(s).split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % 100000) * 8n },
	then: { fn: (s) => s },
	tap: { fn: (s) => s },
};

const NUMERIC: Record<string, Method> = {
	'even?': { fn: (s) => typeof s === 'bigint' && s % 2n === 0n },
	'odd?': { fn: (s) => typeof s === 'bigint' && s % 2n !== 0n },
	'zero?': { fn: (s) => Number(s) === 0 },
	'positive?': { fn: (s) => Number(s) > 0 },
	'negative?': { fn: (s) => Number(s) < 0 },
	succ: { fn: (s) => (typeof s === 'bigint' ? s + 1n : s + 1) },
	pred: { fn: (s) => (typeof s === 'bigint' ? s - 1n : s - 1) },
	abs: { fn: (s) => (s < 0 ? -s : s) },
	to_i: { fn: (s) => (typeof s === 'bigint' ? s : int(s)) },
	to_f: { fn: (s) => Number(s) },
	round: { fn: (s) => (typeof s === 'bigint' ? s : int(Math.round(s))) },
	floor: { fn: (s) => (typeof s === 'bigint' ? s : int(Math.floor(s))) },
	ceil: { fn: (s) => (typeof s === 'bigint' ? s : int(Math.ceil(s))) },
	digits: {
		fn: (s) => {
			if (typeof s !== 'bigint') throw noMethod('digits', s);
			return String(s < 0n ? -s : s).split('').reverse().map((d) => BigInt(d));
		},
	},
	times: { fn: (s) => (typeof s === 'bigint' && s <= 1000n ? Array.from({ length: Number(s) }, (_, i) => BigInt(i)) : s) },
};

const STRING: Record<string, Method> = {
	upcase: { fn: (s: string) => s.toUpperCase() },
	downcase: { fn: (s: string) => s.toLowerCase() },
	capitalize: { fn: (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() },
	swapcase: {
		fn: (s: string) => [...s].map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join(''),
	},
	reverse: { fn: (s: string) => [...s].reverse().join('') },
	length: { fn: (s: string) => int([...s].length) },
	size: { fn: (s: string) => int([...s].length) },
	strip: { fn: (s: string) => s.trim() },
	chars: { fn: (s: string) => [...s] },
	split: { arity: [0, 1], fn: (s: string, [sep]) => (sep == null ? s.trim().split(/\s+/) : s.split(toS(sep as Val))) },
	to_sym: { fn: (s: string) => sym(s) },
	to_i: { fn: (s: string) => int(parseInt(s, 10) || 0) },
	'empty?': { fn: (s: string) => s.length === 0 },
	'include?': { arity: 1, fn: (s: string, [x]) => s.includes(toS(x as Val)) },
	'start_with?': { arity: 1, fn: (s: string, [x]) => s.startsWith(toS(x as Val)) },
	'end_with?': { arity: 1, fn: (s: string, [x]) => s.endsWith(toS(x as Val)) },
	center: { arity: 1, fn: (s: string, [w]) => s.padStart((Number(w) + s.length) / 2).padEnd(Number(w)) },
};

const ARRAY: Record<string, Method> = {
	first: { arity: [0, 1], fn: (s: Val[], [n]) => (n == null ? (s[0] ?? null) : s.slice(0, Number(n))) },
	last: { arity: [0, 1], fn: (s: Val[], [n]) => (n == null ? (s.at(-1) ?? null) : s.slice(-Number(n))) },
	length: { fn: (s: Val[]) => int(s.length) },
	size: { fn: (s: Val[]) => int(s.length) },
	count: {
		arity: [0, 1],
		fn: (s: Val[], args, ctx) => int(args.length ? s.filter((v) => truthy(blockOf(args, 'count', ctx)(v))).length : s.length),
	},
	'empty?': { fn: (s: Val[]) => s.length === 0 },
	'any?': { fn: (s: Val[]) => s.some(truthy) },
	'include?': { arity: 1, fn: (s: Val[], [x]) => s.some((v) => equal(v, x as Val)) },
	reverse: { fn: (s: Val[]) => [...s].reverse() },
	sort: { fn: (s: Val[]) => [...s].sort((a, b) => (truthy(compare('<', a, b)) ? -1 : truthy(compare('>', a, b)) ? 1 : 0)) },
	shuffle: { fn: (s: Val[]) => [...s].sort(() => Math.random() - 0.5) },
	sample: { fn: (s: Val[]) => s[Math.floor(Math.random() * s.length)] ?? null },
	uniq: { fn: (s: Val[]) => s.filter((v, i) => s.findIndex((x) => equal(x, v)) === i) },
	compact: { fn: (s: Val[]) => s.filter((v) => v !== null) },
	flatten: { fn: (s: Val[]) => flatDeep(s) },
	sum: { fn: (s: Val[]) => s.reduce<Val>((a, b) => arith('+', a, b), 0n) },
	max: { fn: (s: Val[]) => s.reduce<Val>((a, b) => (a === null || truthy(compare('>', b, a)) ? b : a), null) },
	min: { fn: (s: Val[]) => s.reduce<Val>((a, b) => (a === null || truthy(compare('<', b, a)) ? b : a), null) },
	join: { arity: [0, 1], fn: (s: Val[], [sep]) => s.map(toS).join(sep == null ? '' : toS(sep as Val)) },
	to_a: { fn: (s: Val[]) => s },
	map: { arity: 1, fn: (s: Val[], args, ctx) => s.map(blockOf(args, 'map', ctx)) },
	each: { arity: 1, fn: (s: Val[], args, ctx) => (s.forEach(blockOf(args, 'each', ctx)), s) },
	select: { arity: 1, fn: (s: Val[], args, ctx) => s.filter((v) => truthy(blockOf(args, 'select', ctx)(v))) },
	reject: { arity: 1, fn: (s: Val[], args, ctx) => s.filter((v) => !truthy(blockOf(args, 'reject', ctx)(v))) },
	sort_by: {
		arity: 1,
		fn: (s: Val[], args, ctx) => {
			const key = blockOf(args, 'sort_by', ctx);
			return [...s].sort((a, b) => (truthy(compare('<', key(a), key(b))) ? -1 : truthy(compare('>', key(a), key(b))) ? 1 : 0));
		},
	},
	max_by: {
		arity: 1,
		fn: (s: Val[], args, ctx) => {
			const key = blockOf(args, 'max_by', ctx);
			return s.reduce<Val>((a, b) => (a === null || truthy(compare('>', key(b), key(a))) ? b : a), null);
		},
	},
	min_by: {
		arity: 1,
		fn: (s: Val[], args, ctx) => {
			const key = blockOf(args, 'min_by', ctx);
			return s.reduce<Val>((a, b) => (a === null || truthy(compare('<', key(b), key(a))) ? b : a), null);
		},
	},
};

const HASH: Record<string, Method> = {
	keys: { fn: (s: RHash) => s.entries.map(([k]) => sym(k)) },
	values: { fn: (s: RHash) => s.entries.map(([, v]) => v) },
	size: { fn: (s: RHash) => int(s.entries.length) },
	length: { fn: (s: RHash) => int(s.entries.length) },
	to_a: { fn: (s: RHash) => s.entries.map(([k, v]) => [sym(k), v]) },
	'key?': { arity: 1, fn: (s: RHash, [k]) => s.entries.some(([x]) => x === toS(k as Val)) },
	fetch: {
		arity: 1,
		fn: (s: RHash, [k]) => {
			const hit = s.entries.find(([x]) => x === toS(k as Val));
			if (!hit) throw new RubyError('KeyError', `key not found: ${inspect(k as Val)}`);
			return hit[1];
		},
	},
};

const SYMBOL: Record<string, Method> = {
	to_sym: { fn: (s: Sym) => s },
	to_proc: { fn: (s: Sym) => s },
	length: { fn: (s: Sym) => int(s.name.length) },
	upcase: { fn: (s: Sym) => sym(s.name.toUpperCase()) },
};

function tableFor(v: Val): Record<string, Method> {
	if (isNum(v)) return NUMERIC;
	if (typeof v === 'string') return STRING;
	if (Array.isArray(v)) return ARRAY;
	if (v instanceof RHash) return HASH;
	if (v instanceof Sym) return SYMBOL;
	if (v instanceof RObject) return v.methods;
	if (v instanceof RClass) return CLASS_METHODS[v.name] ?? {};
	return {};
}

function methodsOf(v: Val): string[] {
	return [...Object.keys(tableFor(v)), ...Object.keys(COMMON)];
}

let CLASS_METHODS: Record<string, Record<string, Method>> = {};

function send(self: Val, name: string, args: Arg[], ctx: Ctx): Val {
	const m = tableFor(self)[name] ?? COMMON[name];
	if (!m) throw noMethod(name, self);
	checkArity(m, args.length);
	return m.fn(self, args, ctx);
}

/* ------------------------------------------------------------- the world */

function buildWorld(data: IrbData) {
	const jobs = data.jobs.map(
		(job) =>
			new RObject(
				'Job',
				{
					role: { fn: () => job.role },
					company: { fn: () => job.company },
					summary: { fn: () => job.summary ?? null },
					started_on: { fn: () => job.start },
					ended_on: { fn: () => job.end },
					'current?': { fn: () => job.end === null },
					months: { fn: () => int(job.months) },
					duration: { fn: () => job.span },
					url: { fn: () => job.url },
				},
				() => `#<Job company: ${inspect(job.company)}, role: ${inspect(job.role)}, duration: ${inspect(job.span)}>`,
			),
	);

	const education = data.education.map(
		(entry) =>
			new RObject(
				'Education',
				{
					title: { fn: () => entry.title },
					institution: { fn: () => entry.institution },
					period: { fn: () => entry.period ?? null },
				},
				() => `#<Education title: ${inspect(entry.title)}, institution: ${inspect(entry.institution)}>`,
			),
	);

	const contact = new RHash(Object.entries(data.contact));
	const currentIndex = data.jobs.findIndex((job) => job.end === null);
	const current = jobs[currentIndex] ?? null;

	const esteban: RObject = new RObject(
		'Engineer',
		{
			name: { fn: () => data.name },
			first_name: { fn: () => data.firstName },
			role: { fn: () => data.role },
			title: { fn: () => data.role },
			age: { fn: () => int(data.age) },
			location: { fn: () => data.location },
			country: { fn: () => sym('CO') },
			favorite_language: { fn: () => 'Ruby' },
			stack: { fn: () => [...data.skills] },
			skills: { fn: () => [...data.skills] },
			jobs: { fn: () => [...jobs] },
			current_job: { fn: () => current },
			company: { fn: () => data.jobs[currentIndex]?.company ?? null },
			experience: { fn: () => data.experience },
			education: { fn: () => [...education] },
			hobbies: { fn: () => [...data.hobbies] },
			'beer?': {
				fn: (_s, _a, ctx) => {
					ctx.out('# once in a while :)', 'note');
					return true;
				},
			},
			contact: { fn: () => contact },
			github: { fn: () => data.contact.github ?? null },
			linkedin: { fn: () => data.contact.linkedin ?? null },
			'hire!': {
				fn: (_s, _a, ctx) => {
					ctx.out(`Excellent choice. Say hi on LinkedIn → ${data.contact.linkedin}`);
					return sym('excellent_choice');
				},
			},
		},
		() =>
			`#<Engineer name: ${inspect(data.name)}, role: ${inspect(data.role)}, location: ${inspect(data.location)}, favorite_language: "Ruby">`,
	);

	CLASS_METHODS = {
		Engineer: {
			find_by: { arity: [0, 1], fn: () => esteban },
			first: { fn: () => esteban },
			last: { fn: () => esteban },
			all: { fn: () => [esteban] },
			count: { fn: () => 1n },
			new: {
				arity: [0, 1],
				fn: () => {
					throw new RubyError('NoMethodError', "private method 'new' called for class Engineer (there's only one — try Engineer.first)");
				},
			},
		},
		Job: {
			all: { fn: () => [...jobs] },
			count: { fn: () => int(jobs.length) },
			first: { fn: () => jobs[0] ?? null },
			last: { fn: () => jobs.at(-1) ?? null },
		},
	};

	const CONSTANTS: Record<string, Val> = {
		RUBY_VERSION: '3.4.0-but-secretly-typescript',
		RUBY_PLATFORM: 'wasm-in-your-browser (not really)',
	};
	const CLASSES = new Set(['Engineer', 'Job', 'Education', 'Integer', 'Float', 'String', 'Symbol', 'Array', 'Hash', 'NilClass', 'TrueClass', 'FalseClass', 'Class', 'Object', 'BasicObject', 'Kernel', 'Comparable']);

	return { esteban, constants: CONSTANTS, classes: CLASSES };
}

/* ------------------------------------------------------------ interpreter */

export interface Output {
	tone: 'out' | 'note' | 'ret' | 'err';
	text: string;
}

export const HELP = [
	'# A tiny irb that knows about me. Some things to try:',
	'esteban.stack                     esteban.jobs',
	'esteban.current_job.duration      esteban.jobs.map(&:company).uniq',
	'esteban.hobbies.sample            esteban.beer?',
	'esteban.contact[:github]          esteban.hire!',
	'esteban.methods                   2 ** 100',
	'"hola".upcase * 3                 x = esteban.age',
	'# also: clear, exit. Tab completes, ↑/↓ walk your history.',
];

export function createIrb(data: IrbData) {
	const { esteban, constants, classes } = buildWorld(data);
	const env = new Map<string, Val>([['esteban', esteban]]);

	function evaluate(node: Node, ctx: Ctx): Val {
		switch (node.k) {
			case 'lit':
				return node.v;
			case 'array':
				return node.items.map((n) => evaluate(n, ctx));
			case 'var':
				if (node.name === 'self') return new RObject('Object', {}, () => 'main');
				if (env.has(node.name)) return env.get(node.name)!;
				throw new RubyError('NameError', `undefined local variable or method '${node.name}' for main`);
			case 'const':
				if (node.name in constants) return constants[node.name];
				if (classes.has(node.name)) return new RClass(node.name);
				throw new RubyError('NameError', `uninitialized constant ${node.name}`);
			case 'assign': {
				const v = evaluate(node.value, ctx);
				env.set(node.name, v);
				return v;
			}
			case 'neg': {
				const v = evaluate(node.v, ctx);
				if (!isNum(v)) throw noMethod('-@', v);
				return typeof v === 'bigint' ? -v : -v;
			}
			case 'not':
				return !truthy(evaluate(node.v, ctx));
			case 'bin': {
				const l = evaluate(node.l, ctx);
				const r = evaluate(node.r, ctx);
				return ['==', '!=', '<', '>', '<=', '>='].includes(node.op) ? compare(node.op, l, r) : arith(node.op, l, r);
			}
			case 'index': {
				const recv = evaluate(node.recv, ctx);
				const idx = evaluate(node.index, ctx);
				if (recv instanceof RHash) return recv.entries.find(([k]) => k === toS(idx))?.[1] ?? null;
				if ((Array.isArray(recv) || typeof recv === 'string') && typeof idx === 'bigint') {
					const list = typeof recv === 'string' ? [...recv] : recv;
					return list.at(Number(idx)) ?? null;
				}
				throw noMethod('[]', recv);
			}
			case 'call': {
				const args: Arg[] = node.args.map((a) => (a instanceof BlockPass ? a : evaluate(a, ctx)));
				if (node.kwargs?.length) {
					args.push(new RHash(node.kwargs.map(([k, v]) => [k, evaluate(v, ctx)])));
				}
				if (node.recv === null) return kernel(node.name, args as Val[], ctx);
				return send(evaluate(node.recv, ctx), node.name, args, ctx);
			}
		}
	}

	function kernel(name: string, args: Val[], ctx: Ctx): Val {
		switch (name) {
			case 'puts':
			case 'print':
				if (!args.length) ctx.out('');
				for (const a of args) (Array.isArray(a) ? flatDeep(a) : [a]).forEach((x) => ctx.out(toS(x)));
				return null;
			case 'p':
			case 'pp':
				args.forEach((a) => ctx.out(inspect(a)));
				return args.length <= 1 ? (args[0] ?? null) : args;
			case 'rand':
				return args.length && typeof args[0] === 'bigint' ? int(Math.random() * Number(args[0])) : Math.random();
		}
		throw new RubyError('NoMethodError', `undefined method '${name}' for main`);
	}

	/** Runs one line. Returns what to print, or `'clear'` when the screen should be wiped. */
	function run(source: string, line: number): Output[] | 'clear' {
		const input = source.trim();
		const output: Output[] = [];
		const ctx: Ctx = { out: (text, tone = 'out') => output.push({ tone, text }) };

		if (!input) return output;
		if (input === 'clear' || input === 'cls') return 'clear';
		if (input === 'help' || input === 'ls') {
			return HELP.map((text) => ({ tone: text.startsWith('#') ? 'note' : 'out', text }));
		}
		if (input === 'exit' || input === 'quit') {
			return [{ tone: 'note', text: "# There's no leaving — but you can scroll down for the rest of the resume." }];
		}

		try {
			const tokens = tokenize(input);
			if (!tokens.length) return output; // just a comment
			const value = evaluate(parse(tokens), ctx);
			env.set('_', value);
			output.push({ tone: 'ret', text: `=> ${inspect(value)}` });
		} catch (error) {
			const { cls, message } =
				error instanceof RubyError
					? error
					: error instanceof RangeError && /call stack/i.test(error.message)
						? { cls: 'SystemStackError', message: 'stack level too deep' }
						: { cls: 'RuntimeError', message: 'something broke in this toy irb — my bad' };
			output.push({ tone: 'err', text: `(irb):${line}:in '<main>': ${message} (${cls})` });
		}
		return output;
	}

	/** Completion candidates for the identifier being typed at the end of `source`. */
	function complete(source: string): { prefix: string; candidates: string[] } {
		const dotted = source.match(/^(.*)\.([a-z_]\w*[?!]?)?$/);
		// Completing evaluates the receiver, so never run an assignment to get there.
		if (dotted && /(^|[^=!<>])=(?!=)/.test(dotted[1])) return { prefix: '', candidates: [] };
		if (dotted) {
			try {
				const recv = evaluate(parse(tokenize(dotted[1])), { out() {} });
				const partial = dotted[2] ?? '';
				// Generic Object methods only join in once a name is being typed; otherwise they drown the good stuff.
				const pool = partial ? methodsOf(recv) : Object.keys(tableFor(recv));
				return {
					prefix: partial,
					candidates: [...new Set(pool)].filter((m) => m.startsWith(partial)).sort(),
				};
			} catch {
				return { prefix: '', candidates: [] };
			}
		}
		const word = source.match(/([a-z_]\w*)$/);
		if (!word) return { prefix: '', candidates: [] };
		const names = [...env.keys(), 'help', 'clear', 'puts', 'exit'].filter((n) => n !== '_');
		return { prefix: word[1], candidates: names.filter((n) => n.startsWith(word[1])).sort() };
	}

	return { run, complete };
}
