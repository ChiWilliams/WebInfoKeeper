const browser = chrome;

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

/**
 * This gets the keys and values!
 * @returns The current state of the dictionary from local storage
 */
async function getKeysAndVals() {
    let dict = (await browser.storage.local.get('dictionary').catch((e) => console.error(e))).dictionary;
    return dict;
}

async function deleteDictKey(key) {
    console.log(`in deleteDictKey with key: ${key}`)
    let dict = (await browser.storage.local.get('dictionary').catch((e) => console.error(e)));
    console.log(`dict is ${JSON.stringify(dict)}`);
    try{    
        delete dict.dictionary[key]; 
    }
    catch (error) {
        console.error(error);}
    console.log(`after deleting: dict is ${JSON.stringify(dict)}`);
    browser.storage.local.set(dict);
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

    if (command == "show-popup") {
        await browser.action.openPopup();

        dict = await browser.storage.local.get('dictionary');
        console.log("in print-dictionary");
        dictText = JSON.stringify(dict);
        console.log(`Dict is: \n ${dictText}`);
        keys = await getDictKeys();
        console.log(`Done with keys ${keys}`);

    }
  });

// message listener from popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.command) {
        case "inputResult":
            logKeyValuePair(message.result);
            break;
        case "outputResult":
            getValueFomKey(message.key).then(pasteValue =>
            {browser.runtime.sendMessage({
                command: "addValueToClipboard", value: pasteValue
            })}
            );
            break;;
        case "getKeys":
            console.log("in getKeys")
            getDictKeys().then(result => {
                sendResponse(result);
            });
            return true;
        case "getKeysAndVals":
            getKeysAndVals().then(result => {
                sendResponse(result);
            });            
            return true;
        case "getUpdateResult":
            //console.log("In getUpdateResult");
            getValueFomKey(message.key).then(pasteValue => {
            browser.runtime.sendMessage({
                command: "updateValueInPopup",
                value: pasteValue,
                key: message.key
            })});
            break;
        case "deleteKey":
            deleteDictKey(message.key);
            break;
        default:
            console.error('Unknown command:', message.command);
            break;
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

