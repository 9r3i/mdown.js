/**
 * plain helper
 * requires: _GLOBAL and _BLOG object
 */
;function PlainHelper(){
this.version='1.1.0';
window._PlainHelper=this;
this.assetsList=function(assets){
  if(Object.keys(assets).length<1){
    return '';
  }
  let res='<div class="assets">'
    +'<div class="assets-title">Assets</div>';
  for(let name in assets){
    let url=assets[name].url,
    size=Math.ceil(assets[name].size/1024),
    tsize=size<1024?size+'kb'
      :Math.ceil(size/1024)+'mb';
    res+='<div class="assets-each">'
      +'<a target="_blank" href="'+url
      +'" title="download:'+name
      +'">[download:'+name+':'+tsize+']</a></div>';
  }res+='</div>';
  return res;
};
this.headers=function(token){
  return {
    "Accept": "application/vnd.github+json",
    "Authorization": "Bearer "+token,
    "X-GitHub-Api-Version": "2022-11-28",
  };
};
this.dataPosts=function(data){
let posts={};
_GLOBAL.mainPosts=_GLOBAL.hasOwnProperty('mainPosts')
  ?_GLOBAL.mainPosts:{};
for(let post of Object.values(data)){
  let assets={};
  for(let asset of post.assets){
    assets[asset.name]={
      name:asset.name,
      type:asset.content_type,
      size:asset.size,
      time:asset.created_at,
      tag:post.tag_name,
      url:asset.browser_download_url,
      downloaded:asset.download_count,
      relfo:[
          'https://relfo.vercel.app',
          _BLOG.db.config.username,
          _BLOG.db.config.name,
          post.tag_name,
          asset.name,
        ].join('/'),
    };
  }
  posts[post.id]={
    id:post.id,
    title:post.name,
    content:post.body,
    time:post.created_at,
    draft:post.draft,
    tag:post.tag_name,
    author:post.author.login,
    authorID:post.author.id,
    authorPicture:post.author.avatar_url,
    authorURL:post.author.html_url,
    assets,
  };
  if(post.hasOwnProperty('tag_name')
    &&post.tag_name.match(/^\d+\.\d+\.\d+$/)
    &&post.tag_name==_BLOG.config.theme.mainTagName
    &&!_GLOBAL.site.across
    ){
    _GLOBAL.mainPosts[post.tag_name]=posts[post.id];
    delete posts[post.id];
  }
}
return posts;
};
this.tags=function(posts){
  let tags={},tagName='#islam',tagsByName=[],
  tagsHTML=document.createElement('div');
  tagsHTML.classList.add('tags-content');
  for(let i in posts){
    if(typeof posts[i].content!=='string'){continue;}
    let akur=posts[i].content.match(/#[a-z][a-z0-9_]+/ig);
    if(!akur){continue;}
    let postID=posts[i].id;
    for(let e=0;e<akur.length;e++){
      tagName=akur[e].toLowerCase();
      if(tagsByName.indexOf(tagName)<0){
        tagsByName.push(tagName);
      }
      if(!tags.hasOwnProperty(tagName)){
        tags[tagName]=[];
      }
      if(tags[tagName].indexOf(postID)>=0){continue;}
      tags[tagName].push(postID);
    }
  }
  tagsByName.sort();
  for(let e=0;e<tagsByName.length;e++){
    let i=tagsByName[e],
    an=document.createElement('a'),
    space=document.createTextNode(' ');
    an.classList.add('tag-count-'+this.tagClass(tags[i].length));
    an.classList.add('tags-each');
    an.href='?tag='+i.substr(1);
    an.title=i;
    an.dataset.content=i.substr(1)+'('+tags[i].length+')';
    tagsHTML.appendChild(an);
    tagsHTML.appendChild(space);
  }
  return {
    total:tagsByName.length,
    element:tagsHTML,
    html:tagsHTML.outerHTML,
  };
};
this.tagClass=function(count){
  count=count?parseInt(count):0;
  count=Math.max(count,0);
  let classes={
    'ultra-high':128,
    'very-high':64,
    'high':32,
    'moderate-high':16,
    'moderate':8,
    'moderate-low':4,
    'low':2,
    'very-low':1,
  },
  className='very-low';
  for(let i in classes){
    if(count>=classes[i]){className=i;break;}
  }return className;
};
this.contentFindTags=function(content){
  content=typeof content==='string'?content:'';
  return content.replace(/#[a-z][a-z0-9_]+/ig,function(m){
    return '<a href="?tag='+m.substr(1).toLowerCase()
      +'" title="'+m.toLowerCase()+'">'+m+'</a>';
  }).replace(/oleh:\s([^\r\n]+)/i,function(m){
    return 'Oleh: <a href="?search='+encodeURIComponent(m.substr(6))
      +'" title="'+m.substr(6)+'">'+m.substr(6)+'</a>';
  });
};
this.contentLink=function(content,assets){
  content=typeof content==='string'?content:'';
  let pl='',
  yptrn=/\[embed:https:\/\/youtu\.be\/([a-z0-9\-_]+)([^\]]*)\]/ig,
  yptrni=/\[embed:https:\/\/youtu\.be\/([a-z0-9\-_]+)([^\]]*)\]/i,
  gptrn=/\[embed:(https:\/\/github\.com\/[^:]+):([a-z0-9]+)\]/ig,
  gptrni=/\[embed:(https:\/\/github\.com\/[^:]+):([a-z0-9]+)\]/i,
  iptrn=/\[image:(https?:\/\/[^:]+):([a-z0-9]+)\]/ig,
  iptrni=/\[image:(https?:\/\/[^:]+):([a-z0-9]+)\]/i,
  ptrn=/\[(audio|video|image|frame|text):([^\]:]+)(:[^\]]+)?\]/ig,
  ptrni=/\[(audio|video|image|frame|text):([^\]:]+)(:[^\]]+)?\]/i,
  tptrn=/\!\[([^\]]*)\]\(([^\)]+)\)/ig,
  tptrni=/\!\[([^\]]*)\]\(([^\)]+)\)/i,
  lptrn=/\[link:(https?:\/\/[^:]+):([^\]]+)\]/ig,
  lptrni=/\[link:(https?:\/\/[^:]+):([^\]]+)\]/i;
  return content.replace(ptrn,function(akur){
    let m=akur.match(ptrni);
    if(!m||!assets.hasOwnProperty(m[2])){
      return akur;
    }
    let asset=assets[m[2]],
    url=asset.url;
    if(m[1]=='image'){
      return '<a href="'+url+'" title="'+asset.name+'" target="_blank">'
        +'<img src="'+url+'" alt="'+asset.name
        +'" style="max-width:100%;" width="100%" />'
        +'</a>';
    }else if(m[1]=='audio'){
      return '<a href="'+url+'" title="'+asset.name
        +'" target="_blank">'
        +akur+'</a><br />'
        +'<audio controls width="100%" height="auto">'
        +'<source src="'+url+'" type="'+asset.type+'">'
        +'</audio>';
    }else if(m[1]=='video'){
      return '<a href="'+url+'" title="'+asset.name
        +'" target="_blank">'
        +akur+'</a><br />'
        +'<video controls width="auto" height="auto">'
        +'<source src="'+url+'" type="'+asset.type+'">'
        +'</video>';
    }else if(m[1]=='frame'){
      let height=m[3]?m[3].substr(1):'400px';
      return '<a href="'+url+'" target="_blank">'
        +asset.name+'</a>'
        +'<div id="'+asset.name+'">'
        +'<iframe style="height:'+height+';" src="'
        +(asset.relfo?asset.relfo:url)
        +'"></iframe> '
        +'<button onclick="_PlainHelper.fullscreen(this)" '
        +'data-frame="'+asset.name+'"a>Fullscreen</button>'
        +'</div>';
    }else if(m[1]=='text'){
      let furl=asset.relfo?asset.relfo:url,
      turl=_BLOG.config.theme.hasOwnProperty('reader')
        ?_BLOG.config.theme.reader
        :'https://relfo.vercel.app/9r3i/plain.js/reader/',
      xurl=turl+'?url='+encodeURIComponent(furl)
        +'&title='+encodeURIComponent(asset.name),
      height=m[3]?m[3].substr(1):'400px';
      return '<a href="'+url+'" target="_blank">'
        +'[text:'+asset.name+']</a>'
        +'<div id="'+asset.name+'">'
        +'<iframe style="height:'+height+';" src="'
        +xurl
        +'"></iframe> '
        +'<button onclick="_PlainHelper.fullscreen(this)" '
        +'data-frame="'+asset.name+'"a>Fullscreen</button>'
        +'</div>';
    }
    return '<a href="'+url+'" title="'+asset.name
      +'" target="_blank">'+akur+'</a>';
  }).replace(tptrn,function(m){
    let im=m.match(tptrni),
    ilink=m,
    ialt=m;
    if(im){
      ilink=im[2];
      ialt=im[1];
    }
    return '<a href="'+ilink+'" title="'+ialt+'" target="_blank">'
      +'<img src="'+ilink+'" alt="'
      +ialt+'" style="max-width:100%;" width="100%" />'
      +'</a>';
  }).replace(iptrn,function(m){
    let im=m.match(iptrni),
    ilink=m,
    ialt=m;
    if(im){
      ilink=im[1];
      ialt=im[2];
    }
    return '<a href="'+ilink+'" title="'+ialt+'" target="_blank">'
      +'<img src="'+ilink+'" alt="'
      +ialt+'" style="max-width:100%;" width="100%" />'
      +'</a>';
  }).replace(yptrn,function(m){
    let ym=m.match(yptrni),
    ylinke=m,
    ylink=m,
    ytext=m;
    if(ym){
      ylinke='https://www.youtube.com/embed/'+ym[1];
      ylink='https://youtu.be/'+ym[1];
      ytext='[embed:'+ylink+']';
    }
    let ww=window.innerWidth,
    cw=Math.min(720,ww),
    ih=Math.floor(cw/16*9);
    return '<a href="'+ylink+'" target="_blank">'+ytext+'</a>'
      +'<div id="'+ylink+'">'
      +'<iframe style="height:'+ih+'px" src="'
      +ylinke+'"></iframe> '
      +'<button onclick="_PlainHelper.fullscreen(this)" data-frame="'+ylink+'"a>Fullscreen</button>'
      +'</div>';
  }).replace(gptrn,function(m){
    let gm=m.match(gptrni),
    glink=m,
    gheight='400px';
    if(gm){
      glink=gm[1];
      gheight=gm[2];
    }
    let data=_PlainHelper.htmlBase(glink),
    url=_PlainHelper.htmlBlob(data);
    return '<a href="'+glink+'" target="_blank">'+m+'</a>'
      +'<div id="'+glink+'">'
      +'<iframe style="height:'+gheight+';" src="'
      +url+'"></iframe> '
      +'<button onclick="_PlainHelper.fullscreen(this)" data-frame="'+glink+'"a>Fullscreen</button>'
      +'</div>';
  }).replace(lptrn,function(m){
    let lm=m.match(lptrni),
    llink=m,
    ltitle=m;
    if(lm){
      llink=lm[1];
      ltitle=lm[2];
    }
    return '<a href="'+llink+'" title="'+ltitle
      +'" target="_blank">'+ltitle+'</a>';
  });
};
this.fullscreen=function(btn){
  let fr=document.getElementById(btn.dataset.frame);
  if(!fr){return false;}
  if(fr.classList.contains('frame-fullscreen')){
    btn.innerText='Fullscreen';
    fr.firstChild.style.height=fr.firstChild.dataset.height;
    fr.classList.remove('frame-fullscreen');
    document.exitFullscreen();
  }else{
    btn.innerText='Exit Fullscreen';
    fr.firstChild.dataset.height=fr.firstChild.style.height;
    fr.firstChild.style.height='';
    fr.firstChild.style.removeProperty('height');
    fr.classList.add('frame-fullscreen');
    fr.requestFullscreen();
  }
};
this.htmlBlob=function(data,type){
  type=typeof type==='string'?type:'text/html';
  let blob=new Blob([data],{type}),
  url=window.URL.createObjectURL(blob);
  /* window.URL.revokeObjectURL(url); */
  return url;
};
this.htmlBase=function(link){
  return '<!DOCTYPE html><html lang="en-US" dir="ltr"><head><meta http-equiv="content-type" content="text/html;charset=utf-8" /><meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" /><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" /><title>9r3i\\github::embed</title></head><body style="margin:0px;padding:0px;"><script src="https://emgithub.com/embed-v2.js?target='
    +encodeURIComponent(link)
    +'&style=atom-one-dark&type=code&showBorder=on&showLineNumbers=on&showFileMeta=on&showCopy=on"></script></body></html>';
};
this.textBase=function(title,url){
  return '';
};
/* testing code */
this.test=function(a,b,c){
  let parse=new parser,
  loaded=[],
  sc=document.querySelectorAll('script[id]');
  for(let i=0;i<sc.length;i++){
    loaded.push(sc[i].id);
  }
  document.body.innerHTML='<pre>'
    +'[loaded.files]\n'
    +parse.likeJSON(loaded)
    +'\n\n'
    +'[stored.files]\n'
    +parse.likeJSON(this.virtual.list(true))
    +'\n\n'
    +'[config]\n'
    +parse.likeJSON(this.config,3)
    +'\n\n'
    +'[args]\n'
    +parse.likeJSON({arguments},5)
    +'\n\n'
    +'[this]\n'
    +parse.likeJSON(this,5)
    +'\n\n'
    +'</pre>'
    +'';
};
};