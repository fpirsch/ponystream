/**
 * PonyStream
 * https://github.com/fpirsch/ponystream
 */

/* jshint browser: true */
/* global Promise */

var PonyStream = (function() {
    var images, width, height, anim, self;
    var replacePonies = true;

    var ponies = [
        'ponies/af.gif',
        'ponies/bm.gif',
        'ponies/cc.gif',
        'ponies/cs.gif',
        'ponies/dl.gif',
        'ponies/ib.gif',
        'ponies/jl.gif',
        'ponies/km.gif',
        'ponies/kr.gif',
        'ponies/lw.gif',
        'ponies/mk.gif',
        'ponies/mt.gif',
        'ponies/mu.gif',
        'ponies/ni.gif',
        'ponies/nk.gif',
        'ponies/rs.gif',
        'ponies/tj.gif',
        'ponies/tl.gif',
        'ponies/zf.gif'
    ];

    var rightTrack = {
        node: undefined,
        width: 0,
        ponyCount: 0,
        ponySizes: [],
        position: 0
    };
    
    var leftTrack = {
        node: undefined,
        width: 0,
        ponyCount: 0,
        ponySizes: [],
        position: 0
    };
    

    function prefixProperty(property) {
        // In case document.body doesn't exist yet (depends when we run this code)
        var dummyStyle = document.documentElement.style;
        if (property in dummyStyle) { return property; }
        var prefixes = ['webkit', 'Moz', 'ms', 'O'];
        property = property.charAt(0).toUpperCase() + property.substr(1);
        for (var i = 0; i < prefixes.length; i++) {
            var p = prefixes[i] + property;
            if (p in dummyStyle) {
                return p;
            }
        }
    }
    
    var prefixedTransform = prefixProperty('transform');

    // Loading
    function load(urls) {
        urls = urls || ponies;
        var promises = [];
        images = [];
        height = 0;
        
        function load(i) {
            return function(resolve, reject) {
                var img = new Image();
                img.onload = function() {
                    if (img.height > height) { height = img.height; }
                    resolve();
                };
                img.onerror = reject;
                img.src = urls[i];
                images[i] = img;
            };
        }
        
        for (var i = 0; i < urls.length; i++) {
            promises.push(new Promise(load(i)));
        }
        return Promise.all(promises).then(function(){
            self.loaded = true;
        });
    }
    
    function random(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    function breedPony() {
        var img = random(images);
        var pony = document.createElement('img');
        pony.src = img.src;
        pony.width = img.width;
        pony.height = img.height;
        var distance = self.minDistance + Math.floor(Math.random() * (self.maxDistance - self.minDistance));
        if (distance > 0) {
            pony.style.margin = '0 ' + distance + 'px 0 0';
        }
        return {
            body: pony,
            width: pony.width + distance
        };
    }
    
    function maybeAddPonies(track) {
        while (track.position > track.width) {
            var myPony = breedPony();
            track.node.appendChild(myPony.body);
            track.width += myPony.width;
            track.ponyCount++;
            track.ponySizes.push(myPony.width);
        }
    }
    
    function maybeRemovePonies(track) {
        var ponySize;
        while (track.position >= width + (ponySize = track.ponySizes[0])) {
            track.node.removeChild(track.node.firstChild);
            track.width -= ponySize;
            track.ponyCount--;
            track.ponySizes.shift();
            track.position -= ponySize;
        }
    }
    
    function nextFrame() {
        rightTrack.position += self.speed;
        leftTrack.position += self.speed;
        
        // Some ponies escape
        maybeRemovePonies(leftTrack);
        maybeRemovePonies(rightTrack);

        // Some ponies come in
        if (replacePonies) {
            maybeAddPonies(rightTrack);
            maybeAddPonies(leftTrack);
        }

        rightTrack.node.style.transform = 'scaleX(-1) translateX(' + (width - rightTrack.position) + 'px)';
        leftTrack.node.style.transform = 'translateX(' + (width - leftTrack.position) + 'px)';
        if (rightTrack.ponyCount > 0 || leftTrack.ponyCount > 0) {
            anim = requestAnimationFrame(nextFrame);
        }
        else {
            anim = undefined;
        }
    }

    function newTrack(right) {
        var track = document.createElement('div');
        track.style.position = 'absolute';
        track.style.left = 0;
        track.style.right = 0;
        track.style.bottom = 0;
        track.style.height = height + 'px';
        var scale = right ? 'scaleX(-1) ' : '';
        track.style[prefixedTransform] = scale + 'translateX(' + width + 'px)';
        track.style.whiteSpace = 'nowrap';
        track.style.pointerEvents = 'none';
        return track;
    }
    
    function start(container) {
        container = container || document.body;
        if (!images) {
            throw new Error('PonyStream: please load images first');
        }
        if (!rightTrack.node) {
            width = container.getBoundingClientRect().width;
            if (width === 0) { return; }            // oups, on n'est pas affiché
            container.appendChild(rightTrack.node = newTrack(true));
            container.appendChild(leftTrack.node = newTrack());
        }
        if (!anim) {
            replacePonies = true;
            rightTrack.ponyCount = 0;
            rightTrack.ponySizes.length = 0;
            rightTrack.width = 0;
            rightTrack.position = 0;
            leftTrack.ponyCount = 0;
            leftTrack.ponySizes.length = 0;
            leftTrack.width = 0;
            leftTrack.position = 0;
            anim = requestAnimationFrame(nextFrame);
        }
    }
    
    function toggle(container) {
        if (anim) {
            replacePonies = false;
        }
        else {
            start(container);
        }
    }
    
    self = {
        speed: 2,                           // in px per frame
        minDistance: 0,                     // in pixels between ponies
        maxDistance: 80,                    // in pixels between ponies
        load: load,
        loaded: false,
        start: start,
        stop: function() { replacePonies = false; },
        toggle: toggle,
        version: "1.0.0",
        pause: function() { cancelAnimationFrame(anim); }
    };
    
    return self;
}());