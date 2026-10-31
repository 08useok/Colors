const apiRoot='/api/beta-account';
async function api(path,method='GET',data) {
  const response=await fetch(apiRoot+path,{method,credentials:'same-origin',cache:'no-store',headers:data?{'Content-Type':'application/json'}:{},body:data?JSON.stringify(data):undefined,signal:AbortSignal.timeout(8000)});
  let result;try{result=await response.json();}catch{throw new Error('계정 서버에 연결할 수 없습니다. 베타시즌 실행.cmd로 열어 주세요.');}
  if(!response.ok)throw Object.assign(new Error(result.error??'계정 요청에 실패했습니다.'),{status:response.status});
  return result;
}

export async function initBetaAccount(baseKey) {
  let session=null,version=0,pending=null,inflight=null,timer=null,blocked=false;
  let unavailable=false;
  try{session=await api('/session');version=session.version;}catch(error){unavailable=error.status!==401;}
  const storageKey=session?`${baseKey}:account:${session.user.id}`:baseKey;
  // Server state is authoritative on login. Guest saves remain untouched.
  if(session)localStorage.setItem(storageKey,JSON.stringify(session.state??{}));
  const button=document.createElement('button');button.type='button';button.id='beta-account-button';
  button.textContent=session?`${session.user.nickname} · 계정`:'계정 로그인';
  document.querySelector('.beta-nav').append(button);
  const dialog=document.createElement('dialog');dialog.id='beta-account-dialog';dialog.className='beta-account-dialog';
  dialog.innerHTML=`<form id="beta-account-form">
    <div class="beta-account-title"><h2>베타 계정</h2><button type="button" data-account-close aria-label="닫기">×</button></div>
    <p class="beta-account-note">아이디·비밀번호 로그인 시험 · 이 PC의 서버에 저장됩니다.</p>
    <p data-account-user hidden></p>
    <div data-account-fields>
      <label>아이디<input name="username" autocomplete="username" minlength="3" maxlength="24" pattern="[A-Za-z0-9_]{3,24}" placeholder="영문·숫자·밑줄 3~24자" required></label>
      <label>비밀번호<input name="password" type="password" autocomplete="current-password" maxlength="128" placeholder="비밀번호" required></label>
      <label data-account-signup hidden>닉네임<input name="nickname" autocomplete="nickname" maxlength="12" placeholder="1~12자"></label>
      <label data-account-signup hidden>비밀번호 확인<input name="confirmation" type="password" autocomplete="new-password" maxlength="128"></label>
      <label data-account-recover hidden>복구 코드<input name="recoveryCode" autocomplete="off" spellcheck="false" maxlength="60" placeholder="미리 보관한 복구 코드"></label>
      <label data-account-recover hidden>새 비밀번호<input name="recoveredPassword" type="password" autocomplete="new-password" minlength="10" maxlength="128"></label>
      <label data-account-recover hidden>새 비밀번호 확인<input name="recoveredConfirmation" type="password" autocomplete="new-password" maxlength="128"></label>
      <button type="submit" data-account-submit>로그인</button>
      <button type="button" data-account-mode>새 계정 만들기</button>
      <button type="button" data-account-forgot>비밀번호를 잊으셨나요?</button>
    </div>
    <details data-account-security hidden>
      <summary>비밀번호 변경·복구 코드</summary>
      <label>현재 비밀번호<input name="currentPassword" type="password" autocomplete="current-password" maxlength="128"></label>
      <label>새 비밀번호<input name="newPassword" type="password" autocomplete="new-password" minlength="10" maxlength="128" placeholder="10~128자"></label>
      <label>새 비밀번호 확인<input name="newConfirmation" type="password" autocomplete="new-password" maxlength="128"></label>
      <button type="button" data-account-change-password>비밀번호 변경</button>
      <p class="beta-account-note">복구 코드는 비밀번호를 잊었을 때 사용합니다. 발급하려면 현재 비밀번호를 입력하세요. 다시 발급하면 이전 코드는 사용할 수 없습니다.</p>
      <button type="button" data-account-issue-code>복구 코드 발급</button>
      <p data-account-recovery-state></p>
    </details>
    <section data-account-code-panel hidden>
      <p>복구 코드는 지금 한 번만 표시됩니다. 안전한 곳에 보관하세요.</p>
      <output data-account-code></output>
      <button type="button" data-account-download>복구 코드 파일로 저장</button>
    </section>
    <button type="button" data-account-logout hidden>로그아웃</button>
    <p data-account-status role="status" aria-live="polite"></p>
    <button type="button" data-account-close>게임으로 돌아가기</button>
  </form>`;
  document.body.append(dialog);
  const status=dialog.querySelector('[data-account-status]'),form=dialog.querySelector('form');
  let signup=false,recover=false,busy=false,recoveryCode='';
  const message=text=>{status.textContent=text;};
  function setBusy(value){busy=value;for(const control of form.querySelectorAll('button,input'))control.disabled=value;}
  async function flush() {
    clearTimeout(timer);
    if(inflight){await inflight;if(pending&&!blocked)return flush();return;}
    if(!session||!pending||blocked)return;
    const state=pending;pending=null;
    inflight=api('/save','PUT',{accountId:session.user.id,version,state})
      .then(result=>{version=result.version;button.dataset.save='saved';button.title='계정 저장 완료';})
      .catch(error=>{pending??=state;blocked=error.status===409||error.status===401;button.dataset.save='error';button.title=error.message;message(error.message);throw error;})
      .finally(()=>{inflight=null;});
    await inflight;
    if(pending&&!blocked)await flush();
  }
  function clearSecrets(){
    recoveryCode='';dialog.querySelector('[data-account-code]').textContent='';dialog.querySelector('[data-account-code-panel]').hidden=true;
    for(const input of form.querySelectorAll('input[type=password]'))input.value='';
    form.elements.recoveryCode.value='';
  }
  dialog.addEventListener('close',clearSecrets);
  function guestMode() {
    for(const row of dialog.querySelectorAll('[data-account-signup]'))row.hidden=!signup;
    for(const row of dialog.querySelectorAll('[data-account-recover]'))row.hidden=!recover;
    form.elements.password.closest('label').hidden=recover;
    form.elements.password.required=!recover;
    form.elements.nickname.required=signup;form.elements.confirmation.required=signup;
    for(const name of ['recoveryCode','recoveredPassword','recoveredConfirmation'])form.elements[name].required=recover;
    form.elements.password.autocomplete=signup?'new-password':'current-password';
    form.elements.password.minLength=signup?10:1;
    dialog.querySelector('[data-account-submit]').textContent=recover?'비밀번호 재설정':signup?'가입하고 시작':'로그인';
    dialog.querySelector('[data-account-mode]').textContent=signup||recover?'로그인으로 돌아가기':'새 계정 만들기';
    dialog.querySelector('[data-account-forgot]').hidden=signup||recover;
    clearSecrets();message(recover?'미리 발급받은 복구 코드로 비밀번호를 재설정합니다. 코드가 없으면 아이디만으로 복구할 수 없습니다.':'');
  }
  button.addEventListener('click',()=>{
    dialog.showModal();
    message(unavailable?'계정 서버에 연결할 수 없습니다. 베타시즌 실행.cmd로 열어 주세요.':session?'로그인되어 있습니다. 기존 게스트 데이터는 별도로 보관됩니다.':'기존 게스트 데이터는 그대로 유지됩니다. 새 계정은 별도 저장으로 시작합니다.');
    if(!session)dialog.querySelector('input').focus();
  });
  for(const close of dialog.querySelectorAll('[data-account-close]'))close.addEventListener('click',()=>{clearSecrets();dialog.close();});
  dialog.addEventListener('cancel',event=>{if(busy)event.preventDefault();else clearSecrets();});
  dialog.querySelector('[data-account-mode]').addEventListener('click',()=>{
    if(recover){recover=false;signup=false;}else signup=!signup;
    guestMode();
  });
  dialog.querySelector('[data-account-forgot]').addEventListener('click',()=>{recover=true;signup=false;guestMode();});
  if(session){
    dialog.querySelector('[data-account-fields]').hidden=true;
    dialog.querySelector('[data-account-user]').hidden=false;
    dialog.querySelector('[data-account-user]').textContent=`${session.user.nickname} (${session.user.username})`;
    dialog.querySelector('[data-account-logout]').hidden=false;
    dialog.querySelector('[data-account-security]').hidden=false;
    dialog.querySelector('[data-account-recovery-state]').textContent=session.hasRecoveryCode?'복구 코드가 발급되어 있습니다.':'아직 복구 코드가 없습니다. 미리 발급해 보관하세요.';
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||session)return;
    if(recover&&form.elements.recoveredPassword.value!==form.elements.recoveredConfirmation.value){message('새 비밀번호 확인이 일치하지 않습니다.');return;}
    if(signup&&form.elements.password.value!==form.elements.confirmation.value){message('비밀번호 확인이 일치하지 않습니다.');return;}
    setBusy(true);message('처리 중…');
    try{
      if(recover){
        await api('/recover','POST',{username:form.elements.username.value,recoveryCode:form.elements.recoveryCode.value,newPassword:form.elements.recoveredPassword.value});
        recover=false;guestMode();message('비밀번호를 재설정했습니다. 새 비밀번호로 로그인하세요. 사용한 복구 코드는 폐기되었습니다.');setBusy(false);return;
      }
      await api(signup?'/register':'/login','POST',{username:form.elements.username.value,password:form.elements.password.value,nickname:form.elements.nickname.value});
      form.elements.password.value='';form.elements.confirmation.value='';location.reload();
    }catch(error){message(error.message);setBusy(false);}
  });
  dialog.querySelector('[data-account-issue-code]').addEventListener('click',async()=>{
    if(busy)return;
    if(!form.elements.currentPassword.value){message('현재 비밀번호를 입력하세요.');return;}
    setBusy(true);message('복구 코드 발급 중…');
    try{
      const result=await api('/recovery-code','POST',{accountId:session.user.id,currentPassword:form.elements.currentPassword.value});
      recoveryCode=result.recoveryCode;
      dialog.querySelector('[data-account-code]').textContent=recoveryCode;
      dialog.querySelector('[data-account-code-panel]').hidden=false;
      dialog.querySelector('[data-account-recovery-state]').textContent='복구 코드가 발급되어 있습니다.';
      form.elements.currentPassword.value='';
      message('새 복구 코드를 보관하세요. 이전 복구 코드는 사용할 수 없습니다.');
    }catch(error){message(error.message);}finally{setBusy(false);}
  });
  dialog.querySelector('[data-account-download]').addEventListener('click',()=>{
    if(!recoveryCode)return;
    const url=URL.createObjectURL(new Blob([`Colors 베타 계정 복구 코드\n아이디: ${session.user.username}\n복구 코드: ${recoveryCode}\n다시 발급하거나 사용하면 이 코드는 무효가 됩니다.\n`],{type:'text/plain;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download='colors-beta-recovery.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  dialog.querySelector('[data-account-change-password]').addEventListener('click',async()=>{
    if(busy)return;
    const currentPassword=form.elements.currentPassword.value,newPassword=form.elements.newPassword.value;
    if(!currentPassword){message('현재 비밀번호를 입력하세요.');return;}
    if(newPassword.length<10||newPassword.length>128){message('새 비밀번호는 10~128자로 입력하세요.');return;}
    if(newPassword!==form.elements.newConfirmation.value){message('새 비밀번호 확인이 일치하지 않습니다.');return;}
    setBusy(true);message('저장 후 비밀번호 변경 중…');
    try{
      await flush();if(blocked)throw new Error('저장 상태를 확인한 뒤 새로고침하세요.');
      await api('/password','POST',{accountId:session.user.id,currentPassword,newPassword});clearSecrets();
      dialog.querySelector('[data-account-recovery-state]').textContent='새 비밀번호로 복구 코드를 다시 발급하세요.';
      message('비밀번호를 변경했습니다. 다른 로그인 세션과 이전 복구 코드는 해제되었습니다.');
    }catch(error){message(error.message);}finally{setBusy(false);}
  });
  dialog.querySelector('[data-account-logout]').addEventListener('click',async()=>{
    if(busy)return;setBusy(true);message('저장 후 로그아웃 중…');
    try{await flush();if(blocked)throw new Error('저장 충돌을 확인한 뒤 새로고침하세요.');await api('/logout','POST',{});location.reload();}
    catch(error){message(error.message);setBusy(false);}
  });
  // Capture keyboard input so typing into account fields never moves the fighter.
  window.addEventListener('keydown',event=>{if(dialog.open)event.stopImmediatePropagation();},true);
  window.addEventListener('pagehide',()=>{
    if(session&&pending&&!inflight&&!blocked)fetch(apiRoot+'/save',{method:'PUT',credentials:'same-origin',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify({accountId:session.user.id,version,state:pending})}).catch(()=>{});
  });
  return {storageKey,get isOpen(){return dialog.open;},get user(){return session?.user;},flush,
    queueSave(state){if(!session)return;pending=structuredClone(state);button.dataset.save='pending';button.title='계정 저장 대기 중';clearTimeout(timer);timer=setTimeout(()=>flush().catch(()=>{}),400);},
  };
}
