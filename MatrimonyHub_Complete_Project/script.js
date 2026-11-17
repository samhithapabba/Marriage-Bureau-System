/* MatrimonyHub - frontend-only application
   Data is stored in localStorage. No backend/database is required. */

const STORAGE = {
  clients: "mh_clients",
  inquiries: "mh_inquiries",
  stories: "mh_stories",
  messages: "mh_messages",
  dark: "mh_dark"
};

const seedClients = [
  {id:1,name:"Priya Sharma",gender:"Female",dob:"1999-04-12",maritalStatus:"Never Married",religion:"Hindu",caste:"Brahmin",motherTongue:"Hindi",familyType:"Nuclear",familyValues:"Moderate",fatherOccupation:"Business",motherOccupation:"Teacher",siblings:1,education:"MBA",occupation:"Marketing Manager",income:900000,location:"Mumbai",photo:"",preferences:{ageMin:28,ageMax:35,religion:"Hindu",caste:"Brahmin",education:"Any",occupation:"Any",location:"Any"},status:"Active"},
  {id:2,name:"Rajesh Kumar",gender:"Male",dob:"1996-08-20",maritalStatus:"Never Married",religion:"Hindu",caste:"Brahmin",motherTongue:"Telugu",familyType:"Nuclear",familyValues:"Traditional",fatherOccupation:"Retired Officer",motherOccupation:"Homemaker",siblings:1,education:"B.Tech",occupation:"Software Engineer",income:1200000,location:"Bangalore",photo:"",preferences:{ageMin:24,ageMax:30,religion:"Hindu",caste:"Brahmin",education:"Any",occupation:"Any",location:"Any"},status:"Active"},
  {id:3,name:"Ananya Reddy",gender:"Female",dob:"2000-02-03",maritalStatus:"Never Married",religion:"Hindu",caste:"Reddy",motherTongue:"Telugu",familyType:"Joint",familyValues:"Moderate",fatherOccupation:"Doctor",motherOccupation:"Lecturer",siblings:2,education:"M.Tech",occupation:"Data Analyst",income:1000000,location:"Hyderabad",photo:"",preferences:{ageMin:27,ageMax:34,religion:"Hindu",caste:"Any",education:"Any",occupation:"Software Engineer",location:"Hyderabad"},status:"Active"},
  {id:4,name:"Arjun Mehta",gender:"Male",dob:"1995-11-16",maritalStatus:"Never Married",religion:"Hindu",caste:"Bania",motherTongue:"Hindi",familyType:"Nuclear",familyValues:"Modern",fatherOccupation:"Entrepreneur",motherOccupation:"Homemaker",siblings:0,education:"MBA",occupation:"Product Manager",income:1600000,location:"Pune",photo:"",preferences:{ageMin:25,ageMax:31,religion:"Hindu",caste:"Any",education:"MBA",occupation:"Any",location:"Mumbai/Pune"},status:"Active"},
  {id:5,name:"Sara Khan",gender:"Female",dob:"1998-06-22",maritalStatus:"Never Married",religion:"Muslim",caste:"Sunni",motherTongue:"Urdu",familyType:"Joint",familyValues:"Traditional",fatherOccupation:"Business",motherOccupation:"Homemaker",siblings:2,education:"MA",occupation:"HR Executive",income:700000,location:"Hyderabad",photo:"",preferences:{ageMin:28,ageMax:34,religion:"Muslim",caste:"Any",education:"Any",occupation:"Any",location:"Hyderabad"},status:"Active"}
];

const seedInquiries = [
  {id:1,clientId:1,subject:"Interest from Rajesh Kumar",message:"Rajesh's profile matches your stated preferences. Would you like the bureau to initiate contact?",status:"Pending",timestamp:"2026-11-17 10:30"},
  {id:2,clientId:2,subject:"Profile viewed",message:"A prospective profile has viewed Rajesh's profile.",status:"Contacted",timestamp:"2026-11-16 15:10"},
  {id:3,clientId:3,subject:"Family inquiry",message:"Family requested additional education and career details.",status:"Pending",timestamp:"2026-11-15 12:20"}
];

const seedStories = [
  {id:1,couple:"Neha & Karan",date:"2026-05-18",story:"We met through MatrimonyHub and appreciated the careful profile matching. Our families connected quickly and we are grateful for the support.",image:""},
  {id:2,couple:"Divya & Rohit",date:"2026-02-14",story:"The bureau helped us find a compatible partner based on our education, location and family preferences.",image:""},
  {id:3,couple:"Meera & Aditya",date:"2025-12-20",story:"A smooth matchmaking experience from first inquiry to family introduction. Thank you MatrimonyHub!",image:""}
];

const seedMessages = {
  1:[{from:"client",text:"Hello, I am interested in learning more about my suggested matches.",time:"10:20 AM"},{from:"admin",text:"Sure. I can arrange an introduction after receiving your confirmation.",time:"10:25 AM"}],
  2:[{from:"client",text:"Can you update my preferred location to Hyderabad?",time:"Yesterday"},{from:"admin",text:"Yes, your preference has been noted.",time:"Yesterday"}],
  3:[{from:"client",text:"We would like to know more about the profile.",time:"2 days ago"}]
};

let clients = load(STORAGE.clients, seedClients);
let inquiries = load(STORAGE.inquiries, seedInquiries);
let stories = load(STORAGE.stories, seedStories);
let messages = load(STORAGE.messages, seedMessages);
let currentStep = 1;
let currentConversation = null;

function load(key, fallback){
  const raw = localStorage.getItem(key);
  if(raw !== null){ try{return JSON.parse(raw)}catch(e){} }
  localStorage.setItem(key, JSON.stringify(fallback));
  return JSON.parse(JSON.stringify(fallback));
}
function save(key,value){localStorage.setItem(key,JSON.stringify(value))}
function esc(value){return String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function initials(name){return name.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase()}
function ageFromDob(dob){if(!dob)return 0;const d=new Date(dob),t=new Date();let a=t.getFullYear()-d.getFullYear();if(t.getMonth()<d.getMonth()||(t.getMonth()===d.getMonth()&&t.getDate()<d.getDate()))a--;return a}
function money(n){return n?new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n):"Not specified"}
function toast(msg,type=""){const el=document.createElement("div");el.className=`toast ${type}`;el.textContent=msg;document.getElementById("toast-container").appendChild(el);setTimeout(()=>el.remove(),2800)}
function findClient(id){return clients.find(c=>Number(c.id)===Number(id))}
function escapeCSV(v){return `"${String(v??"").replace(/"/g,'""')}"`}

document.addEventListener("DOMContentLoaded",()=>{
  if(localStorage.getItem("mh_logged_in")==="1")showApp();
  setupNavigation();
  setupLogin();
  setupForm();
  setupFilters();
  setupModalClose();
  setupMessages();
  setupStories();
  setupReports();
  document.getElementById("logout-btn").addEventListener("click",()=>{localStorage.removeItem("mh_logged_in");location.reload()});
  document.getElementById("dark-mode-btn").addEventListener("click",toggleDark);
  document.getElementById("menu-btn").addEventListener("click",()=>document.getElementById("sidebar").classList.toggle("open"));
  document.getElementById("global-search").addEventListener("input",e=>{if(e.target.value.trim()){showSection("clients");document.getElementById("client-search").value=e.target.value;renderClients()}});
  document.getElementById("notification-btn").addEventListener("click",()=>toast(`${inquiries.filter(x=>x.status==="Pending").length} pending inquiries`));
  if(localStorage.getItem(STORAGE.dark)==="1")document.body.classList.add("dark");
  renderAll();
});

function setupLogin(){
  document.getElementById("login-form").addEventListener("submit",e=>{
    e.preventDefault();
    localStorage.setItem("mh_logged_in","1");
    showApp();
    toast("Welcome to MatrimonyHub","success");
  });
}
function showApp(){document.getElementById("login-screen").classList.add("hidden");document.getElementById("app").classList.remove("hidden")}
function toggleDark(){document.body.classList.toggle("dark");localStorage.setItem(STORAGE.dark,document.body.classList.contains("dark")?"1":"0")}

function setupNavigation(){
  document.querySelectorAll(".nav-item[data-section]").forEach(btn=>btn.addEventListener("click",()=>showSection(btn.dataset.section)));
  document.querySelectorAll("[data-go]").forEach(btn=>btn.addEventListener("click",()=>showSection(btn.dataset.go)));
}
function showSection(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active-page"));
  document.getElementById(id)?.classList.add("active-page");
  document.querySelectorAll(".nav-item[data-section]").forEach(b=>b.classList.toggle("active",b.dataset.section===id));
  document.getElementById("sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
  if(id==="matches")renderMatchSelect();
  if(id==="messages")renderConversations();
}

function setupForm(){
  document.getElementById("next-step").addEventListener("click",()=>{
    if(validateStep(currentStep)){if(currentStep<4){currentStep++;updateStep()}else document.getElementById("client-form").requestSubmit()}
  });
  document.getElementById("prev-step").addEventListener("click",()=>{if(currentStep>1){currentStep--;updateStep()}});
  document.getElementById("client-form").addEventListener("submit",saveClient);
}
function validateStep(step){
  if(step===1 && !document.getElementById("name").value.trim()){toast("Enter the client's full name","error");return false}
  if(step===1 && !document.getElementById("gender").value){toast("Select gender","error");return false}
  if(step===1 && !document.getElementById("dob").value){toast("Select date of birth","error");return false}
  if(step===3 && !document.getElementById("occupation").value.trim()){toast("Enter occupation","error");return false}
  if(step===3 && !document.getElementById("location").value.trim()){toast("Enter working location","error");return false}
  return true;
}
function updateStep(){
  document.querySelectorAll(".form-step").forEach(x=>x.classList.toggle("active",Number(x.dataset.step)===currentStep));
  document.querySelectorAll(".step").forEach(x=>x.classList.toggle("active",Number(x.dataset.step)<=currentStep));
  document.getElementById("prev-step").classList.toggle("hidden",currentStep===1);
  document.getElementById("next-step").classList.toggle("hidden",currentStep===4);
  document.getElementById("save-client").classList.toggle("hidden",currentStep!==4);
}
function getFormClient(){
  const editId=document.getElementById("edit-id").value;
  return {
    id:editId?Number(editId):Date.now(),
    name:document.getElementById("name").value.trim(),
    gender:document.getElementById("gender").value,
    dob:document.getElementById("dob").value,
    maritalStatus:document.getElementById("marital-status").value,
    religion:document.getElementById("religion").value,
    caste:document.getElementById("caste").value.trim()||"Not specified",
    motherTongue:document.getElementById("mother-tongue").value.trim()||"Not specified",
    familyType:document.getElementById("family-type").value,
    familyValues:document.getElementById("family-values").value,
    fatherOccupation:document.getElementById("father-occupation").value.trim()||"Not specified",
    motherOccupation:document.getElementById("mother-occupation").value.trim()||"Not specified",
    siblings:Number(document.getElementById("siblings").value||0),
    education:document.getElementById("education").value,
    occupation:document.getElementById("occupation").value.trim(),
    income:Number(document.getElementById("income").value||0),
    location:document.getElementById("location").value.trim(),
    photo:document.getElementById("photo").value.trim(),
    preferences:{
      ageMin:Number(document.getElementById("pref-age-min").value||18),
      ageMax:Number(document.getElementById("pref-age-max").value||80),
      religion:document.getElementById("pref-religion").value,
      caste:document.getElementById("pref-caste").value.trim()||"Any",
      education:document.getElementById("pref-education").value.trim()||"Any",
      occupation:document.getElementById("pref-occupation").value.trim()||"Any",
      location:document.getElementById("pref-location").value.trim()||"Any"
    },
    status:"Active"
  };
}
function saveClient(e){
  e.preventDefault();
  const c=getFormClient();
  if(c.preferences.ageMin>c.preferences.ageMax){toast("Preferred minimum age cannot exceed maximum age","error");return}
  const existing=clients.findIndex(x=>x.id===c.id);
  if(existing>=0)clients[existing]=c;else clients.unshift(c);
  save(STORAGE.clients,clients);
  toast(existing>=0?"Client updated successfully":"Client registered successfully","success");
  resetClientForm();
  renderAll();
  showSection("clients");
}
function resetClientForm(){
  document.getElementById("client-form").reset();
  document.getElementById("edit-id").value="";
  document.getElementById("form-title").textContent="Register New Client";
  currentStep=1;updateStep();
}
function editClient(id){
  const c=findClient(id);if(!c)return;
  showSection("register-client");
  document.getElementById("form-title").textContent="Edit Client Profile";
  document.getElementById("edit-id").value=c.id;
  const map={name:c.name,gender:c.gender,dob:c.dob,"marital-status":c.maritalStatus,religion:c.religion,caste:c.caste,"mother-tongue":c.motherTongue,"family-type":c.familyType,"family-values":c.familyValues,"father-occupation":c.fatherOccupation,"mother-occupation":c.motherOccupation,siblings:c.siblings,education:c.education,occupation:c.occupation,income:c.income,location:c.location,photo:c.photo,"pref-age-min":c.preferences.ageMin,"pref-age-max":c.preferences.ageMax,"pref-religion":c.preferences.religion,"pref-caste":c.preferences.caste,"pref-education":c.preferences.education,"pref-occupation":c.preferences.occupation,"pref-location":c.preferences.location};
  Object.entries(map).forEach(([id,val])=>{const el=document.getElementById(id);if(el)el.value=val??""});
  currentStep=1;updateStep();
}
function deleteClient(id){
  if(!confirm("Delete this client profile?"))return;
  clients=clients.filter(c=>c.id!==Number(id));save(STORAGE.clients,clients);
  inquiries=inquiries.filter(i=>i.clientId!==Number(id));save(STORAGE.inquiries,inquiries);
  renderAll();toast("Client deleted");
}

function setupFilters(){
  ["client-search","gender-filter","status-filter","religion-filter"].forEach(id=>document.getElementById(id).addEventListener("input",renderClients));
  document.getElementById("inquiry-filter").addEventListener("change",renderInquiries);
}
function renderClients(){
  const q=document.getElementById("client-search").value.toLowerCase();
  const g=document.getElementById("gender-filter").value,s=document.getElementById("status-filter").value,r=document.getElementById("religion-filter").value;
  const list=clients.filter(c=>(!q||[c.name,c.education,c.occupation,c.location,c.caste].join(" ").toLowerCase().includes(q))&&(!g||c.gender===g)&&(!s||c.status===s)&&(!r||c.religion===r));
  const box=document.getElementById("clients-grid");
  if(!list.length){box.innerHTML='<div class="panel" style="grid-column:1/-1;text-align:center">No clients found.</div>';return}
  box.innerHTML=list.map(c=>`
    <article class="client-card">
      <div class="client-card-top">${c.photo?`<img class="client-photo" src="${esc(c.photo)}" onerror="this.style.display='none'">`:`<div class="client-photo initials">${esc(initials(c.name))}</div>`}</div>
      <div class="client-card-body">
        <h3>${esc(c.name)}</h3><div class="client-meta">${ageFromDob(c.dob)} yrs • ${esc(c.gender)} • ${esc(c.location)}</div>
        <div class="chips"><span class="chip">${esc(c.education)}</span><span class="chip">${esc(c.occupation)}</span><span class="chip">${esc(c.religion)}</span></div>
        <div class="card-actions"><button class="btn secondary" onclick="viewProfile(${c.id})">View</button><button class="btn secondary" onclick="editClient(${c.id})">Edit</button><button class="action-btn" onclick="deleteClient(${c.id})" title="Delete"><i class="fa-solid fa-trash"></i></button></div>
      </div>
    </article>`).join("");
}
function viewProfile(id){
  const c=findClient(id);if(!c)return;
  document.getElementById("profile-content").innerHTML=`
    <div class="profile-header"><div class="profile-big">${c.photo?`<img src="${esc(c.photo)}">`:esc(initials(c.name))}</div><div><h2>${esc(c.name)}</h2><p>${ageFromDob(c.dob)} years • ${esc(c.gender)} • ${esc(c.maritalStatus)}</p><span class="status ${esc(c.status)}">${esc(c.status)}</span></div></div>
    <div class="detail-grid">
      ${detail("Religion",c.religion)}${detail("Caste",c.caste)}${detail("Mother Tongue",c.motherTongue)}${detail("Education",c.education)}
      ${detail("Occupation",c.occupation)}${detail("Income",money(c.income))}${detail("Location",c.location)}${detail("Family Type",c.familyType)}
      ${detail("Family Values",c.familyValues)}${detail("Father's Occupation",c.fatherOccupation)}${detail("Mother's Occupation",c.motherOccupation)}${detail("Siblings",c.siblings)}
      ${detail("Preferred Age",`${c.preferences.ageMin} - ${c.preferences.ageMax}`)}${detail("Preferred Religion",c.preferences.religion)}${detail("Preferred Caste",c.preferences.caste)}${detail("Preferred Education",c.preferences.education)}${detail("Preferred Occupation",c.preferences.occupation)}${detail("Preferred Location",c.preferences.location)}
    </div>`;
  document.getElementById("profile-modal").classList.remove("hidden");
}
function detail(a,b){return `<div class="detail"><small>${esc(a)}</small><b>${esc(b)}</b></div>`}
function setupModalClose(){document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>document.getElementById(b.dataset.close).classList.add("hidden")));document.querySelectorAll(".modal-backdrop").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)m.classList.add("hidden")}))}

function renderMatchSelect(){
  const sel=document.getElementById("match-client-select");
  const old=sel.value;sel.innerHTML=clients.map(c=>`<option value="${c.id}">${esc(c.name)} (${ageFromDob(c.dob)})</option>`).join("");if(old)sel.value=old;
}
function compatibility(a,b){
  if(a.gender===b.gender)return 0;
  let score=0, total=0;
  const p=a.preferences;
  const age=ageFromDob(b.dob); total+=25;if(age>=p.ageMin&&age<=p.ageMax)score+=25;
  total+=20;if(p.religion==="Any"||p.religion===b.religion)score+=20;
  total+=15;if(p.caste==="Any"||!p.caste||p.caste.toLowerCase()===b.caste.toLowerCase())score+=15;
  total+=15;if(p.education==="Any"||!p.education||p.education.toLowerCase()===b.education.toLowerCase())score+=15;
  total+=10;if(p.occupation==="Any"||!p.occupation||b.occupation.toLowerCase().includes(p.occupation.toLowerCase()))score+=10;
  total+=15;if(p.location==="Any"||!p.location||b.location.toLowerCase().includes(p.location.toLowerCase())||p.location.toLowerCase().includes(b.location.toLowerCase()))score+=15;
  return Math.round(score/total*100);
}
document.getElementById("generate-matches").addEventListener("click",()=>{
  const a=findClient(document.getElementById("match-client-select").value);if(!a)return;
  const results=clients.filter(b=>b.id!==a.id&&b.gender!==a.gender).map(b=>({b,score:compatibility(a,b)})).sort((x,y)=>y.score-x.score);
  document.getElementById("match-results").innerHTML=results.length?results.map(x=>`
    <div class="match-card"><div class="match-avatar">${esc(initials(x.b.name))}</div><div class="match-info"><h3>${esc(x.b.name)}</h3><p>${ageFromDob(x.b.dob)} yrs • ${esc(x.b.education)} • ${esc(x.b.occupation)}</p><p>${esc(x.b.location)} • ${esc(x.b.religion)} • ${esc(x.b.caste)}</p></div><div><div class="score">${x.score}%</div><div class="score-label">Compatibility</div></div></div>`).join(""):`<div class="panel">No compatible profiles available.</div>`;
});
function renderInquiries(){
  const f=document.getElementById("inquiry-filter").value;
  const list=inquiries.filter(i=>!f||i.status===f);
  document.getElementById("inquiries-table").innerHTML=`<table class="data-table"><thead><tr><th>Client</th><th>Subject</th><th>Message</th><th>Date</th><th>Status</th><th>Action</th></tr></thead><tbody>${list.map(i=>`<tr><td class="client-name">${esc(findClient(i.clientId)?.name||"Unknown")}</td><td>${esc(i.subject)}</td><td>${esc(i.message)}</td><td>${esc(i.timestamp)}</td><td><span class="status ${esc(i.status)}">${esc(i.status)}</span></td><td><select onchange="updateInquiry(${i.id},this.value)"><option ${i.status==="Pending"?"selected":""}>Pending</option><option ${i.status==="Contacted"?"selected":""}>Contacted</option><option ${i.status==="Closed"?"selected":""}>Closed</option></select></td></tr>`).join("")}</tbody></table>`;
}
function updateInquiry(id,status){const i=inquiries.find(x=>x.id===Number(id));if(i){i.status=status;save(STORAGE.inquiries,inquiries);renderAll();toast("Inquiry updated","success")}}

function setupMessages(){document.getElementById("message-form").addEventListener("submit",e=>{e.preventDefault();if(!currentConversation)return;const input=document.getElementById("message-input"),v=input.value.trim();if(!v)return;(messages[currentConversation] ||= []).push({from:"admin",text:v,time:new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})});save(STORAGE.messages,messages);input.value="";renderChat()})}
function renderConversations(){
  const ids=[...new Set(clients.map(c=>c.id).filter(id=>messages[id]))];
  document.getElementById("conversation-list").innerHTML=ids.map(id=>{const c=findClient(id),last=messages[id].at(-1);return `<div class="conversation ${currentConversation===id?"active":""}" onclick="openConversation(${id})"><div class="avatar">${esc(initials(c.name))}</div><div><b>${esc(c.name)}</b><small>${esc(last?.text||"No messages")}</small></div></div>`}).join("")||'<div style="padding:20px;color:#777;font-size:12px">No conversations.</div>';
  if(!currentConversation&&ids[0])openConversation(ids[0]);
}
function openConversation(id){currentConversation=Number(id);renderConversations();renderChat()}
function renderChat(){
  const c=findClient(currentConversation);if(!c){document.getElementById("chat-head").textContent="Select a conversation";document.getElementById("chat-body").innerHTML="";return}
  document.getElementById("chat-head").textContent=c.name;
  document.getElementById("chat-body").innerHTML=(messages[currentConversation]||[]).map(m=>`<div class="bubble ${m.from==="admin"?"out":"in"}">${esc(m.text)}<small>${esc(m.time)}</small></div>`).join("");
  const body=document.getElementById("chat-body");body.scrollTop=body.scrollHeight;
}

function setupStories(){document.getElementById("add-story-btn").addEventListener("click",()=>document.getElementById("story-modal").classList.remove("hidden"));document.getElementById("story-form").addEventListener("submit",e=>{e.preventDefault();stories.unshift({id:Date.now(),couple:document.getElementById("story-couple").value.trim(),date:document.getElementById("story-date").value,story:document.getElementById("story-text").value.trim(),image:document.getElementById("story-image").value.trim()});save(STORAGE.stories,stories);e.target.reset();document.getElementById("story-modal").classList.add("hidden");renderAll();toast("Success story added","success")})}
function renderStories(){document.getElementById("stories-grid").innerHTML=stories.map(s=>`<article class="story-card"><div class="story-img">${s.image?`<img src="${esc(s.image)}" onerror="this.style.display='none'">`:`<i class="fa-solid fa-heart"></i>`}</div><div class="story-body"><h3>${esc(s.couple)}</h3><div class="date">${new Date(s.date).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</div><p>${esc(s.story)}</p></div></article>`).join("")}

function renderDashboard(){
  document.getElementById("stat-clients").textContent=clients.length;
  document.getElementById("stat-matches").textContent=clients.length>1?Math.max(0,clients.length-1):0;
  document.getElementById("stat-inquiries").textContent=inquiries.filter(i=>i.status==="Pending").length;
  document.getElementById("stat-success").textContent=stories.length;
  const recent=clients.slice(0,5);
  document.getElementById("recent-clients").innerHTML=`<table class="data-table"><thead><tr><th>Name</th><th>Age</th><th>Education</th><th>Location</th><th>Status</th></tr></thead><tbody>${recent.map(c=>`<tr><td class="client-name">${esc(c.name)}</td><td>${ageFromDob(c.dob)}</td><td>${esc(c.education)}</td><td>${esc(c.location)}</td><td><span class="status ${esc(c.status)}">${esc(c.status)}</span></td></tr>`).join("")}</tbody></table>`;
  const active=clients.filter(c=>c.status==="Active").length,male=clients.filter(c=>c.gender==="Male").length,female=clients.filter(c=>c.gender==="Female").length;
  const max=Math.max(male,female,active,1);
  document.getElementById("distribution-chart").innerHTML=[["Male",male],["Female",female],["Active",active],["Inactive/Pending",clients.length-active]].map(x=>`<div class="bar-row"><span>${x[0]}</span><div class="bar-track"><div class="bar-fill" style="width:${x[1]/max*100}%"></div></div><b>${x[1]}</b></div>`).join("");
  document.getElementById("notification-count").textContent=inquiries.filter(i=>i.status==="Pending").length;
}
function setupReports(){
  document.getElementById("export-csv").addEventListener("click",exportCSV);
}
function renderReports(){
  const active=clients.filter(c=>c.status==="Active").length,male=clients.filter(c=>c.gender==="Male").length,female=clients.filter(c=>c.gender==="Female").length;
  document.getElementById("report-total").textContent=clients.length;document.getElementById("report-active").textContent=active;document.getElementById("report-male").textContent=male;document.getElementById("report-female").textContent=female;
  const edu={};clients.forEach(c=>edu[c.education]=(edu[c.education]||0)+1);const max=Math.max(...Object.values(edu),1);
  document.getElementById("education-chart").innerHTML=Object.entries(edu).map(([k,v])=>`<div class="bar-row"><span>${esc(k)}</span><div class="bar-track"><div class="bar-fill" style="width:${v/max*100}%"></div></div><b>${v}</b></div>`).join("");
  const possible=clients.length>1?clients.length*(clients.length-1)/2:0;
  document.getElementById("summary-report").innerHTML=`<div class="summary-item"><span>Registered Clients</span><b>${clients.length}</b></div><div class="summary-item"><span>Pending Inquiries</span><b>${inquiries.filter(i=>i.status==="Pending").length}</b></div><div class="summary-item"><span>Success Stories</span><b>${stories.length}</b></div><div class="summary-item"><span>Potential Pairings</span><b>${Math.round(possible)}</b></div><div class="summary-item"><span>Active Rate</span><b>${clients.length?Math.round(active/clients.length*100):0}%</b></div><div class="summary-item"><span>Inquiry Closure Rate</span><b>${inquiries.length?Math.round(inquiries.filter(i=>i.status==="Closed").length/inquiries.length*100):0}%</b></div>`;
}
function exportCSV(){
  const headers=["ID","Name","Gender","Age","Religion","Caste","Education","Occupation","Income","Location","Status"];
  const rows=clients.map(c=>[c.id,c.name,c.gender,ageFromDob(c.dob),c.religion,c.caste,c.education,c.occupation,c.income,c.location,c.status]);
  const csv=[headers,...rows].map(r=>r.map(escapeCSV).join(",")).join("\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="matrimonyhub-clients.csv";a.click();URL.revokeObjectURL(url);
  toast("CSV exported successfully","success");
}
function renderAll(){renderDashboard();renderClients();renderInquiries();renderStories();renderReports();renderConversations();renderMatchSelect()}
