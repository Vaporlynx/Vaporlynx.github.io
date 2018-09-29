import * as unitHelper from "../../unitHelper.js";

const template = document.createElement("template");
template.innerHTML = `
    <style>
        :host {
         --bevelOffset: 5vw;
        }
        .bevel {
            background-color: var(--nonInteractiveElement2BackgroundColor);
            clip-path: polygon(0 0, calc(100% - var(--bevelOffset)) 0, 100% var(--bevelOffset), 100% 100%, var(--bevelOffset) 100%, 0 calc(100% - var(--bevelOffset)));
            padding: calc(var(--bevelOffset) / 2);
            margin-bottom: 10px;
        }

        #body {
            width: 60vw;
            height: 40vw;
        }
    </style>
    <div id="body" class="bevel">
        <vpl-label id="skillLabel" prefix="Pilot skill:" suffix="PV:">
            <input type="number" id="skillLevel" value="4" min="0" max="7" slot="content"/>
        </vpl-label>
        <button id="submit">Add Unit</button>
    </div>
`;

export default class CustomizeUnit extends HTMLElement {
    static get template() {
      return template;
    }

    static get observedAttributes() {
        return [];
    }

    constructor() {
        super();

        this._pv = 0;

        this.attachShadow({mode: "open"}).appendChild(this.constructor.template.content.cloneNode(true));

        this.skillLabelElem = this.shadowRoot.getElementById("skillLabel");
        this.skillLevelElem = this.shadowRoot.getElementById("skillLevel");
        this.skillLevelElem.addEventListener("change", event => {
            this.skillLabelElem.suffix = `PV: ${unitHelper.calculatePointValue(this._pv, parseInt(this.skillLevelElem.value))}`;
        });

        this.submitElem = this.shadowRoot.getElementById("submit");
        this.submitElem.addEventListener("pointerdown", event => {
            this.dispatchEvent(new CustomEvent("submit", {detail: {
                skill: parseInt(this.skillLevelElem.value),
            }}));
        });

        // Prevent clickthrough to the modal layer's pointerDown listener
        this.addEventListener("pointerdown", event => {
            event.stopPropagation();
        });
    }

    get pv () {
        return this._pv;
    }

    set pv (val) {
        this._pv = val;
        setTimeout(() => {
            this.skillLabelElem.suffix = `PV: ${unitHelper.calculatePointValue(this._pv, parseInt(this.skillLevelElem.value))}`;
        }, 1);
    }
}

customElements.define("vpl-customize-unit", CustomizeUnit);