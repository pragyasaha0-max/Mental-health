/* ============================================================
   resume buttons
   ============================================================ */
function cvBlob(p){
  const bin = atob(p.cvData.split(',')[1]), bytes = new Uint8Array(bin.length);
  for(let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], {type: 'application/pdf'});
}
function setCvButtons(p){
  const hasCv = !!(p && p.cvData);
  const site = document.documentElement.dataset.mode === 'site';
  $('resumeTxt').textContent = hasCv ? 'View My Resume' : 'Upload CV';
  $('cvLink').hidden = !hasCv;
  if(site) $('resumeBtn').hidden = !hasCv;
}
$('resumeBtn').onclick = () => {
  if(CURRENT && CURRENT.cvData) window.open(URL.createObjectURL(cvBlob(CURRENT)), '_blank');
  else $('fileInput').click();
};
$('cvLink').onclick = e => {
  e.preventDefault();
  if(!CURRENT || !CURRENT.cvData) return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(cvBlob(CURRENT));
  a.download = slugify(CURRENT.name) + '-cv.pdf';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
};
$('moreJobs').onclick = () => {
  const open = $('jobList').classList.toggle('is-open');
  $('moreJobs').firstElementChild.textContent = open ? 'Show fewer' : 'View all roles';
};
$('moreProj').onclick = () => {
  const open = $('cards').classList.toggle('is-open');
  $('moreProj').firstElementChild.textContent = open ? 'Show fewer' : 'View all projects';
};

/* ============================================================
   upload flow
   ============================================================ */
function setProgress(n, pct, title){
  [...$('steps').children].forEach((li, i) => { li.className = i < n ? 'done' : (i === n ? 'now' : ''); });
  $('arc').style.strokeDashoffset = ARC * (1 - pct / 100);
  $('pct').textContent = pct + '%';
  if(title) $('modalTitle').textContent = title;
}
function showError(msg){
  $('modal').classList.add('on');
  setProgress(0, 0, 'Could not build the page');
  $('err').textContent = msg;
  $('modalClose').hidden = false;
}
const readAsDataUrl = file => new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => res(''); r.readAsDataURL(file); });

async function handleFile(file){
  if(!file) return;
  $('err').textContent = ''; $('modalClose').hidden = true;
  if(!/pdf$/i.test(file.type) && !/\.pdf$/i.test(file.name)) return showError('Please choose a PDF file.');
  if(file.size > 10 * 1024 * 1024) return showError('That file is over 10 MB.');
  $('modal').classList.add('on');
  setProgress(0, 6, 'Reading the CV');
  try{
    const lines = await extractPdfText(file);
    if(lines.length < 3) return showError('No readable text found. Try a text-based PDF, not a scan.');
    setProgress(1, 30); await wait(350);
    const parsed = parseResume(lines);
    /* keep the PDF in the profile so the exported site can offer it (small files only) */
    if(file.size <= 2.5 * 1024 * 1024) parsed.cvData = await readAsDataUrl(file);
    setProgress(2, 55); await wait(350);
    setProgress(3, 80); await wait(350);
    renderProfile(parsed);
    setProgress(4, 100, 'Page ready');
    await wait(900);
    $('modal').classList.remove('on');
    window.scrollTo({top: 0, behavior: 'smooth'});
  }catch(err){
    console.error(err);
    showError('That file could not be read.');
  }
}
$('barUpload').onclick = () => $('fileInput').click();
$('modalClose').onclick = () => $('modal').classList.remove('on');
$('siteBtn').onclick = () => downloadSite();
$('fileInput').addEventListener('change', e => { handleFile(e.target.files[0]); e.target.value = ''; });

let dragDepth = 0;
window.addEventListener('dragenter', e => { e.preventDefault(); dragDepth++; $('dropzone').classList.add('on'); });
window.addEventListener('dragleave', e => { e.preventDefault(); if(--dragDepth <= 0){ dragDepth = 0; $('dropzone').classList.remove('on'); } });
window.addEventListener('dragover', e => e.preventDefault());
window.addEventListener('drop', e => { e.preventDefault(); dragDepth = 0; $('dropzone').classList.remove('on'); handleFile(e.dataTransfer.files[0]); });

/* ============================================================
   download: clone this page, switch it to site mode, bake the profile in
   ============================================================ */
function downloadSite(){
  const doc = document.documentElement.cloneNode(true);
  doc.dataset.mode = 'site';
  const scripts = doc.querySelectorAll('script');
  const last = scripts[scripts.length - 1];
  const END = '/* end-' + 'of-page-script */';       // built in two pieces so it only matches the real comment below
  const src = last.textContent;
  const at = src.lastIndexOf(END);
  last.textContent = src.slice(0, at + END.length) + '\nrenderProfile(' + JSON.stringify(CURRENT).replace(/<\//g, '<\\/') + ');\n';
  const blob = new Blob(['<!DOCTYPE html>\n' + doc.outerHTML], {type: 'text/html'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = slugify((CURRENT || {}).name) + '.html';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(a.href);
}

