// Add notice to #a > div
(function addNipNotice() {
  const aDiv = document.querySelector('#a > div');
  if (!aDiv) return;
  if (aDiv.querySelector('.nip-notice')) return; // Prevent duplicate
  const notice = document.createElement('div');
  notice.className = 'nip-notice';
  notice.textContent = 'Copy terlebih dahulu NIP pegawai sebelum membuka aktivitas';
  notice.style.background = '#fff3cd';
  notice.style.color = '#856404';
  notice.style.border = '1px solid #ffeeba';
  notice.style.padding = '10px 16px';
  notice.style.marginBottom = '12px';
  notice.style.borderRadius = '4px';
  notice.style.fontWeight = 'bold';
  aDiv.insertBefore(notice, aDiv.firstChild);
})();

// Lock/unlock modal close during progress
function lockModal() {
  var closeBtn = document.querySelector('#modal-validasi-aktivitas .close, #modal-validasi-aktivitas [data-dismiss="modal"]');
  if (closeBtn) closeBtn.disabled = true;
  var modal = document.getElementById('modal-validasi-aktivitas');
  if (modal) {
    modal.setAttribute('data-locked', 'true');
    modal.addEventListener('click', modalLockHandler, true);
  }
}
function modalLockHandler(e) {
  if (e.target.classList.contains('modal') || e.target.classList.contains('modal-backdrop')) {
    e.stopPropagation();
    e.preventDefault();
  }
}
function unlockModal() {
  var closeBtn = document.querySelector('#modal-validasi-aktivitas .close, #modal-validasi-aktivitas [data-dismiss="modal"]');
  if (closeBtn) closeBtn.disabled = false;
  var modal = document.getElementById('modal-validasi-aktivitas');
  if (modal) {
    modal.removeAttribute('data-locked');
    modal.removeEventListener('click', modalLockHandler, true);
  }
}

// Function to run the main script logic
function runValidasiScript() {
  const buttons = document.querySelectorAll(
    '#modal-validasi-aktivitas table button.btn.btn-success.btn-sm'
  );

  const filteredButtons = Array.from(buttons).filter(btn => {
    return btn.textContent.trim() === 'Terima' &&
           btn.querySelector('span.fa.fa-check') &&
           btn.id.startsWith('valid-');
  });

  console.log(filteredButtons); // Array of matching button elements`

  // Change button color to purple and remove previous click listeners
  filteredButtons.forEach((btn, idx) => {
    // Remove previous click listeners by replacing the button with a clone
    const newBtn = btn.cloneNode(true);
    newBtn.style.backgroundColor = '#800080';
    newBtn.style.borderColor = '#800080';
    newBtn.style.color = '#fff';
    btn.parentNode.replaceChild(newBtn, btn);
    filteredButtons[idx] = newBtn; // update reference
  });

  // Prompt for NIP once
  const nip = prompt('Masukkan NIP:');
  if (!nip || nip.trim() === '') {
    alert('NIP wajib diisi! Proses dibatalkan.');
    return;
  }

  // csrf_token must be defined globally or elsewhere in your script

  filteredButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const id = btn.id.replace('valid-', '');
      fetch(aksiUrl, {
        headers: {
          "accept": "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9",
          "content-type": "application/json;charset=UTF-8",
          "sec-ch-ua": '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-csrf-token": csrf_token
        },
        referrer: refUrl,
        body: JSON.stringify({
          id: id,
          nip: nip,
          valid: "valid",
          keterangan_valid: ""
        }),
        method: "POST",
        mode: "cors",
        credentials: "include"
      }).then(resp => resp.json())
        .then(data => {
          // After success, disable the button, change text and color
          btn.disabled = true;
          btn.textContent = 'Tervalidasi';
          btn.style.backgroundColor = '#888';
          btn.style.borderColor = '#888';
          btn.style.color = '#fff';
          console.log('Response:', data);
        })
        .catch(err => {
          alert('Terjadi kesalahan validasi!');
          console.error(err);
        });
    });
  });
}

// Obfuscation helpers
function getDomain() {
  // Split and decode base64 for the domain
  return atob('ZXJrLnBvbnRpYW5hay5nby5pZA==');
}

function getUrl(path) {
  return 'https://' + getDomain() + path;
}

const aksiUrl = getUrl('/validasi/aksi');
const refUrl = getUrl('/validasi');

// Function to run all aktivitas automatically
function runSemuaAktivitasScript() {
  lockModal(); // Lock modal at start
  const buttons = document.querySelectorAll(
    '#modal-validasi-aktivitas table button.btn.btn-success.btn-sm'
  );

  const filteredButtons = Array.from(buttons).filter(btn => {
    return btn.textContent.trim() === 'Terima' &&
           btn.querySelector('span.fa.fa-check') &&
           btn.id.startsWith('valid-');
  });

  // Change button color to purple and remove previous click listeners
  filteredButtons.forEach((btn, idx) => {
    const newBtn = btn.cloneNode(true);
    newBtn.style.backgroundColor = '#800080';
    newBtn.style.borderColor = '#800080';
    newBtn.style.color = '#fff';
    btn.parentNode.replaceChild(newBtn, btn);
    filteredButtons[idx] = newBtn;
  });

  const nip = prompt('Masukkan NIP:');
  if (!nip || nip.trim() === '') {
    alert('NIP wajib diisi! Proses dibatalkan.');
    unlockModal();
    return;
  }
  let detik = prompt('Masukkan jeda antar klik (detik, kosongkan untuk random 1-10 detik):', '');
  let useRandom = false;
  if (detik === null || detik.trim() === '') {
    useRandom = true;
  } else {
    detik = parseInt(detik, 10);
    if (isNaN(detik) || detik < 1) detik = 2;
  }

  // csrf_token must be defined globally or elsewhere in your script

  let idx = 0;
  function klikBerikutnya() {
    if (idx >= filteredButtons.length) {
      alert('Semua aktivitas telah dijalankan!');
      unlockModal(); // Unlock modal after all done
      return;
    }
    const btn = filteredButtons[idx];
    if (btn.disabled || btn.textContent === 'Tervalidasi') {
      idx++;
      klikBerikutnya();
      return;
    }
    const id = btn.id.replace('valid-', '');
    let delaySec = useRandom ? (1 + Math.floor(Math.random() * 10)) : detik;
    let countdown = delaySec;
    btn.textContent = useRandom ? `Memproses... (${countdown} detik)` : 'Memproses...';
    btn.disabled = true;
    fetch(aksiUrl, {
      headers: {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/json;charset=UTF-8",
        "sec-ch-ua": '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-csrf-token": csrf_token
      },
      referrer: refUrl,
      body: JSON.stringify({
        id: id,
        nip: nip,
        valid: "valid",
        keterangan_valid: ""
      }),
      method: "POST",
      mode: "cors",
      credentials: "include"
    }).then(resp => resp.json())
      .then(data => {
        // Start countdown if random
        if (useRandom) {
          let interval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
              btn.textContent = `Memproses... (${countdown} detik)`;
            } else {
              clearInterval(interval);
            }
          }, 1000);
          setTimeout(() => {
            btn.textContent = 'Tervalidasi';
            btn.style.backgroundColor = '#888';
            btn.style.borderColor = '#888';
            btn.style.color = '#fff';
            btn.disabled = true;
            idx++;
            klikBerikutnya();
          }, delaySec * 1000);
        } else {
          btn.textContent = 'Tervalidasi';
          btn.style.backgroundColor = '#888';
          btn.style.borderColor = '#888';
          btn.style.color = '#fff';
          btn.disabled = true;
          idx++;
          setTimeout(klikBerikutnya, delaySec * 1000);
        }
      })
      .catch(err => {
        btn.textContent = 'Gagal';
        btn.style.backgroundColor = '#d32f2f';
        btn.style.borderColor = '#d32f2f';
        btn.style.color = '#fff';
        btn.disabled = false;
        alert('Terjadi kesalahan validasi pada aktivitas ke-' + (idx + 1));
        console.error(err);
        idx++;
        setTimeout(klikBerikutnya, delaySec * 1000);
      });
  }
  klikBerikutnya();
}

function getBawahan() {
  const result = [];
  window.queueValidasiBawahan = [];
  const parent = document.querySelector('#wraper > div > div.card_wrapper');
  if (!parent) {
    console.warn('Parent card_wrapper not found');
    return result;
  }
  const cards = parent.querySelectorAll('.card.bg-white.box-shadow-panel.wrapper-md');
  cards.forEach(card => {
    const nama = (card.querySelector('p.text-orange.text14') || {}).textContent?.trim() || '';
    const nipText = (card.querySelector('p.text-light-grey.text12') || {}).textContent || '';
    const nipMatch = nipText.match(/NIP:\s*(\d+)/);
    const nip = nipMatch ? nipMatch[1] : '';
    const jabatan = (card.querySelector('p.text-success.text14') || {}).textContent?.trim() || '';
    const allValidated = !!card.innerText.match(/Semua Aktivitas Sudah Divalidasi/);
    const obj = {
      nama: nama,
      nip: nip,
      jabatan: jabatan,
      all_validated: allValidated
    };
    result.push(obj);
    if (!allValidated) {
      window.queueValidasiBawahan.push(obj);
    }
  });
  // Add menu if needed
  const ul = document.querySelector('#header > div.collapse.pos-rlt.navbar-collapse.bg-info > ul');
  if (ul && !ul.querySelector('#prosesBawahanMenu')) {
    const li = document.createElement('li');
    li.className = 'dropdown';
    li.id = 'prosesBawahanMenu';
    const a = document.createElement('a');
    a.href = '#';
    a.className = 'dropdown-toggle';
    a.style.backgroundColor = '#1976d2';
    a.style.color = '#fff';
    a.style.fontWeight = 'bold';
    a.style.borderRadius = '4px';
    a.style.margin = '2px 0';
    a.innerHTML = '🚀 Validasi Otomatis <span class="badge badge-sm m-l-sm bg-danger pull-right-xs" id="bawahanBadge">' + window.queueValidasiBawahan.length + '</span>';
    a.onclick = function(e) {
      e.preventDefault();
      if (window.queueValidasiBawahan.length > 0) {
        console.log('queueValidasiBawahan:', window.queueValidasiBawahan);
        notify("Info",window.queueValidasiBawahan.length + ' pegawai belum divalidasi. Lihat console untuk detail.');
        notify("Info",'Fitur ini belum diimplementasi, silahkan klik tombol "Jalankan Script" untuk menjalankan validasi secara manual.');
      } else {
        notify("Info",'Saat ini tidak ada pegawai yang perlu divalidasi.', "error");
      }
    };
    li.appendChild(a);
    ul.insertBefore(li, ul.firstChild);
  } else if (ul) {
    // update badge if already present
    const badge = ul.querySelector('#bawahanBadge');
    if (badge) badge.textContent = window.queueValidasiBawahan.length;
  }
  console.log(result);
  return result;
}

// Add the 'Jalankan Script' and 'Jalankan Semua Aktivitas' buttons to the modal-content if not already present
(function addJalankanScriptButtons() {
  const modalContent = document.querySelector('#modal-validasi-aktivitas > div > div');
  if (!modalContent) return;
  // Add info message if not already present
  if (!modalContent.querySelector('.aktivitas-info')) {
    const info = document.createElement('div');
    info.className = 'aktivitas-info';
    info.textContent = 'Tunggu Aktivitas Muncul Terlebih Dahulu';
    info.style.background = '#e3f2fd';
    info.style.color = '#1565c0';
    info.style.border = '1px solid #90caf9';
    info.style.padding = '10px 16px';
    info.style.marginBottom = '12px';
    info.style.borderRadius = '4px';
    info.style.fontWeight = 'bold';
    modalContent.insertBefore(info, modalContent.firstChild);
  }
  if (!modalContent.querySelector('#jalankanScriptBtn')) {
    const jalankanBtn = document.createElement('button');
    jalankanBtn.id = 'jalankanScriptBtn';
    jalankanBtn.textContent = '🔥 Jalankan Script';
    jalankanBtn.style.backgroundColor = '#1976d2';
    jalankanBtn.style.color = '#fff';
    jalankanBtn.style.border = 'none';
    jalankanBtn.style.borderRadius = '4px';
    jalankanBtn.style.padding = '8px 18px';
    jalankanBtn.style.fontSize = '16px';
    jalankanBtn.style.marginBottom = '8px';
    jalankanBtn.style.cursor = 'pointer';
    jalankanBtn.style.display = 'block';
    jalankanBtn.style.marginLeft = 'auto';
    jalankanBtn.style.marginRight = 'auto';
    jalankanBtn.addEventListener('click', function() {
      runValidasiScript();
      jalankanBtn.disabled = true;
      jalankanBtn.textContent = 'Script Sudah Dijalankan';
      jalankanBtn.style.backgroundColor = '#888';
      jalankanBtn.style.cursor = 'not-allowed';
    });
    modalContent.insertBefore(jalankanBtn, modalContent.firstChild.nextSibling);
  }
  if (!modalContent.querySelector('#jalankanSemuaBtn')) {
    const jalankanSemuaBtn = document.createElement('button');
    jalankanSemuaBtn.id = 'jalankanSemuaBtn';
    jalankanSemuaBtn.textContent = '🚀 Jalankan Semua Aktivitas';
    jalankanSemuaBtn.style.backgroundColor = '#8e24aa';
    jalankanSemuaBtn.style.color = '#fff';
    jalankanSemuaBtn.style.border = 'none';
    jalankanSemuaBtn.style.borderRadius = '4px';
    jalankanSemuaBtn.style.padding = '8px 18px';
    jalankanSemuaBtn.style.fontSize = '16px';
    jalankanSemuaBtn.style.marginBottom = '16px';
    jalankanSemuaBtn.style.cursor = 'pointer';
    jalankanSemuaBtn.style.display = 'block';
    jalankanSemuaBtn.style.marginLeft = 'auto';
    jalankanSemuaBtn.style.marginRight = 'auto';
    jalankanSemuaBtn.addEventListener('click', function() {
      jalankanSemuaBtn.disabled = true;
      jalankanSemuaBtn.textContent = 'Menjalankan Semua...';
      runSemuaAktivitasScript();
    });
    modalContent.insertBefore(jalankanSemuaBtn, modalContent.firstChild.nextSibling.nextSibling);
  }
})();

// Call getBawahan on page load
getBawahan();