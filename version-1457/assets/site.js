(function(){
  var menuBtn=document.querySelector('[data-menu-button]');
  var mobile=document.querySelector('[data-mobile-menu]');
  if(menuBtn&&mobile){menuBtn.addEventListener('click',function(){mobile.classList.toggle('open')})}
  var hero=document.querySelector('[data-hero]');
  if(hero){
    var slides=[].slice.call(hero.querySelectorAll('.hero-slide'));
    var dots=[].slice.call(hero.querySelectorAll('.hero-dot'));
    var current=0;
    function show(n){
      if(!slides.length)return;
      current=(n+slides.length)%slides.length;
      slides.forEach(function(s,i){s.classList.toggle('active',i===current)});
      dots.forEach(function(d,i){d.classList.toggle('active',i===current)});
    }
    dots.forEach(function(d,i){d.addEventListener('click',function(){show(i)})});
    show(0);
    setInterval(function(){show(current+1)},5200);
  }
  var inputs=[].slice.call(document.querySelectorAll('[data-filter-input]'));
  inputs.forEach(function(input){
    var target=document.querySelector(input.getAttribute('data-filter-input'));
    if(!target)return;
    var cards=[].slice.call(target.querySelectorAll('[data-title]'));
    input.addEventListener('input',function(){
      var q=input.value.trim().toLowerCase();
      cards.forEach(function(card){
        var text=(card.getAttribute('data-title')+' '+card.getAttribute('data-region')+' '+card.getAttribute('data-genre')).toLowerCase();
        card.classList.toggle('hidden-card',q&&text.indexOf(q)===-1);
      });
    });
  });
  var sorts=[].slice.call(document.querySelectorAll('[data-sort-select]'));
  sorts.forEach(function(sel){
    var target=document.querySelector(sel.getAttribute('data-sort-select'));
    if(!target)return;
    sel.addEventListener('change',function(){
      var cards=[].slice.call(target.children);
      var key=sel.value;
      cards.sort(function(a,b){
        var av=parseFloat(a.getAttribute('data-'+key)||'0');
        var bv=parseFloat(b.getAttribute('data-'+key)||'0');
        return bv-av;
      });
      cards.forEach(function(c){target.appendChild(c)});
    });
  });
  var players=[].slice.call(document.querySelectorAll('.player[data-play]'));
  players.forEach(function(box){
    var video=box.querySelector('video');
    var button=box.querySelector('.player-button');
    var src=box.getAttribute('data-play');
    var ready=false;
    function prepare(){
      if(ready||!video||!src)return;
      ready=true;
      if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=src;}
      else if(window.Hls&&window.Hls.isSupported()){var hls=new Hls({enableWorker:true,lowLatencyMode:true});hls.loadSource(src);hls.attachMedia(video);}
      else{video.src=src;}
    }
    function start(){prepare();if(video){video.play().catch(function(){});box.classList.add('playing');}}
    if(button){button.addEventListener('click',start)}
    if(video){
      video.addEventListener('click',function(){if(video.paused){start()}else{video.pause()}});
      video.addEventListener('play',function(){box.classList.add('playing')});
      video.addEventListener('pause',function(){box.classList.remove('playing')});
    }
  });
})();