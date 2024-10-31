/**
 * This returns a sorted list of all of the current keys in the dictionary from local storage
 */
async function getDictKeys() {
    let dict = (await browser.storage.local.get('dictionary').catch((e) => console.error(e))).dictionary;
    if (!dict) {
        return [];
    }
    sortedDictKeys = Object.keys(dict).toSorted();
    return sortedDictKeys;
}

async function logKeyValuePair(keyValue) {
    let dict = await browser.storage.local.get('dictionary');
    if (!dict.dictionary) {
        dict = {dictionary: {}};
    }
    dict.dictionary[keyValue.key] = keyValue.value;
    await browser.storage.local.set(dict);
}

async function getValueFomKey(key) {
    dict = (await browser.storage.local.get('dictionary')).dictionary
    return dict[key] ?? "no such key";
}


/**
 * This function opens a popup
 * Waits for the popup to give a response
 * And then logs that value where appropriate
 * @returns 
 */
async function storePopupContent() {
    await browser.action.openPopup();
    
    //get our keys:
    const keys = await getDictKeys();

    // wait a little bit for the popup to open
    await new Promise(resolve => setTimeout(resolve, 50));

    browser.runtime.sendMessage( {
        command: "getInput", keys: keys
    })}
    // send message to popup

async function getPopupContent() {
    await browser.action.openPopup();

    //wait a little bit for popup to load:
    await new Promise(resolve => setTimeout(resolve, 50));

    //get our keys:
    const keys = await getDictKeys();

    browser.runtime.sendMessage( {
        command: "getOutput", 
        keys: keys
    });
}

//keyboard shortcuts listener
browser.commands.onCommand.addListener(async (command) => {
    if (command === "store-content") {
        storePopupContent();
    }

    if (command === "get-content") {
        getPopupContent();
    }

    let response;
    if (command == "print-dictionary") {
        try {
        }
        catch (error) {
            console.error(error)
        }
        response = await getPopupContent();
        console.log("After popup closed, message is", response)

        dict = await browser.storage.local.get('dictionary');
        console.log("in print-dictionary");
        dictText = JSON.stringify(dict);
        console.log(`Dict is: \n ${dictText}`);
        keys = await getDictKeys();
        console.log(`Done with keys ${keys}`);

    }
  });

// message listener from popup
browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
if (message.command === "inputResult") {
    logKeyValuePair(message.result); 
}
if (message.command === "outputResult") {
    const pasteValue = await getValueFomKey(message.key);
    browser.runtime.sendMessage({
        command: "addValueToClipboard", value: pasteValue
    });
}

if (message.command === "getKeys") {
    const keys = await getDictKeys();
    return new Promise( resolve => {
        resolve(keys);
    });
}
});

browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.removeAll();

    // Add things to the context menu!
    browser.contextMenus.create( {
        id: "add-value",
        title: "Add value",
        contexts: ["all"],
        type: "normal",
        parentId: null
    });


    browser.contextMenus.create( {
        id: "get-value",
        title: "Get value",
        contexts: ["all"],
        type: "normal",
        parentId: null
        });

    })

browser.contextMenus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
        case "add-value":
            storePopupContent();
            break;
        case "get-value":
            getPopupContent();
            break;
    }
})

