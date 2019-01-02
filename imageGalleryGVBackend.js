function gvHttpRequest(requestBody) {
	var http = new XMLHttpRequest();
	var serviceUrl = 'https://vision.googleapis.com/v1/images:annotate?key=' + apiKey
	var method = 'POST';
	http.onreadystatechange = function() {
		handleReadyStateChanged(http);
	} 

	http.open(method, serviceUrl);
	http.setRequestHeader('Content-Type', 'application/json');
	http.send(JSON.stringify(requestBody));
}

function handleReadyStateChanged(http) {
	if (http.readyState === XMLHttpRequest.DONE && http.status === 200) {
		console.log('REQUEST ok');
		responses = JSON.parse(http.responseText).responses;
		// error response?
		if (hasProperty(responses[0], "error")) {
			displayErrorInfo(responses);
		} else {
			processGVResults(responses);
		}
	} else if (http.readyState === XMLHttpRequest.DONE && http.status != 200) {
		errorText = 'ERROR: ' + http.status + ' ' + http.responseText;
		console.log(errorText);
		displayRequestFail(errorText);
	}
    gvDiv = document.querySelector("#gvResults");
    gvDiv.scrollIntoView(true);
}


