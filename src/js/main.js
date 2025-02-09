// =========================================================
// Constants, Variables and Declarations
// =========================================================

let page = document.getElementById("page");
const notes = {
    1: {
        title: "test1",
        created: '2024-02-08T14:45:30.123Z',
        modified: '2024-02-08T14:45:30.123Z',
        content: 'text1'
    },
    2: {
        title: "test2",
        created: '2025-02-08T14:45:30.123Z',
        modified: '2025-02-08T14:45:30.123Z',
        content: 'text2'
    }
};

// =========================================================
// Functionality
// =========================================================

// Utility function for quick creation of a div element
function createDiv(options = { className: "", textContent: "", id: "", title: "" }, parent = null, onClick = null) {
    let element = document.createElement("div");
    if (options.className) element.className = options.className;
    if (options.textContent) element.textContent = options.textContent;
    if (options.id) element.id = options.id;
    if (options.title) element.title = options.title;
    if (onClick) element.addEventListener('click', onClick);
    if (parent) parent.appendChild(element);
    return element;
}

// Utility function for quick creation of a pre element
function createPre(options = { className: "", textContent: "", id: "", title: "" }, parent = null, onClick = null) {
    let element = document.createElement("pre");
    if (options.className) element.className = options.className;
    if (options.textContent) element.textContent = options.textContent;
    if (options.id) element.id = options.id;
    if (options.title) element.title = options.title;
    if (onClick) element.addEventListener('click', onClick);
    if (parent) parent.appendChild(element);
    return element;
}

// Get an ID greater than current maximum ID
function getNewNoteID() {
    let ids = Object.keys(notes).map(id => parseInt(id));
    let maxID = Math.max(...ids);
    let newID = maxID + 1
    return newID;
}

// Get ECMA date time string YYYY-MM-DDTHH:mm:ss.sssZ
function getDateString() {
    const date = new Date();
    const string = date.toISOString();
    return string;
}

// Create a blank note with new ID and add to global notes
function createBlankNote() {
    let date = getDateString();
    let id = getNewNoteID();
    let noteData = {
        title: '',
        content: '',
        created: date,
        modified: date
    };
    notes[id] = noteData;
    let output = createNote(noteData, id);
    return output
}

// Remove a note by its ID
function removeNoteById(noteId) {
    delete notes[noteId];
    const noteElement = document.querySelector(`[data-id='${noteId}']`);
    noteElement.parentNode.remove();
}

// Remove a note by its element
function removeNoteByElement(note) {
    delete notes[note.dataset.id];
    note.parentNode.remove();
}

// Show current notes as a stringified alert
function showNotes() {
    alert(JSON.stringify(notes, null, 2));
}

// Create note from data and id
function createNote(data, id) {
    let container = createDiv({ className: "note-container" }, page)
    let note = createDiv({ className: "note" }, container);
    let title = createDiv({ className: "note-title", textContent: data.title }, note);
    let content = createDiv({ className: "note-content", textContent: data.content }, note);
    title.contentEditable = true;
    // title.tabIndex = -1;
    // title.tabIndex = 0;
    content.contentEditable = true;
    // content.tabIndex = -1;
    // content.tabIndex = 0;
    note.setAttribute('data-id', id);
    title.addEventListener("focusout", () => {
        saveNoteElement(container);
    });
    content.addEventListener("focusout", () => {
        saveNoteElement(container);
    });
    // content.addEventListener("keydown", (e) => {
    //     if (e.key === "Enter") {
    //         setTimeout(() => {
                const lineHeight = parseInt(getComputedStyle(content).lineHeight, 10);
                console.log(lineHeight);
    //             note.scrollTop += 500;
    //         }, 0);
    //     }
    // });
    return note
}

// Save a note element, keep date created the same
function saveNoteElement(noteContainer) {
    let noteElement = noteContainer.children[0];
    let id = noteElement.dataset.id;
    let title = noteElement.querySelector(".note-title").textContent;
    let content = noteElement.querySelector(".note-content").textContent;
    let date = getDateString();
    let noteData = {
        title: title,
        content: content,
        modified: date
    };
    Object.assign(notes[id], noteData);
    console.log(`Saved note ${id} at ${date}`);
}

// Save / Push all notes
function pushAllNotesLocal() {

}

// =========================================================
// Toolbar Class
// =========================================================

class ToolbarContainer {
    constructor() {
        this.element = document.getElementById('toolbar-container');
    }

    // Add row to the toolbar
    addRow() {
        createDiv({ className: "toolbar-row" }, this.element);
    }

    // Create and add a button to a given row index
    createButton(rowIndex, iconCode, tooltipText, onClick = null) {
        let rows = this.element.children.length;
        if (rowIndex >= rows) {
            let needed = rowIndex - rows;
            for (let i = 0; i <= needed; i++) {
                this.addRow();
            }
        }
        const row = this.element.children[rowIndex];
        const button = createDiv({ className: "toolbar-button", title: tooltipText }, row, onClick)
        createDiv({ className: "material-symbols-outlined", textContent: iconCode }, button)
    }
}

// =========================================================
// Initialisation Functions
// =========================================================

// Create the ToolBar container and populate with buttons / functionality
function populateToolbar() {
    let tools = new ToolbarContainer();
    tools.createButton(0, "folder", "A1");
    tools.createButton(0, "add", "A2");
    tools.createButton(1, "remove", "B1");
    tools.createButton(1, "delete", "B1");
    tools.createButton(1, "close", "B1");
    tools.createButton(1, "sort_by_alpha", "B1");
    tools.createButton(2, "edit", "B1");
    tools.createButton(2, "sort", "B1");
    tools.createButton(2, "logout", "B1");
    tools.createButton(4, "link", "Show Notes JSON", () => showNotes());
    tools.createButton(2, "check", "B1");
}

// Initialisation function
function init() {
    for (const [id, noteData] of Object.entries(notes)) {
        let note = createNote(noteData, id);
        // note.addEventListener("click", () => removeNoteByElement(note));
    }
}

// Initialisation function
function main() {
    populateToolbar();
    init();
};

// =========================================================
// Execution
// =========================================================

main();