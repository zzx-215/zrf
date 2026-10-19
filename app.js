const images=[
  {src:'assets/cover.webp',title:'专辑正面',alt:'自在极意锋黑胶唱片与星尘人像封套'},
  {src:'assets/back-white.webp',title:'专辑背面',alt:'自在极意锋专辑背面与十首曲目'}
];
let current=0,modalIndex=0,toastTimer,returnFocus,switchTimer;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const frame=$('#galleryFrame');

function paintImage(i){
  current=(i+images.length)%images.length;
  const item=images[current];
  $('#heroImage').src=item.src;
  $('#heroImage').alt=item.alt;
  $('#imageCount').textContent=`0${current+1} / 02`;
  $('#openImage').setAttribute('aria-label','放大查看'+item.title);
  $$('.thumb').forEach((button,index)=>{
    button.classList.toggle('selected',index===current);
    button.setAttribute('aria-pressed',index===current);
  });
}
function selectImage(i,direction){
  const next=(i+images.length)%images.length;
  if(next===current)return;
  clearTimeout(switchTimer);
  frame.classList.remove('is-switching-left','is-switching-right');
  frame.classList.add(direction==='right'?'is-switching-right':'is-switching-left');
  window.setTimeout(()=>paintImage(next),145);
  switchTimer=window.setTimeout(()=>frame.classList.remove('is-switching-left','is-switching-right'),360);
}
$$('.thumb').forEach(button=>button.addEventListener('click',()=>{
  const next=Number(button.dataset.index);
  selectImage(next,next>current?'left':'right');
}));

function toast(text){
  $('#toast').textContent=text;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2200);
}
let saved=false;
try{saved=localStorage.getItem('ego-king-favorite')==='true'}catch{}
function renderFavorite(){
  $$('.favorite').forEach(button=>{
    button.setAttribute('aria-pressed',saved);
    button.setAttribute('aria-label',saved?'取消收藏':'收藏专辑');
    const label=button.querySelector('span');
    if(label)label.textContent=saved?'已收藏':'收藏';
  });
}
renderFavorite();
$$('.favorite').forEach(button=>button.addEventListener('click',()=>{
  saved=!saved;
  let persisted=true;
  try{localStorage.setItem('ego-king-favorite',String(saved))}catch{persisted=false}
  renderFavorite();
  toast(saved?(persisted?'已收藏至此浏览器':'本次浏览已收藏'):'已取消收藏');
}));
$$('.share').forEach(button=>button.addEventListener('click',async()=>{
  const url=location.origin+location.pathname;
  try{
    if(navigator.share){await navigator.share({title:'自在极意锋 · 郑锐锋',text:'探索《自在极意锋》个人黑胶专辑',url});return}
    await navigator.clipboard.writeText(url);toast('专辑链接已复制');
  }catch(error){if(error.name!=='AbortError')toast('请从浏览器地址栏复制链接')}
}));

const dialog=$('#lightbox');
function renderModal(){
  const item=images[modalIndex];
  $('#lightboxImage').src=item.src;$('#lightboxImage').alt=item.alt;
  $('#lightboxTitle').textContent=item.title;$('#lightboxCounter').textContent=`${modalIndex+1} / 2`;
  $('.lightbox-scroll').classList.remove('zoomed');$('#zoomToggle').textContent='放大';
  $('.lightbox-scroll').scrollTop=0;$('.lightbox-scroll').scrollLeft=0;
}
function openModal(i){returnFocus=document.activeElement;modalIndex=i;renderModal();dialog.showModal();document.body.style.overflow='hidden'}
$('#openImage').onclick=()=>openModal(current);$('#zoomButton').onclick=()=>openModal(current);$('.back-art').onclick=()=>openModal(1);$('#closeLightbox').onclick=()=>dialog.close();
dialog.addEventListener('close',()=>{document.body.style.overflow='';returnFocus?.focus()});
function stepModal(n){modalIndex=(modalIndex+n+images.length)%images.length;renderModal()}
$('#prevImage').onclick=()=>stepModal(-1);$('#nextImage').onclick=()=>stepModal(1);
$('#zoomToggle').onclick=()=>{const zoomed=$('.lightbox-scroll').classList.toggle('zoomed');$('#zoomToggle').textContent=zoomed?'适合屏幕':'放大'};
document.addEventListener('keydown',event=>{if(dialog.open){if(event.key==='ArrowLeft')stepModal(-1);if(event.key==='ArrowRight')stepModal(1);}});

let touchStart=null,dragging=false;
frame.addEventListener('touchstart',event=>{
  touchStart={x:event.touches[0].clientX,y:event.touches[0].clientY};dragging=false;
  frame.style.transition='none';
},{passive:true});
frame.addEventListener('touchmove',event=>{
  if(!touchStart)return;
  const dx=event.touches[0].clientX-touchStart.x,dy=event.touches[0].clientY-touchStart.y;
  if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>7){
    dragging=true;event.preventDefault();
    frame.style.setProperty('--drag-x',`${Math.max(-52,Math.min(52,dx*.42))}px`);
    frame.style.setProperty('--tilt-y',`${Math.max(-3,Math.min(3,dx/35))}deg`);
  }
},{passive:false});
frame.addEventListener('touchend',event=>{
  if(!touchStart)return;
  const dx=event.changedTouches[0].clientX-touchStart.x,dy=event.changedTouches[0].clientY-touchStart.y;
  frame.style.transition='';frame.style.setProperty('--drag-x','0px');frame.style.setProperty('--tilt-y','0deg');
  if(dragging&&Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy))selectImage(current+(dx<0?1:-1),dx<0?'left':'right');
  touchStart=null;dragging=false;
},{passive:true});

if(matchMedia('(pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
  frame.addEventListener('pointermove',event=>{
    const rect=frame.getBoundingClientRect();
    const px=(event.clientX-rect.left)/rect.width-.5,py=(event.clientY-rect.top)/rect.height-.5;
    frame.style.setProperty('--tilt-y',`${px*4.5}deg`);frame.style.setProperty('--tilt-x',`${py*-4.5}deg`);
  });
  frame.addEventListener('pointerleave',()=>{frame.style.setProperty('--tilt-y','0deg');frame.style.setProperty('--tilt-x','0deg')});
}

const sectionLinks=$$('.section-nav a');
const sections=['details','tracks','story'].map(id=>document.getElementById(id));
let scrollTicking=false;
function updateScroll(){
  const y=window.scrollY,max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
  $('#scrollProgress').style.transform=`scaleX(${Math.min(1,y/max)})`;
  let active=sections[0];
  for(const section of sections)if(section.getBoundingClientRect().top<=140)active=section;
  sectionLinks.forEach(link=>{
    const on=link.hash==='#'+active.id;link.classList.toggle('active',on);
    if(on)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
  });
  const galleryRect=frame.getBoundingClientRect();
  if(galleryRect.bottom>0&&galleryRect.top<innerHeight){
    const progress=Math.max(-1,Math.min(1,(innerHeight*.5-(galleryRect.top+galleryRect.height*.5))/innerHeight));
    frame.style.setProperty('--parallax-y',`${progress*8}px`);
  }
  $('.ambient-one').style.transform=`translate3d(0,${y*.035}px,0)`;
  $('.ambient-two').style.transform=`translate3d(0,${-y*.025}px,0)`;
  scrollTicking=false;
}
window.addEventListener('scroll',()=>{if(!scrollTicking){requestAnimationFrame(updateScroll);scrollTicking=true}},{passive:true});
updateScroll();

const revealNodes=$$('.product-info,.gallery,.section-heading,.long-image,.track-layout,.concept-hero,.concept-copy,.concept-symbols,.concept-journey,.story blockquote');
revealNodes.forEach((node,index)=>{node.classList.add('reveal');if(index%3===1)node.classList.add('reveal-delay')});
if('IntersectionObserver'in window&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}
  }),{threshold:.08,rootMargin:'0px 0px -6%'});
  revealNodes.forEach(node=>observer.observe(node));
}else revealNodes.forEach(node=>node.classList.add('is-visible'));
