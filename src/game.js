function getRandom(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function fill(num) {
  return Array.apply(null, Array(num)).map(function (_, i) {
    return i;
  });
}

function detectmob() {
  if (
    navigator.userAgent.match(/Android/i) ||
    navigator.userAgent.match(/webOS/i) ||
    navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/iPod/i) ||
    navigator.userAgent.match(/BlackBerry/i) ||
    navigator.userAgent.match(/Windows Phone/i)
  ) {
    return true;
  } else {
    return false;
  }
}

//The `hitTestRectangle` function
function hitTestRectangle(r1, r2) {
  //Define the variables we'll need to calculate
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

  //hit will determine whether there's a collision
  hit = false;

  //Find the center points of each sprite
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;

  //Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;

  //Calculate the distance vector between the sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + 1; // one pixel of a bullet
  combinedHalfHeights = r1.halfHeight + 1;

  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {
    //A collision might be occuring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {
      //There's definitely a collision happening
      hit = true;
    } else {
      //There's no collision on the y axis
      hit = false;
    }
  } else {
    //There's no collision on the x axis
    hit = false;
  }

  //`hit` will be either `true` or `false`
  return hit;
}

let sounds = new Array(),
  lastShoot = Date.now(),
  reloading = false,
  bullets = detectmob() ? 200 : 10,
  defaultBullets = 10,
  texts = new Array(),
  socreBoard,
  showBullets;
let SPS = 250; // shoot per second
let score = 0;
let level = 1;
// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container
const app = new PIXI.Application(/*{ 
    width: 256,         // default: 800
    height: 256,        // default: 600
    antialias: true,    // default: false
    transparent: false, // default: false
    resolution: 1       // default: 1
  }*/);
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);
// The application will create a canvas element for you that you
// can then insert into the DOM
document.body.appendChild(app.view);

let loaderDiv = J$("body").append("div", { class: "loader" }).css({
  width: "0",
  height: "100%",
  "z-index": "999",
  position: "fixed",
  top: "0",
  left: "0",
  transition: "all 0.2s",
  background: "rgba(115,0,0,0.4)",
});

// load the texture we need
PIXI.loader
  .add([
    { name: "background", url: "./assets/background.jpeg" },
    { name: "balloon_R", url: "./assets/balloons/blue.png" },
    { name: "balloon_G", url: "./assets/balloons/green.png" },
    { name: "balloon_B", url: "./assets/balloons/orange.png" },
    { name: "aim", url: "./assets/player-aim.png" },
    { name: "gun", url: "./assets/player-gun.png" },
  ])
  .add("reload", "./assets/sounds/reload.mp3")
  .add("shoot", "./assets/sounds/shoot.mp3")
  .add("balloon", "./assets/sounds/balloon.mp3")
  .on("progress", (loader, resource) => {
    loaderDiv.css({
      width: `${loader.progress}%`,
    });
  })
  .load((loader, resources) => {
    document.body.removeChild(document.querySelector(".loader"));

    // displaylevel 1
    texts.push({
      x: app.renderer.width / 2 - 80,
      y: 20,
      displayed: Date.now(),
      obj: new PIXI.Text(
        `Level #${level}`,
        new PIXI.TextStyle({
          fontFamily: "Arial",
          fontSize: 44,
          fill: "red",
          stroke: "#ff9900",
          strokeThickness: 2,
        })
      ),
    });

    // create listener for mouse position
    let mousePos = new Object();
    document.body.addEventListener("mousemove", (e) => {
      e = e || window.e;
      if (e.pageX == null && e.clientX != null) {
        eventDoc = (e.target && e.target.ownerDocument) || document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;

        e.pageX =
          e.clientX +
          ((doc && doc.scrollLeft) || (body && body.scrollLeft) || 0) -
          ((doc && doc.clientLeft) || (body && body.clientLeft) || 0);
        e.pageY =
          e.clientY +
          ((doc && doc.scrollTop) || (body && body.scrollTop) || 0) -
          ((doc && doc.clientTop) || (body && body.clientTop) || 0);
      }
      mousePos.x = e.pageX;
      mousePos.y = e.pageY;

      // aim.x = mousePos.x
      // aim.y = mousePos.y
    });

    /* load background image and append stage */
    let backImgOffsets = 100;
    let back = new PIXI.Sprite(resources.background.texture);
    back.width = app.renderer.width + backImgOffsets;
    back.height = app.renderer.height + backImgOffsets;
    back.position.set(-backImgOffsets, -backImgOffsets);
    app.stage.addChild(back);

    let balloons = new Array(),
      dimMap = new Array();

    [10, 20, 40, 60, 80, 90, 100, 110].forEach((x) => {
      dimMap.push({
        w: x,
        h: x / 0.81,
        vx: getRandom(-1, 1) * 0.1 * (x / 50),
        vy: 0.1 * (x / 10),
        points: 510 - x,
      });
    });

    fill(70).forEach((i) => {
      let pickBalloon = undefined,
        tmpDims = 0;
      switch (i % 3) {
        case 0:
          pickBalloon = resources.balloon_R.texture;
          break;
        case 1:
          pickBalloon = resources.balloon_G.texture;
          break;
        case 2:
          pickBalloon = resources.balloon_B.texture;
          break;
      }
      let tmp = new PIXI.Sprite(pickBalloon),
        tmpMx,
        tmpMy;
      tmpDims = dimMap[getRandom(0, dimMap.length - 1)];
      tmp.width = tmpDims.w;
      tmp.height = tmpDims.h;
      tmpMx = getRandom(0, app.renderer.width - tmp.width);
      tmpMy = getRandom(
        app.renderer.height - app.renderer.height / 5,
        app.renderer.height - app.renderer.height / 2
      );
      mousePos.x = tmpMx;
      mousePos.y = tmpMy;
      tmp.position.set(tmpMx, tmpMy);

      balloons.push({
        obj: tmp,
        vx: tmpDims.vx,
        vy: tmpDims.vy,
        points: tmpDims.points,
        time: Date.now(),
      });
      tmp.vx = 0;
      tmp.vy = 0;
    });

    balloons.sort(function (a, b) {
      return a.vy - b.vy;
    });
    // balloons.reverse()
    balloons.forEach((x) => app.stage.addChild(x.obj));

    /* load gun player image */
    let playerGun = new PIXI.Sprite(resources.gun.texture);
    playerGun.width = app.renderer.width / 6;
    playerGun.height = playerGun.width / 2;
    // playerGun.position.set((app.renderer.width/2)+playerGun.width/2, app.renderer.width-playerGun.height)
    playerGun.x = app.renderer.width - playerGun.width / 2;
    // minus 20 px bydefault to use later moving
    playerGun.y = app.renderer.height - playerGun.height + 20;
    app.stage.addChild(playerGun);

    /* load crosshair aim image and append to stage */
    let aim = new PIXI.Sprite(resources.aim.texture);
    aim.width = 25;
    aim.height = 25;
    aim.position.set(mousePos.x, mousePos.y);
    app.stage.addChild(aim);

    let style = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 36,
      fill: "white",
      stroke: "#ff3300",
      strokeThickness: 4,
      dropShadow: true,
      dropShadowColor: "#000000",
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
    });

    socreBoard = new PIXI.Text("Score: 0", style);
    socreBoard.position.set(20, 20);
    app.stage.addChild(socreBoard);

    showBullets = new PIXI.Text("bullets: 10", style);
    showBullets.position.set(20, 20);
    app.stage.addChild(showBullets);

    /*******************************************************/

    /* main loop of the game*/
    // Listen for frame updates
    app.ticker.add((delta) => {
      if (balloons.length === 0) {
        let ended = false;
        switch (level) {
          case 1:
            level++;
          default:
            ended = true;
        }
        if (ended) {
          let style = new PIXI.TextStyle({
            fontFamily: "Futura",
            fontSize: 64,
            fill: "white",
          });
          message = new PIXI.Text("The End!", style);
          message.x = 120;
          message.y = app.stage.height / 2 - 32;
          app.stage.addChild(message);
          return;
        }
      }

      /* show bullets*/
      // update score
      app.stage.removeChild(showBullets);

      showBullets = new PIXI.Text(`bullets: ${bullets}`, style);
      showBullets.position.set(20, 80);
      app.stage.addChild(showBullets);

      // update score
      app.stage.removeChild(socreBoard);

      socreBoard = new PIXI.Text(`Score: ${score}`, style);
      socreBoard.position.set(20, 20);
      app.stage.addChild(socreBoard);

      texts.forEach((x, i) => {
        if (Date.now() - x.displayed < 2000) {
          // let style = ;

          // let styledMessage = ;
          //Position it and add it to the stage
          x.obj.position.set(x.x, x.y);
          app.stage.addChild(x.obj);
        } else {
          texts.splice(i, 1);
          app.stage.removeChild(x.obj);
        }
      });
      // play sounds
      sounds.forEach((x, i) => {
        if (x.name === "reload" && x.obj.ended) {
          reloading = false;
        }
        if (x.obj.ended) {
          sounds.splice(i, 1);
          if (reloading) {
            let rld = new Audio(resources.reload.url);
            sounds.push({
              name: "reload",
              obj: rld,
            });
          }
        } else {
          x.obj.play();
        }
      });
      // move player
      playerGun.x = mousePos.x;

      /* move aim img*/
      aim.x = mousePos.x - aim.width / 2;
      aim.y = mousePos.y - aim.height / 2;

      /* move background by mouse pos */
      back.x =
        -((backImgOffsets / 2) * (aim.x / app.renderer.width)) -
        backImgOffsets / 2;
      back.y =
        -((backImgOffsets / 2) * (aim.y / app.renderer.height)) -
        backImgOffsets / 2;

      /* move player gun by mouse pos */
      playerGun.y =
        app.renderer.height -
        (playerGun.height - playerGun.height / 10) +
        100 * (aim.y / app.renderer.height);

      balloons.forEach((e, i) => {
        e.obj.vx = e.vx;
        e.obj.vy = e.vy;

        if (e.obj.y <= 0) {
          score -= e.points;
          texts.push({
            x: e.obj.x + e.obj.width / 2,
            y: e.obj.y + e.obj.height / 2,
            displayed: Date.now(),
            obj: new PIXI.Text(
              `-${e.points}`,
              new PIXI.TextStyle({
                fontFamily: "Arial",
                fontSize: 14,
                fill: "red",
                stroke: "#ff9900",
                strokeThickness: 2,
              })
            ),
          });
          balloons.splice(i, 1);
          app.stage.removeChild(e.obj);
          let bln = new Audio(resources.balloon.url);
          sounds.push({
            name: "balloon",
            obj: bln,
          });
        } else {
          e.obj.y -= e.obj.vy;
          e.obj.x -= e.obj.vx;
          e.obj.rotation = -e.obj.vx;
        }
      });

      if (bullets <= 0) {
        if (Date.now() - lastShoot > SPS) {
          lastShoot = Date.now();
          reloading = true;
          bullets = defaultBullets;
        }
      }

      // each frame we spin the bunny around a bit
      // bunny.rotation += 0.01;
    });
    /* end of the loop*/

    J$("canvas").on("click", () => {
      if (Date.now() - lastShoot > SPS && bullets > 0 && !reloading) {
        bullets--;
        lastShoot = Date.now();
        let sht = new Audio(resources.shoot.url);
        sht.volume = 0.6;
        sounds.push({
          name: "shoot",
          obj: sht,
        });
        let hitcounter = 0;
        balloons.forEach((e, i) => {
          if (hitTestRectangle(e.obj, aim)) {
            hitcounter++;
            let bln = new Audio(resources.balloon.url);
            sounds.push({
              name: "balloon",
              obj: bln,
            });
            // substract elapsed time as penalty point
            let pt = Math.round(e.points - (Date.now() - e.time) / 500);
            score += pt;
            texts.push({
              x: e.obj.x + e.obj.width / 2,
              y: e.obj.y + e.obj.height / 2,
              displayed: Date.now(),
              obj: new PIXI.Text(
                `+${pt}`,
                new PIXI.TextStyle({
                  fontFamily: "Arial",
                  fontSize: 14,
                  fill: "green",
                  stroke: "#ff9900",
                  strokeThickness: 2,
                })
              ),
            });

            balloons.splice(i, 1);
            app.stage.removeChild(e.obj);
          }
        });
        if (hitcounter === 0) {
          score -= 100;
          texts.push({
            x: mousePos.x - 20,
            y: mousePos.y - 10,
            displayed: Date.now(),
            obj: new PIXI.Text(
              `Missed -100`,
              new PIXI.TextStyle({
                fontFamily: "Arial",
                fontSize: 14,
                fill: "red",
                stroke: "#ff9900",
                strokeThickness: 2,
              })
            ),
          });
        }
      }
    });
  });
