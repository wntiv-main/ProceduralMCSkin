// DO NOT EDIT THIS UNLESS YOU KNOW WHAT YOU ARE DOING, line 55 is for you
import {
	SkinViewer,
	IdleAnimation
} from "skinview3d"
import {
	Skin,
	Gradient,
	copyToClipboard
} from "./skin.js"
import {
	noise
} from "./perlin.js"
import * as THREE from "three"

//#region NOEDIT
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
//#endregion NOEDIT
// EDIT PAST HERE

function opal(i, o) {
	// Scale noise with this function
	var scaler = Math.sqrt; // Math.sqrt will increase the chance of higher tones
	if (!i.isOverlay) {
		// Scaled world pos, for less noisy noise
		var swp = vec3.scale(i.worldPos, 0.08);
		// Get the r, g, and b noise values
		var rNoise = scaler(noise(swp.x, swp.y, swp.z));
		var gNoise = scaler(noise(swp.x + 100, swp.y, swp.z));
		var bNoise = scaler(noise(swp.x, swp.y + 100, swp.z));
		// output color
		o.color = vec4(rNoise, gNoise, bNoise, 1);
		// Overlay color is white with transparency based on a fourth noise layer
		// and inverse scaled by the distance to the centre of the face to make the
		// edges of the faces likely to have more transparency.
		var distToCenter = vec2.subtract(i.relativePos, vec2.scale(i.faceBoundingBox, 0.5)).length() / (i.faceBoundingBox.length() / 2);
		o.overlayColor = vec4(vec3(1), noise(swp.x, swp.y, swp.z + 100) * (1 - distToCenter / 2));
	}
}

// Create a gradient with a color stop at each end
var fire = new Gradient();
fire.addColorStop(new Gradient.ColorStop(vec4(248, 148, 0, 1), 0));
fire.addColorStop(new Gradient.ColorStop(vec4(149, 15, 0, 1), 1));
// Gradients can be used with gradient.calculateColor(percentage)
// gradient.calculateColor expects a decimal value from 0 - 1 and will return the
// blended color at that coordinate along the gradient.

// This library works by executing multiple "shaders" on a HTML5 canvas
// You can have multiple passes, and each pass has access to the output of the previous pass
// This allows for post-process effects such as blur, color manipulation (contrast, hue shift, etc)

// skin.executeShader(opal);

skin.executeShader((i, o) => {
	// This function gets called once for every pixel of the skin
	// a shader program has access to a bunch of input and output objects, stored in i and o
	if (!i.isOverlay) { // i.isOverlay is whether we are on the base layer or overlay layer
		// Generally when you are using o.overlayColor you will want to avoid writing
		// onto the overlay layer otherwise, hence if(!i.isOverlay)

		// In the input (i) you have the following values:
		// limb: the currently rendering limb, one of Skin.entity.HEAD, Skin.entity.BODY, etc
		// faceID: the current face identifier as a string in the format "(sign)(axis)", i.e. one of -x +x -y +y -z +z
		// normalVector: the normal vector of the current face
		// isOverlay: are we currently on the overlay layer,
		// relativePos: the current position relative to this face as a vec2,
		// faceBoundingBox: the size of the current face as a vec2,
		// atlasPos: the position on the texture atlas (i.e. the position on the output skin file)),
		// worldPos: the position of the pixel in world space, useful if you want to use something
		//			 like noise and you want the texture to connect across edges
		// readFromAtlas(pos): a function to read any pixel color from the texture atlas. This only reads colors
		//					   from the previous pass

		// In the output (o) you have the following values:
		// color: the color that this pixel should be, initialised with the color
		//		  from the previous pass or vec4(0)
		// overlayColor: the color that the overlay should be at this pixel
		//				 not available on the overlay layer, initialised with
		//				 the color at this pixel on the overlay from the previous pass or vec4(0)
		// writeToAtlas(color, pos): write a given color to any pixel on the texture atlas
		//							 this function is untested and may break things

		// Get the rainbow gradient, and with an offset
		var grad1 = Gradient.rainbow.calculateColor((0.5 + skin.linearGradient(i.worldPos, vec3(0, -1, 0))) % 1);
		var grad2 = Gradient.rainbow.calculateColor(skin.linearGradient(i.worldPos, vec3(0, -1, 0)));
		o.color = grad1;
		o.overlayColor = grad2;
		if (Math.random() < 0.5) {
			o.color = grad2;
			o.overlayColor = vec4(0);
		}
	}
});


// shader function to blur faces
function blur(i, o) {
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