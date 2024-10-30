function addKeysToDoc(keys) {
    const keyList = document.getElementById("key-strs");

    keys.forEach(function(key) {
        const option = document.createElement('option');
        option.value = key;
        keyList.appendChild(option);
  });
}


/**
 * This function triggers on alt+c.
 * It can also trigger on the "add value" input in popup or the context window
 * It happens when there is a (delayed) messenger which tells popup to "showInput"
 * It modifies the popup html to show the "input-mode" div (and hide the other divs)
 * It then gets user input, and on Enter, returns a promise with the response
 * 
 * @returns a promise object with the message
 */
async function inputMode(clipboard, keys) {
    //confirm(clipboard)
    addKeysToDoc(keys);
    const inputDiv = document.getElementById("input-mode-div");
    const defaultDiv = document.getElementById("default-div");
    inputDiv.style.display = "block";
    defaultDiv.style.display = "none";

    const valueInput = document.getElementById("value-input");
    valueInput.value = clipboard;
    const keyInput = document.getElementById("key-input");

    valueInput.focus();
    valueInput.select();
    

    return new Promise( (resolve) => {
        //keyboard triggers on Enter [or Ctrl+Enter], or escape
        inputDiv.addEventListener('keydown', (e) => {
            const activeElementId = document.activeElement.id;

            //enter key
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey || activeElementId === "key-input")) {
                e.preventDefault();
                const result = { key: keyInput.value, value: valueInput.value};
                window.close();
                resolve(result);
            }

            //escape key also closes:
            if (e.key === "Escape") {
                e.preventDefault();
                window.close();
                resolve(null);
            }
        })
    })
}

/**
 * This function (eventually) triggers on alt+g
 * It can also trigger on button press in popup or context menu
 * It happens where there is a delayed message to getOutput
 * 
 * It modifies the popup html and then gets the query
 * 
 * @returns a promise object with the outpu
 */
async function outputMode(keys) {
    addKeysToDoc(keys);
    const outputDiv = document.getElementById("output-mode-div");
    const defaultDiv = document.getElementById("default-div");
    outputDiv.style.display = "block";
    defaultDiv.style.display = "none";

    const keyOutput = document.getElementById("key-output");
    keyOutput.focus();

    return new Promise(resolve => {
        //keyboard triggers on enter or release
        outputDiv.addEventListener('keydown', (e) => {
            //enter key
            if (e.key === "Enter") {
                e.preventDefault();
                const result = keyOutput.value;
                resolve(result);
            }

            //escape key also closes:
            if (e.key === "Escape") {
                e.preventDefault();
                window.close();
                resolve(null);
            }
        })

    })
}

// In popup.js
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === "addValueToClipboard") {
        navigator.clipboard.writeText(message.value);
        window.close();
        return;
      }

    if (message.command === "getInput") {
        navigator.clipboard.readText().then(clipboard => {
        inputMode(clipboard, message.keys)
        .then(result => {
            sendResponse(result);
        })
        .catch(error => {
            sendResponse({ error: error.message});
        });
        })
        return true;
        
    }

    if (message.command === "getOutput") {
        outputMode(message.keys)
        .then(key => {
            sendResponse(key)
        })
        .catch(error => {
            sendResponse({ error: error.message});
        })

        return true;
    }
  // 
});

// window.addEventListener("beforeunload", (event) => {
//     event.preventDefault();
//     confirm("Sure you want to close?");
// })