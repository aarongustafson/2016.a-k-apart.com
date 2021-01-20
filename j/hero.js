(function(window,document){// repeated
function sceneOne() {
 var tl = new TimelineMax();

 tl.add("begin");
 tl.to("#gear", 4, {
   rotation: 360,
   transformOrigin: "50% 50%",
   repeat: -1,
   ease: Linear.easeNone
 }, "begin");
 tl.to("#wheel1", 3, {
   rotation: 360,
   svgOrigin: "515 455",
   repeat: -1,
   ease: Linear.easeNone
 }, "begin");
 tl.to("#wheel2", 5, {
   rotation: 360,
   transformOrigin: "50% 50%",
   repeat: -1,
   ease: Linear.easeNone
 }, "begin");
 tl.to("#wheel3", 10, {
   rotation: 360,
   transformOrigin: "50% 50%",
   repeat: -1,
   ease: Linear.easeNone
 }, "begin");
 tl.to("#plate1", 1, {
   rotation: 5,
   transformOrigin: "100% 80%",
   repeat: -1,
   yoyo: true,
   ease: Linear.easeNone
 }, "begin");
 tl.to("#crank", 2, {
   rotation: 5,
   transformOrigin: "0% 100%",
   repeat: -1,
   yoyo: true,
   ease: Linear.easeNone
 }, "begin");

 return tl;
}

// paper
function sceneTwo() {
 var tl = new TimelineMax({
   repeat: 4
 });

 tl.add("paper");
 tl.fromTo(("#paper1"), 1, {
   opacity: 0
 }, {
   opacity: 1
 }, "paper");
 tl.to(("#paper1"), 2.5, {
   bezier: {
     type: "cubic",
     values: [{x: 0, y: -30}, {x: 750, y: -20}, {x: 750, y: 200}, {x: 1200, y: 400}],
     autoRotate: ["x", "y", "rotation", 30, false]
   },
   ease: Power3.easeInOut
 }, "paper");
 tl.to(("#paper1"), 1, {
   opacity:0,
   ease: Power3.easeIn
 }, "paper+=1");
 
 tl.timeScale(1.3);
 
 return tl;
}

//hovering stuff
function bloop() {
  var tl = new TimelineMax();
  tl.to(".circle-bloop", 0.1, {
    visibility: "visible"
  });
  tl.staggerFromTo(".circle-bloop circle", 1.2, {
    scale: 1,
    opacity: 0.2
  }, {
    scale: 5,
    transformOrigin: "50% 50%",
    opacity: 0,
    ease: Sine.easeOut
  }, 0.15);
  tl.to(".circle-bloop", 0.1, {
    visibility: "hidden"
  });
  return tl;
}

// Animate it
window.addEventListener('load',function(){
  //create a master timeline but pause it initially
  var master = new TimelineMax({
  paused: true
  });
  master.add("masterStart")
  .add(sceneOne(), "masterStart")
  .add(sceneTwo(), "masterStart");

  //hover events
  var bloopAnim = new TimelineMax({
      paused: true
    }),
    hoverArea = document.getElementById("hoverArea");
  bloopAnim.add(bloop());

  //variables that aren't timeline-associated
  var lever = document.getElementById("crank"),
    running = false,
    click_event = document.createEvent('MouseEvents');

  click_event.initEvent('click', true, true);
  click_event.synthetic = true;

  TweenMax.set(lever, {
  tranformOrigin: "0% 100%"
  });

  //allow it to start and stop through click event
  lever.addEventListener('click', function() {
  if (running === false) {
    running = true;
    TweenMax.to(lever, 0.5, {
      rotation: 15,
      ease: Power4.easeOut
    });
    master.restart();
  } else {
    running = false;
    TweenMax.to(lever, 0.5, {
        rotation: 0,
        ease: Power2.easeOut
    });
    master.pause();
    master.progress(0);
  }
  }, false);

  // Trigger once then stop again
  lever.dispatchEvent(click_event, true);
  setTimeout(function(){
  lever.dispatchEvent(click_event, true);
  },2000);

  //hover events
  hoverArea.addEventListener("mouseover", handler);
  // handler function
  function handler(e) {
    // remove this handler
    e.target.removeEventListener(e.type, arguments.callee);
    if (running === false) {
      bloopAnim.restart();
    }
  }

},false);
}(this,this.document));