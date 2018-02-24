function getRandom(min, max){
	return Math.round(Math.random() * (max - min) + min)
}

function compare(a, b) {
	if(a > b) {
		return 1;
	} else if(a < b) {
		return -1;
	}
		return 0;
};

var balon_id = 1;
var bulone_count_main = 0;



var clikc_1 = 0;
var clikc_2 = 0;

var gun_shoot_sound = new Audio('mus/shoot_1.mp3')
var magazine = new Audio('mus/magazine.mp3')

var _get_ = {
  left: function(elem_1){
     var offsetLeft = 0;
    do {
      if ( !isNaN( elem_1.offsetLeft ) )
      {
          offsetLeft += elem_1.offsetLeft;
      }
    } while( elem_1 = elem_1.offsetParent );
    return offsetLeft;
  },
  top: function(elem){
     var offsetTop = 0;
    do {
      if ( !isNaN( elem.offsetTop ) )
      {
          offsetTop += elem.offsetTop;
      }
    } while( elem = elem.offsetParent );
    return offsetTop;
  }
}

var buler_counter = 15;
 
document.querySelector("body").addEventListener("mousemove", function(e){
  var absLeft  = _get_.left(document.querySelector(".main_div"))
  var absTop   = _get_.top(document.querySelector(".main_div"))

  var top_main = e.pageY-absTop;
  var left_main = e.pageX-absLeft;

  if ((top_main>0 && left_main>0) && (top_main<662 && left_main<1118)) 
  {
        var $moveable = $('#pl_1');

        $moveable.css({'top': top_main-26, 'left': left_main-26});
        console.log("top", top_main-26);
        console.log("gverdi", left_main-26);

        clikc_1 = top_main-26;
        clikc_2 = left_main-26;
        $(".gun").css({"left" : left_main-26+ "px" })
        if (top_main-26 < 50) {$(".gun").css({"bottom" : "-62px" })}
        
        if (top_main-26 > 50&& top_main-26 < 150) {$(".gun").css({"bottom" : "-70px" })}
        if (top_main-26 > 150&& top_main-26 < 250) {$(".gun").css({"bottom" : "-80px" })}
        if (top_main-26 > 250&& top_main-26 < 350) {$(".gun").css({"bottom" : "-90px" })}
        if (top_main-26 > 350&& top_main-26 < 450) {$(".gun").css({"bottom" : "-100px" })}
        if (top_main-26 > 450&& top_main-26 < 550) {$(".gun").css({"bottom" : "-110px" })}
        if (top_main-26 > 550&& top_main-26 < 610) {$(".gun").css({"bottom" : "-120px" })}
          
  }

})
var shoot_ede = 0;
$( ".main_div" ).click(function() {
        if (shoot_ede == 0 && buler_counter > 0) 
        {
            console.log("click top", clikc_1);
            console.log("click left", clikc_2);
            $(".gun_shoot").css({"display" : "block" })
            shoot_ede = 1;
            buler_counter--;
            show_bulet();
            gun_shoot_sound.play();
            setTimeout(function(){
              $(".gun_shoot").css({"display" : "none" })
            }, 100);
            
            setTimeout(function(){
              shoot_ede = 0;
            }, 1000);
        }
});


function show_bulet(){
  for (var i = 1; i < 16; i++) {
    $("#N_1_"+i).css({"display" : "none"});
  }

  for (var b = 1; b <= buler_counter; b++) {
    $("#N_1_"+b).css({"display" : "inline-block"});
  }
    console.log(buler_counter);
    
}

  document.addEventListener('contextmenu', event => event.preventDefault());

$( ".main_div" ).contextmenu(function() {
  buler_counter = 15;
  show_bulet();
  magazine.play();
  
});
var baloons = new Array()

for (var i = 0; i < 10; i++) {
  crate_balon();
}


function crate_balon () {
  var color_balon = ["balon/blue.png", "balon/green.png", "balon/orange.png"];
  var div = document.createElement("div");
  div.style.position = "absolute";
  div.style.top = "450px";
  var rand = getRandom(0, 1050)
  div.style.left = rand +"px";
  div.style.transition = "all 0.15s";
  div.style.width = "50px";
  div.style.height = "60px";
  div.style.color = "white";
  div.setAttribute('id', balon_id+'');
  div.setAttribute('class', 'balon');
  
  baloons.push({
    y: 450,
    x: rand,
    obj: div,
    dims: {w:50,h:60}
  })
  document.getElementById("main_div_1").appendChild(div);

  $("#"+balon_id).css({"background-image" : "url("+color_balon[getRandom(0, 2)]+")"});
  $("#"+balon_id).css({"background-size" : "100%"});
  $("#"+balon_id).css({"z-index" : "2"});
  balon_id++;
  bulone_count_main++;
}

console.log(baloons)




var mainLoop = function(){
  if(baloons.length === 0)
  {
    alert("agsrulda neba xvtisa")
    return

  } 
  for (var i = 0; i < baloons.length; i++) {
      if(baloons[i].y+60 > 0){

        baloons[i].y -= getRandom(0, 20);
        baloons[i].x -= getRandom(-10, 10);
        
        baloons[i].obj.style.top=`${baloons[i].y}px`
        baloons[i].obj.style.left=`${baloons[i].x}px`
      }else{
        baloons.splice(i,1)
      }


  }  



  setTimeout(function(){
    mainLoop();
  }, 150)
}

mainLoop();