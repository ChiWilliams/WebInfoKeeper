let isDialogOpen = false;

const createDialog = (selectedText, keys, containsValue) => {
  //confirm(` in createDialog `)
  const wrapper = document.createElement('div');
  const shadow = wrapper.attachShadow( {mode: 'open' });

  if (!selectedText) {
    selectedText = "";
  }

  shadow.innerHTML = `
  <body>
    <dialog id="approvalPopup">
      <div>
        <label class="input-class" for="input-value">Copied value:</label> <br>
        <textarea class="input-class" id="input-value" name="input-value"
          rows=6 cols = 45
          style = "resize: none"
        ></textarea>
        <br>
        <label class="output-class" for="key-value">Key value:</label><br>
        <input list="key-strs" id="key-value" name="key-value" required>

        <datalist id="key-strs"></datalist>
      </div>
    </dialog>
  </body>   
  `;

  //confirm(`created innerHTML`)

  // We add elements to our list now:
  const keyStrs = shadow.querySelector('#key-strs');
  //confirm(`created keyStrs: ${keyStrs}`);
  keys.forEach(function(key) {
    const option = document.createElement('option');
    //confirm(`option is ${option}`)
    option.value = key;
    keyStrs.appendChild(option);
  });

  //confirm(`added everything to keyStrs`)

  document.body.appendChild(wrapper);

  const input = shadow.querySelector('#input-value');
  input.value = selectedText;
  const key = shadow.querySelector('#key-value');
  const dialog = shadow.querySelector('dialog');

  // if we only have the key, we only show the key:
  if (!containsValue) {
    shadow.querySelectorAll('.input-class').forEach(element => element.remove());
  }


  return { wrapper, dialog, input, key}
}

const cleanup = (wrapper, dialog) => {
  wrapper.remove();
  isDialogOpen = false;
};

async function writeToLocalStorage(keys) {
  //confirm(`In writeToLocalStorage, keys=${keys}`)
  //confirm(`isDialogopen value: ${isDialogOpen}`)
  if (isDialogOpen) {
    //confirm("Dialog is already open")
    return; //exit if dialog is already open
  }
  isDialogOpen = true;

  const selectedText = window.getSelection().toString();
  //confirm(`will run createDialog with ${selectedText}; ${keys}; ${true}`)
  const {wrapper, dialog, input, key} = createDialog(selectedText, keys, true);

  //confirm(`ran createDialog with ${selectedText, keys, true}`)
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
      // get id of active element that is hid in the shadow root
      const activeElementId = document.activeElement.shadowRoot.activeElement.id;

      // submit on a ctrl+enter if in value or on an enter if in key
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || activeElementId === 'key-value')) {
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

async function getKeyForRetrieval(keys) {
  let {wrapper, dialog, _, key} = await createDialog(null, keys, false);
  
  dialog.showModal();

  return new Promise( (resolve) => {

    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        cleanup(wrapper, dialog);
        resolve(key.value);
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
      console.log(`in copyAction, message is ${JSON.stringify(message)}`)
      writeToLocalStorage(message.keys)
        .then(result => {
          sendResponse(result);
        })
        .catch(error => {
          sendResponse({ error: error.message });
      });
    
    return true;
    }

    if (message.command === "getKeyForRetrieval") {
      //confirm(`Keys is ${message.keys}`)
      getKeyForRetrieval(message.keys)
        .then(result => {
          sendResponse(result);
        })
        .catch(error => {
          sendResponse({ error: error.message });
      });
      // get local storage
      return true;
      // return key value
    }

    if (message.command === "addValueToClipboard") {
      navigator.clipboard.writeText(message.value);

      return true;
    }
  });