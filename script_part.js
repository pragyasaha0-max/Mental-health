/* ============================================================
   page script: CV in, portfolio out
   ============================================================ */
const $ = id => document.getElementById(id);
const wait = ms => new Promise(r => setTimeout(r, ms));
const ARC = 226.2;                  // circumference of the r=36 progress ring
const NOW_YEAR = new Date().getFullYear();
let CURRENT = null;                 // set once a real CV has been processed


/* fictional CV shown before anything is uploaded; it goes through the same parser as a real PDF */
const SAMPLE = [
  'Name', 'Mental Health UX Designer', 'Pune, India', 'name@example.com', 'linkedin.com/in/name',
  'Summary',
  'UX designer who builds calm, trustworthy digital tools for therapy and wellbeing. I work with clinicians and people with lived experience to make support easier to find and easier to keep using.',
  'Experience',
  'Senior UX Designer, MindBridge Care', 'Jul 2022 - Present',
  '• Redesigned a therapy booking flow and lifted completed first sessions by 30%.',
  '• Built a gentle design system used across five wellbeing apps.',
  'Product Designer, Calmly Health', 'Jan 2021 - Jun 2022',
  '• Designed a mood journal with check-ins that people actually kept using.',
  'UX Research Intern, Haven Clinic', 'May 2020 - Dec 2020',
  '• Ran interviews with counsellors and clients to map the intake journey.',
  'Education',
  'Master of Design (Interaction), Riverside Institute of Design', '2018 - 2020',
  'Bachelor of Psychology, Bay City College', '2015 - 2018',
  'Projects',
  'Therapy Booking Flow', 'A calmer way to find a therapist, compare availability and book a first session.',
  'Teen Support App', 'Check-ins, coping tools and safe messaging designed with and for teenagers.',
  'Family Care Portal', 'Shared plans and session notes that keep families and therapists in step.',
  'Online Sessions Studio', 'Video therapy that feels private, steady and easy on low bandwidth.',
  'Couples Check-in Tool', 'Guided weekly prompts that help partners talk before small things grow.',
  'Group Sessions Hub', 'Shared spaces for group therapy, with gentle moderation and clear boundaries.',
  'Skills',
  'Figma, Design Systems, User Research, Prototyping, Accessibility, Trauma-informed Design, Content Design, Usability Testing',
  'Certifications',
  'Trauma-informed Care Certificate'
];

/* ---------- icons: 24px line icons, filled in wherever an element has data-ic ---------- */
const PATHS = {
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  leaf:'<path d="M6 31C4 17 12 7 30 5c2 15-4 26-18 27 3-8 8-14 15-18-9 3-15 9-18 17z" transform="scale(.6)"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>',
  play:'<path d="M8 5l11 7-11 7z" fill="currentColor"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  clock:'<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',
  cap:'<path d="M2 9l10-5 10 5-10 5zM6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5"/>',
  bank:'<path d="M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/>',
  user:'<circle cx="12" cy="8" r="3.6"/><path d="M5 20c0-4 3-6 7-6s7 2 7 6"/>',
  users:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.4 2.7-5.5 6-5.5s6 2.1 6 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.5 0 4 1.6 4 4.5"/>',
  award:'<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5L7 21l5-3 5 3-1.5-7.5"/>',
  layers:'<path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5"/>',
  pin:'<path d="M12 21c-4-4.5-6-7.5-6-10.5a6 6 0 0112 0c0 3-2 6-6 10.5z"/><circle cx="12" cy="10.5" r="2.2"/>',
  heart:'<path d="M12 20s-8-4.7-8-10.3A4.7 4.7 0 0112 7a4.7 4.7 0 018 2.7C20 15.3 12 20 12 20z"/>',
  brain:'<path d="M9 4a3 3 0 00-3 3 3 3 0 00-2 3 3 3 0 001.5 2.6A3.2 3.2 0 007 18a3 3 0 005 1V5a2 2 0 00-3-1zM15 4a3 3 0 013 3 3 3 0 012 3 3 3 0 01-1.5 2.6A3.2 3.2 0 0117 18a3 3 0 01-5 1V5a2 2 0 013-1z"/>',
  sofa:'<path d="M5 11V8a2 2 0 012-2h10a2 2 0 012 2v3M3 13a2 2 0 014 0v2h10v-2a2 2 0 014 0v5H3zM6 18v2M18 18v2"/>',
  laptop:'<rect x="5" y="5" width="14" height="10" rx="1.5"/><path d="M2.5 19h19"/>',
  lotus:'<path d="M12 20c-3-1-6-4-6-8 3 0 5 1 6 3 1-2 3-3 6-3 0 4-3 7-6 8zM12 15c-2-2-2-6 0-10 2 4 2 8 0 10zM3 11c1 3 3 5 6 6M21 11c-1 3-3 5-6 6"/>',
  star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  shield:'<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M12 9v6M9 12h6"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
  download:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  linkedin:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 11v5M8 8v.01M12 16v-5M12 13c0-1.5 1-2 2-2s2 .8 2 2.2V16"/>'
};
const svgIcon = name => '<svg viewBox="0 0 ' + (name === 'leaf' ? '24 24' : '24 24') + '" aria-hidden="true">' + (PATHS[name] || '') + '</svg>';
function paintIcons(root){ (root || document).querySelectorAll('[data-ic]').forEach(el => { el.innerHTML = svgIcon(el.dataset.ic); }); }
const BADGE_ICONS = ['user', 'users', 'heart', 'sofa', 'laptop', 'lotus'];
const PHOTOS = ['{{S1}}', '{{S2}}', '{{S3}}', '{{S4}}', '{{S5}}', '{{S6}}'];
const AVATARS = ['{{P1}}', '{{P2}}', '{{P3}}'];
const SKILL_ICONS = ['brain', 'heart', 'shield', 'lotus'];

/* ---------- small helpers ---------- */
function yearsLabel(y){ return y >= 1 ? {n: Math.floor(y), s: '+'} : {n: Math.round(y * 10) / 10, s: ''}; }
function setCount(id, n, suffix){ const el = $(id); el.textContent = '0'; CM.count(el, n, suffix || ''); }
function setHeading(el, html){
  el.innerHTML = html;
  delete el.dataset.cmSplit;
  el.classList.remove('is-in');
  CM.refresh();
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-in')));
}
function lastYear(dates){
  if(/present|current/i.test(dates || '')) return NOW_YEAR;
  const m = (dates || '').match(/\d{4}/g);
  return m ? parseInt(m[m.length - 1], 10) : 0;
}
const NOT_LISTED = 'Not listed';

/* ============================================================
   render
   ============================================================ */
function renderProfile(p, opts){
  opts = opts || {};
  const real = !opts.preview;
  if(real) CURRENT = p;
  const y = yearsLabel(computeYearsOfExperience(p.experience));
  const name = p.name || 'Name';
  const role = p.headline || (p.experience[0] && p.experience[0].title) || 'Wellbeing Professional';

  /* numbers */
  setCount('hYears', y.n, y.s);
  setCount('sYears', y.n, y.s);
  setCount('sProj', p.projects.length, '+');
  setCount('sSkill', p.skills.length);
  setCount('sEdu', p.education.length);

  /* hero */
  $('brand').textContent = name;
  $('footBrand').textContent = name;
  $('kick').textContent = [p.location, 'Portfolio'].filter(Boolean).join('. ');
  setHeading($('heroTitle'), 'Hi, I’m ' + escapeHtml(name) + ' <br><span class="cm-wipe pg-g">' + escapeHtml(role) + '</span>');
  $('heroSum').textContent = p.summary;
  $('aboutText').textContent = p.summary;
  $('footName').textContent = '© ' + NOW_YEAR + ' ' + name + '. All rights reserved.';
  $('floatList').innerHTML = p.skills.length ? p.skills.slice(0, 4).map((s, i) =>
    '<li><span class="ic">' + svgIcon(SKILL_ICONS[i]) + '</span><span>' + escapeHtml(s) + '</span></li>').join('')
    : '<li><span>' + NOT_LISTED + '</span></li>';

  /* profile strip: five facts straight from the CV */
  const e0 = p.experience[0], d0 = p.education[0];
  const facts = [
    ['lotus', 'Current role', e0 ? e0.title : NOT_LISTED, e0 ? e0.company : ''],
    ['heart', 'Education', d0 ? d0.degree : NOT_LISTED, d0 ? d0.school : ''],
    ['shield', 'Key skills', p.skills.length ? p.skills.slice(0, 2).join(', ') : NOT_LISTED, p.skills.length > 2 ? '+ ' + (p.skills.length - 2) + ' more' : ''],
    ['users', 'Certifications', p.certifications.length ? p.certifications[0] : NOT_LISTED, p.certifications.length > 1 ? '+ ' + (p.certifications.length - 1) + ' more' : ''],
    ['star', 'Based in', p.location || NOT_LISTED, '']
  ];
  $('about-strip').innerHTML = facts.map(f => '<div class="pg-pi"><span class="ic">' + svgIcon(f[0]) + '</span><b title="' + escapeHtml(f[2]) + '">' + escapeHtml(f[2]) + '</b><small>' + escapeHtml(f[3] || f[1]) + '</small></div>').join('');

  /* project cards: the six photos from the design, cycled */
  $('cards').innerHTML = p.projects.length ? p.projects.map((pr, i) =>
    '<article class="pg-card cm-glow' + (i >= 6 ? ' extra' : '') + '"><div class="pg-ph"><img alt="" src="' + PHOTOS[i % 6] + '"></div>' +
    '<span class="pg-badge"><span class="ic">' + svgIcon(BADGE_ICONS[i % 6]) + '</span></span>' +
    '<div class="body"><h3>' + escapeHtml(pr.title) + '</h3><p>' + escapeHtml(pr.description || '') + '</p>' +
    '<a class="pg-go" href="#experience" aria-label="Details"><span class="ic">' + svgIcon('arrow') + '</span></a></div></article>').join('')
    : '<div class="pg-empty">No Projects section was found in this CV.</div>';
  $('moreProj').hidden = p.projects.length <= 6;

  /* experience cards: round photo, dates, quote from the first bullet, role and company */
  $('jobList').innerHTML = p.experience.length ? p.experience.map((e, i) =>
    '<article class="pg-job cm-glow' + (i >= 3 ? ' extra' : '') + '"><img alt="" src="' + AVATARS[i % 3] + '"><div>' +
    '<div class="dt">' + escapeHtml((e.dates || '').replace(/\s*-\s*/, ' – ') || 'Role') + '</div>' +
    (e.points && e.points[0] ? '<p>“' + escapeHtml(e.points[0]) + '”</p>' : '') +
    '<b>— ' + escapeHtml(e.title) + '</b><small>' + escapeHtml(e.company || '') + '</small></div></article>').join('')
    : '<div class="pg-empty">No Experience section was found in this CV.</div>';
  $('moreJobs').hidden = p.experience.length <= 3;

  /* education, skills, certifications */
  $('eduList').innerHTML = p.education.length ? p.education.map((e, i) => {
    const status = lastYear(e.dates) >= NOW_YEAR ? 'Pursuing' : 'Completed';
    const when = (e.dates || '').replace(/\s*-\s*/, ' – ');
    return '<div class="pg-edu cm-card cm-glow"><span class="badge"><span class="ic">' + svgIcon(i % 2 ? 'bank' : 'cap') + '</span></span><div><b>' + escapeHtml(e.degree) + '</b><small>' +
      (when ? status + ' | ' + escapeHtml(when) + '<br>' : '') + escapeHtml(e.school || '') + '</small></div></div>';
  }).join('') : '<div class="pg-empty">No Education section was found in this CV.</div>';
  $('skillList').innerHTML = p.skills.length ? p.skills.map(s => '<span class="cm-chip">' + escapeHtml(s) + '</span>').join('') : '<div class="pg-empty">No Skills section was found in this CV.</div>';
  $('certBox').hidden = !p.certifications.length;
  $('certList').innerHTML = p.certifications.slice(0, 4).map(c => '<span class="cm-chip">' + escapeHtml(c) + '</span>').join('');

  /* contact */
  if(real){
    document.title = name + ' | Portfolio';
    $('mailLink').hidden = !p.email;
    if(p.email) $('mailLink').href = 'mailto:' + p.email;
    $('inLink').hidden = !p.linkedin;
    if(p.linkedin){ $('inLink').href = p.linkedin; $('inLink').target = '_blank'; $('inLink').rel = 'noopener'; }
    const href = p.linkedin || (p.email ? 'mailto:' + p.email : '#contact');
    ['contactBtn', 'ctaBtn', 'navCta', 'aboutBtn'].forEach(id => { $(id).href = href; if(p.linkedin){ $(id).target = '_blank'; $(id).rel = 'noopener'; } });
    $('siteBtn').hidden = false;
  }
  setCvButtons(real ? p : null);
  document.querySelectorAll('.cm-glow').forEach((el, i) => el.style.setProperty('--cm-delay', (-(i * 1.7) % 9).toFixed(1) + 's'));
  CM.refresh();
}

{{TAIL}}

/* highlight the nav link of the section on screen */
const spy = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if(!en.isIntersecting) return;
    document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('is-on', a.getAttribute('href') === '#' + en.target.id));
  });
}, {rootMargin: '-35% 0px -55% 0px'});
['top', 'about', 'projects', 'experience', 'skills', 'contact'].forEach(id => spy.observe($(id)));

paintIcons();
renderProfile(parseResume(SAMPLE), {preview: true});
/* end-of-page-script */
