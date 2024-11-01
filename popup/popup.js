function addKeysToDoc(keys) {
    const keyList = document.getElementById("key-strs");

    keys.forEach(function(key) {
        const option = document.createElement('option');
        option.value = key;
        keyList.appendChild(option);
  });
}

/**
 * This function returns everything to the creation default
 */
function toDefaultState() {
    const inputDiv = document.getElementById("input-mode-div");
    const defaultDiv = document.getElementById("default-div");
    const outputDiv = document.getElementById("output-mode-div");
    const keyList = document.getElementById("key-strs");

    // make defaultDiv visible, and other two invisible (usign display)
    defaultDiv.style.display = "grid";
    inputDiv.style.display = "none";
    outputDiv.style.display = "none";
    while (keyList.firstChild) {
        keyList.removeChild(keyList.lastChild);
    }
}

/**
 * This function triggers on alt+c.
 * It can also trigger on the "add value" input in popup or the context window
 * It happens when there is a (delayed) messenger which tells popup to "showInput"
 * It modifies the popup html to show the "input-mode" div (and hide the other divs)
 * It then gets user input, and on Enter, returns a promise with the response
 * 
 * @returns None
 * BUT, it does send a message to the background script
 */
function inputMode(clipboard, keys) {
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
    

    //if Enter, we send a message
    //Escape will close the browser by default
    inputDiv.addEventListener('keydown', (e) => {
        const activeElementId = document.activeElement.id;

        //enter key
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey || activeElementId === "key-input")) {
            e.preventDefault();
            const result = { key: keyInput.value, value: valueInput.value};
            browser.runtime.sendMessage({
                command: "inputResult",
                result: result
            });
            window.close();
        }
    })

    document.querySelector('#enter-input').addEventListener('click', (e) => {
        const result = { key: keyInput.value, value: valueInput.value};
        browser.runtime.sendMessage( {
            command: "inputResult",
            result: result
        });
    });
}

/**
 * This function (eventually) triggers on alt+g
 * It can also trigger on button press in popup or context menu
 * It happens where there is a delayed message to getOutput
 * 
 * It modifies the popup html and then gets the query
 * 
 * @returns none
 * BUT, it does send a promise
 */
function outputMode(keys) {
    addKeysToDoc(keys);
    const outputDiv = document.getElementById("output-mode-div");
    const defaultDiv = document.getElementById("default-div");
    outputDiv.style.display = "block";
    defaultDiv.style.display = "none";

    const keyOutput = document.getElementById("key-output");
    keyOutput.focus();

    //keyboard triggers on enter
    //escape closes by default
    outputDiv.addEventListener('keydown', (e) => {
        //enter key
        if (e.key === "Enter") {
            e.preventDefault();
            const keyText = keyOutput.value;
            browser.runtime.sendMessage( {
                command: "outputResult",
                key: keyText
            })
        }
    });

    document.querySelector('#enter-output').addEventListener('click', (e) => {
        const keyText = keyOutput.value;
        browser.runtime.sendMessage( {
            command: "outputResult",
            key: keyText
        });
    });
}

// Listeners from 
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === "addValueToClipboard") {
        navigator.clipboard.writeText(message.value);
        window.close();
      }

    if (message.command === "getInput") {
        navigator.clipboard.readText().then(clipboard => {
        inputMode(clipboard, message.keys);
    });
    }

    if (message.command === "getOutput") {
        outputMode(message.keys)
    }
  // 
});

//we deal with the buttons now!
document.addEventListener('click', async (e) => {
    if (e.target.matches('#to-input-button')){
        clipboard = await navigator.clipboard.readText()
        const keys = await browser.runtime.sendMessage({
            command: "getKeys"
        });
        inputMode(clipboard, keys);
    }

    if (e.target.matches('#to-output-button')) {
        const keys = await browser.runtime.sendMessage({
            command: "getKeys"
        });
        outputMode(keys);
    }

    if (e.target.matches('.to-default')) {
        toDefaultState();
    }

    if (e.target.matches('#to-exit')) {
        window.close();
    }
}
);

//finally, we de