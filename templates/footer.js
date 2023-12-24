let sinput=document.getElementById('search-input'),
sresult=document.getElementById('search-result'),
stotal=document.querySelector('div[class="post-detail"]'),
stitle=document.querySelector('h3[class="post-title"]'),
scode=document.querySelector('div[class="site-code"]'),
reloada=document.querySelector('a[id="site-reload"]');
if(scode){
  scode.onclick=function(){
    /* this.parentNode.removeChild(scode); */
  }
}
if(sresult&&sinput&&stotal&&stitle){
  sinput.onkeyup=function(e){
    let val=this.value,
    res='',
    count=0,
    rtitle='Search: '+val,
    keys=Object.keys(_GLOBAL.posts).reverse();
    if(e.keyCode==13){
      return _BLOG.route.go('?search='+encodeURIComponent(val));
    }
    for(let id of keys){
      let post=_GLOBAL.posts[id],
      akur=post.content.match(new RegExp(val,'ig')),
      akut=post.title.match(new RegExp(val,'ig'));
      if(akut||akur){
        count++;
        res+='<div class="post-each">'
          +'<a href="?id='+id+'">'
          +post.title+'</a></div>';
      }
    }
    sresult.innerHTML=res;
    stotal.innerText='Total: '+count+' posts';
    stitle.innerText=rtitle;
    _BLOG.route.anchor();
    _BLOG.route.title(rtitle+' \xb7  '+_GLOBAL.site.name);
  };
}else if(_GET.hasOwnProperty('lang')){
  _GLOBAL.langSet(_GLOBAL.langGet()=='en'?'id':'en');
  location.assign('?home');
}else if(_GET.hasOwnProperty('reload')){
  let helper=new PlainHelper,
  durl=helper.htmlBlob(JSON.stringify(_GLOBAL.posts),'octet/stream'),
  dload=confirm('Download data?');
  if(dload){
    window.open(durl,'_blank');
  }
  localStorage.clear();
  if(stitle){
    stitle.style.color='#b33';
  }
  if(reloada){
    reloada.parentNode.removeChild(reloada);
  }
  setTimeout(()=>{
    let url=_BLOG.route.baseurl;
    if(_GET.reload!=''){
      url=_GET.reload;
    }
    location.assign(url);
  },0x3e8);
}else if(reloada){
  reloada.href='?reload='+encodeURIComponent(location.search);
}

setTimeout(()=>{
  hljs.highlightAll();
  let menus=document.querySelector('.site-menu');
  siteMenuShow(menus.children);
},500);


/* prepare locale */
(async function(){
  let url=[
    _BLOG.config.theme.host,
    _BLOG.config.theme.namespace,
    'locale.json',
  ].join('/'),
  loc=await locale.init(_GLOBAL.langGet(),url);
})();

let title=document.querySelector('title').textContent;
if(_GET.id){
  title=_GLOBAL.posts[_GET.id]
      ?_GLOBAL.posts[_GET.id].title
      :'Error: Post is not available.';
}
return _BLOG.route.title(title+' \xb7  '+_GLOBAL.site.name);

function siteMenuShow(menus,i){
  i=i?i:0;
  if(!menus.hasOwnProperty(i)){
    return false;
  }
  menus[i].classList.add('site-menu-each');
  setTimeout(()=>{
    siteMenuShow(menus,i+1);
  },100);
}
