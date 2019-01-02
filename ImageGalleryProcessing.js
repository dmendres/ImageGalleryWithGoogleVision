
function gvAnalyzeImage(srcUrl) {
	var requestBody = {
		requests : [
			{
			image : {
				source : {
					imageUri : ""
				}
			},
			features : [
			]
		}]
	}
	// what feature checkboxes?
	requestedFeatures = getRequestedFeatures();
	if (requestedFeatures.objectLocalization) {
		requestBody.requests[0].features.push(
			{
			type : "OBJECT_LOCALIZATION"
			})
	}
	if (requestedFeatures.textAnnotations) {
		requestBody.requests[0].features.push(
			{
			type : "TEXT_DETECTION"
			})
	}
	if (requestedFeatures.faceAnnotations) {
		requestBody.requests[0].features.push(
			{
			type : "FACE_DETECTION"
			})
	}
	if (requestedFeatures.logoAnnotations) {
		requestBody.requests[0].features.push(
			{
			type : "LOGO_DETECTION"
			})
	}
	if (requestedFeatures.landmarkAnnotations) {
		requestBody.requests[0].features.push(
			{
			type : "LANDMARK_DETECTION"
			})
	}
	if (requestedFeatures.labelAnnotations) {
		requestBody.requests[0].features.push(
			{
			type : "LABEL_DETECTION"
			})
	}

	requestBody.requests[0].image.source.imageUri = srcUrl;
	// fire off the GV request, results analyzed in analysis methods
	gvHttpRequest(requestBody);
}

function processGVResults(responses) {
	responses != null && responses.forEach(function(resp) {
		if (hasProperty(resp, 'textAnnotations')) {
			displayTextAnnotations(resp.textAnnotations);
		}
		if (hasProperty(resp, 'localizedObjectAnnotations')) {
			displayLocalizedObjectInfo(resp.localizedObjectAnnotations);
		}
		if (hasProperty(resp, 'faceAnnotations')) {
			displayFaceAnnotations(resp.faceAnnotations);
		}
		if (hasProperty(resp,"labelAnnotations")) {
			displayKeywordAnnotations(resp.labelAnnotations);
		}
		if (hasProperty(resp, 'landmarkAnnotations')) {
			displayLandmarkAnnotations(resp.landmarkAnnotations);
		}
		if (hasProperty(resp, 'logoAnnotations')) {
			displayLogoAnnotations(resp.logoAnnotations);
		}
	})
}

function displayErrorInfo(resp) {
	var errorInfoTexts = [];
	var errorInfoCodes = [];
	for (aIndex = 0; aIndex < resp.length; aIndex++) {
		if (hasProperty(resp[0],'error')) {
			errorInfo = resp[aIndex].error
			if (errorInfo !== null) {
				errorInfoTexts.push(errorInfo.message); 
				errorInfoCodes.push(errorInfo.code);
			}
		}
	}
	if (errorInfoTexts.length > 0) {
		var displayText = '';
		errorInfoTexts.forEach(function(errorInfo, eiIndex) {
			displayText += 'Error code: ' + errorInfoCodes[eiIndex].toString() +
						': ' + errorInfo;
		});
		displayRequestFail(displayText);
	}
}

function collectEntityAnnotations(entityAnnotations) {
	var annotationText = '';

	entityAnnotations != null && entityAnnotations.forEach(function(ea, eaIndex) {
		annotationText += ea.description;
		if (eaIndex < entityAnnotations.length - 1) {
			annotationText += ", ";
		}
	})
	return annotationText;
}
function displayLogoAnnotations(logoAnnotations) {
	logoText = collectEntityAnnotations(logoAnnotations);
	presentAnnotations(logoText, '#logoResults');
	// now to presentation
}
function displayLandmarkAnnotations(landmarkAnnotations) {
	landmarkText = collectEntityAnnotations(landmarkAnnotations);
	presentAnnotations(landmarkText, '#landmarkResults');
	// to presentation
}
function displayKeywordAnnotations(labelAnnotations) {
	var keywordText = collectEntityAnnotations(labelAnnotations);
	presentAnnotations(keywordText, '#keywordResults'); 
}
function displayTextAnnotations(textAnnotations) {
	var annotationText = '';
	if (textAnnotations != null && textAnnotations.length > 0) {
		// 0th textAnnotation is locale (language) & description
		// use it if we are not going to plot the bounding polys
		annotationText += textAnnotations[0].description;
		// for (taIndex = 1; taIndex < textAnnotations.length; taIndex++) {	
		// 		annotationText += ' Text: ' + textAnnotations[taIndex].description;
		// 		annotationText += ' at ' + JSON.stringify(textAnnotations[taIndex].boundingPoly)  + '\n';
		// }
	}
	presentTextAnnotations(annotationText);
	
}

function displayFaceAnnotations(faceAnnotations) {
	faceAnnotations != null && faceAnnotations.forEach(function(faceAnnotation) {
		plotFaceAnnotationPoly(faceAnnotation);
	})
}
function displayLocalizedObjectInfo(objectAnnotations) {
	// var annotationText = '';
	objectAnnotations != null && objectAnnotations.forEach(function(oa) {
		// if (oa.score > 0.25) {
		// 	// color code score?
		// 	annotationText += 'There is a ' + oa.name + ' with confidence ' + oa.score.toString();
		// 	annotationText += ' at ' + JSON.stringify(oa.boundingPoly.normalizedVertices) + '\n';
		// }
		plotObjectAnnotationPolys(oa);
	})
}

function plotFaceAnnotationPoly(faceAnnotation) {
	var gvDiv = document.querySelector("#gvResults");
	var svgElement = gvDiv.querySelector("svg");
	var svgHeight = svgElement.height.baseVal.value
	var svgWidth = svgElement.width.baseVal.value

	if (hasProperty(faceAnnotation, 'boundingPoly')) {
		var vertices = faceAnnotation.boundingPoly.vertices;
		// TODO: normalized vertices are documented, but NOT PRESENT!
		var polyPointsText = '';
		vertices != null && vertices.forEach(function(vert) {
			var polyX = Math.min(vert.x,svgWidth);
			var polyY = Math.min(vert.y,svgHeight);
			polyPointsText += polyX.toString() + ',' + polyY.toString() + ' ';
		});
		plotFacePoly(polyPointsText);		
	}
}

// move to presentation? all we need svgElement for poly processing is to convert normalized to pixels
function plotObjectAnnotationPolys(oa) {

	var gvDiv = document.querySelector("#gvResults");
	var svgElement = gvDiv.querySelector("svg");
	var svgHeight = svgElement.height.baseVal.value
	var svgWidth = svgElement.width.baseVal.value

	var allAnnotations = {};

	if (hasProperty(oa, 'boundingPoly')) {
		// score threshold is kind of arbitrary
		const SCORE_THRESHOLD = 0.25;
		if (oa.score > SCORE_THRESHOLD) {
			var vertices = oa.boundingPoly.normalizedVertices;
			var polyPointsText = '';
			var firstPolyX, firstPolyY;
			vertices != null && vertices.forEach(function(vert, vi) {
				var polyX = Math.trunc(vert.x * svgWidth);
				var polyY = Math.trunc(vert.y * svgHeight);
				polyPointsText += polyX.toString() + ',' + polyY.toString() + ' ';
				if (vi === 0) {
					firstPolyX = polyX;
					firstPolyY = polyY;
				}
			})

			plotAnnotationPoly(polyPointsText);
			
			// process the annotation text, watch for overlays at same location!
			textLocKey = "x" + firstPolyX.toString() + "y" + firstPolyY.toString();
			if (! hasProperty(allAnnotations, textLocKey)) {
				// new location
				allAnnotations[textLocKey] = {
					xLocText : firstPolyX.toString(),
					yLocText: firstPolyY.toString(),
					annotationText : oa.name
				} 
			} else {
				allAnnotations[textLocKey].annotationText += ", " + objectAnnotations[loaIndex].name;
			}
		}
	}
	plotAnnotationTexts(allAnnotations);
}
function plotTextPoly(resp) {
	// not implemented
}	

function hasProperty(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
}