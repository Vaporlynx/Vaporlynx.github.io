const template = document.createElement("template");
template.innerHTML = `
    <style>
        :host {
            display: flex;
            flex-direction: column;
        }

        vpl-label {
            --prefixWidth: 28%;
            --suffixWidth: 35%;
            --prefixFontSize: 75%;
            --suffixFontSize: 70%;
            margin-bottom: 10px;
        }

        vpl-pips {
            width: 35%;
        }

    </style>
    <vpl-label prefix="ENGINE" id="engineContainer" suffix="1/4 MV (Minimum 1)">
        <vpl-pips id="engine" slot="content" total-pips="2" marked="0"></vpl-pips>
    </vpl-label>
    <vpl-label prefix="FIRE CONTROL" id="fireControlContainer" suffix="+2 To-Hit Each">
        <vpl-pips id="fireControl" slot="content" total-pips="4" marked="0"></vpl-pips>
    </vpl-label>
    <vpl-label prefix="WEAPONS" id="weaponsContainer" suffix="-1 Dmg Each">
        <vpl-pips id="weapons" slot="content" total-pips="4" marked="0"></vpl-pips>
    </vpl-label>
`;

export default class aerospace extends HTMLElement {
    static get template() {
      return template;
    }

    constructor() {
        super();

        this.attachShadow({mode: "open"}).appendChild(this.constructor.template.content.cloneNode(true));
    }
}

customElements.define("vpl-aerospace-crit-chart", aerospace);