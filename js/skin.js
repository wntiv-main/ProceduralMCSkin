// PLAYER DIMENSIONS (PX) - { X: 16, Y: 32, Z: 8 } // USE `skin.playersize`

// Create an instance with new Skin(<canvas rendering context>, <slimSkin?>)
// Use `skin.executeShader(<your shader program function>)`
// `Skin.entity` is a "enum" with different 'limbs'
// Other functions are useful for finding a position on the atlas

// IN
// limb - The ID (skin.entity.NAME) of the limb this pixel is on (e.g. skin.entity.HEAD)
// faceID - ID of the face the pixel is on. Format is (sign)(axis) eg "+z", "-y" (+x -x +y -y +z -z)
// normalVector - faceID but as a normal vector
// isOverlay - Whether the pixel is on the overlay layer or the initial layer
// relativePos - Coordinate relative to the current face in atlas space
// faceBoundingBox - Size of the current face
// atlasPos - Position on the atlas
// worldPos - Position on skin in world coords
// readFromAtlas - Function to read from the atlas

// OUT
// color: The color to set this pixel to.
//        Initially set to the current color of this pixel from the previous program, or vec4(0);
// overlayColor: The color to set this pixel on the overlay layer to.
//               Initially set to the current color of this pixel on the overlay layer from the previous program, or vec4(0);
//               Only available on the initial layer (!isOverlay)
// writeToAtlas: A function allowing this pixel to write to another pixel's color. Untested, may be buggy.

function faceSizesGen(slim) {
	return [
		[ // HEAD
			[
				null,
				vec2(8, 8),
				vec2(8, 8),
				null
			],
			[
				vec2(8, 8),
				vec2(8, 8),
				vec2(8, 8),
				vec2(8, 8)
			]
		],
		[ // BODY
			[
				null,
				vec2(8, 4),
				vec2(8, 4),
				null
			],
			[
				vec2(4, 12),
				vec2(8, 12),
				vec2(4, 12),
				vec2(8, 12)
			]
		],
		[ // ARM_L
			[
				null,
				vec2(slim ? 3 : 4, 4),
				vec2(slim ? 3 : 4, 4),
				null
			],
			[
				vec2(4, 12),
				vec2(slim ? 3 : 4, 12),
				vec2(4, 12),
				vec2(slim ? 3 : 4, 12)
			]
		],
		[ // ARM_R
			[
				null,
				vec2(slim ? 3 : 4, 4),
				vec2(slim ? 3 : 4, 4),
				null
			],
			[
				vec2(4, 12),
				vec2(slim ? 3 : 4, 12),
				vec2(4, 12),
				vec2(slim ? 3 : 4, 12)
			]
		],
		[ // LEG_L
			[
				null,
				vec2(4, 4),
				vec2(4, 4),
				null
			],
			[
				vec2(4, 12),
				vec2(4, 12),
				vec2(4, 12),
				vec2(4, 12)
			]
		],
		[ // LEG_R
			[
				null,
				vec2(4, 4),
				vec2(4, 4),
				null
			],
			[
				vec2(4, 12),
				vec2(4, 12),
				vec2(4, 12),
				vec2(4, 12)
			]
		]
	];
};

export class Skin {
	canvas = null;
	playerSize = vec3(16, 32, 8);
	slim = false;
	faceSizes = [];
	onProgress = (percent) => {};
	onComplete = () => {};
	constructor(canvas, slim = false) {
		this.canvas = canvas;
		this.slim = slim;
		this.playerSize = vec3(slim ? 14 : 16, 32, 8);
		this.faceSizes = faceSizesGen(slim);
	}
	static entity = {
		HEAD: 0,
		BODY: 1,
		ARM_L: 2,
		ARM_R: 3,
		LEG_L: 4,
		LEG_R: 5
	};
	static overlayOffset(entity) {
		return ([
			vec2(32, 0), // HEAD
			vec2(0, 16), // BODY
			vec2(0, 16), // ARM_L
			vec2(16, 0), // ARM_R
			vec2(0, 16), // LEG_L
			vec2(-16, 0) // LEG_R
		])[entity];
	};
	static entityCoord(entity) {
		return ([
			vec2(0, 0), // HEAD
			vec2(16, 16), // BODY
			vec2(40, 16), // ARM_L
			vec2(32, 48), // ARM_R
			vec2(0, 16), // LEG_L
			vec2(16, 48) // LEG_R
		])[entity];
	};
	static face(f) {
		var retval = vec2();
		retval.y = f.includes('y') ? 0 : 1;
		switch (f) {
			case '-x':
				retval.x = 0;
				break;
			case '+y':
			case '-z':
				retval.x = 1;
				break;
			case '-y':
			case '+x':
				retval.x = 2;
				break;
			case '+z':
				retval.x = 3;
				break;
			default:
				throw new Error('Invalid Face');
		}
		return retval;
	};
	faceCoord(entity, face) {
		var slim = this.slim;
		var fcoord = Skin.face(face);
		return ([
			[ // HEAD
				[ // Y = 0
					null,
					vec2(8, 0),
					vec2(16, 0),
					null
				],
				[ // Y = 1
					vec2(0, 8),
					vec2(8, 8),
					vec2(16, 8),
					vec2(24, 8)
				]
			],
			[ // BODY
				[ // Y = 0
					null,
					vec2(4, 0),
					vec2(12, 0),
					null
				],
				[ // Y = 1
					vec2(0, 4),
					vec2(4, 4),
					vec2(12, 4),
					vec2(16, 4)
				]
			],
			[ // ARM_L
				[ // Y = 0
					null,
					vec2(4, 0),
					vec2(slim ? 7 : 8, 0),
					null
				],
				[ // Y = 1
					vec2(0, 4),
					vec2(4, 4),
					vec2(slim ? 7 : 8, 4),
					vec2(slim ? 11 : 12, 4)
				]
			],
			[ // ARM_R
				[ // Y = 0
					null,
					vec2(4, 0),
					vec2(slim ? 7 : 8, 0),
					null
				],
				[ // Y = 1
					vec2(0, 4),
					vec2(4, 4),
					vec2(slim ? 7 : 8, 4),
					vec2(slim ? 11 : 12, 4)
				]
			],
			[ // LEG_L
				[ // Y = 0
					null,
					vec2(4, 0),
					vec2(8, 0),
					null
				],
				[ // Y = 1
					vec2(0, 4),
					vec2(4, 4),
					vec2(8, 4),
					vec2(12, 4)
				]
			],
			[ // LEG_R
				[ // Y = 0
					null,
					vec2(4, 0),
					vec2(8, 0),
					null
				],
				[ // Y = 1
					vec2(0, 4),
					vec2(4, 4),
					vec2(8, 4),
					vec2(12, 4)
				]
			],
		])[entity][fcoord.y][fcoord.x];
	};
	atlasCoord(entity, face, overlay, coord) {
		return coord.add(Skin.entityCoord(entity)).add(this.faceCoord(entity, face)).add(Skin.overlayOffset(entity).scale(overlay));
	};
	worldCoord(entity, face, coord) {
		var result = vec3();
		// Y
		result.y = face.includes('y') ? face.includes('-') * (this.faceSizes[entity][1][1].y - 1) : coord.y;
		if (entity > Skin.entity.HEAD) result.y += this.faceSizes[Skin.entity.HEAD][1][1].y;
		if (entity > Skin.entity.ARM_R) result.y += this.faceSizes[Skin.entity.ARM_R][1][1].y;
		// X
		result.x = face.includes('x') ? face.includes('+') * (this.faceSizes[entity][1][1].x - 1) : (face.includes('+z') ? this.faceSizes[entity][1][1].x - coord.x - 1 : coord.x);
		if (entity != Skin.entity.ARM_L) result.x += this.faceSizes[Skin.entity.ARM_L][1][1].x;
		if (entity == Skin.entity.ARM_R) result.x += this.faceSizes[Skin.entity.BODY][1][1].x;
		if (entity == Skin.entity.LEG_R) result.x += this.faceSizes[Skin.entity.LEG_L][1][1].x;
		// Z
		if (face.includes('z')) {
			result.z = (this.faceSizes[entity][1][0].x - 1) * face.includes('+');
		} else {
			result.z = face.includes('y') ? this.faceSizes[entity][0][1].y - coord.y - 1 : (face.includes('-') ? this.faceSizes[entity][1][0].x - coord.x - 1 : coord.x);
		}
		if (entity != Skin.entity.HEAD) {
			result.z += 2;
		}
		return result;
	};

	linearGradient(worldPos, normalVector) {
		normalVector = vec3(normalVector);
		var val = 0,
			max = 0;
		for (var i of "xyz") {
			max += Math.abs(normalVector[i]) * (this.playerSize[i] - 1);
			val += (normalVector[i] < 0 ? (this.playerSize[i] - 1) - worldPos[i] : worldPos[i]) * Math.abs(normalVector[i]);
		}
		return val / max;
	}

	radialGradient(worldPos, normalVector) {
		normalVector = vec3(Math.abs(normalVector[0]), Math.abs(normalVector[1]), Math.abs(normalVector[2]));
		var sum = 0;
		var wp = vec3.add(worldPos, vec3.add(vec3.scale(this.playerSize, -0.5), vec3(0.5, 0.5, 0.5)));
		//ok nvm apparently not. return vec3.length(wp) / vec3.length(normalVector);
		for (var i of "xyz") {
			sum += Math.pow(Math.abs(wp[i]) / (normalVector[i] - 0.5), 2);
		}
		range("percent", Math.sqrt(sum) / vec3.length(vec3(1)));
		return map_range(Math.sqrt(sum) / vec3.length(vec3(1)), vec3.length(vec3(0.5, 0.5, 1.5)) / vec3.length(normalVector), 1, 0, 1);
	}
	executeShader(fn) {
		if (!this.canvas || !(this.canvas instanceof CanvasRenderingContext2D)) throw new Error("Library not initiated properly.");
		var imageData = this.canvas.getImageData(0, 0, this.canvas.canvas.width, this.canvas.canvas.height);
		let writeColor = (color, pos) => {
			color = vec4(color);
			if (color.a > 1) color.a /= 255;
			this.canvas.fillStyle = "rgba(" + color.r * 255 + "," + color.g * 255 + "," + color.b * 255 + "," + color.a + ")";
			this.canvas.fillRect(pos.x, pos.y, 1, 1);
		}
		for (var overlay = 0; overlay < 2; overlay++) { //6
			for (var entityid in Skin.entity) {
				var entity = Skin.entity[entityid];
				var faces = ['-x', '+x', '-y', '+y', '-z', '+z'];
				for (var face of faces) {
					var face_coord = Skin.face(face);
					var bounds = this.faceSizes[entity][face_coord.y][face_coord.x];
					for (var y = 0; y < bounds.y; y++) {
						for (var x = 0; x < bounds.x; x++) {
							this.onProgress((overlay + (entity + (faces.indexOf(face) + (y + x / bounds.x) / bounds.y) / faces.length) / 6) / 2);
							var out = {};
							const in_ = {
								limb: entity,
								faceID: face,
								normalVector: vec3(
									face[1] == 'x' ? (face[0] == '-' ? -1 : 1) : 0,
									face[1] == 'y' ? (face[0] == '-' ? -1 : 1) : 0,
									face[1] == 'z' ? (face[0] == '-' ? -1 : 1) : 0),
								isOverlay: !!overlay,
								relativePos: vec2(x, y),
								faceBoundingBox: this.faceSizes[entity][face_coord.y][face_coord.x],
								atlasPos: this.atlasCoord(entity, face, !!overlay, vec2(x, y)),
								worldPos: this.worldCoord(entity, face, vec2(x, y)),
								readFromAtlas(pos) {
									var index = (pos.y * imageData.width + pos.x) * 4;
									var datafix = vec4(Array.from(imageData.data.slice(index, index + 4)));
									return vec4(vec3.scale(datafix, 1 / 255), datafix.a);
								}
							}
							out.color = in_.readFromAtlas(in_.atlasPos);
							if (!in_.isOverlay)
								out.overlayColor = in_.readFromAtlas(vec2.add(in_.atlasPos, Skin.overlayOffset(entity)));
							out.writeToAtlas = writeColor;
							fn(in_, out);
							writeColor(out.color, in_.atlasPos);
							if (!in_.isOverlay) writeColor(out.overlayColor, vec2.add(in_.atlasPos, Skin.overlayOffset(entity)));
						}
					}
				}
			}
		}
		this.onComplete();
	}
}

//#region Gradient Library
export function Gradient() {
	this.colorStops = [];
}

Gradient.prototype.addColorStop = function (cs) {
	if (!cs instanceof Gradient.ColorStop) throw new TypeError("Can only add ColorStops using the builtin ColorStop object.");
	this.colorStops.push(cs);
	this.colorStops.sort((a, b) => a.pos - b.pos);
}

Gradient.prototype.calculateColor = function (percent) {
	var above = this.colorStops.filter(value => value.pos >= percent);
	var below = this.colorStops.filter(value => value.pos <= percent);
	var topColor, bottomColor, topPos, bottomPos;
	if (above.length > 0) {
		topColor = above[0].color;
		topPos = above[0].pos;
	} else if (below.length > 0) {
		topColor = below[below.length - 1].color;
		topPos = 1;
	} else {
		topColor = vec4(0, 0, 0, 1);
		topPos = 1;
	}
	if (below.length > 0) {
		bottomColor = below[below.length - 1].color;
		bottomPos = below[below.length - 1].pos;
	} else if (above.length > 0) {
		bottomColor = above[0].color;
		bottomPos = 0;
	} else {
		bottomColor = vec4(0, 0, 0, 1);
		bottomPos = 0;
	}
	percent = (percent - bottomPos) / (topPos - bottomPos);
	if (topPos - bottomPos == 0) percent = 0;
	return vec4(Gradient.__colorLib.interpolate(bottomColor, topColor, percent, Gradient.__colorLib.linear), bottomColor.a + percent * (topColor.a - bottomColor.a));
}

// A color stop within a gradient, color is a vec4 of the color (RGBA)
// RG&B should range from 0-255, A should range from 0-1. percent is a value between 0 - 1
Gradient.ColorStop = function (color, percent) {
	if (globalThis == this) return;
	this.color = vec4(color);
	if (vec3.length(this.color) > 2) this.color = vec4(vec3.scale(this.color, 1 / 255), this.color.a);
	this.pos = percent;
}

Gradient.__colorLib = {
	linear(valueA, valueB, threshold, isHue) {
		var valA = Math.min(valueA, valueB);
		var valB = Math.max(valueA, valueB);
		if (valueA > valueB) threshold = 1 - threshold;
		if (isHue) {
			var len1, len2;
			len1 = valB - valA;
			len2 = valA - valB + 1;
			if (len1 <= len2) {
				return valA * (1 - threshold) + valB * threshold;
			} else {
				return ((valA + 1) * (1 - threshold) + valB * threshold) % 1;
			}
		}
		return valA * (1 - threshold) + valB * threshold;
	},

	interpolate(rgbA, rgbB, threshold, interpolatorFn) {
		var hsvA = this.rgbToHsv(rgbA);
		var hsvB = this.rgbToHsv(rgbB);
		threshold = this.toArray(threshold, 3);
		return this.hsvToRgb({
			h: interpolatorFn(hsvA.h, hsvB.h, threshold[0], true),
			s: interpolatorFn(hsvA.s, hsvB.s, threshold[1]),
			v: interpolatorFn(hsvA.v, hsvB.v, threshold[2])
		});
	},

	rgbToHsv(rgb) {
		var r = rgb.r / 255,
			g = rgb.g / 255,
			b = rgb.b / 255;
		var max = Math.max(r, g, b),
			min = Math.min(r, g, b);
		var h, s, v = max;
		var d = max - min;
		s = max === 0 ? 0 : d / max;
		if (max == min) {
			h = 0; // achromatic
		} else {
			switch (max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
					break;
			}
			h /= 6;
		}
		return {
			h: h,
			s: s,
			v: v
		};
	},

	hsvToRgb(hsv) {
		var r, g, b, i, f, p, q, t,
			h = hsv.h,
			s = hsv.s,
			v = hsv.v;
		i = Math.floor(h * 6);
		f = h * 6 - i;
		p = v * (1 - s);
		q = v * (1 - f * s);
		t = v * (1 - (1 - f) * s);
		switch (i % 6) {
			case 0:
				r = v, g = t, b = p;
				break;
			case 1:
				r = q, g = v, b = p;
				break;
			case 2:
				r = p, g = v, b = t;
				break;
			case 3:
				r = p, g = q, b = v;
				break;
			case 4:
				r = t, g = p, b = v;
				break;
			case 5:
				r = v, g = p, b = q;
				break;
		}
		return vec3(r * 255, g * 255, b * 255);
	},

	isNumeric(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	},

	toArray(arr, size) {
		var isNum = this.isNumeric(arr);
		arr = !Array.isArray(arr) ? [arr] : arr;
		for (var i = 1; i < size; i++) {
			if (arr.length < size) {
				arr.push(isNum ? arr[0] : 0);
			}
		}
		return arr;
	}
}
//#endregion Gradient Library

function percent(num, max) {
	return num / (max - 1);
}

//var

export function map_range(value, low1, high1, low2, high2) {
	return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

// Debugging purposes. get the max and min values returned by a function
export function range(varName, val) {
	if (!(varName in range.data)) range.data[varName] = [];
	range.data[varName].push(val);
}
range.data = {};

range.log = function () {
	for (var i in range.data) {
		if (range.data[i] instanceof Array) {
			var min = Number.MAX_VALUE,
				max = -Number.MIN_VALUE;
			for (var j of range.data[i]) {
				if (j instanceof vec3) {
					if (typeof min == 'number' || vec3.length(min) > vec3.length(j)) min = j;
					if (typeof max == 'number' || vec3.length(max) < vec3.length(j)) max = j;
				} else {
					min = Math.min(min, j);
					max = Math.max(max, j);
				}
			}
			console.log(i, ":", min, "-", max);
		}
	}
}

range.extremes = function (name) {
	if (range.data[name] instanceof Array) {
		var min = Number.MAX_VALUE,
			max = -Number.MIN_VALUE;
		for (var j of range.data[name]) {
			if (j instanceof vec3) {
				if (typeof min == 'number' || vec3.length(min) > vec3.length(j)) min = j;
				if (typeof max == 'number' || vec3.length(max) < vec3.length(j)) max = j;
			} else {
				min = Math.min(min, j);
				max = Math.max(max, j);
			}
		}
		return {
			min: min,
			max: max
		};
	} else throw new Error("unexpected variable name: " + name);
}


//#region Example: Rainbow
Gradient.rainbow = new Gradient();

Gradient.rainbow.addColorStop(new Gradient.ColorStop(vec4(255, 0, 0, 1), 0.0));
Gradient.rainbow.addColorStop(new Gradient.ColorStop(vec4(255, 154, 0, 1), 0.1));
Gradient.rainbow.addColorStop(new Gradient.ColorStop(vec4(208, 222, 33, 1), 0.2));
Gradient.rainbow.addColorStop(new Gradient.ColorStop(vec4(79, 220, 74, 1), 0.3));
Gradient.rainbow.addColorStop(new Gradient.ColorStop(vec4(63, 218, 216, 1), 0.4));
Gradient.rainbow.addColorStop(new Gradient.ColorStop(vec4(47, 201, 226, 1), 0.5));
Gradient.rainbow.addColorStop(new Gradient.ColorStop(vec4(28, 127, 238, 1), 0.6));
Gradient.rainbow.addColorStop(new Gradient.ColorStop(vec4(95, 21, 242, 1), 0.7));
Gradient.rainbow.addColorStop(new Gradient.ColorStop(vec4(186, 12, 248, 1), 0.8));
Gradient.rainbow.addColorStop(new Gradient.ColorStop(vec4(251, 7, 217, 1), 0.9));
Gradient.rainbow.addColorStop(new Gradient.ColorStop(vec4(255, 0, 0, 1), 1.0));
//#endregion Example: Rainbow

export function copyToClipboard(text) {
	if (navigator.clipboard) {
		navigator.clipboard.writeText(text).then(function () {}, function () {
			const elem = document.createElement('textarea');
			elem.value = text;
			document.body.appendChild(elem);
			elem.select();
			document.execCommand('copy');
			document.body.removeChild(elem);
		});
	} else {
		const elem = document.createElement('textarea');
		elem.value = text;
		document.body.appendChild(elem);
		elem.select();
		document.execCommand('copy');
		document.body.removeChild(elem);
	}
}