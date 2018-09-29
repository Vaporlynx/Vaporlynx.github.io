const template = document.createElement("template");
template.innerHTML = `
    <style>
        :host {
            display: flex;
            width: 200px;
            height: 50px;  
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
            width: 48px;
            height: 48px;
            background-color: var(--interactiveElementBackgroundColor);
            font-size: 48px;
        }
        div:hover {
            background-color: var(--interactiveElementHoverBackgroundColor);
        }

        #mech {
            width: 40px;
        }
    </style>

    <div id="add">+</div>
    <img src="/assets/mech.svg" id="mech"></img>
    <div id="remove">-</div>
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