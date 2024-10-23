let isDialogOpen = false;

const createDialog = (selectedText) => {
  const wrapper = document.createElement('div');
  const shadow = wrapper.attachShadow( {mode: 'open' });

  shadow.innerHTML = `
  <body>
    <dialog id="approvalPopup">
      <div>
        <label for="input-value">Copied value:</label> <br>
        <textarea id="input-value" name="input-value"
          rows=6 cols = 45
          style = "resize: none"
        >${selectedText}</textarea>
        <br>
        <label for="key-value">Key value:</label><br>
        <input type="text" id="key-value" name="key-value" required>
      </div>
    </dialog>
  </body>   
  `;

  document.body.appendChild(wrapper);

  const input = shadow.querySelector('#input-value');
  const key = shadow.querySelector('#key-value');
  const dialog = shadow.querySelector('dialog');

  return { wrapper, dialog, input, key}
}

const cleanup = (wrapper, dialog) => {
  wrapper.remove();
  isDialogOpen = false;
};

async function writeToLocalStorage() {
  if (isDialogOpen) {
    confirm("dialog is open")
    return; //exit if dialog is already open
  }
  isDialogOpen = true;

  const selectedText = window.getSelection().toString();
  const {wrapper, dialog, input, key} = createDialog(selectedText);

  dialog.showModal();

  requestAnimationFrame( () => {
    if (selectedText === "") {
      input.focus();
  } else {
      key.focus();
  }
  });


  return new Promise( (resolve) => {

    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const result = { key: key.value, value: input.value };
        cleanup(wrapper, dialog);
        resolve(result);
      }
    });

    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cleanup(wrapper, dialog);
        resolve(null);
      }
    });


  });
}



browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === "ping") {
        sendResponse(true);
        return;
}

    if (message.command === "copyAction") {
      writeToLocalStorage()
        .then(result => {
          sendResponse(result);
        })
        .catch(error => {
          sendResponse({ error: error.message });
      });
    
    return true;
    }
  });