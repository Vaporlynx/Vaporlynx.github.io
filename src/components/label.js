const template = document.createElement("template");
template.innerHTML = `
    <style>
        :host {
            display: flex;
            --margin: 5px;
        }

        #prefix {
            margin-right: var(--margin);
            width: var(--prefixWidth);
            font-size: var(--prefixFontSize);
        }

        #suffix {
            margin-left: var(--margin);
            width: var(--suffixWidth);
            font-size: var(--suffixFontSize);
        }
    </style>
    <div id="prefix"></div>
    <slot name="content">I AM A PRETTY BOY.</slot>
    <div id="suffix"></div>
`;

export default class label extends HTMLElement {
    static get template() {
      return template;
    }

    static get observedAttributes() {
        return ["prefix", "suffix"];
    }

    constructor() {
        super();

        this.attachShadow({mode: "open"}).appendChild(this.constructor.template.content.cloneNode(true));

        this.prefixElem = this.shadowRoot.getElementById("prefix");
        this.suffixElem = this.shadowRoot.getElementById("suffix");

        this._prefix = "";
        this._suffix = "";
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "prefix": this.prefix = newValue; break;
            case "suffix": this.suffix = newValue; break;
        }
    }

    set prefix (val) {
        this._prefix = val;
        this.prefixElem.textContent = val;
    }

    get prefix () {
        return this._prefix;
    }

    set suffix (val) {
        this._suffix = val;
        this.suffixElem.textContent = val;
    }

    get suffix () {
        return this._suffix;
    }
}

customElements.define("vpl-label", label);