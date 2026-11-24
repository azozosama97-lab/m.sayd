(function(){
  var FREE = 1500;
  var products = [
    {id:'classic', name:'دفا كلاسيك', type:'plain', price:749, badge:'الأكتر طلباً', desc:'قصّة مستقيمة وجيب كانجرو. بيلبس مع أي حاجة.',
      colors:[{n:'رمادي هيذر',c:'#8A8F98'},{n:'أسود',c:'#1C1F24'},{n:'زيتي',c:'#5B6B4A'}]},
    {id:'zip', name:'دفا زيب', type:'zip', price:849, badge:'', desc:'سوستة معدن كاملة. تفتحه وتقفله حسب الجو.',
      colors:[{n:'كحلي',c:'#26344A'},{n:'فحمي',c:'#3A3F47'}]},
    {id:'over', name:'دفا أوفرسايز', type:'plain', price:799, badge:'جديد', desc:'كتف نازل وطول زيادة. مريح من أول لبسة.',
      colors:[{n:'رملي',c:'#C9B79C'},{n:'أبيض كسر',c:'#E4E1DA'},{n:'بني',c:'#7A5B45'}]},
    {id:'street', name:'دفا ستريت', type:'print', price:899, badge:'', desc:'طبعة على الصدر بحبر مرن مش بيتشقق.',
      colors:[{n:'أسود',c:'#1C1F24'},{n:'برتقالي محروق',c:'#C8430B'}]},
    {id:'crop', name:'دفا كروب', type:'plain', price:699, badge:'', desc:'أقصر من العادي وبيظبط مع الجينز عالي الوسط.',
      colors:[{n:'وردي دخاني',c:'#C79A9A'},{n:'أخضر مريمية',c:'#8DA38A'}]},
    {id:'heavy', name:'دفا ثقيل', type:'zip', price:999, badge:'٥٠٠ جم', desc:'أتقل قماش عندنا. للبرد الحقيقي.',
      colors:[{n:'فحمي',c:'#34393F'},{n:'عنابي',c:'#6E2B3A'}]}
  ];
  var sizes = ['S','M','L','XL','XXL'];
  var cart = [];
  var $ = function(id){return document.getElementById(id)};
  var fmt = function(n){return Number(n).toLocaleString('ar-EG')};

  function extras(type){
    if(type==='zip') return '<path d="M100 66 V205" stroke="#000" stroke-opacity=".4" stroke-width="3" fill="none"/><path d="M100 66 V205" stroke="#fff" stroke-opacity=".5" stroke-width="1" stroke-dasharray="2 3" fill="none"/>';
    if(type==='print') return '<circle cx="100" cy="116" r="15" fill="#fff" fill-opacity=".92"/><path d="M92 116 H108 M100 108 V124" stroke="#1C1F24" stroke-width="3" stroke-linecap="round" fill="none"/>';
    return '';
  }
  function svg(p,color){
    return '<svg viewBox="0 0 200 220" style="color:'+color+'" aria-hidden="true"><use href="#h-base" width="200" height="220"/>'+extras(p.type)+'</svg>';
  }

  function renderGrid(filter){
    var html = products.filter(function(p){return filter==='all'||p.type===filter}).map(function(p){
      var sw = p.colors.map(function(c,i){
        return '<button type="button" class="swatch" data-i="'+i+'" aria-label="'+c.n+'" aria-pressed="'+(i===0)+'" style="background:'+c.c+'"></button>';
      }).join('');
      var opts = sizes.map(function(s){return '<option'+(s==='L'?' selected':'')+'>'+s+'</option>'}).join('');
      return '<article class="card" data-id="'+p.id+'" data-ci="0">'+
        '<div class="art">'+svg(p,p.colors[0].c)+(p.badge?'<span class="badge">'+p.badge+'</span>':'')+'</div>'+
        '<div class="info"><h3>'+p.name+'</h3><p class="meta">'+p.desc+'</p>'+
        '<div class="swatch-row">'+sw+'<span class="cname">'+p.colors[0].n+'</span></div>'+
        '<label class="sr" for="sz-'+p.id+'">المقاس</label><select class="size" id="sz-'+p.id+'">'+opts+'</select>'+
        '<div class="buy"><span class="price">'+fmt(p.price)+' ج</span><button type="button" class="btn primary add">أضف للسلة</button></div>'+
        '</div></article>';
    }).join('');
    $('grid').innerHTML = html;
  }

  function byId(id){return products.filter(function(p){return p.id===id})[0]}

  $('grid').addEventListener('click',function(e){
    var card = e.target.closest('.card'); if(!card) return;
    var p = byId(card.dataset.id);
    var sw = e.target.closest('.swatch');
    if(sw){
      var i = +sw.dataset.i; card.dataset.ci = i;
      card.querySelectorAll('.swatch').forEach(function(b){b.setAttribute('aria-pressed', b===sw)});
      card.querySelector('.art svg').style.color = p.colors[i].c;
      card.querySelector('.cname').textContent = p.colors[i].n;
      return;
    }
    if(e.target.closest('.add')){
      addToCart(p, p.colors[+card.dataset.ci], card.querySelector('.size').value);
    }
  });

  $('filters').addEventListener('click',function(e){
    var b = e.target.closest('button'); if(!b) return;
    $('filters').querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed', x===b)});
    renderGrid(b.dataset.f);
  });

  function addToCart(p,color,size){
    var key = p.id+'|'+color.n+'|'+size;
    var found = cart.filter(function(i){return i.key===key})[0];
    if(found) found.qty++; else cart.push({key:key,p:p,color:color,size:size,qty:1});
    renderCart(); toast('اتضاف للسلة: '+p.name);
  }

  function renderCart(){
    var n = 0, total = 0;
    cart.forEach(function(i){n+=i.qty; total+=i.qty*i.p.price});
    $('count').textContent = fmt(n);
    $('total').textContent = fmt(total)+' ج';
    var left = FREE - total;
    $('shipTxt').textContent = left>0 ? 'فاضل '+fmt(left)+' ج وشحنك يبقى مجاني' : 'شحنك مجاني';
    $('shipBar').style.width = Math.min(100, total/FREE*100)+'%';
    $('items').innerHTML = cart.length ? cart.map(function(i){
      return '<div class="line"><div class="thumb">'+svg(i.p,i.color.c)+'</div>'+
        '<div><h4>'+i.p.name+'</h4><small>'+i.color.n+' · '+i.size+'</small>'+
        '<div class="qty"><button type="button" data-k="'+i.key+'" data-a="-" aria-label="قلّل">−</button><span>'+fmt(i.qty)+'</span><button type="button" data-k="'+i.key+'" data-a="+" aria-label="زوّد">+</button></div></div>'+
        '<strong>'+fmt(i.qty*i.p.price)+' ج</strong></div>';
    }).join('') : '<p class="empty">السلة فاضية. اختار هودي يدفّيك.</p>';
  }

  $('items').addEventListener('click',function(e){
    var b = e.target.closest('button[data-k]'); if(!b) return;
    var it = cart.filter(function(i){return i.key===b.dataset.k})[0]; if(!it) return;
    it.qty += b.dataset.a==='+' ? 1 : -1;
    if(it.qty<=0) cart.splice(cart.indexOf(it),1);
    renderCart();
  });

  function openCart(o){
    $('drawer').classList.toggle('open',o);
    $('scrim').classList.toggle('open',o);
    $('drawer').setAttribute('aria-hidden', String(!o));
  }
  $('openCart').addEventListener('click',function(){openCart(true)});
  $('closeCart').addEventListener('click',function(){openCart(false)});
  $('scrim').addEventListener('click',function(){openCart(false)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape') openCart(false)});
  $('checkout').addEventListener('click',function(){
    toast(cart.length ? 'هنا بتربط الدفع أو الطلب على واتساب' : 'السلة فاضية');
  });

  var tt;
  function toast(m){
    var t = $('toast'); t.textContent = m; t.classList.add('show');
    clearTimeout(tt); tt = setTimeout(function(){t.classList.remove('show')},2200);
  }

  renderGrid('all');
  renderCart();
})();