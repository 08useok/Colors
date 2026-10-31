import { appendRecord, emptySummary, matchRecord, RECORD_SEASON } from './config/beta8-records.js';
const modes={goldRush:'골드 러쉬',showdown:'쇼다운',soccer:'SOCCER KICK',gemGrab:'젬 그랩',chopWood:'찹 우드',knockout:'KNOCKOUT'};
const n=value=>Number(value||0).toLocaleString('ko-KR',{maximumFractionDigits:1});
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function request(path,method='GET',data) {
  const res=await fetch('/api/beta-account/records'+path,{method,credentials:'same-origin',cache:'no-store',headers:data?{'Content-Type':'application/json'}:{},body:data?JSON.stringify(data):undefined,signal:AbortSignal.timeout(8000)});
  let result;try{result=await res.json();}catch{throw Error('기록 서버에 연결할 수 없습니다. 베타 실행 파일로 열어 주세요.');}
  if(!res.ok)throw Object.assign(Error(result.error||'기록을 불러오지 못했습니다.'),{status:res.status});return result;
}
export function createBetaRecords({state,save,storageKey,account,characters,title,content,open}) {
  // Keep a per-account journal so a navigation during an in-flight save cannot erase a match.
  const journalKey=storageKey+':records';
  try{const journal=JSON.parse(localStorage.getItem(journalKey)||'null');if(journal && (journal.beta8Records?.total?.games||0)>=(state.beta8Records?.total?.games||0))for(const key of ['beta8Records','beta8RecordPending','beta8RecordFailed','beta8ActiveRecord'])state[key]=journal[key];}catch{}
  function persist(){localStorage.setItem(journalKey,JSON.stringify({beta8Records:state.beta8Records,beta8RecordPending:state.beta8RecordPending,beta8RecordFailed:state.beta8RecordFailed,beta8ActiveRecord:state.beta8ActiveRecord}));save();}
  function markFailed(record,message){state.beta8RecordFailed=[...(state.beta8RecordFailed||[]).filter(r=>r.id!==record.id),{id:record.id,message}].slice(-100);}
  let tab='history',generation=0,detail=null,syncing=null;
  const name=id=>characters.find(c=>c.id===id)?.name||id;
  const book=()=>state.beta8Records||{};
  const outcome=r=>r.abandoned?'패배 · 이탈':r.draw?'무승부':r.won?'승리':'패배';
  const stats=s=>`<div class="record-metrics">${[['경기',s.games],['승리',s.wins],['패배',s.losses],['무승부',s.draws],['승률',n(s.games?s.wins/s.games*100:0)+'%'],['킬',s.kills],['데스',s.deaths],['피해량',s.damage],['회복량',s.healing],['시즌 점수',s.points]].map(([label,v])=>`<div><small>${label}</small><strong>${typeof v==='string'?v:n(v)}</strong></div>`).join('')}</div>`;
  function detailHTML(r){return `<article class="record-card"><h3>${escape(name(r.character))} · ${modes[r.mode]} · ${outcome(r)}</h3><p>${new Date(r.endedAt).toLocaleString('ko-KR')} · ${n(r.duration)}초 ${r.rank?'· '+r.rank+'위':''}</p><p>${n(r.kills)} 킬 / ${n(r.deaths)} 데스 · 피해 ${n(r.damage)} · 회복 ${n(r.healing)}</p><p>${r.abandoned?'이탈 경기: 랭킹 0점':`킬 ${n(r.kills)} + 피해 ${n(r.damage/1000)} + 회복 ${n(r.healing/2000)} + 승리 ${r.won?5:0} = ${n(r.points)}점`}</p></article>`;}
  function render(next=tab) {
    tab=next;const version=++generation;title.textContent='시즌 8 · 기록';
    const pending=state.beta8RecordPending?.length||0,failed=state.beta8RecordFailed?.length||0;
    const syncStatus=account.user?`${pending?`<p role="status">랭킹 저장 대기 ${pending}경기 · 랭킹 탭에서 다시 시도할 수 있습니다.</p>`:''}${failed?`<p role="status">랭킹에 반영되지 않은 경기 ${failed}건이 있습니다. 개인 전적은 유지됩니다.</p>`:''}`:'';
    content.innerHTML=`<section class="record-header"><strong>베타 테스트 기록</strong><p>정식 시즌과 별도 집계 · 연습 제외 · 소수 점수 누적</p>${syncStatus}<nav aria-label="기록 탭">${[['history','전적'],['personal','개인 기록'],['ranking','랭킹']].map(([id,label])=>`<button data-record-tab="${id}" aria-pressed="${tab===id}">${label}</button>`).join('')}</nav></section><section data-record-body></section>`;
    content.querySelectorAll('[data-record-tab]').forEach(b=>b.onclick=()=>{detail=null;render(b.dataset.recordTab);});
    const body=content.querySelector('[data-record-body]');
    if(tab==='history') {
      const recent=book().recent||[];
      body.innerHTML=`<h3>최근 전적 · ${recent.length} / 20경기</h3>${detail?detailHTML(detail):''}${recent.length?recent.map(r=>`<button class="record-row" data-record-id="${escape(r.id)}"><b>${outcome(r)}${r.rank?' · '+r.rank+'위':''}</b><span>${escape(name(r.character))} · ${modes[r.mode]}</span><span>${n(r.kills)}킬 / ${n(r.deaths)}데스 · 피해 ${n(r.damage)} · 회복 ${n(r.healing)}</span><span>+${n(r.points)}점 · ${new Date(r.endedAt).toLocaleString('ko-KR')}</span></button>`).join(''):'<p>아직 전적이 없습니다. 대전을 완료하면 기록됩니다.</p>'}`;
      body.querySelectorAll('[data-record-id]').forEach(b=>b.onclick=()=>{detail=recent.find(r=>r.id===b.dataset.recordId);render();});
    } else if(tab==='personal') {
      const total={...emptySummary(),...book().total};
      body.innerHTML=`<h3>이번 시즌</h3>${stats(total)}<h3>개인 최고 기록</h3><p>연승 ${n(total.bestStreak)} · 한 경기 최다 킬 ${n(total.bestKills)} · 피해 ${n(total.bestDamage)} · 회복 ${n(total.bestHealing)}</p><h3>캐릭터별 기록</h3>${Object.entries(book().characters||{}).map(([id,s])=>`<article class="record-card"><h4>${escape(name(id))}</h4><p>${n(s.games)}경기 · 승률 ${n(s.wins/s.games*100)}% · 평균 킬 ${n(s.kills/s.games)} · 피해 ${n(s.damage/s.games)} · 회복 ${n(s.healing/s.games)}</p></article>`).join('')||'<p>캐릭터별 기록이 없습니다.</p>'}`;
    } else {
      body.innerHTML='<p role="status">랭킹 불러오는 중…</p>';
      sync().then(()=>request('/ranking')).then(data=>{
        if(version!==generation)return;
        const row=r=>`<div class="record-row"><b>${r.rank}위 · ${escape(r.nickname)}</b><span>${n(r.points)}점 · ${n(r.wins)}승 · 대표 ${escape(name(r.character))}</span></div>`;
        body.innerHTML=`<p>이 PC의 베타 계정 랭킹 · 상위 100명</p><p>킬 + 피해량/1,000 + 회복량/2,000 + 승리 5점</p><p>베타 시험용: 경기 수치의 서버 전투 검증은 아직 적용되지 않습니다.</p><h3>내 순위</h3>${data.me?row(data.me):`<p>${account.user?'첫 경기를 완료하면 순위가 표시됩니다.':'로그인하면 랭킹에 참여할 수 있습니다.'}</p>`}<h3>상위 순위</h3>${data.rows.map(row).join('')||'<p>아직 등록된 기록이 없습니다.</p>'}<button data-record-refresh>다시 불러오기</button>`;
        body.querySelector('[data-record-refresh]').onclick=()=>render('ranking');
      }).catch(error=>{if(version===generation){body.textContent=error.message;const retry=document.createElement('button');retry.textContent='다시 시도';retry.onclick=()=>render('ranking');body.append(retry);}});
    }
  }
  function sync() {
    if(!account.user)return Promise.resolve();if(syncing)return syncing;
    let failed=false;
    // Defer work until syncing has been assigned, even when the queue is empty.
    syncing=Promise.resolve().then(async()=>{
      while(state.beta8RecordPending?.length) {
        const record=state.beta8RecordPending[0];
        try{await request('/finish','POST',{accountId:account.user.id,record});}catch(error){if(error.status!==400)throw error;markFailed(record,error.message);}
        state.beta8RecordPending=state.beta8RecordPending.filter(r=>r.id!==record.id);persist();
      }
    }).catch(error=>{failed=true;throw error;}).finally(()=>{
      syncing=null;
      if(!failed&&state.beta8RecordPending?.length)return sync();
    });return syncing;
  }
  function start(mode,character) {
    const id=crypto.randomUUID();
    const ticket=account.user?request('/start','POST',{accountId:account.user.id,id,mode,character}).then(()=>true).catch(()=>false):Promise.resolve(false);
    state.beta8ActiveRecord={id,mode,character,startedAt:Date.now(),kills:0,deaths:0,damage:0,healing:0,duration:0};persist();
    return {id,mode,character,ticket};
  }
  function finish(match,input) {
    if(!match)return null;
    const r=matchRecord({...input,...match,season:RECORD_SEASON,endedAt:Date.now()});
    if(!r)return null;state.beta8ActiveRecord=null;state.beta8Records=appendRecord(book(),r);persist();
    match.ticket.then(started=>{if(started){state.beta8RecordPending=[...(state.beta8RecordPending||[]).filter(v=>v.id!==r.id),r].slice(-100);persist();sync().catch(()=>{});}else if(account.user){markFailed(r,'경기 시작 정보를 저장하지 못했습니다.');persist();}});
    return r;
  }
  function result(r,append=false) {
    if(!r)return;if(!append){open();title.textContent='경기 결과';content.innerHTML='';}++generation;
    content.insertAdjacentHTML('beforeend',detailHTML(r)+'<button data-record-view>전적 보기</button>');
    content.querySelector('[data-record-view]').onclick=()=>{detail=r;render('history');};
  }
  if(state.beta8ActiveRecord){
    const r=matchRecord({...state.beta8ActiveRecord,abandoned:true,endedAt:Date.now()});
    if(r){state.beta8Records=appendRecord(book(),r);if(account.user)state.beta8RecordPending=[...(state.beta8RecordPending||[]).filter(v=>v.id!==r.id),r].slice(-100);}
    state.beta8ActiveRecord=null;persist();
  }
  sync().catch(()=>{});
  return {render,start,finish,result,checkpoint(input){if(state.beta8ActiveRecord){Object.assign(state.beta8ActiveRecord,input);persist();}}};
}
