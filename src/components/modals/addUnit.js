const template = document.createElement("template");
template.innerHTML = `
    <style>
        :host {
            display: flex;
            width: 200px;
        }
    </style>
    <div id="pipsContainer"></div>
`;

export default class pips extends HTMLElement {
    static get template() {
      return template;
    }

    static get observedAttributes() {
        return ["total-pips", "mode", "marked"];
    }

    constructor() {
        super();

        this.attachShadow({mode: "open"}).appendChild(this.constructor.template.content.cloneNode(true));

        this.pipsContainerElem = this.shadowRoot.getElementById("pipsContainer");
    }
}

customElements.define("vpl-add-unit-modal", pips);