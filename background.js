async function logKeyValuePair(keyValue) {
    let gettingStoredStats = await browser.storage.local.get('dictionary');
    let dictionary = gettingStoredStats.dictionary;

    if (!dictionary) {
        dictionary = {};
    }

    dictionary[keyValue.key] = keyValue.value
    await browser.storage.local.set({ dictionary: dictionary})
}


browser.commands.onCommand.addListener(async (command) => {
    if (command === "store-content") {
        console.log("TODO: IMPLEMENT store-content");
        
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

        // check if the content script is injected:
        try {
            await browser.tabs.sendMessage(tab.id, { command: "ping"});
        } catch (err) {
            // if fails, then thing doesn't exist
            // so we inject it
            await browser.tabs.executeScript( 
                { "file": "/content-script/read-and-write.js" });
        }

        let response = await browser.tabs.sendMessage(tab.id,
            {command: "copyAction"});
        logKeyValuePair(response);
    }
    if (command === "get-content") {
        console.log("TODO: implement get-content");
        try {
            await navigator.clipboard.writeText("Copied to clipboard!");
        } catch (error) {
            console.error(error.message);
        }
    }
  });