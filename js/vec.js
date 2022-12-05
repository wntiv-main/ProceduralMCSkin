function __vector_constructor__(args) {
	var len = args.length;
	var result = [];
	if (typeof args[0] == "number" && (args.slice(1)).every(a => typeof a == "undefined")) return new Array(len).fill(args[0]);

	function flatten(arg) {
		var retval = [];
		if (arg instanceof vec4) {
			retval.push(arg.x, arg.y, arg.z, arg.w);
		} else if (arg instanceof vec3) {
			retval.push(arg.x, arg.y, arg.z);
		} else if (arg instanceof vec2) {
			retval.push(arg.x, arg.y);
		} else if (arg instanceof Array) {
			for (var i = 0; i < arg.length; i++)
				[].push.apply(retval, flatten(arg[i]));
		} else if (typeof (arg) == "number") {
			retval.push(arg);
		}
		return retval;
	}
	for (var i = 0; i < len; i++) {
		[].push.apply(result, flatten(args[i]));
	}
	while (result.length > len) result.pop();
	while (result.length < len) result.push(1 * (result.length == 3));
	return result;
}

function __vector_length__(args) {
	var sum = 0;
	for (var i of args) {
		sum += i * i;
	}
	return Math.sqrt(sum);
}

function __swizzle__(obj, len) {
	var lettersets = ["xyzw", "rgba", "stpq", "0123"];
	var types = [null, Number, _vec2, _vec3, _vec4];
	for (var ls of lettersets) {
		var arr = ls.split('');
		//len = 1
		if (ls != "xyzw")
			for (var i = 0; i < len; i++) {
				obj.__defineGetter__(ls[i], (function (l1) {
					return function () {
						return this[l1];
					};
				})(lettersets[0][i]));
				obj.__defineSetter__(ls[i], (function (l1) {
					return function (val) {
						this[l1] = val;
					};
				})(lettersets[0][i]));
			}
		//len = 2
		for (var i = 0; i < len; i++) {
			for (var j = 0; j < len; j++) {
				obj.__defineGetter__(ls[i] + ls[j], (function (l1, l2) {
					return function () {
						return new types[2](this[l1], this[l2]);
					};
				})(lettersets[0][i], lettersets[0][j]));
				var letters = {};
				if (!arr.some((v) => {
						var r = v in letters;
						letters[v] = true;
						return r;
					}))
					obj.__defineSetter__(ls[i] + ls[j], (function (l1, l2) {
						return function (val) {
							var v = new types[2](val);
							this[l1] = v.x;
							this[l2] = v.y;
						};
					})(lettersets[0][i], lettersets[0][j]));
			}
		}
		//len = 3
		for (var i = 0; i < len; i++) {
			for (var j = 0; j < len; j++) {
				for (var k = 0; k < len; k++) {
					obj.__defineGetter__(ls[i] + ls[j] + ls[k], (function (l1, l2, l3) {
						return function () {
							return new types[3](this[l1], this[l2], this[l3]);
						};
					})(lettersets[0][i], lettersets[0][j], lettersets[0][k]));
					var letters = {};
					if (!arr.some((v) => {
							var r = v in letters;
							letters[v] = true;
							return r;
						}))
						obj.__defineSetter__(ls[i] + ls[j] + ls[k], (function (l1, l2, l3) {
							return function (val) {
								var v = new types[3](val);
								this[l1] = v.x;
								this[l2] = v.y;
								this[l3] = v.z;
							};
						})(lettersets[0][i], lettersets[0][j], lettersets[0][k]));
				}
			}
		}
		//len = 4
		for (var i = 0; i < len; i++) {
			for (var j = 0; j < len; j++) {
				for (var k = 0; k < len; k++) {
					for (var l = 0; l < len; l++) {
						obj.__defineGetter__(ls[i] + ls[j] + ls[k] + ls[l], (function (l1, l2, l3, l4) {
							return function () {
								return new types[4](this[l1], this[l2], this[l3], this[l4]);
							};
						})(lettersets[0][i], lettersets[0][j], lettersets[0][k], lettersets[0][l]));
						var letters = {};
						if (!arr.some((v) => {
								var r = v in letters;
								letters[v] = true;
								return r;
							}))
							obj.__defineSetter__(ls[i] + ls[j] + ls[k] + ls[l], (function (l1, l2, l3, l4) {
								return function (val) {
									var v = new types[4](val);
									this[l1] = v.x;
									this[l2] = v.y;
									this[l3] = v.z;
									this[l4] = v.w;
								};
							})(lettersets[0][i], lettersets[0][j], lettersets[0][k], lettersets[0][l]));
					}
				}
			}
		}
	}
}

class _vec2 {
	constructor(x, y) {
		var construct = __vector_constructor__([x, y]);
		for (var i = 0; i < construct.length; i++) {
			this[i] = construct[i];
		}
	}

	static add(a, b) {
		return new this(a.x + b.x, a.y + b.y);
	}

	static multiply(a, b) {
		return new this(a.x * b.x, a.y * b.y);
	}

	static subtract(a, b) {
		return new this(a.x - b.x, a.y - b.y);
	}

	static divide(a, b) {
		return new this(a.x / b.x, a.y / b.y);
	}

	static scale(a, scalar) {
		return new this(a.x * scalar, a.y * scalar);
	}

	static length(a) {
		return __vector_length__([a.x, a.y]);
	}

	add(b) {
		this.x += b.x;
		this.y += b.y;
		return this;
	}

	multiply(b) {
		this.x *= b.x;
		this.y *= b.y;
		return this;
	}

	subtract(b) {
		this.x -= b.x;
		this.y -= b.y;
		return this;
	}

	divide(b) {
		this.x /= b.x;
		this.y /= b.y;
		return this;
	}

	scale(scalar) {
		this.x *= scalar;
		this.y *= scalar;
		return this;
	}

	length() {
		return _vec2.length(this);
	}

	inverse() {
		return vec2(1 / this.x, 1 / this.y);
	}
}

class _vec3 {
	constructor(x, y, z) {
		var construct = __vector_constructor__([x, y, z]);
		for (var i = 0; i < construct.length; i++) {
			this[i] = construct[i];
		}
	}

	static add(a, b) {
		return new this(a.x + b.x, a.y + b.y, a.z + b.z);
	}

	static multiply(a, b) {
		return new this(a.x * b.x, a.y * b.y, a.z * b.z);
	}

	static subtract(a, b) {
		return new this(a.x - b.x, a.y - b.y, a.z - b.z);
	}

	static divide(a, b) {
		return new this(a.x / b.x, a.y / b.y, a.z / b.z);
	}

	static scale(a, scalar) {
		return new this(a.x * scalar, a.y * scalar, a.z * scalar);
	}

	static length(a) {
		return __vector_length__([a.x, a.y, a.z]);
	}

	add(b) {
		this.x += b.x;
		this.y += b.y;
		this.z += b.z;
		return this;
	}

	multiply(b) {
		this.x *= b.x;
		this.y *= b.y;
		this.z *= b.z;
		return this;
	}

	subtract(b) {
		this.x -= b.x;
		this.y -= b.y;
		this.z -= b.z;
		return this;
	}

	divide(b) {
		this.x /= b.x;
		this.y /= b.y;
		this.z /= b.z;
		return this;
	}

	scale(scalar) {
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		return this;
	}

	length() {
		return _vec3.length(this);
	}

	inverse() {
		return vec3(1 / this.x, 1 / this.y, 1 / this.z);
	}
}

class _vec4 {
	constructor(x, y, z, w) {
		if (this == globalThis || this == self || this == window) return new this(x, y, z, w);
		var construct = __vector_constructor__([x, y, z, w]);
		for (var i = 0; i < construct.length; i++) {
			this[i] = construct[i];
		}
	}

	static add(a, b) {
		return new this(a.x + b.x, a.y + b.y, a.z + b.z, a.w + b.w);
	}

	static multiply(a, b) {
		return new this(a.x * b.x, a.y * b.y, a.z * b.z, a.w * b.w);
	}

	static subtract(a, b) {
		return new this(a.x - b.x, a.y - b.y, a.z - b.z, a.w - b.w);
	}

	static divide(a, b) {
		return new this(a.x / b.x, a.y / b.y, a.z / b.z, a.w / b.w);
	}

	static scale(a, scalar) {
		return new this(a.x * scalar, a.y * scalar, a.z * scalar);
	}

	static length(a) {
		return __vector_length__([a.x, a.y, a.z, a.w]);
	}

	add(b) {
		this.x += b.x;
		this.y += b.y;
		this.z += b.z;
		this.w += b.w;
		return this;
	}

	multiply(b) {
		this.x *= b.x;
		this.y *= b.y;
		this.z *= b.z;
		this.w *= b.w;
		return this;
	}

	subtract(b) {
		this.x -= b.x;
		this.y -= b.y;
		this.z -= b.z;
		this.w -= b.w;
		return this;
	}

	divide(b) {
		this.x /= b.x;
		this.y /= b.y;
		this.z /= b.z;
		this.w /= b.w;
		return this;
	}

	scale(scalar) {
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		this.w *= scalar;
		return this;
	}

	length() {
		return _vec4.length(this);
	}

	inverse() {
		return vec4(1 / this.x, 1 / this.y, 1 / this.z, 1 / this.w);
	}
}

__swizzle__(_vec2.prototype, 2);
__swizzle__(_vec3.prototype, 3);
__swizzle__(_vec4.prototype, 4);

const vec2 = new Proxy(_vec2, {
	length: _vec2.length,
	add: _vec2.add,
	subtract: _vec2.subtract,
	multiply: _vec2.multiply,
	divide: _vec2.divide,
	scale: _vec2.scale,
	apply(target, thisArg, argumentsList) {
		return new target(...argumentsList);
	}
});
const vec3 = new Proxy(_vec3, {
	length: _vec3.length,
	add: _vec3.add,
	subtract: _vec3.subtract,
	multiply: _vec3.multiply,
	divide: _vec3.divide,
	scale: _vec3.scale,
	apply(target, thisArg, argumentsList) {
		return new target(...argumentsList);
	}
});
const vec4 = new Proxy(_vec4, {
	length: _vec4.length,
	add: _vec4.add,
	subtract: _vec4.subtract,
	multiply: _vec4.multiply,
	divide: _vec4.divide,
	scale: _vec4.scale,
	apply(target, thisArg, argumentsList) {
		return new target(...argumentsList);
	}
});