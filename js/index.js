import {
	SkinViewer,
	IdleAnimation
} from "skinview3d"
import {
	Skin,
	Gradient
} from "./skin.js"
import {
	noise
} from "./perlin.js"
import * as THREE from "three"

let skinViewer = new SkinViewer({
	canvas: document.getElementById("skinViewer"),
	width: 800,
	height: 600
});
skinViewer.animation = new IdleAnimation();
skinViewer.loadPanorama("https://bs-community.github.io/skinview3d/img/panorama.png");
// for (var part of ["body", "leftLeg", "rightLeg", "leftArm", "rightArm"]) {
// 	skinViewer.playerObject.skin[part].visible = false;
// }
// skinViewer.cameraLight.intensity = 0.9;
window.skinViewer = skinViewer;

var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d", {
	willReadFrequently: true,
	desynchronized: true
});
c.renderTarget = document.getElementById("fakeCanvas");

document.getElementById("getURL").addEventListener("click", function () {
	copyToClipboard(canvas.toDataURL());
	alert("Copied to clipboard i think!");
	// yes very much good effort user interface
});

var skin = new Skin(c, true);
skin.onProgress = percent => {
	document.getElementById("progressBar").value = Math.floor(percent * 1000);
}
skin.onComplete = () => {
	c.renderTarget.src = canvas.toDataURL();
	skinViewer.loadSkin(canvas.toDataURL());
}

function opal(i, o) {
	var scaler = Math.sqrt;
	if (!i.isOverlay) {
		var swp = vec3.scale(i.worldPos, 0.08);
		var nval1 = scaler(noise(swp.x, swp.y, swp.z));
		var nval2 = scaler(noise(swp.x + 100, swp.y, swp.z));
		var nval3 = scaler(noise(swp.x, swp.y + 100, swp.z));
		o.color = vec4(nval1, nval2, nval3, 1);
		var distToCenter = vec2.subtract(i.relativePos, vec2.scale(i.faceBoundingBox, 0.5)).length() / (i.faceBoundingBox.length() / 2);
		o.overlayColor = vec4(vec3(1), noise(swp.x, swp.y, swp.z + 100) * (1 - distToCenter / 2));
	}
}

var forestHue = new Gradient();

forestHue.addColorStop(new Gradient.ColorStop(vec4(31, 255, 26, 1), 0));
forestHue.addColorStop(new Gradient.ColorStop(vec4(255, 219, 47, 1), 1));

var coolSunset = new Gradient();

coolSunset.addColorStop(new Gradient.ColorStop(vec4(255, 31, 10, 1), 0));
coolSunset.addColorStop(new Gradient.ColorStop(vec4(0, 31, 234, 1), 1));

var fire = new Gradient();
fire.addColorStop(new Gradient.ColorStop(vec4(248, 148, 0, 1), 0));
fire.addColorStop(new Gradient.ColorStop(vec4(149, 15, 0, 1), 1));

// noiseSeed("Opal");

skin.executeShader(opal);

// skin.executeShader((i, o) => {
// 	if (!i.isOverlay) {
// 		// o.color = vec4(vec2.divide(i.relativePos, i.faceBoundingBox), 0, 1);
// 		var distToCenter = vec2.subtract(vec2.add(i.relativePos, vec2(0.5)), vec2.scale(i.faceBoundingBox, 0.5)).length() / (i.faceBoundingBox.length() / 2);
// 		o.color = vec4(vec3(distToCenter), 1);
// 		// o.overlayColor = vec4(vec3(1), noise(swp.x, swp.y, swp.z + 100) * Math.min(1, 1.5 - distToCenter));
// 		// range("noise", nval);
// 		// Gradient.rainbow.calculateColor(radialGradient(i.worldPos, vec3.scale(vec3(8, 16, 8), 0.6917503296121503)));
// 		// var grad1 = coolSunset.calculateColor(linearGradient(i.worldPos, vec3(0.2, -1, 0.2)));
// 		// var grad2 = forestHue.calculateColor(linearGradient(i.worldPos, vec3(0.2, -1, 0.2)));
// 		// o.color = grad1;
// 		// o.overlayColor = grad2;
// 		// if (Math.random() > 0.7) {
// 		// 	o.color = grad2;
// 		// 	o.overlayColor = vec4(0);
// 		// }
// 	}
// });

// skin.executeShader((i, o) => {
// 	if (!i.isOverlay) {
// 		var oldColor = i.readFromAtlas(i.atlasPos);
// 		var extremes = range.extremes("noise");
// 		var nval = map_range(oldColor.x, extremes.min, extremes.max, 0, 1);
// 		o.color = fire.calculateColor(nval);
// 		if (nval > 0.5) {
// 			o.overlayColor = o.color;
// 			o.color = fire.calculateColor(1 - nval);
// 		}
// 	}
// })

var blur = (i, o) => {
	var colors = [],
		thisColor = i.readFromAtlas(i.atlasPos);
	colors.push(thisColor);
	if (i.relativePos.x > 0) {
		colors.push(i.readFromAtlas(vec2.add(i.atlasPos, vec2(-1, 0))));
	}
	if (i.relativePos.y > 0) {
		colors.push(i.readFromAtlas(vec2.add(i.atlasPos, vec2(0, -1))));
	}
	if (i.relativePos.x < i.faceBoundingBox.x - 1) {
		colors.push(i.readFromAtlas(vec2.add(i.atlasPos, vec2(1, 0))));
	}
	if (i.relativePos.y < i.faceBoundingBox.y - 1) {
		colors.push(i.readFromAtlas(vec2.add(i.atlasPos, vec2(0, 1))));
	}
	var result = vec4(0);
	for (var i = 0; i < colors.length; i++) {
		result.add(colors[i]);
	}
	result.scale(1 / colors.length);
	o.color = result;
};

// skin.executeShader(blur);