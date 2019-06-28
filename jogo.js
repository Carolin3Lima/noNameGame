
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let SelectedCharacter = 1;
let XCarolPosition;
let YCarolPosition;
let XKenyPosition;
let YKenyPosition;
let XCharPosition;
let YCharPosition;
let compareCharacter = [];
let myMusic;
let Buttons = 1;
var snd = new Audio("./movesound.mp3");


function noScroll() {
    window.scrollTo(0, 0);
  }


  // add listener to disable scroll
  window.addEventListener('scroll', noScroll);

//snow

/** @license
 * DHTML Snowstorm! JavaScript-based snow for web pages
 * Making it snow on the internets since 2003. You're welcome.
 * -----------------------------------------------------------
 * Version 1.44.20131208 (Previous rev: 1.44.20131125)
 * Copyright (c) 2007, Scott Schiller. All rights reserved.
 * Code provided under the BSD License
 * http://schillmania.com/projects/snowstorm/license.txt
 */

/*jslint nomen: true, plusplus: true, sloppy: true, vars: true, white: true */
/*global window, document, navigator, clearInterval, setInterval */

var snowStorm = (function(window, document) {

    // --- common properties ---
  
    this.autoStart = true;          // Whether the snow should start automatically or not.
    this.excludeMobile = true;      // Snow is likely to be bad news for mobile phones' CPUs (and batteries.) Enable at your own risk.
    this.flakesMax = 128;           // Limit total amount of snow made (falling + sticking)
    this.flakesMaxActive = 64;      // Limit amount of snow falling at once (less = lower CPU use)
    this.animationInterval = 50;    // Theoretical "miliseconds per frame" measurement. 20 = fast + smooth, but high CPU use. 50 = more conservative, but slower
    this.useGPU = true;             // Enable transform-based hardware acceleration, reduce CPU load.
    this.className = null;          // CSS class name for further customization on snow elements
    this.excludeMobile = true;      // Snow is likely to be bad news for mobile phones' CPUs (and batteries.) By default, be nice.
    this.flakeBottom = null;        // Integer for Y axis snow limit, 0 or null for "full-screen" snow effect
    this.followMouse = false;        // Snow movement can respond to the user's mouse
    this.snowColor = '#fff';        // Don't eat (or use?) yellow snow.
    this.snowCharacter = '&bull;';  // &bull; = bullet, &middot; is square on some systems etc.
    this.snowStick = true;          // Whether or not snow should "stick" at the bottom. When off, will never collect.
    this.targetElement = null;      // element which snow will be appended to (null = document.body) - can be an element ID eg. 'myDiv', or a DOM node reference
    this.useMeltEffect = true;      // When recycling fallen snow (or rarely, when falling), have it "melt" and fade out if browser supports it
    this.useTwinkleEffect = false;  // Allow snow to randomly "flicker" in and out of view while falling
    this.usePositionFixed = false;  // true = snow does not shift vertically when scrolling. May increase CPU load, disabled by default - if enabled, used only where supported
    this.usePixelPosition = false;  // Whether to use pixel values for snow top/left vs. percentages. Auto-enabled if body is position:relative or targetElement is specified.
  
    // --- less-used bits ---
  
    this.freezeOnBlur = true;       // Only snow when the window is in focus (foreground.) Saves CPU.
    this.flakeLeftOffset = 0;       // Left margin/gutter space on edge of container (eg. browser window.) Bump up these values if seeing horizontal scrollbars.
    this.flakeRightOffset = 0;      // Right margin/gutter space on edge of container
    this.flakeWidth = 8;            // Max pixel width reserved for snow element
    this.flakeHeight = 8;           // Max pixel height reserved for snow element
    this.vMaxX = 5;                 // Maximum X velocity range for snow
    this.vMaxY = 4;                 // Maximum Y velocity range for snow
    this.zIndex = 0;                // CSS stacking order applied to each snowflake
  
    // --- "No user-serviceable parts inside" past this point, yadda yadda ---
  
    var storm = this,
    features,
    // UA sniffing and backCompat rendering mode checks for fixed position, etc.
    isIE = navigator.userAgent.match(/msie/i),
    isIE6 = navigator.userAgent.match(/msie 6/i),
    isMobile = navigator.userAgent.match(/mobile|opera m(ob|in)/i),
    isBackCompatIE = (isIE && document.compatMode === 'BackCompat'),
    noFixed = (isBackCompatIE || isIE6),
    screenX = null, screenX2 = null, screenY = null, scrollY = null, docHeight = null, vRndX = null, vRndY = null,
    windOffset = 1,
    windMultiplier = 2,
    flakeTypes = 6,
    fixedForEverything = false,
    targetElementIsRelative = false,
    opacitySupported = (function(){
      try {
        document.createElement('div').style.opacity = '0.5';
      } catch(e) {
        return false;
      }
      return true;
    }()),
    didInit = false,
    docFrag = document.createDocumentFragment();
  
    features = (function() {
  
      var getAnimationFrame;
  
      /**
       * hat tip: paul irish
       * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
       * https://gist.github.com/838785
       */
  
      function timeoutShim(callback) {
        window.setTimeout(callback, 1000/(storm.animationInterval || 20));
      }
  
      var _animationFrame = (window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.oRequestAnimationFrame ||
          window.msRequestAnimationFrame ||
          timeoutShim);
  
      // apply to window, avoid "illegal invocation" errors in Chrome
      getAnimationFrame = _animationFrame ? function() {
        return _animationFrame.apply(window, arguments);
      } : null;
  
      var testDiv;
  
      testDiv = document.createElement('div');
  
      function has(prop) {
  
        // test for feature support
        var result = testDiv.style[prop];
        return (result !== undefined ? prop : null);
  
      }
  
      // note local scope.
      var localFeatures = {
  
        transform: {
          ie:  has('-ms-transform'),
          moz: has('MozTransform'),
          opera: has('OTransform'),
          webkit: has('webkitTransform'),
          w3: has('transform'),
          prop: null // the normalized property value
        },
  
        getAnimationFrame: getAnimationFrame
  
      };
  
      localFeatures.transform.prop = (
        localFeatures.transform.w3 || 
        localFeatures.transform.moz ||
        localFeatures.transform.webkit ||
        localFeatures.transform.ie ||
        localFeatures.transform.opera
      );
  
      testDiv = null;
  
      return localFeatures;
  
    }());
  
    this.timer = null;
    this.flakes = [];
    this.disabled = false;
    this.active = false;
    this.meltFrameCount = 20;
    this.meltFrames = [];
  
    this.setXY = function(o, x, y) {
  
      if (!o) {
        return false;
      }
  
      if (storm.usePixelPosition || targetElementIsRelative) {
  
        o.style.left = (x - storm.flakeWidth) + 'px';
        o.style.top = (y - storm.flakeHeight) + 'px';
  
      } else if (noFixed) {
  
        o.style.right = (100-(x/screenX*100)) + '%';
        // avoid creating vertical scrollbars
        o.style.top = (Math.min(y, docHeight-storm.flakeHeight)) + 'px';
  
      } else {
  
        if (!storm.flakeBottom) {
  
          // if not using a fixed bottom coordinate...
          o.style.right = (100-(x/screenX*100)) + '%';
          o.style.bottom = (100-(y/screenY*100)) + '%';
  
        } else {
  
          // absolute top.
          o.style.right = (100-(x/screenX*100)) + '%';
          o.style.top = (Math.min(y, docHeight-storm.flakeHeight)) + 'px';
  
        }
  
      }
  
    };
  
    this.events = (function() {
  
      var old = (!window.addEventListener && window.attachEvent), slice = Array.prototype.slice,
      evt = {
        add: (old?'attachEvent':'addEventListener'),
        remove: (old?'detachEvent':'removeEventListener')
      };
  
      function getArgs(oArgs) {
        var args = slice.call(oArgs), len = args.length;
        if (old) {
          args[1] = 'on' + args[1]; // prefix
          if (len > 3) {
            args.pop(); // no capture
          }
        } else if (len === 3) {
          args.push(false);
        }
        return args;
      }
  
      function apply(args, sType) {
        var element = args.shift(),
            method = [evt[sType]];
        if (old) {
          element[method](args[0], args[1]);
        } else {
          element[method].apply(element, args);
        }
      }
  
      function addEvent() {
        apply(getArgs(arguments), 'add');
      }
  
      function removeEvent() {
        apply(getArgs(arguments), 'remove');
      }
  
      return {
        add: addEvent,
        remove: removeEvent
      };
  
    }());
  
    function rnd(n,min) {
      if (isNaN(min)) {
        min = 0;
      }
      return (Math.random()*n)+min;
    }
  
    function plusMinus(n) {
      return (parseInt(rnd(2),10)===1?n*-1:n);
    }
  
    this.randomizeWind = function() {
      var i;
      vRndX = plusMinus(rnd(storm.vMaxX,0.2));
      vRndY = rnd(storm.vMaxY,0.2);
      if (this.flakes) {
        for (i=0; i<this.flakes.length; i++) {
          if (this.flakes[i].active) {
            this.flakes[i].setVelocities();
          }
        }
      }
    };
  
    this.scrollHandler = function() {
      var i;
      // "attach" snowflakes to bottom of window if no absolute bottom value was given
      scrollY = (storm.flakeBottom ? 0 : parseInt(window.scrollY || document.documentElement.scrollTop || (noFixed ? document.body.scrollTop : 0), 10));
      if (isNaN(scrollY)) {
        scrollY = 0; // Netscape 6 scroll fix
      }
      if (!fixedForEverything && !storm.flakeBottom && storm.flakes) {
        for (i=0; i<storm.flakes.length; i++) {
          if (storm.flakes[i].active === 0) {
            storm.flakes[i].stick();
          }
        }
      }
    };
  
    this.resizeHandler = function() {
      if (window.innerWidth || window.innerHeight) {
        screenX = window.innerWidth - 16 - storm.flakeRightOffset;
        screenY = (storm.flakeBottom || window.innerHeight);
      } else {
        screenX = (document.documentElement.clientWidth || document.body.clientWidth || document.body.scrollWidth) - (!isIE ? 8 : 0) - storm.flakeRightOffset;
        screenY = storm.flakeBottom || document.documentElement.clientHeight || document.body.clientHeight || document.body.scrollHeight;
      }
      docHeight = document.body.offsetHeight;
      screenX2 = parseInt(screenX/2,10);
    };
  
    this.resizeHandlerAlt = function() {
      screenX = storm.targetElement.offsetWidth - storm.flakeRightOffset;
      screenY = storm.flakeBottom || storm.targetElement.offsetHeight;
      screenX2 = parseInt(screenX/2,10);
      docHeight = document.body.offsetHeight;
    };
  
    this.freeze = function() {
      // pause animation
      if (!storm.disabled) {
        storm.disabled = 1;
      } else {
        return false;
      }
      storm.timer = null;
    };
  
    this.resume = function() {
      if (storm.disabled) {
         storm.disabled = 0;
      } else {
        return false;
      }
      storm.timerInit();
    };
  
    this.toggleSnow = function() {
      if (!storm.flakes.length) {
        // first run
        storm.start();
      } else {
        storm.active = !storm.active;
        if (storm.active) {
          storm.show();
          storm.resume();
        } else {
          storm.stop();
          storm.freeze();
        }
      }
    };
  
    this.stop = function() {
      var i;
      this.freeze();
      for (i=0; i<this.flakes.length; i++) {
        this.flakes[i].o.style.display = 'none';
      }
      storm.events.remove(window,'scroll',storm.scrollHandler);
      storm.events.remove(window,'resize',storm.resizeHandler);
      if (storm.freezeOnBlur) {
        if (isIE) {
          storm.events.remove(document,'focusout',storm.freeze);
          storm.events.remove(document,'focusin',storm.resume);
        } else {
          storm.events.remove(window,'blur',storm.freeze);
          storm.events.remove(window,'focus',storm.resume);
        }
      }
    };
  
    this.show = function() {
      var i;
      for (i=0; i<this.flakes.length; i++) {
        this.flakes[i].o.style.display = 'block';
      }
    };
  
    this.SnowFlake = function(type,x,y) {
      var s = this;
      this.type = type;
      this.x = x||parseInt(rnd(screenX-20),10);
      this.y = (!isNaN(y)?y:-rnd(screenY)-12);
      this.vX = null;
      this.vY = null;
      this.vAmpTypes = [1,1.2,1.4,1.6,1.8]; // "amplification" for vX/vY (based on flake size/type)
      this.vAmp = this.vAmpTypes[this.type] || 1;
      this.melting = false;
      this.meltFrameCount = storm.meltFrameCount;
      this.meltFrames = storm.meltFrames;
      this.meltFrame = 0;
      this.twinkleFrame = 0;
      this.active = 1;
      this.fontSize = (10+(this.type/5)*10);
      this.o = document.createElement('div');
      this.o.innerHTML = storm.snowCharacter;
      if (storm.className) {
        this.o.setAttribute('class', storm.className);
      }
      this.o.style.color = storm.snowColor;
      this.o.style.position = (fixedForEverything?'fixed':'absolute');
      if (storm.useGPU && features.transform.prop) {
        // GPU-accelerated snow.
        this.o.style[features.transform.prop] = 'translate3d(0px, 0px, 0px)';
      }
      this.o.style.width = storm.flakeWidth+'px';
      this.o.style.height = storm.flakeHeight+'px';
      this.o.style.fontFamily = 'arial,verdana';
      this.o.style.cursor = 'default';
      this.o.style.overflow = 'hidden';
      this.o.style.fontWeight = 'normal';
      this.o.style.zIndex = storm.zIndex;
      docFrag.appendChild(this.o);
  
      this.refresh = function() {
        if (isNaN(s.x) || isNaN(s.y)) {
          // safety check
          return false;
        }
        storm.setXY(s.o, s.x, s.y);
      };
  
      this.stick = function() {
        if (noFixed || (storm.targetElement !== document.documentElement && storm.targetElement !== document.body)) {
          s.o.style.top = (screenY+scrollY-storm.flakeHeight)+'px';
        } else if (storm.flakeBottom) {
          s.o.style.top = storm.flakeBottom+'px';
        } else {
          s.o.style.display = 'none';
          s.o.style.bottom = '0%';
          s.o.style.position = 'fixed';
          s.o.style.display = 'block';
        }
      };
  
      this.vCheck = function() {
        if (s.vX>=0 && s.vX<0.2) {
          s.vX = 0.2;
        } else if (s.vX<0 && s.vX>-0.2) {
          s.vX = -0.2;
        }
        if (s.vY>=0 && s.vY<0.2) {
          s.vY = 0.2;
        }
      };
  
      this.move = function() {
        var vX = s.vX*windOffset, yDiff;
        s.x += vX;
        s.y += (s.vY*s.vAmp);
        if (s.x >= screenX || screenX-s.x < storm.flakeWidth) { // X-axis scroll check
          s.x = 0;
        } else if (vX < 0 && s.x-storm.flakeLeftOffset < -storm.flakeWidth) {
          s.x = screenX-storm.flakeWidth-1; // flakeWidth;
        }
        s.refresh();
        yDiff = screenY+scrollY-s.y+storm.flakeHeight;
        if (yDiff<storm.flakeHeight) {
          s.active = 0;
          if (storm.snowStick) {
            s.stick();
          } else {
            s.recycle();
          }
        } else {
          if (storm.useMeltEffect && s.active && s.type < 3 && !s.melting && Math.random()>0.998) {
            // ~1/1000 chance of melting mid-air, with each frame
            s.melting = true;
            s.melt();
            // only incrementally melt one frame
            // s.melting = false;
          }
          if (storm.useTwinkleEffect) {
            if (s.twinkleFrame < 0) {
              if (Math.random() > 0.97) {
                s.twinkleFrame = parseInt(Math.random() * 8, 10);
              }
            } else {
              s.twinkleFrame--;
              if (!opacitySupported) {
                s.o.style.visibility = (s.twinkleFrame && s.twinkleFrame % 2 === 0 ? 'hidden' : 'visible');
              } else {
                s.o.style.opacity = (s.twinkleFrame && s.twinkleFrame % 2 === 0 ? 0 : 1);
              }
            }
          }
        }
      };
  
      this.animate = function() {
        // main animation loop
        // move, check status, die etc.
        s.move();
      };
  
      this.setVelocities = function() {
        s.vX = vRndX+rnd(storm.vMaxX*0.12,0.1);
        s.vY = vRndY+rnd(storm.vMaxY*0.12,0.1);
      };
  
      this.setOpacity = function(o,opacity) {
        if (!opacitySupported) {
          return false;
        }
        o.style.opacity = opacity;
      };
  
      this.melt = function() {
        if (!storm.useMeltEffect || !s.melting) {
          s.recycle();
        } else {
          if (s.meltFrame < s.meltFrameCount) {
            s.setOpacity(s.o,s.meltFrames[s.meltFrame]);
            s.o.style.fontSize = s.fontSize-(s.fontSize*(s.meltFrame/s.meltFrameCount))+'px';
            s.o.style.lineHeight = storm.flakeHeight+2+(storm.flakeHeight*0.75*(s.meltFrame/s.meltFrameCount))+'px';
            s.meltFrame++;
          } else {
            s.recycle();
          }
        }
      };
  
      this.recycle = function() {
        s.o.style.display = 'none';
        s.o.style.position = (fixedForEverything?'fixed':'absolute');
        s.o.style.bottom = 'auto';
        s.setVelocities();
        s.vCheck();
        s.meltFrame = 0;
        s.melting = false;
        s.setOpacity(s.o,1);
        s.o.style.padding = '0px';
        s.o.style.margin = '0px';
        s.o.style.fontSize = s.fontSize+'px';
        s.o.style.lineHeight = (storm.flakeHeight+2)+'px';
        s.o.style.textAlign = 'center';
        s.o.style.verticalAlign = 'baseline';
        s.x = parseInt(rnd(screenX-storm.flakeWidth-20),10);
        s.y = parseInt(rnd(screenY)*-1,10)-storm.flakeHeight;
        s.refresh();
        s.o.style.display = 'block';
        s.active = 1;
      };
  
      this.recycle(); // set up x/y coords etc.
      this.refresh();
  
    };
  
    this.snow = function() {
      var active = 0, flake = null, i, j;
      for (i=0, j=storm.flakes.length; i<j; i++) {
        if (storm.flakes[i].active === 1) {
          storm.flakes[i].move();
          active++;
        }
        if (storm.flakes[i].melting) {
          storm.flakes[i].melt();
        }
      }
      if (active<storm.flakesMaxActive) {
        flake = storm.flakes[parseInt(rnd(storm.flakes.length),10)];
        if (flake.active === 0) {
          flake.melting = true;
        }
      }
      if (storm.timer) {
        features.getAnimationFrame(storm.snow);
      }
    };
  
    this.mouseMove = function(e) {
      if (!storm.followMouse) {
        return true;
      }
      var x = parseInt(e.clientX,10);
      if (x<screenX2) {
        windOffset = -windMultiplier+(x/screenX2*windMultiplier);
      } else {
        x -= screenX2;
        windOffset = (x/screenX2)*windMultiplier;
      }
    };
  
    this.createSnow = function(limit,allowInactive) {
      var i;
      for (i=0; i<limit; i++) {
        storm.flakes[storm.flakes.length] = new storm.SnowFlake(parseInt(rnd(flakeTypes),10));
        if (allowInactive || i>storm.flakesMaxActive) {
          storm.flakes[storm.flakes.length-1].active = -1;
        }
      }
      storm.targetElement.appendChild(docFrag);
    };
  
    this.timerInit = function() {
      storm.timer = true;
      storm.snow();
    };
  
    this.init = function() {
      var i;
      for (i=0; i<storm.meltFrameCount; i++) {
        storm.meltFrames.push(1-(i/storm.meltFrameCount));
      }
      storm.randomizeWind();
      storm.createSnow(storm.flakesMax); // create initial batch
      storm.events.add(window,'resize',storm.resizeHandler);
      storm.events.add(window,'scroll',storm.scrollHandler);
      if (storm.freezeOnBlur) {
        if (isIE) {
          storm.events.add(document,'focusout',storm.freeze);
          storm.events.add(document,'focusin',storm.resume);
        } else {
          storm.events.add(window,'blur',storm.freeze);
          storm.events.add(window,'focus',storm.resume);
        }
      }
      storm.resizeHandler();
      storm.scrollHandler();
      if (storm.followMouse) {
        storm.events.add(isIE?document:window,'mousemove',storm.mouseMove);
      }
      storm.animationInterval = Math.max(20,storm.animationInterval);
      storm.timerInit();
    };
  
    this.start = function(bFromOnLoad) {
      if (!didInit) {
        didInit = true;
      } else if (bFromOnLoad) {
        // already loaded and running
        return true;
      }
      if (typeof storm.targetElement === 'string') {
        var targetID = storm.targetElement;
        storm.targetElement = document.getElementById(targetID);
        if (!storm.targetElement) {
          throw new Error('Snowstorm: Unable to get targetElement "'+targetID+'"');
        }
      }
      if (!storm.targetElement) {
        storm.targetElement = (document.body || document.documentElement);
      }
      if (storm.targetElement !== document.documentElement && storm.targetElement !== document.body) {
        // re-map handler to get element instead of screen dimensions
        storm.resizeHandler = storm.resizeHandlerAlt;
        //and force-enable pixel positioning
        storm.usePixelPosition = true;
      }
      storm.resizeHandler(); // get bounding box elements
      storm.usePositionFixed = (storm.usePositionFixed && !noFixed && !storm.flakeBottom); // whether or not position:fixed is to be used
      if (window.getComputedStyle) {
        // attempt to determine if body or user-specified snow parent element is relatlively-positioned.
        try {
          targetElementIsRelative = (window.getComputedStyle(storm.targetElement, null).getPropertyValue('position') === 'relative');
        } catch(e) {
          // oh well
          targetElementIsRelative = false;
        }
      }
      fixedForEverything = storm.usePositionFixed;
      if (screenX && screenY && !storm.disabled) {
        storm.init();
        storm.active = true;
      }
    };
  
    function doDelayedStart() {
      window.setTimeout(function() {
        storm.start(true);
      }, 20);
      // event cleanup
      storm.events.remove(isIE?document:window,'mousemove',doDelayedStart);
    }
  
    function doStart() {
      if (!storm.excludeMobile || !isMobile) {
        doDelayedStart();
      }
      // event cleanup
      storm.events.remove(window, 'load', doStart);
    }
  
    // hooks for starting the snow
    if (storm.autoStart) {
      storm.events.add(window, 'load', doStart, false);
    }
  
    return this;
  
  }(window, document));
  
// snow

// Carregar imagem canvas


const img = new Image();
img.src = './background.png';
img.onload = function () {
  ctx.drawImage(img, 350, 10);

};





// instrucao
const instru = new Image();
instru.src = './instrucao.png';
instru.onload = function () {
  ctx.drawImage(instru, 20, 10);
};

// name
const nameGame = new Image();
nameGame.src = './name.png';
nameGame.onload = function () {
  ctx.drawImage(nameGame, 990, 10);
};




//imagem aleatoria

let imagemItem1 = new Image();
imagemItem1.src = './itens/anel.png';
let posItem1 = 93;
// window.onload = () => ctx.drawImage(imagemItem[randomItem], 0, 0);
let imagemItem2 = new Image();
imagemItem2.src = './itens/box.png';
let posItem2 = 213;

let imagemItem3 = new Image();
imagemItem3.src = './itens/cogumelo.png';
let posItem3 = 65;

let imagemItem4 = new Image();
imagemItem4.src = './itens/espada.png';
let posItem4 = 236;

let imagemItem5 = new Image();
imagemItem5.src = './itens/estrela.png';
let posItem5 = 54;

let imagemItem6 = new Image();
imagemItem6.src = './itens/frango.png';
let posItem6 = 88;

let imagemItem7 = new Image();
imagemItem7.src = './itens/fritas.png';
let posItem7 = 74;

let imagemItem8 = new Image();
imagemItem8.src = './itens/hamburg.png';
let posItem8 = 25;

let imagemItem9 = new Image();
imagemItem9.src = './itens/mario.png';
let posItem9 = 201;

let imagemItem10 = new Image();
imagemItem10.src = './itens/moeda.png';
let posItem10 = 99;

let imagemItem11 = new Image();
imagemItem11.src = './itens/ovo.png';
let posItem11 = 18;

let imagemItem12 = new Image();
imagemItem12.src = './itens/peixe.png';
let posItem12 = 194;

let imagemItem13 = new Image();
imagemItem13.src = './itens/pinto.png';
let posItem13 = 62;

let imagemItem14 = new Image();
imagemItem14.src = './itens/pocao.png';
let posItem14 = 180;

let imagemItem15 = new Image();
imagemItem15.src = './itens/queijo.png';
let posItem15 = 190;

let imagemItem16 = new Image();
imagemItem16.src = './itens/tocha.png';
let posItem16 = 227;

let imagemItem17 = new Image();
imagemItem17.src = './itens/vinho.png';
let posItem17 = 170;

const imagemItem = [[imagemItem1,posItem1], [imagemItem2,posItem2], [imagemItem3,posItem3], [imagemItem4, posItem4], [imagemItem5,posItem5], [imagemItem6,posItem5], [imagemItem7,posItem7], [imagemItem8,posItem8], [imagemItem9,posItem9], [imagemItem10,posItem10], [imagemItem11,posItem11], [imagemItem12,posItem12], [imagemItem13,posItem13], [imagemItem14,posItem14], [imagemItem15,posItem15], [imagemItem16,posItem16], [imagemItem17,posItem17]];

let randomItem = Math.floor(Math.random() * imagemItem.length);
let randomItemPos = imagemItem[randomItem][1];

imagemItem[randomItem][0].onload = function() {
 ctx.drawImage(imagemItem[randomItem][0], 132, 365);
}

// posição

const xpos = [350, 388, 426, 464, 502, 540, 578, 616, 654, 692, 730, 768, 806, 844, 882, 920];
const ypos = [5, 45, 80, 120, 155, 195, 235, 270, 310, 345, 385, 425, 460, 500, 540, 575];


let position = [];
for (let i = 0; i < xpos.length; i += 1) {
  for (let z = 0; z < ypos.length; z += 1) {
    position.push([xpos[i], ypos[z]]);
  }
}


//Função para buscar as arrays

Array.prototype.indexOfForArrays = function(search)
{
  let searchJson = JSON.stringify(search);
  let arrJson = this.map(JSON.stringify);

  return arrJson.indexOf(searchJson);
};


//Remove as posições dos itens
//
let ItemsToDelete = [18, 25, 54, 62, 65, 74, 88, 93, 99, 170, 180, 190, 194, 201, 213, 227, 236];
// for (let i = ItemsToDelete.length -1; i >= 0; i--)
//    position.splice(ItemsToDelete[i],1);

let randomCarol = Math.floor(Math.random() * position.length);
for (f=0;f<ItemsToDelete.length;f++){
    if(randomCarol == ItemsToDelete[f]){
        randomCarol = randomCarol +1;
    }
}

let randomKeny;
do{
 randomKeny = Math.floor(Math.random() * position.length);
    if(randomKeny == ItemsToDelete[f]){
        randomKeny = randomKeny +1;
    }
}
while (randomKeny == randomCarol); {
  randomKeny = Math.floor(Math.random() * position.length);
}

let SideBarriers = [16,18,25,38,46,49,58,88,93,99,103,104,127,135,136,170,164,174,185,192,194,197,223,227,236];
let TopAndDownBarriers = [6,12,26,18,55,62,65,75,88,93,100,119,121,135,137,171,181,191,195,201,213,227,236,246,250];


const randomCarolPosition = position[randomCarol];
const randomKenyPosition = position[randomKeny];


// personagens

const carol = new Image();
carol.src = './personagens/caroldir.png';
const keny = new Image();
keny.src = './personagens/kenydir.png';

window.onload = function drawCharacter() {
  ctx.drawImage(carol, randomCarolPosition[0], randomCarolPosition[1]);
  XCarolPosition = randomCarolPosition[0];
  YCarolPosition = randomCarolPosition[1];

  ctx.drawImage(keny, randomKenyPosition[0], randomKenyPosition[1]);
  XKenyPosition = randomKenyPosition[0];
  YKenyPosition = randomKenyPosition[1];
};



// walk

window.onkeydown = function(event) {
  if(Buttons == 0){
    return;
  }
    var keyPr = event.keyCode; //Key code of key pressed
    if(keyPr==49)SelectedCharacter=1;
    if(keyPr==50)SelectedCharacter=2;


    switch (SelectedCharacter){
    case 1:
    XCharPosition = XCarolPosition
    YCharPosition = YCarolPosition
    compareCharacter.push([XKenyPosition,YKenyPosition]);
    break;
    case 2:
    XCharPosition = XKenyPosition
    YCharPosition = YKenyPosition
    break;
    }

      if(keyPr==37){moveLeft();snd.play();}
      if(keyPr==39){moveRight(); snd.play();}
      if(keyPr==38){moveUp();  snd.play();}
      if(keyPr==40){moveDown();  snd.play();}

     switch (SelectedCharacter){
     case 1:
     XCarolPosition = XCharPosition
     YCarolPosition = YCharPosition
     break;
     case 2:
     XKenyPosition = XCharPosition
     YKenyPosition = YCharPosition
     break;
    }




    ctx.drawImage(img, 350, 10);
    ctx.drawImage(carol, XCarolPosition, YCarolPosition);
    ctx.drawImage(keny, XKenyPosition, YKenyPosition);

    if (randomItemPos == position.indexOfForArrays([XCharPosition,YCharPosition])){
      Buttons = 0
      const win = new Image();
      win.src = './winner.png';
      win.onload = function () {
        ctx.drawImage(win, 350, 10);
      };
    }

    };

// move sides
function moveLeft(){
    var CurrentPosition = position.indexOfForArrays([XCharPosition,YCharPosition]);
    var NewPosition;

  var CompareCharPosition

  if(SelectedCharacter==1){
    CompareCharPosition = position.indexOfForArrays([XKenyPosition,YKenyPosition]);
  }
  else{CompareCharPosition = position.indexOfForArrays([XCarolPosition,YCarolPosition]);}


  if(position[CurrentPosition][0]>position[CompareCharPosition][0] && position[CurrentPosition][1]==position[CompareCharPosition][1]){
    for (i = CurrentPosition; i >0; i -= 16){
        for(f = 0; f<= SideBarriers.length -1; f++){
          if(i==SideBarriers[f] && XCharPosition>position[i][0]){
            NewPosition = position[SideBarriers[f]+16]
            if(NewPosition[0]>position[CompareCharPosition][0]){
              NewPosition = position[SideBarriers[f]+16]
              XCharPosition = NewPosition[0];
              return;
                        }
            else if(NewPosition[0]<=position[CompareCharPosition][0]){
            NewPosition = position[CompareCharPosition+16]
           XCharPosition = NewPosition[0];
            return;
          }
          }
        }
      }
      NewPosition = position[CompareCharPosition+16]
     XCharPosition = NewPosition[0];
     return;
  }
  else{
    for (i = CurrentPosition; i >0; i -= 16){
        for(f = 0; f<= SideBarriers.length -1; f++){
          if(i==SideBarriers[f] && XCharPosition>position[i][0]){
            NewPosition = position[SideBarriers[f]+16]
            XCharPosition = NewPosition[0];
            return;
          }
        }
      }
    }
            XCharPosition = xpos[0];
             return;

  };


  function moveUp() {
    var CurrentPosition = position.indexOfForArrays([XCharPosition,YCharPosition]);
    var NewPosition;

    var CompareCharPosition

    if(SelectedCharacter==1){
      CompareCharPosition = position.indexOfForArrays([XKenyPosition,YKenyPosition]);
    }
    else{CompareCharPosition = position.indexOfForArrays([XCarolPosition,YCarolPosition]);}

    var CurrentPosition = position.indexOfForArrays([XCharPosition,YCharPosition]);
    var NewPosition;

    if(position[CurrentPosition][1]>position[CompareCharPosition][1] && position[CurrentPosition][0]==position[CompareCharPosition][0]){

      for (i = CurrentPosition; i >0; i -= 1){
          for(f = 0; f< TopAndDownBarriers.length; f++){

            if(YCharPosition==position[TopAndDownBarriers[f]][1] && XCharPosition == position[TopAndDownBarriers[f]][0]){
              return;
            }
            if(i==TopAndDownBarriers[f] && YCharPosition>position[i][1] && CurrentPosition!=TopAndDownBarriers[f] && XCharPosition == position[TopAndDownBarriers[f]][0]){
              if (position[CompareCharPosition][1] < position[TopAndDownBarriers[f]][1]){
               NewPosition = position[TopAndDownBarriers[f]]
               YCharPosition = position[TopAndDownBarriers[f]][1]
       return;

             }

             else if(position[CompareCharPosition][1] >= position[TopAndDownBarriers[f]][1]){

             NewPosition = position[TopAndDownBarriers[f]]
             YCharPosition = position[CompareCharPosition+1][1]
             return;
         }


            }
          }
        }
        NewPosition = position[TopAndDownBarriers[f]]
        YCharPosition = position[CompareCharPosition+1][1]
        return;

  }
  else{

    for (i = CurrentPosition; i >0; i -= 1){
        for(f = 0; f< TopAndDownBarriers.length; f++){

          if(YCharPosition==position[TopAndDownBarriers[f]][1] && XCharPosition == position[TopAndDownBarriers[f]][0]){
            return;
          }
          if(i==TopAndDownBarriers[f] && YCharPosition>position[i][1] && CurrentPosition!=TopAndDownBarriers[f] && XCharPosition == position[TopAndDownBarriers[f]][0]){
            NewPosition = position[TopAndDownBarriers[f]]
            YCharPosition = NewPosition[1];
            return;
          }
        }
      }
    }
            YCharPosition = ypos[0];
             return;


    };



  function moveDown() {
    var CurrentPosition = position.indexOfForArrays([XCharPosition,YCharPosition]);
    var NewPosition;
    var CompareCharPosition

    if(SelectedCharacter==1){
      CompareCharPosition = position.indexOfForArrays([XKenyPosition,YKenyPosition]);
    }
    else{CompareCharPosition = position.indexOfForArrays([XCarolPosition,YCarolPosition]);}

    var CurrentPosition = position.indexOfForArrays([XCharPosition,YCharPosition]);
    var NewPosition;


    if(position[CurrentPosition][1]<position[CompareCharPosition][1] && position[CurrentPosition][0]==position[CompareCharPosition][0]){
  for (i = CurrentPosition; i <position.length; i += 1){
      for(f = 0; f< TopAndDownBarriers.length; f++){
        if(YCharPosition==position[TopAndDownBarriers[f]]-1[1] && XCharPosition == position[TopAndDownBarriers[f]][0]){
          return;
        }
        if(i==TopAndDownBarriers[f] && YCharPosition<position[i][1 ] && CurrentPosition<=TopAndDownBarriers[f]
           && XCharPosition == position[TopAndDownBarriers[f]][0]){

         if (position[CompareCharPosition][1] >= position[TopAndDownBarriers[f]][1]){
          NewPosition = position[TopAndDownBarriers[f]]
          YCharPosition = position[TopAndDownBarriers[f]-1][1]
  return;

        }

        else if(position[CompareCharPosition][1] < position[TopAndDownBarriers[f]][1]){
        NewPosition = position[TopAndDownBarriers[f]]
        YCharPosition = position[CompareCharPosition-1][1]
        return;
    }

        }
      }
    }

    NewPosition = position[TopAndDownBarriers[f]]
    YCharPosition = position[CompareCharPosition-1][1]
    return;

  }
  else{

    for (i = CurrentPosition; i <position.length; i += 1){
        for(f = 0; f< TopAndDownBarriers.length; f++){
          if(YCharPosition==position[TopAndDownBarriers[f]]-1[1] && XCharPosition == position[TopAndDownBarriers[f]][0]){
            return;
          }
          if(i==TopAndDownBarriers[f] && YCharPosition<position[i][1] && CurrentPosition<=TopAndDownBarriers[f] && XCharPosition == position[TopAndDownBarriers[f]][0]){
            NewPosition = position[TopAndDownBarriers[f]]
            YCharPosition = position[TopAndDownBarriers[f]-1][1]
            return;
          }
        }
      }
    }
            YCharPosition = ypos[15];
             return;
    };


  function moveRight() {
    var CurrentPosition = position.indexOfForArrays([XCharPosition,YCharPosition]);
    var NewPosition;

  var CompareCharPosition

  if(SelectedCharacter==1){
    CompareCharPosition = position.indexOfForArrays([XKenyPosition,YKenyPosition]);
  }
  else{CompareCharPosition = position.indexOfForArrays([XCarolPosition,YCarolPosition]);}

  if(position[CurrentPosition][0]<position[CompareCharPosition][0] && position[CurrentPosition][1]==position[CompareCharPosition][1]){
    for (i = CurrentPosition; i < position.length; i += 16){
        for(f = 0; f<= SideBarriers.length -1; f++){
          if(i==SideBarriers[f] && XCharPosition==position[SideBarriers[f]][0]){
          return;}
          if(i==SideBarriers[f] && XCharPosition<position[i][0]){
            NewPosition = position[SideBarriers[f]-16]
            //Condição para o outro boneco depois da barreira
            if(NewPosition[0]<position[CompareCharPosition][0] && position[CompareCharPosition][0] > position[SideBarriers[f]][0]){
              NewPosition = position[SideBarriers[f]]
              XCharPosition = NewPosition[0];
              return;
                        }
            else if(NewPosition[0]<position[CompareCharPosition][0] && position[CompareCharPosition][0] < position[SideBarriers[f]][0]){
            NewPosition = position[SideBarriers[f]-16]
           XCharPosition = NewPosition[0];
            return;
          }
          }
        }
      }
      NewPosition = position[CompareCharPosition-16]
     XCharPosition = NewPosition[0];
     return;
  }
  else{

    for (i = CurrentPosition; i < position.length; i += 16){
        for(f = 0; f<= SideBarriers.length -1; f++){
          if(i==SideBarriers[f] && XCharPosition==position[SideBarriers[f]][0]){
          return;}
          if(i==SideBarriers[f] && XCharPosition<position[i][0]){
            NewPosition = position[SideBarriers[f]]
            XCharPosition = NewPosition[0];

            return;
          }
        }
      }
    }
            XCharPosition = xpos[15];
             return;


  }

// vitoria



// cronometro

var count = 101;
var tempo = document.getElementById("tempo"); // associar a variável tempo ao elemento


function startTime() {
     if (count > 0){
        count -= 1;
        if (count == 0) {
          Buttons = 0
            let gameOver = new Image();
            gameOver.src = './gameover.png';
            gameOver.onload = function() {
                ctx.drawImage(gameOver, 350, 10);
               }

            // }else if(count > 0 && ){

            // }    //condiçao de vitoria

        }else if(count < 10){
            count = "0" + count;
        }
        tempo.innerText = count;
        setTimeout(startTime, 1000);

        
        // em vez de chamar setTimeout("start();", 100) usa só o nome da função
        // o setTimeout vai executar a função mesmo sem pores os ()
    }
}



startTime();

// var counter = 100;
// var timer = setInterval(function() {
//   if( counter <= 0 ) {
//     clearInterval( timer );
//   }

//   console.log( counter-- );
// }, 1000);
