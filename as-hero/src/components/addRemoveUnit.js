const template = document.createElement("template");
template.innerHTML = `
    <style>
        :host {
            display: flex;
            width: 8em;
            height: 3em;  
            background-color: var(--nonInteractiveElementBackgroundColor);
            color: var(--nonInteractiveElementBackgroundFontColor);
            position: absolute;
            bottom: 0px;
            right: 0px;
            justify-content: space-between;
        }

        .disabled {
            pointer-events: none;
        }

        div {
            width: 2em;
            height: 2em;
            background-color: var(--interactiveElementBackgroundColor);
            font-size: 2em;
        }
        div:hover {
            background-color: var(--interactiveElementHoverBackgroundColor);
        }

        #mech {
            width: 1.6em;
        }
    </style>

    <button id="add"><img src="./assets/plus.svg"></img></button>
    <img src="./assets/mech.svg" id="mech"></img>
    <button id="remove"><img src="./assets/minus.svg"></img></button>
`;

export default class addRemoveUnits extends HTMLElement {
    static get template() {
      return template;
    }

    constructor() {
        super();

        this.attachShadow({mode: "open"}).appendChild(this.constructor.template.content.cloneNode(true));

        this.addElem = this.shadowRoot.getElementById("add");
        this.addElem.addEventListener("pointerdown", () => {
            this.dispatchEvent(new CustomEvent("add", {detail: {}}));
        });
        this.removeElem = this.shadowRoot.getElementById("remove");
        this.removeElem.addEventListener("pointerdown", () => {
            this.dispatchEvent(new CustomEvent("remove", {detail: {}}));
        });
    }
}

customElements.define("vpl-add-remove-units", addRemoveUnits);