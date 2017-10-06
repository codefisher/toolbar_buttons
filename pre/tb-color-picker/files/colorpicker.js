var wheel = document.getElementById("w"),
	wheelCtx = wheel ? getContext(wheel) : null,
	currentBox = document.getElementById("c"),
	currentCtx = currentBox ? getContext(currentBox) : null,
	barCanvas = document.getElementById("ck"),
	barCanvasCtx = barCanvas ? getContext(barCanvas) : null,
	panelCanvas = document.getElementById("cj"),
	panelCanvasCtx = panelCanvas ? getContext(panelCanvas) : null,

	hexNode = document.getElementById("x"),
	inputBoxes = [],
	radius = 82,
	width = 16,
	inner = radius - (width / 2),
	color,

	wheelDown = false,
	tringaleDown = false,
	barDown = false,
	panelDown = false,

	RGBmax = 255,
	HSVmax = 100,
	hueMax = 360,

	canvasSize = 196,
	black = "#000",
	white = "#fff",
	diffColor = [[0, -15], [15, -15], [15, 0], [15, 15], [0, 15], [-15, 15], [-15, 0], [-15, -15]],

	currentColor = [RGBmax, 0, 0],
	newColor = currentColor,

	hex3match = /(.)(.)(.)/,
	hex3replace = "$1$1$2$2$3$3",
	hexChars = "0123456789ABCDEF",
	hexDisplay = "upper",
	chars = "0369CF",
	inputs = [["Hue", hueMax], ["Saturation", HSVmax], ["Value", HSVmax],
		["Red", RGBmax], ["Green", RGBmax], ["Blue", RGBmax]],
	inputIds = "HSVRGB",
	radioIds = "YJKOQF",

	primaryColorsArray = [],
	colorPaletteItem = {},
	namedColorItems = {},
	paletteColors = decode("B;MQS:B@;KK5<KG7BA0QM@QS3CE;H=98KMCI31H?4HLGOD26D:>B5SO@?PG4C?9DE;DQF6B;0DG9PS?C>:C=FBDG>O;1BF4I>;NK5D65LH4LH81HAAJL4=?@6>@6IA1H81CSFH>AJDABCG6NA3JM=6EAHQ5==;7N3EN:9NA;IL5<C1<PA6O@0JF3NSMN7GJJ;CP58IG2CM8<SMJJ5CD@7O2>QGFOG5KQ4CJ9=P?7N28B?:NL:HR5EQ:<P;6<@3IM3CSGIC5<KG>K=7IA@NF3JQ3<>:LO87H12IF4NF@HK9>P4@R46641<E4JS@CJ:6C80RB0");

var namedColors = {
	"aliceblue": "#f0f8ff",
	"antiquewhite": "#faebd7",
	"aqua": "#00ffff",
	"aquamarine": "#7fffd4",
	"azure": "#f0ffff",
	"beige": "#f5f5dc",
	"bisque": "#ffe4c4",
	"black": "#000000",
	"blanchedalmond": "#ffebcd",
	"blue": "#0000ff",
	"blueviolet": "#8a2be2",
	"brown": "#a52a2a",
	"burlywood": "#deb887",
	"cadetblue": "#5f9ea0",
	"chartreuse": "#7fff00",
	"chocolate": "#d2691e",
	"coral": "#ff7f50",
	"cornflowerblue": "#6495ed",
	"cornsilk": "#fff8dc",
	"crimson": "#dc143c",
	"cyan": "#00ffff",
	"darkblue": "#00008b",
	"darkcyan": "#008b8b",
	"darkgoldenrod": "#b8860b",
	"darkgray": "#a9a9a9",
	"darkgreen": "#006400",
	"darkkhaki": "#bdb76b",
	"darkmagenta": "#8b008b",
	"darkolivegreen": "#556b2f",
	"darkorange": "#ff8c00",
	"darkorchid": "#9932cc",
	"darkred": "#8b0000",
	"darksalmon": "#e9967a",
	"darkseagreen": "#8fbc8f",
	"darkslateblue": "#483d8b",
	"darkslategray": "#2f4f4f",
	"darkturquoise": "#00ced1",
	"darkviolet": "#9400d3",
	"deeppink": "#ff1493",
	"deepskyblue": "#00bfff",
	"dimgray": "#696969",
	"dodgerblue": "#1e90ff",
	"firebrick": "#b22222",
	"floralwhite": "#fffaf0",
	"forestgreen": "#228b22",
	"fuchsia": "#ff00ff",
	"gainsboro": "#dcdcdc",
	"ghostwhite": "#f8f8ff",
	"gold": "#ffd700",
	"goldenrod": "#daa520",
	"gray": "#808080",
	"green": "#008000",
	"greenyellow": "#adff2f",
	"honeydew": "#f0fff0",
	"hotpink": "#ff69b4",
	"indianred ": "#cd5c5c",
	"indigo": "#4b0082",
	"ivory": "#fffff0",
	"khaki": "#f0e68c",
	"lavender": "#e6e6fa",
	"lavenderblush": "#fff0f5",
	"lawngreen": "#7cfc00",
	"lemonchiffon": "#fffacd",
	"lightblue": "#add8e6",
	"lightcoral": "#f08080",
	"lightcyan": "#e0ffff",
	"lightgoldenrodyellow": "#fafad2",
	"lightgrey": "#d3d3d3",
	"lightgreen": "#90ee90",
	"lightpink": "#ffb6c1",
	"lightsalmon": "#ffa07a",
	"lightseagreen": "#20b2aa",
	"lightskyblue": "#87cefa",
	"lightslategray": "#778899",
	"lightsteelblue": "#b0c4de",
	"lightyellow": "#ffffe0",
	"lime": "#00ff00",
	"limegreen": "#32cd32",
	"linen": "#faf0e6",
	"magenta": "#ff00ff",
	"maroon": "#800000",
	"mediumaquamarine": "#66cdaa",
	"mediumblue": "#0000cd",
	"mediumorchid": "#ba55d3",
	"mediumpurple": "#9370d8",
	"mediumseagreen": "#3cb371",
	"mediumslateblue": "#7b68ee",
	"mediumspringgreen": "#00fa9a",
	"mediumturquoise": "#48d1cc",
	"mediumvioletred": "#c71585",
	"midnightblue": "#191970",
	"mintcream": "#f5fffa",
	"mistyrose": "#ffe4e1",
	"moccasin": "#ffe4b5",
	"navajowhite": "#ffdead",
	"navy": "#000080",
	"oldlace": "#fdf5e6",
	"olive": "#808000",
	"olivedrab": "#6b8e23",
	"orange": "#ffa500",
	"orangered": "#ff4500",
	"orchid": "#da70d6",
	"palegoldenrod": "#eee8aa",
	"palegreen": "#98fb98",
	"paleturquoise": "#afeeee",
	"palevioletred": "#d87093",
	"papayawhip": "#ffefd5",
	"peachpuff": "#ffdab9",
	"peru": "#cd853f",
	"pink": "#ffc0cb",
	"plum": "#dda0dd",
	"powderblue": "#b0e0e6",
	"purple": "#800080",
	"red": "#ff0000",
	"rosybrown": "#bc8f8f",
	"royalblue": "#4169e1",
	"saddlebrown": "#8b4513",
	"salmon": "#fa8072",
	"sandybrown": "#f4a460",
	"seagreen": "#2e8b57",
	"seashell": "#fff5ee",
	"sienna": "#a0522d",
	"silver": "#c0c0c0",
	"skyblue": "#87ceeb",
	"slateblue": "#6a5acd",
	"slategray": "#708090",
	"snow": "#fffafa",
	"springgreen": "#00ff7f",
	"steelblue": "#4682b4",
	"tan": "#d2b48c",
	"teal": "#008080",
	"thistle": "#d8bfd8",
	"tomato": "#ff6347",
	"turquoise": "#40e0d0",
	"violet": "#ee82ee",
	"wheat": "#f5deb3",
	"white": "#ffffff",
	"whitesmoke": "#f5f5f5",
	"yellow": "#ffff00",
	"yellowgreen": "#9acd32"
};

for (var x = 0; x < 7; x++) {
	primaryColorsArray.push(getHexColor(decode("N5N50S0S5N0"), x));
}

function colorNameToHex(color) {
	if (typeof namedColors[color.toLowerCase()] != 'undefined') {
		return namedColors[color.toLowerCase()];
	}
	return false;
}

function getContext(item) {
	return item.getContext("2d");
}

function getHexColor(value, index) {
	return "#" + value.substr(index * 3, 3).replace(hex3match, hex3replace);
}

function decode(text) {
	var hex = [], result = "", other;
	for (var i = 0; i < 6; i++) {
		other = chars;
		for (var j = 0; j < 6;) {
			hex.push(chars[i] + chars[j++]);
		}
	}
	for (var k = 0; k < text.length; k++) {
		result += hex[(text.charCodeAt(k) - 48)];
	}
	return result;
}

function getHex(r, g, b) {
	function toHex(d) {
		return ("0" + ((d < 16) ? "" : toHex((d - d % 16) / 16)) + hexChars.charAt(d % 16)).slice(-2);
	}

	return "#" + toHex(r) + toHex(g) + toHex(b);
}

function getRGB(hex) {
	function hex2dec(hex) {
		return hexChars.indexOf(hex.toUpperCase());
	}

	hex = hex.replace("#", "");

	hex = (hex.length == 3) ? hex.replace(hex3match, hex3replace) : hex;
	if (hex.length == 6) {
		var result = [];
		for (var i = 0; i < 3;) {
			result.push(hex2dec(hex[i * 2]) * 16 + hex2dec(hex[i++ * 2 + 1]));
		}
		return result;
	}
}

function minMax(value, minValue, maxValue) {
	return (value > maxValue) ? maxValue : ((value < minValue) ? minValue : value);
}

// the javascript mod is wrong for negative numbers
function mod(x, n) {
	return ((x % n) + n) % n;
}


function getHue(r, g, b) {
	var M = Math.max(r, g, b),
		C = M - Math.min(r, g, b);
	return Math.round(60 * ((C == 0) ? 0 : ((M == r) ? mod((g - b) / C, 6) : ((M == g) ? 2 + (b - r) / C : 4 + (r - g) / C))));
}

function getValue(r, g, b) {
	return Math.round(HSVmax * Math.max(r, g, b) / RGBmax);
}

function getLightness(r, g, b) {
	return (HSVmax * 0.5 * (Math.max(r, g, b) + Math.min(r, g, b)) / RGBmax);
}

function getSaturation(r, g, b) {
	var M = Math.max(r, g, b),
		C = M - Math.min(r, g, b);
	return Math.round(HSVmax * (C ? C / M : 0));
}

function solveRGB(r, g, b) {
	return [getHue(r, g, b), getSaturation(r, g, b), getValue(r, g, b)];
}

function getHSL(r, g, b) {

	var rv = r / 255;
	var gv = g / 255;
	var bv = b / 255;

	var max = Math.max(rv, gv, bv);
	var min = Math.min(rv, gv, bv);
	var diff = max - min;
	var sum = max + min;

	var l = sum / 2;

	if (diff == 0) {
		return [0, 0, l]
	}

	var s = diff / (2.0 - sum);
	if (l < 0.5) {
		s = diff / sum;
	}

	var dr = (((max - rv) / 6) + (diff / 2)) / diff;
	var dg = (((max - gv) / 6) + (diff / 2)) / diff;
	var db = (((max - bv) / 6) + (diff / 2)) / diff;

	var h = 0;
	if (rv == max) {
		h = db - dg;
	} else if (gv == max) {
		h = (1.0 / 3) + dr - db;
	} else if (bv == max) {
		h = (2.0 / 3) + dg - dr;
	}

	if (h < 0) {
		h += 1;
	}
	if (h > 1) {
		h -= 1;
	}
	return [h * 360, s * 100, l * 100];
}

function doApply(func, args) {
	return func.apply(null, args);
}

function solveHSV(h, s, v) {
	var C = v / HSVmax * s / HSVmax,
		H = mod(h / 60, 6),
		X = C * (1 - Math.abs(mod(H, 2) - 1)),
		val = [[C, X, 0], [X, C, 0], [0, C, X], [0, X, C], [X, 0, C], [C, 0, X]][Math.floor(H)];
	return val.map(function (x) {
		return Math.floor((x + v / HSVmax - C) * RGBmax);
	});
}

function textBoxChange(target) {
	var val = target.value,
		index = "HSVRGB".indexOf(target.id), tmp;
	if (index < 3) {
		tmp = doApply(solveRGB, currentColor);
		tmp[index] = val % (inputs[index][1] + 1);
		tmp = doApply(solveHSV, tmp);
	} else {
		tmp = currentColor;
		tmp[index % 3] = val % (inputs[index][1] + 1);
	}
	return tmp;
}

function startup() {
	setupInputs();
	setupPalette();
	setupNamedColors();
	setupHexInput();
	setUpSaved();
	setWheelAndPanelEvents();
	doApply(updateColor, currentColor);
}

function setupInputs() {
	function func(event) {
		event.target.focus();
		doApply(updateColor, textBoxChange(this));
	}
	document.getElementById('nc').addEventListener('change', selectChange);
	for (var i = 0; i < inputs.length; i++) {
		var input = document.getElementById(inputIds[i]);
		input.addEventListener('keydown', function (event) {
			var code = event.keyCode;
			return goodKey(code) || (48 <= code && code <= 57);
		});
		input.addEventListener('change', func);
		input.addEventListener('click', func);
		input.addEventListener('keyup', function (event) {
			if (event.keyCode == 9)
				return false;
			var target = this, val = target.value, rgb;
			if (parseInt(val)) {
				rgb = textBoxChange(target);
				rgb.push(target.id);
				doApply(updateColor, rgb);
			}
			return true;
		});
		inputBoxes.push(input);
		var radio = document.getElementById(radioIds[i]);
		radio.addEventListener('click', function () {
			doApply(updateColor, currentColor);
		});
	}
}

function setupPalette() {
	var palette = document.getElementById('p');
	for (var i = 0; i < 6 * 36; i++) {
		if (i % 36 == 0) {
			var tmp = document.createElementNS('http://www.w3.org/1999/xhtml', 'tr');
			palette.appendChild(tmp);
		}
		color = getHexColor(paletteColors, i);
		var td = document.createElementNS('http://www.w3.org/1999/xhtml', 'td');
		td.addEventListener('click', function (event) {
			doApply(updateColor, getRGB(this.value));
		});
		td.value = color;
		td.style.backgroundColor = color;
		colorPaletteItem[color] = td;
		tmp.appendChild(td);
	}
}

function setupNamedColors() {
	var colorSelect = document.getElementById("nc");
	colorSelect.addEventListener('mouseup', selectChange, false);
	colorSelect.addEventListener('keyup', selectChange, false);
	var colors = colorSelect.getElementsByTagName("option");
	for (var i = 0; i < colors.length; i++) {
		var colorName = colors[i].getAttribute('value');
		if (colorName) {
			namedColorItems[colorNameToHex(colorName)] = colors[i];
		}
	}
}

function setupHexInput() {
	hexNode.addEventListener('keydown', function (event) {
		var code = event.keyCode;
		if (event.ctrlKey) {
			return true;
		}
		return goodKey(code) || (48 <= code && code <= 57) || (65 <= code && code <= 70);
	});

	hexNode.addEventListener('keyup', function (event) {
		var rgb = getRGB(this.value);
		if (rgb) {
			rgb.push("x");
			doApply(updateColor, rgb);
		}
	});
}

function setUpSaved() {
	var tmp = document.createElementNS('http://www.w3.org/1999/xhtml', 'tr');
	for (var i = 0; i < 17; i++) {
		var cell = document.createElementNS('http://www.w3.org/1999/xhtml', 'td');
		cell.addEventListener('click', function (event) {
			if (this.value) doApply(updateColor, getRGB(this.value));
		}, false);
		tmp.appendChild(cell);
	}
	document.getElementById("sc").appendChild(tmp);

	document.getElementById("vs").addEventListener('click', function (event) {
		var hex = doApply(getHex, currentColor);
		delete sessionStorage[hex];
		sessionStorage[hex] = sessionStorage.length ? getSessionVals()[0][0] + 1 : 0;
		loadSaved();
	});
	loadSaved();
}

function setWheelAndPanelEvents() {
	wheel.addEventListener('mousedown', function (event) {
		var items = angleDistance(event, 104, wheel), tmp,
			angle = items[0], distance = items[1];
		if (inner + 1 < distance && distance < inner + width) {
			wheelDown = true;
			setWheelCurrent(angle);
		} else if (distance < inner) {
			tmp = setWheelTriangle(angle, distance);
			if (tmp[3]) {
				tringaleDown = true;
				doApply(setWheel, tmp);
				doSetCurrent(doApply(solveHSV, tmp));
			}
		}
	});

	document.addEventListener('mousemove', function (event) {
		var items = angleDistance(event, 104, wheel),
			angle = items[0], tmp,
			distance = items[1];
		if (wheelDown) {
			setWheelCurrent(angle);
		} else if (tringaleDown) {
			tmp = setWheelTriangle(angle, distance);
			doSetCurrent(doApply(solveHSV, tmp));
			doApply(setWheel, tmp);
		} else if (barDown) {
			tmp = getBarColor(event);
			doSetCurrent(tmp);
			doApply(drawPanel, tmp);
		} else if (panelDown) {
			tmp = getPanelColor(event);
			doSetCurrent(tmp);
			doApply(drawPanel, tmp);
		}
	});

	document.addEventListener('mouseup', function (event) {
		var items = angleDistance(event, 104, wheel),
			angle = items[0], tmp,
			distance = items[1];
		if (wheelDown) {
			wheelDown = false;
			tmp = doApply(solveRGB, currentColor);
			tmp[0] = angle;
			doApply(updateColor, doApply(solveHSV, tmp));
		} else if (tringaleDown) {
			tringaleDown = false;
			doApply(updateColor, doApply(solveHSV, setWheelTriangle(angle, distance)));
		} else if (barDown) {
			doApply(updateColor, getBarColor(event));
			barDown = false;
		} else if (panelDown) {
			doApply(updateColor, getPanelColor(event));
			panelDown = false;
		}
	});

	currentBox.addEventListener('mouseup', function (event) {
		var items = angleDistance(event, 65, currentBox),
			angle = items[0], tmp,
			distance = items[1], diff;
		if (40 < distance && distance < 60) {
			diff = diffColor[parseInt(((angle + 45 / 2) / 45) % 8)];
			tmp = doApply(solveRGB, currentColor);
			for (var i = 0; i < 2;) {
				tmp[i + 1] = minMax(diff[i] + tmp[++i], 0, HSVmax);
			}
			doApply(updateColor, doApply(solveHSV, tmp));
		}
	});

	currentCtx.translate(60, 60);


	barCanvas.addEventListener('mousedown', function (event) {
		var tmp = getBarColor(event);
		doSetCurrent(tmp);
		doApply(drawPanel, tmp);
		barDown = true;
	});

	panelCanvas.addEventListener('mousedown', function (event) {
		var tmp = getPanelColor(event);
		doSetCurrent(tmp);
		doApply(drawPanel, tmp);
		panelDown = true;
	});
}

function goodKey(code) {
	return code == 8 || code == 46 || (37 <= code && code <= 40) || code == 13 || code == 9;
}

function loadSaved() {
	var values = getSessionVals(), tds = document.getElementById('sc').getElementsByTagName('td'), value;
	for (var i = 0; i < values.length; i++) {
		value = values[i][1];
		if (i < 17) {
			tds[i].style.backgroundColor = value;
			tds[i].value = value;
		} else {
			delete sessionStorage[value];
		}
	}
}

function getSessionVals() {
	var values = [];
	for (var i = 0; i < sessionStorage.length; i++) {
		var key = sessionStorage.key(i);
		values.push([parseInt(sessionStorage[key]), key]);
	}
	values.sort(function (x, y) {
		return y[0] - x[0];
	});
	return values;
}

function createGradient(ctx, x1, y1, x2, y2, grad) {
	var gradient = ctx.createLinearGradient(x1, y1, x2, y2);
	for (var j = 0; j < grad.length; j++) {
		gradient.addColorStop(j / (grad.length - 1), grad[j]);
	}
	return gradient;
}

function getXY(event, elem, offset) {
	var el = elem;
	return [event.pageX - el.offsetLeft - offset, event.pageY - el.offsetTop - offset];
}

function angleDistance(event, center, elm) {
	var xy = getXY(event, elm, center), x = xy[0], y = xy[1],
		angle = mod(Math.atan2(-y, x) / Math.PI * 180, hueMax),
		distance = Math.sqrt(x * x + y * y);
	return [angle, distance];
}

function setWheelCurrent(angle) {
	var tmp;
	wheelDown = true;
	tmp = doApply(solveRGB, currentColor);
	tmp[0] = angle;
	doApply(setWheel, tmp);
	doSetCurrent(doApply(solveHSV, tmp));
}

function setWheelTriangle(angle, distance) {
	var rotate = doApply(solveRGB, currentColor)[0],
		x = distance * Math.cos((angle - rotate - 120) * Math.PI / 180),
		y = distance * Math.sin((angle - rotate - 120) * Math.PI / 180),
		sat_dist = inner - 1 - (inner * Math.cos(Math.PI * 2 / 3)),
		sat = x - (inner * Math.cos(Math.PI * 2 / 3)),
		val_max = (sat_dist - sat) * Math.tan(Math.PI / 6),
		vlu = ((val_max * 2) - (val_max + y)) / (val_max * 2),
		satu = (sat_dist - sat) / sat_dist;
	return [rotate, minMax(Math.round(HSVmax * vlu), 0, HSVmax), minMax(Math.round(HSVmax * satu), 0, HSVmax), 0 <= vlu && vlu <= 1 && 0 <= satu && satu <= 1];
}

function setWheel(h, s, v) {
	var topX = inner * Math.cos(Math.PI * 2 / 3), topY = inner * Math.sin(Math.PI * 2 / 3),
		bottomX = inner * Math.cos(Math.PI * 4 / 3), bottomY = inner * Math.sin(Math.PI * 4 / 3),
		size = inner - bottomX;

	wheelCtx.save();
	wheelCtx.lineWidth = width;
	wheelCtx.clearRect(0, 0, canvasSize, canvasSize);
	wheelCtx.translate(radius + width, radius + width);
	for (var i = 0; i < 6; i++) {
		wheelCtx.strokeStyle = createGradient(wheelCtx, radius, 0, radius * 0.5, radius * Math.sin(-Math.PI / 3),
			[primaryColorsArray[i], primaryColorsArray[i + 1]]);

		wheelCtx.beginPath();
		wheelCtx.arc(0, 0, radius, 0.01, -Math.PI / 3, true);
		wheelCtx.stroke();
		wheelCtx.rotate(-Math.PI / 3);
	}
	wheelCtx.rotate(-Math.PI * h / 180);
	for (i = 0; i < 2; i++) {
		wheelCtx.fillStyle = ( !i ? createGradient(wheelCtx, 0, topY, 0, bottomY, [white, black])
			: createGradient(wheelCtx, topX, 0, inner, 0, ["hsla(" + h + ",100%,50%,0)", "hsl(" + h + ",100%,50%)"]));

		wheelCtx.beginPath();
		wheelCtx.moveTo(inner, 0);
		wheelCtx.lineTo(topX, topY);
		wheelCtx.lineTo(bottomX, bottomY);
		wheelCtx.fill();
	}
	wheelCtx.lineWidth = 1;
	wheelCtx.strokeStyle = black;
	wheelCtx.beginPath();
	wheelCtx.moveTo(inner, 0);
	wheelCtx.lineTo(inner + width, 0);
	wheelCtx.stroke();

	wheelCtx.strokeStyle = doApply(getLightness, solveHSV(h, s, v)) > 25 ? black : white;
	wheelCtx.lineWidth = 2;
	wheelCtx.beginPath();
	var distance = size * v / HSVmax, across = -distance * Math.tan(Math.PI / 6) * (s - 50) / HSVmax * 2;
	wheelCtx.arc(topX + (Math.cos(Math.PI / 3) * (distance)) - (Math.cos(Math.PI / 6) * across),
		-topY + (Math.sin(Math.PI / 3) * (distance)) + (Math.sin(Math.PI / 6) * across), 4, 0, Math.PI * 2, true);
	wheelCtx.stroke();
	wheelCtx.restore();
}

function doSetCurrent(c2) {
	doApply(setCurrent, currentColor.concat(c2));
}


function setCurrent(r1, g1, b1, r2, g2, b2) {
	var h = getHue(r1, g1, b1), s = getSaturation(r1, g1, b1), v = getValue(r1, g1, b1),
		size = 40;

	currentCtx.clearRect(-60, -60, 120, 120);

	for (var i = 0; i < diffColor.length; i++) {
		currentCtx.fillStyle = doApply(getHex, solveHSV(h, minMax(s + diffColor[i][0], 0, HSVmax),
			minMax(v + diffColor[i][1], 0, HSVmax)));
		currentCtx.beginPath();
		currentCtx.arc(10, 0, size + 10, Math.PI / 8, -Math.PI / 8, true);
		currentCtx.lineTo(10, 0);
		currentCtx.closePath();
		currentCtx.fill();
		currentCtx.rotate(-Math.PI / 4);
	}

	for (i = 0; i < 2; i++) {
		currentCtx.fillStyle = i ? getHex(r1, g1, b1) : getHex(r2, g2, b2);
		currentCtx.beginPath();
		currentCtx.arc(0, 0, size, (i ? -1 : 1) * Math.PI / 2, (i ? 1 : -1) * Math.PI / 2, true);
		currentCtx.closePath();
		currentCtx.fill();
	}
}

function setPalette(hex) {
	var item = document.getElementById("sp"),
		pos = colorPaletteItem[hex];
	if (pos) {
		item.style.backgroundColor = hex;
		item.style.height = "16px";
		item.style.width = "16px";
		item.style.display = "block";
		item.style.top = (pos.offsetTop + pos.offsetHeight - 1).toString() + "px";
		item.style.left = (pos.offsetLeft - 3).toString() + "px";
	} else {
		item.style.display = "none";
	}
}

function getPanelView() {
	for (var i = 0; i < 6; i++) {
		if (document.getElementById(radioIds[i]).checked) {
			return i;
		}
	}
}

function drawPanel(r, g, b) {
	var grad0, grad2, grad4,
		x, y, z, view = getPanelView(), facz, facy, facx, vc,
		hsv = solveRGB(r, g, b), h = hsv[0], s = hsv[1], v = hsv[2];

	if (view == 0) {
		x = v;
		y = s;
		z = hueMax - h;
		facz = hueMax;
		facy = HSVmax;
		facx = HSVmax;
		grad0 = primaryColorsArray;
		grad2 = [doApply(getHex, solveHSV(h, HSVmax, HSVmax)), white];
		grad4 = [black, "rgba(0,0,0,0)"];
	} else if (view == 1 || view == 2) {
		x = v;
		y = hueMax - h;
		z = s;
		facz = HSVmax;
		facy = hueMax;
		facx = HSVmax;
		grad0 = [white, black];
		grad2 = primaryColorsArray;
		grad4 = [black, "rgba(255,255,255," + (HSVmax - s) / HSVmax + ")"];
		if (view == 2) {
			x = s;
			z = v;
			vc = parseInt(v / HSVmax * RGBmax);
			grad4 = [getHex(vc, vc, vc), "rgba(" + vc + "," + vc + "," + vc + "," + (HSVmax - v) / HSVmax + ")"];
		}
	} else if (view == 3) {
		x = b;
		y = g;
		z = r;
		grad0 = [primaryColorsArray[0], black];
		grad2 = [getHex(r, RGBmax, 0), getHex(r, RGBmax, RGBmax)];
		grad4 = [getHex(r, 0, 0), getHex(r, 0, RGBmax)];
	} else if (view == 4) {
		x = r;
		y = b;
		z = g;
		grad0 = [primaryColorsArray[2], black];
		grad2 = [getHex(RGBmax, g, 0), getHex(RGBmax, g, RGBmax)];
		grad4 = [getHex(0, g, 0), getHex(0, g, RGBmax)];
	} else if (view == 5) {
		x = g;
		y = r;
		z = b;
		grad0 = [primaryColorsArray[4], black];
		grad2 = [getHex(RGBmax, 0, b), getHex(RGBmax, RGBmax, b)];
		grad4 = [getHex(0, 0, b), getHex(0, RGBmax, b)];
	}
	if (view > 2) {
		facz = RGBmax;
		facy = RGBmax;
		facx = RGBmax;
	}

	function doFill(panel, x2, y2, y3, x4, y4, grad) {
		panel.fillStyle = createGradient(panel, 0, 0, x2, y2, grad);
		panel.fillRect(0, y3, x4, y4);
	}

	doFill(barCanvasCtx, 0, canvasSize, 0, 16, canvasSize, grad0);
	barCanvasCtx.fillStyle = "#ddd";
	barCanvasCtx.fillRect(0, parseInt(195 - z / facz * 195), 16, 1);

	if (view > 2) {
		doFill(panelCanvasCtx, canvasSize, 0, 0, canvasSize, canvasSize, grad2);
		for (var i = 0; i < canvasSize; i++) {
			panelCanvasCtx.globalAlpha = i / canvasSize;
			doFill(panelCanvasCtx, canvasSize, 0, i, canvasSize, 1, grad4);
		}
	} else {
		doFill(panelCanvasCtx, 0, canvasSize, 0, canvasSize, canvasSize, grad2);
		doFill(panelCanvasCtx, canvasSize, 0, 0, canvasSize, canvasSize, grad4);
	}
	panelCanvasCtx.fillStyle = "#555";
	panelCanvasCtx.fillRect(0, parseInt(195 - y / facy * 195), canvasSize, 1);
	panelCanvasCtx.fillRect(parseInt(x / facx * 195), 0, 1, canvasSize);
}

function getBarColor(event) {
	var xy = getXY(event, barCanvas, 6),
		y = minMax(1 - (xy[1] / canvasSize), 0, 1),
		hsv = doApply(solveRGB, currentColor),
		tmp = currentColor.slice(0, 3), view = getPanelView();
	if (view < 3) {
		hsv[view] = (view == 0) ? (1 - y) * hueMax : y * HSVmax;
		tmp = doApply(solveHSV, hsv);
	} else {
		tmp[view - 3] = parseInt(RGBmax * y);
	}
	return tmp;
}

function getPanelColor(event) {
	var xy = getXY(event, panelCanvas, 6),
		x = minMax((xy[0] / canvasSize), 0, 1),
		y = minMax(1 - (xy[1] / canvasSize), 0, 1),
		Xindex, Yindex, tmp, view = getPanelView(),
		hsv = doApply(solveRGB, currentColor);
	if (view == 1) {
		Xindex = 2;
		Yindex = 0;
	} else if (view % 3 == 0) {
		Xindex = 2;
		Yindex = 1;
	} else if (view == 4) {
		Xindex = 0;
		Yindex = 2;
	} else if (view % 3 == 2) {
		Xindex = 1;
		Yindex = 0;
	}
	if (view < 3) {
		hsv[Xindex] = x * HSVmax;
		hsv[Yindex] = (Yindex ? y * HSVmax : (1 - y) * hueMax);
		tmp = doApply(solveHSV, hsv);
	} else {
		tmp = currentColor.slice(0, 3);
		tmp[Xindex] = parseInt(x * RGBmax);
		tmp[Yindex] = parseInt(y * RGBmax);
	}
	return tmp;
}

function selectChange(event) {
	var color = namedColors[event.target.value];
	if (typeof color != 'undefined') {
		doApply(updateColor, getRGB(color));
	}
}

function updateColor(r, g, b, input) {
	currentColor = [r, g, b];
	newColor = currentColor;
	var currentHsv = solveRGB(r, g, b),
		boxValues = currentHsv.concat(currentColor),
		hex = getHex(r, g, b);
	setPalette(hex);
	doApply(setWheel, currentHsv);
	doSetCurrent(newColor);
	if (input !== "x") {
		if(hexDisplay === "lower") {
            hexNode.value = getHex(r, g, b).toLowerCase();
        } else {
			hexNode.value = getHex(r, g, b).toUpperCase();
		}
	}
	for (var i = 0; i < inputBoxes.length; i++) {
		if (input != inputBoxes[i].id && inputBoxes[i] !== document.activeElement) {
			inputBoxes[i].value = boxValues[i];
		}
	}
	var item = namedColorItems[hex.toLowerCase()];
	if (typeof item == 'undefined') {
		document.getElementById('nce').selected = true;
	} else {
		item.selected = true;
	}
	doApply(drawPanel, currentColor);
}

function getInFormat(hexValue, copyFormat) {
	let rgb = getRGB(hexValue);
	let r = rgb[0], g = rgb[1], b = rgb[2];
	let hsl = getHSL(r, g, b);
	let h = Math.round(hsl[0]), s = Math.round(hsl[1]), l = Math.round(hsl[2]);
	switch (copyFormat) {
		case "hex-upper-1":
			return hexValue.toUpperCase();
		case "hex-lower-1":
			return hexValue.toLowerCase();
		case "hex-upper-2":
			return hexValue.toUpperCase().replace("#", "");
		case "hex-lower-2":
			return hexValue.toLowerCase().replace("#", "");
		case "rgb-2":
			r = Math.round(r / 255 * 100);
			g = Math.round(g / 255 * 100);
			b = Math.round(b / 255 * 100);
			return `rgb(${r}%, ${g}%, ${b}%)`;
		case "rgb-1":
			return `rgb(${r}, ${g}, ${b})`;
		case "rgba-2":
			r = Math.round(r / 255 * 100);
			g = Math.round(g / 255 * 100);
			b = Math.round(b / 255 * 100);
			return `rgba(${r}%, ${g}%, ${b}%, 1)`;
		case "rgba-1":
			return `rgba(${r}, ${g}, ${b}, 1)`;
		case "hsl":
			return `hsl(${h}, ${s}%, ${l}%)`;
		case "hsla":
			return `hsla(${h}, ${s}%, ${l}%, 1)`;
		default:
			return hexValue;
	}
}