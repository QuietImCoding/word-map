var layers = [];
var svg;
var wordInput;
var width = window.innerWidth;
var height = window.innerHeight;
var anim;

var moveLayers = function() {
    for(var i = 0 ; i < layers.length; i++) {
	dx = Math.cos(layers[i].content.length)/2;
	dy = Math.sin(layers[i].content.length)/2;
	//console.log(dx + dy);
	layers[i].node.setAttribute("x", parseFloat(layers[i].node.getAttribute("x")) + dx);
	layers[i].node.setAttribute("y", parseFloat(layers[i].node.getAttribute("y")) + dy);
    }
    anim = window.requestAnimationFrame(moveLayers);
};

var makeKiddos = function(info) {
    if (info == null) return(null);
    var parent = info.parent;
    var words = info.wordList;
    words = words.filter (function (value, index, array) { 
	return array.indexOf (value) == index;
    });
    var newLayerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    newLayerGroup.id = layers.length;
    
    var angle = 2 * Math.PI / words.length;
    var cover = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    cover.setAttribute("cx", parseFloat(parent.getAttribute("x")));
    cover.setAttribute("cy", parseFloat(parent.getAttribute("y")));
    cover.setAttribute("r", 13 * Math.max(...words.map(function(word) {return(word.length);})));
    cover.setAttribute("fill", "rgba(0,0,0,0.4)");
    //newLayerGroup.appendChild(cover);
    for (var i = 0 ; i < words.length; i++) {
	var newTextNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
	var distance = 13 * words[i].length;
	var hue = 360 / 7 * (i % 7);
	newTextNode.setAttribute("text-anchor", "middle");
	newTextNode.setAttribute("x", parseFloat(parent.getAttribute("x")) + (distance * Math.cos(i * angle)));
	newTextNode.setAttribute("y", parseFloat(parent.getAttribute("y")) + (distance * Math.sin(i * angle)));
	newTextNode.setAttribute("fill", "hsl(" + hue + ", 95%, 80%)");//"white");
	newTextNode.setAttribute("font-family", "Poppins");
	newTextNode.textContent = words[i];
	layers.push({x:newTextNode.getAttribute("x"), y:newTextNode.getAttribute("y"), content: newTextNode.textContent, node: newTextNode});
	newTextNode.onclick = getNodeForWord;
	newLayerGroup.appendChild(newTextNode);
    }
    svg.appendChild(newLayerGroup);
    //layers.push(newLayerGroup);
    return(newLayerGroup);
};

var responseParse = function(parent, resp) {
    var parsed = JSON.parse(resp);
    try {
	var def = parsed.results[0].senses[0].definition;
    } catch (e) {
	console.log("Word not found");
	return(null);
    }
    console.log(def);
    return({parent:parent, wordList:def.split(" ")});
};

var getNodeForWord = function(word) {
    //console.log(layers.length);
    if (layers.length == 0) {
	var newTextNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
	newTextNode.setAttribute("text-anchor", "middle");
	newTextNode.setAttribute("x", width/2);
	newTextNode.setAttribute("y", height/2);
	newTextNode.setAttribute("fill", "white");
	newTextNode.setAttribute("font-family", "Poppins");
	newTextNode.textContent = word;
	layers.push({x:newTextNode.getAttribute("x"), y:newTextNode.getAttribute("y"), content: newTextNode.textContent, node: newTextNode});
	return(newTextNode);
    } else {
	var parent = word.target;
	var httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = function() {
	    if(httpRequest.readyState === XMLHttpRequest.DONE && httpRequest.status == 200) {
		makeKiddos(responseParse(parent, httpRequest.responseText));
	    }
	};
	httpRequest.open("GET", "http://api.pearson.com/v2/dictionaries/laad3/entries?headword=" + parent.textContent);
	httpRequest.send();
    }
};

var createMap = function() {
    layers = [];
    while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
    }
    window.cancelAnimationFrame(anim);
    var newNode = getNodeForWord(wordInput.value);
    newNode.onclick = getNodeForWord;
    svg.appendChild(newNode);
    moveLayers();
}

var setup = function() {
    svg = document.getElementById("surface");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    wordInput = document.getElementById("word");
    wordInput.oninput = createMap;
};

window.onload = setup;
