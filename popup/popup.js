let currentKeys = [];
let currentKeysAndValues = {};

document.addEventListener('DOMContentLoaded', async () => {
    toDefaultState();
  });


/**
 * This function sets the global variables currentKeys and currentKeysAndValues
 * It sends a message to the background script
 */
async function refreshKeyData() {
    currentKeys = await browser.runtime.sendMessage({
        command: "getKeys"
    });
    currentKeysAndValues = await browser.runtime.sendMessage({
        command: "getKeysAndVals"
    });
}

function addKeysToDoc(keys) {
    const keyList = document.getElementById("key-strs");

    keys.forEach(function(key) {
        const option = document.createElement('option');
        option.value = key;
        keyList.appendChild(option);
  });
}

function hideAllDivs() {
    const inputDiv = document.getElementById("input-mode-div");
    const defaultDiv = document.getElementById("default-div");
    const outputDiv = document.getElementById("output-mode-div");
    const updateDiv = document.getElementById("update-mode-div");
    const listDiv = document.getElementById("list-keys-div");

    defaultDiv.style.display = "none";
    inputDiv.style.display = "none";
    outputDiv.style.display = "none";
    updateDiv.style.display = "none";
    listDiv.style.display = "none";

}

/**
 * This function returns everything to the creation default
 */
async function toDefaultState() {
    const defaultDiv = document.getElementById("default-div");
    const keyList = document.getElementById("key-strs");
    const keyValueList = document.getElementById("keys-list");

    // make defaultDiv visible, and others invisible
    hideAllDivs();
    defaultDiv.style.display = "grid";

    //clear the keyList and the keyValueList
    while (keyList.firstChild) {
        keyList.removeChild(keyList.lastChild);
    }
    while (keyValueList.firstChild) {
        keyValueList.removeChild(keyValueList.lastChild)
    }

    await refreshKeyData();
    addKeysToDoc(currentKeys);
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
function inputMode(clipboard) {
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
function outputMode() {
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

function getUpdateKey() {
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
                command: "getUpdateResult",
                key: keyText
            })
        }
    });
}

function listKeys(keysAndVals) {
    const defaultDiv = document.getElementById("default-div");
    const listDiv = document.getElementById("list-keys-div");
    defaultDiv.style.display = "none";
    listDiv.style.display = "block";

    keysList = document.getElementById("keys-list");
    Object.entries(keysAndVals).forEach(([key, value]) => {
        const li = document.createElement('li');
        li.className = 'key-list-item';

        // create keySpan
        const keySpan = document.createElement('span')
        keySpan.class = 'key-list-key';
        keySpan.textContent=key;

        // Create and append buttons div
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'key-list-buttons';

        //create update buttons:
        const updateButton = document.createElement('button');
        updateButton.textContent = 'Update';
        updateButton.onclick = () => {
            hideAllDivs();
            browser.runtime.sendMessage( {
                command: "getUpdateResult",
                key: key
            });
        }

        // create delete button:
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = async () => {
            hideAllDivs();
            await browser.runtime.sendMessage( {
                command: "deleteKey",
                key: key
            })
            await toDefaultState();
        }

        // value on tooltip
        const tooltipDiv = document.createElement('div');
        tooltipDiv.className = 'key-tooltip';
        tooltipDiv.textContent = value;

        buttonsDiv.appendChild(updateButton);
        buttonsDiv.appendChild(deleteButton);
        li.appendChild(keySpan);
        li.appendChild(buttonsDiv);
        li.appendChild(tooltipDiv);
        
        keysList.appendChild(li);
    });


}

function updateValue(key, value) {
    const outputDiv = document.getElementById("output-mode-div");
    const updateDiv = document.getElementById("update-mode-div");
    outputDiv.style.display = "none";
    updateDiv.style.display = "block";

    const keyArea = document.getElementById("update-mode-key");
    keyArea.textContent = key;
    const valueArea = document.getElementById("update-mode-value");
    valueArea.value = value;

    document.querySelector('.update-value').addEventListener('click', (e) => {
        const result = { key: key, value: valueArea.value};
        browser.runtime.sendMessage( {
            command: "inputResult",
            result: result
        });
        toDefaultState();
    });

    document.querySelector('.delete-value').addEventListener('click', async (e) => {
        await browser.runtime.sendMessage( {
            command: "deleteKey",
            key: key
        });
        await toDefaultState();
    })
    
}

// Listeners from 
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.command) {
        case "addValueToClipboard":
            navigator.clipboard.writeText(message.value);
            window.close();
            break;
        case "getInput":
            navigator.clipboard.readText().then(clipboard => {
                inputMode(clipboard)
            });
            break;
        case "getOutput":
            outputMode();
            break;
        case "updateValueInPopup":
            updateValue(message.key, message.value);
            break;
        default:
            console.error('Unknown command:', message.command);
            // Handle unexpected commands appropriately
            break;
    }

  // 
});

//we deal with the buttons now!
document.addEventListener('click', async (e) => {
    //navigation to input mode
    if (e.target.matches('#to-input-button')){
        clipboard = await navigator.clipboard.readText()
        inputMode(clipboard);
    }

    //navigation to output mode
    if (e.target.matches('#to-output-button')) {
        outputMode();
    }

    //navigation to list_keys
    if (e.target.matches('#to-list-keys-button')) {
        listKeys(currentKeysAndValues);
    }

    //navigation to modify button
    if (e.target.matches('#to-modify-key-button')) {
        getUpdateKey();
    }

    // return to default (homepage)
    if (e.target.matches('.to-default')) {
        toDefaultState();
    }

    // exit
    if (e.target.matches('#to-exit')) {
        window.close();
    }
}
);

