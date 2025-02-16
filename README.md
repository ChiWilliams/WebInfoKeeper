# WebInfoKeeper

WebInfoKeeper is a lightweight browser extension to help store and keep track of text across browser session with minimal friction. 

## Features
* **Quick text storage**: Select text and press `Alt+C` (or your configured keyboard shortcut) to save it with a custom label.
* **Easy retrieval**: Quickly access stored with `Alt+G` by inputting your label (with autofill!) onto your clipboard.
* **Cross browser**: Available on Firefox, Chrome, and Edge.
* **GUI for managing snippets**: Access the extension popup (`Alt+O`) to access your key value pairs!

## Demo:
1. Loading a value in is easy.
<img src="https://github.com/user-attachments/assets/7bbb2663-57c7-4947-9c37-eeb162a532b0" width="400" alt="Loading a value">

2. When you type in your key, you get your keys suggested to you.  
<img src="https://github.com/user-attachments/assets/2bebd29e-942f-4e37-a4cc-59466c8b403d" width="400" alt="Key suggestions">

4. You can also modify your keys in the graphical user interface:
<img src="https://github.com/user-attachments/assets/2bfe3387-9c65-4d8e-8533-f75b557e7244" width="400" alt="GUI interface">

## Installation

### Through a web store
To install onto your browser, you can download for Firefox at [WebInfoKeeper](https://addons.mozilla.org/en-US/firefox/addon/webinfokeeper/), and also on [Chrome](https://chromewebstore.google.com/detail/webinfokeeper/fkkbbcbjidlkelmpajcocjhlhoabepgg) and [Edge](https://microsoftedge.microsoft.com/addons/detail/webinfokeeper/bmkookfameikjboipaghelajdphpkmmf). 

### Building Locally

Clone the repository:
```bash
git clone https://github.com/chiWilliams/webInfoKeeper.git
cd webInfoKeeper
```
Choose your browser:  
#### Firefox
* Install web-ext:
```bash
npm install --global web-ext
```
* Run in development mode:
```bash
web-ext run
```
* Or load temporarily through `about:debugging`.

#### Chrome/Edge

* Rename manifestChrome.json to manifest.json
* Load unpacked extension:
  * Chrome: Visit chrome://extensions/, enable Developer mode, click "Load unpacked"
  * Edge: Visit edge://extensions/, enable Developer mode, click "Load unpacked"

## Privacy
WebInfoKeeper stores all data locally in your browser. No data is sent to external servers, and no tracking or analytics are implemented.

## Acknowledgements
This project was done at the [Recurse Center](recurse.com). Thank you to everyone there!
