// ==UserScript==
// @name          Flickr Thumbnails Enhancer
// @description	  Adds more information (comments, notes) to lists of thumbnails on Flickr
// @namespace     http://www.rhyley.org/gm/
// @include       http://*flickr.com/photos/*
// @include       http://*flickr.com/groups/*
// @exclude       http://*flickr.com/photos/*/sets/*/comments/

//    By Jason Rhyley (www.rhyley.org)
//       Feel free to contact me if you have suggestions or questions.
//       I reserve the right to make fun of your grammar if you do.
//    Icons by Michael Angeles (Flickr member jibbajabba).
//       See http://urlgreyhot.com/personal/resources/mini_icons

// @author Jason Rhyley
// @enabledbydefault true
// @homepage http://www.rhyley.org/posts/962/
// ==/UserScript==

(function() {

archivePage = 0;
allDivs = document.evaluate("//p[@class='StreamList']",document,null,XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,null);

doFavsOrSet = function() {
	document.evaluate("//p[@class='StreamList']",document,null,XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,null);
	for (var i = 0; i < allDivs.length; i++) {
		thisDiv = allDivs[i];
		newDiv = document.createElement('div');
		newDiv.setAttribute('style','float:left;break:none;height:86px;width:78px;line-height:9px;padding:3;text-align:center');
		newDiv.setAttribute('class','gm_div');
		newDiv.innerHTML = '<a href="' + thisDiv.href + '" title="' + thisDiv.title + '">' + thisDiv.innerHTML + '</a><br>&nbsp;';
		thisDiv.parentNode.replaceChild(newDiv,thisDiv);
	}
	allDivs = document.evaluate("//div[@class='gm_div']",document,null,XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,null);
}

while (allDivs.snapshotLength==0) {
	if (location.pathname.match('/tags')) {
		allDivs = document.evaluate("//p[@class='UserTagList']",document,null,XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,null);
		break;
	}

	if (location.pathname.match('/groups')) {
		allDivs = document.evaluate("//p[@class='PoolList']",document,null,XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,null);
		break;
	}

	if (location.pathname.match('/archives')) {
		allDivs = document.evaluate("//table[@class='ArchiveDisplay']",document,null,XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,null);
		if (allDivs.snapshotLength!=0) { 
			allDivs = allDivs.snapshotItem(0)
			allDivs = document.evaluate("//p",allDivs,null,XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,null);
			archivePage = 1;
		}
		break;
	}
	if (location.pathname.match('/favorites')) {
		allDivs = document.getElementById('favoriteThumbs');
		if (allDivs) {
			var br = document.createElement('br');
			br.setAttribute('clear', 'all');
			allDivs.parentNode.insertBefore(br,allDivs.nextSibling);
			allDivs = allDivs.getElementsByTagName("a");
			doFavsOrSet();
		}
		break;
	}
	if (location.pathname.match('/sets')) {
		allDivs = document.getElementById('setThumbs');
		if (allDivs) {
			allDivs = allDivs.getElementsByTagName("a");
			doFavsOrSet();
		}
		break;
	}
	else break;
}


if (allDivs && allDivs.snapshotLength!=0) {

	gmPhotos = new Array();
	for (var i = 0; i < allDivs.snapshotLength; i++) {
	    thisDiv = allDivs.snapshotItem(i);
	    youareell = thisDiv.getElementsByTagName('a')[0].href;
	    gmPhotos[i] = new Object();
	    gmPhotos[i].id = youareell.split('/')[5];
	    gmPhotos[i].secret = document.evaluate("//img",thisDiv,null,XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,null).snapshotItem(0).src.split('_')[1];
	    gmPhotos[i].user_url = youareell.split('/')[4];
	}


	loadDeets = function(num){
	   if (num<gmPhotos.length) {
	   
	   	GM_xmlhttpRequest({
	   	    method: 'GET',
	   	    url: 'http://www.flickr.com/services/rest/?method=flickr.photos.getInfo&photo_id=' + gmPhotos[num].id + '&secret=' + gmPhotos[num].secret + '&api_key=f11993eae97a85c2579a0ffa82adf265',
	   	    headers: {
	   	        'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
	   	        'Accept': 'application/atom+xml,application/xml,text/xml',
	   	    },
		    onload: function(responseDetails) {
		    	doc = responseDetails.responseText;
			gmPhotos[num].comments = doc.split('<comments>')[1].split('</comments>')[0];
			gmPhotos[num].notes = doc.split('<note ').length - 1;
			
			doEnhance(num);
			num++;
			loadDeets(num);
		    }
		});
	   }
	}

	head = document.getElementsByTagName('head')[0];
	if (!head) { return; }
	style = document.createElement('style');
	style.type = 'text/css';
	css = '.gm_icon {border:0; margin-left:2px; margin-right:4px; vertical-align:middle}';
	css += '.gm_small { color:#777 !important; text-decoration:none !important; font-size:.9em; white-space: nowrap;}';
	css += '.gm_small:hover { color:#fff !important;}';
	css += '.gm_ArchiveDisplay { padding-bottom:0px !important;}';
	css += '.gm_ArchiveDisplay * { padding-bottom:0px !important; margin-bottom:0px !important;}';
	css += '.gm_ArchiveDisplay * { font-size:10px; line-height:12px; }';
	
	style.innerHTML = css;
	head.appendChild(style);

	comments_icon = '<img src="data:image/gif;base64,R0lGODlhCAAHAJEDAGdnZ97e3d7d3f///yH5BAEAAAMALAAAAAAIAAcAAAISHI4WsnsBIHuhToPO2GB7820FADs=" class="gm_icon" width="8" height="7" alt="comments">'
	notes_icon = '<img src="data:image/gif;base64,R0lGODlhBwAJAKIFAGdnZ97d3d7e3fLy8mZmZv///wAAAAAAACH5BAEAAAUALAAAAAAHAAkAAAMcCARcRWEA+UYAcUXG7RAX9gmC4gXBIowpRyxAAgA7" class="gm_icon" width="7" height="9" alt="notes">'

	doEnhance = function(thisOne) {
	    thisDiv = allDivs.snapshotItem(thisOne);
	    thisOne = gmPhotos[thisOne];
	    out = (archivePage) ? '<br>' : '';
	    write = 0;

	    title = '';
	    if (thisOne.comments!=0){
		out += thisOne.comments + comments_icon;
		title += (thisOne.comments>1) ? thisOne.comments + ' comments' : thisOne.comments + ' comment';
		write++;
	    }
	    if (thisOne.notes!=0){
		out += thisOne.notes + notes_icon;
		title += (title) ? ', ' : ' ';
		title += (thisOne.notes!=0) ? thisOne.notes + ' notes' : thisOne.notes + ' note';
		write++;
	    }

	    if(write) {
		    deets = document.createElement('a');
		    deets.setAttribute('class','gm_small');
		    deets.setAttribute('href','/photos/' + thisOne.user_url + '/' + thisOne.id);
		    deets.setAttribute('title', title);
		    deets.innerHTML = out;
		    thisDiv.appendChild(deets);
	    }
	    if (archivePage && write) thisDiv.setAttribute('class','gm_ArchiveDisplay');
	    //if (thisDiv.className == "gm_div") thisDiv.setAttribute('style','float:left;break:none;line-height:9px;padding-bottom:0px;text-align:center');
	}

	if (allDivs.snapshotLength) loadDeets(0);

}

})();