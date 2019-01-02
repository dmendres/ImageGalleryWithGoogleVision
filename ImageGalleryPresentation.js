var gvButtons = document.querySelectorAll('button');
// Use alternate method to encode this key: read from envVar or file!!!!
var apiKey = gvApiKey; // PROTECT THE API KEY: loaded from gvInit.js  outside the source tree 

// // could these be set dynamically?
// var svgHeight = 200;
// var svgWidth = 200;

for (btnIndex = 0; btnIndex < gvButtons.length; btnIndex++) {
	btn = gvButtons[btnIndex]
	btn.addEventListener('click', gvBtnListener);
}

// responds to image button clicks to fire off GV analysis
function gvBtnListener(event) {
	event.stopPropagation();
	// console.log(event)
	
	imgElement = event.currentTarget.querySelector('img');
	if (imgElement === null) {return;}
	btnImgSrc = imgElement.src;
	// console.log(btnImgSrc);
	// clear previous results


	if (btnImgSrc != null) {
		cleanGVresults();
		// re-enable container & display the selected image
		
		displaySelectedImg(btnImgSrc)

		gvAnalyzeImage(btnImgSrc);
		// console.log(features)
	}
}

// scans the feature checkboxes for requested features
function getRequestedFeatures() {
	var requestedFeatures = {
		objectLocalization: false,
		textAnnotations: false,
		faceAnnotations: false,
		logoAnnotations: false,
		landmarkAnnotations: false,
		labelAnnotations: false
	}
	filterDiv = document.querySelector('#filters');
	if (filterDiv.querySelector('input#ObjectLocalization').checked) {
			requestedFeatures.objectLocalization = true;
	}
	if (filterDiv.querySelector("input#TextAnnotations").checked) {
			requestedFeatures.textAnnotations = true;
	}
	if (filterDiv.querySelector("input#FaceAnnotations").checked) {
			requestedFeatures.faceAnnotations = true;
	}
	if (filterDiv.querySelector("input#LogoAnnotations").checked) {
			requestedFeatures.logoAnnotations = true;
	}
	if (filterDiv.querySelector("input#LandmarkAnnotations").checked) {
			requestedFeatures.landmarkAnnotations = true;
	}
	if (filterDiv.querySelector("input#LabelAnnotations").checked) {
			requestedFeatures.labelAnnotations = true;
	}
	return requestedFeatures;
}

function displaySelectedImg(imgSrc) {
	imageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image');
	imageElement.setAttributeNS("http://www.w3.org/1999/xlink", 'href', btnImgSrc);
	imageElement.setAttribute('height', '400');
	imageElement.setAttribute('width', '400');

	gvDiv = document.querySelector("#gvResults");
	gvDiv.style.display = 'inline';

	svgElement = gvDiv.querySelector('svg');
	svgElement.insertBefore(imageElement, null);
}
// clear the elements associated with previous analysis, including headings
function cleanGVresults() {
	// console.log('Clearing old feature results')
	gvDiv = document.querySelector("#gvResults");
	oldPElements = gvDiv.querySelectorAll("p");
	oldPElements != null && oldPElements.forEach(function(oldElement) {
		oldElement.remove();
	})
	svgElement = gvDiv.querySelector('svg');
	oldImageElements = svgElement.querySelectorAll('image');
	oldImageElements != null && oldImageElements.forEach(function(oldElement) {
		oldElement.remove();
	})
	oldPolyElements = svgElement.querySelectorAll('polygon');
	oldPolyElements != null && oldPolyElements.forEach(function(oldElement) {
		oldElement.remove();
	})
	oldTextElements = svgElement.querySelectorAll('text');
	oldTextElements != null && oldTextElements.forEach(function(oldElement) {
		oldElement.remove();
	})
	oldHeadings = gvDiv.querySelectorAll('h4');
	oldHeadings != null && oldHeadings.forEach(function(oldElement) {
		oldElement.style.display = 'none';
	})
	gvDiv.style.display = 'none';
}

function displayRequestFail(errorText) {
	window.alert(errorText);
}

function presentAnnotations(text, headerId) {
	if (text.length > 0) {
		var gvDiv = document.querySelector("#gvResults");
		var annotHead = gvDiv.querySelector(headerId);
		annotHead.style.display = 'inline';
		
		paraElem = document.createElement('p');
		paraElem.setAttribute('class', 'textP')
		paraElem.textContent = text;

		var allHeads = Array.from(gvDiv.querySelectorAll('h4'));
		var ahPos = allHeads.indexOf(annotHead);
		var nextHead = allHeads[ahPos+1];
		gvDiv.insertBefore(paraElem, nextHead);
	}
}

function presentTextAnnotations(annotationText) {
	// don't plot it, just displaying in a text box
	if (annotationText.length > 0) {
		gvDiv = document.querySelector("#gvResults");
		txtHead = gvDiv.querySelector("#textResults");
		txtHead.style.display = 'inline';
		paraElem = document.createElement('p');
		paraElem.setAttribute('class', 'textP')
		paraElem.textContent = '"' + annotationText + '"';
		txtHead.insertBefore(paraElem, null);
	}
	// if (annotationText.length > 0) {
	// 	annotationText += "Do you want to locate these text items?";
	// 	if (window.confirm(annotationText)) {
	// 		plotTextPoly(svgElement, resp)
	// 	}
	// }
}

function plotAnnotationPoly(polyPointsText) {
	var gvDiv = document.querySelector("#gvResults");
	var svgElement = gvDiv.querySelector("svg");
	var polyElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
	polyElement.setAttribute('points', polyPointsText);
	polyElement.setAttribute('fill', 'lightblue');
	polyElement.setAttribute('fill-opacity', .25);
	polyElement.setAttribute('stroke', 'red');
	svgElement.insertBefore(polyElement, null);
}

function plotFacePoly(polyPointsText) {
	var gvDiv = document.querySelector("#gvResults");
	var svgElement = gvDiv.querySelector("svg");
	var polyElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
	polyElement.setAttribute('points', polyPointsText);
	polyElement.setAttribute('fill', 'pink');
	polyElement.setAttribute('fill-opacity', .25);
	polyElement.setAttribute('stroke', 'orange');
	svgElement.insertBefore(polyElement, null);
}

function plotAnnotationTexts(allAnnotations) {
	var gvDiv = document.querySelector("#gvResults");
	var svgElement = gvDiv.querySelector("svg");
	for (var locKey in allAnnotations) {
		xLocText = allAnnotations[locKey].xLocText;
		yLocText = allAnnotations[locKey].yLocText;
		annotationText = allAnnotations[locKey].annotationText;
		textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		textElement.setAttribute("x", xLocText);
		textElement.setAttribute("y", yLocText);
		textElement.setAttribute("class", "small");
		textElement.setAttribute("style", "font: italic 10px serif; stroke: red; stroke-width: .1%; fill: red")
		textElement.textContent = annotationText;
		svgElement.insertBefore(textElement, null);
	}
}