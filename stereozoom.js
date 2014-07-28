"use strict";

// Size of both viewers
var viewersize;

var imgurl;

// Size of half of original image, no scaling
var imgsize;

var zoomfactor = 1;

// Position of top left corner of the imagewrapper in a viewer
var position = new Pair(0,0); 
var push = 0;

var mousestart = null;
var mousedrag = new Pair(0,0);

var leftwrapper;
var rightwrapper;
var wrappers;

$( document ).ready(function() {
	leftwrapper = $("#leftwrapper");
	rightwrapper = $("#rightwrapper");
	wrappers = $("#leftwrapper, #rightwrapper");

	$(document).keypress(function(e){
		switch (e.which) {
		case 43: doZoomIn(1); break; // +
		case 45: doZoomOut(1); break; // -
		case 49: doZoom1(); break; // 1
		case 97: doPush(); break; // a
		case 102: doZoomFit(); break; // f
		case 115: doSwap(); break; // s
		case 122: doPull(); break; // z
		default: console.log(e.type, e.which);
		}
	});

	wrappers.mousedown(function(e){
		mousestart = new Pair(e.screenX, e.screenY);
		wrappers.addClass("notransition");
	});

	wrappers.mousemove(function(e){
		if (!mousestart) return;
		mousedrag = new Pair(e.screenX, e.screenY).subtract(mousestart);
		redraw();
	});

	wrappers.bind("mousewheel", function(e){
		var delta = e.originalEvent.wheelDelta / 120;
		if (delta > 0) {
			doZoomIn(delta);
		} else if (delta < 0) {
			doZoomOut(-delta);
		}
	});

	$(document).mouseup(function(e){
		mousestart = null;
		position = position.add(mousedrag);
		mousedrag = new Pair(0,0);
		wrappers.removeClass("notransition");
	});

	$( window ).resize(function() {
	  handleResize();
	});

	handleResize();

	$("#right").append($("#lefttoolbox").clone().attr("id", "righttoolbox"));

	var x = $("#lefttoolbox, #righttoolbox");
	x.mouseover(function() {
		x.css("opacity", 1);
	});
	x.mouseout(function() {
		x.css("opacity", 0);
	});

	$(window).bind( 'hashchange', function(){readHash();});
	readHash();
	//loadImage("http://th06.deviantart.net/fs50/PRE/f/2009/260/d/a/Stereo_Cross_View_of_a_park_3D_by_zour.jpg");
});

var doZoomIn = function(factor) {zoom(1.25 * factor); redraw();};
var doZoomOut = function(factor) {zoom(.8 * factor); redraw();};
var doZoom1 = function() {push = 0; zoomTo(1); redraw(); };
var doZoomFit = function() {push = 0; zoomToFit();};
var doPush = function() {push += 10; redraw();};
var doPull = function() {push -= 10; redraw();};
var doSwap = function() {$("#viewer").toggleClass("swapped");};

var readHash = function() {
    var qs = document.location.hash.substring(1);
 	if (!qs) {
 		qs = "crossview.jpg"
 	}
	
	loadImage(qs);
 }

var loadImage = function(url) {
	$("#leftwrapper, #rightwrapper").fadeOut();
	imgurl = url;

	$("<img/>") // Make in memory copy of image to avoid css issues
    .attr("src", imgurl)
    .load(function() {
		imgsize = new Pair(this.width/2, this.height);
		$("#leftimg, #rightimg").attr("src", imgurl);
		$("#leftwrapper, #rightwrapper").fadeIn();
		//wrappers.css("width", (imgsize.w)+"px");
		//wrappers.css("height", imgsize.h+"px");
		zoomToFit();
    })
    .error(function(event){
    	alert("Couldn't load image. Try another?")
    })
    .finish(function(){
    	console.log("Finished."); // TODO
    });
}

var handleResize = function(){
	var aviewer = $("#left");
	var oldviewersize = viewersize;
	viewersize = new Pair(aviewer.width(), aviewer.height());

	if (oldviewersize) {
		var distance = oldviewersize.subtract(viewersize).divide(2);
		var scale = viewersize.divide(oldviewersize).divide(2);
		zoom(scale.x + scale.y);
		position = position.subtract(distance);
		redraw();	
	}
}

var redraw = function(){
	leftwrapper.css("width", (imgsize.w*zoomfactor)+"px");
	leftwrapper.css("height", (imgsize.h*zoomfactor)+"px");
	rightwrapper.css("width", (imgsize.w*zoomfactor)+"px");
	rightwrapper.css("height", (imgsize.h*zoomfactor)+"px");

	leftwrapper.css("top", (position.y + mousedrag.y)+"px");
	leftwrapper.css("left", (position.x + mousedrag.x + push)+"px");
	rightwrapper.css("top", (position.y + mousedrag.y)+"px");
	rightwrapper.css("left", (position.x + mousedrag.x - push)+"px");
}

var zoom = function(factor) {
	zoomfactor *= factor;
	var distance = viewersize.divide(2).subtract(position).multiply(factor-1);
	position = position.subtract(distance);
	redraw();	
}
var zoomTo = function(factor) {
	zoom(factor/zoomfactor);
}
var zoomToFit = function(percent){
	var zoomw = viewersize.w / imgsize.w;
	var zoomh = viewersize.h / imgsize.h;
	zoomfactor = Math.min(zoomw, zoomh);
	zoom(1);
	position = viewersize.subtract((imgsize.multiply(zoomfactor))).divide(2);
	//leftposition = new Pair(viewersize.w - (imgsize.w/2*zoom), viewersize.h/2);
	//rightposition = new Pair(imgsize.w/2*zoom, viewersize.h/2);
	redraw();
}

function Pair(a, b) {
	this.a = a;
	this.b = b;
	this.x = a;
	this.y = b;
	this.w = a;
	this.h = b;
}
Pair.prototype.add = function(c) {
	if (c instanceof Pair) {
	return new Pair(this.a + c.a, this.b + c.b);
	}
	return new Pair(this.a + c, this.b + c);
}
Pair.prototype.subtract = function(c) {
	if (c instanceof Pair) {
	return new Pair(this.a - c.a, this.b - c.b);
	}
	return new Pair(this.a - c, this.b - c);
}
Pair.prototype.multiply = function(m) {
	return new Pair(this.a * m, this.b * m);
}
Pair.prototype.divide = function(c) {
	if (c instanceof Pair) {
	return new Pair(this.a / c.a, this.b / c.b);
	}
	return new Pair(this.a / c, this.b / c);
}
