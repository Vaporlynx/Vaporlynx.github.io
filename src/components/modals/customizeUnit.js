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
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            font-size: 3.5vw;
        }

        #skillLevel {
            font-size: 3vw;
        }

        #submit {
            width: 25vw;
            height: 6vw;
            font-size: 4vw;
        }

        input {
            font-size: 3vw;
        }
    </style>
    <div id="body" class="bevel">
        <vpl-label id="skillLabel" prefix="Pilot skill:" suffix="PV:">
            <input type="number" id="skillLevel" value="4" min="0" max="7" slot="content"/>
        </vpl-label>

        <vpl-label prefix="Unit Notes:" id="label">
            <input type="text" id="note" slot="content"></input>
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

        // Prevent clickthrough to the modal layer's pointerDown listener
        this.addEventListener("pointerdown", event => {
            event.stopPropagation();
        });

        this._pv = 0;

        this.attachShadow({mode: "open"}).appendChild(this.constructor.template.content.cloneNode(true));

        this.skillLabelElem = this.shadowRoot.getElementById("skillLabel");
        this.skillLevelElem = this.shadowRoot.getElementById("skillLevel");
        this.skillLevelElem.addEventListener("change", event => {
            this.skillLabelElem.suffix = `PV: ${unitHelper.calculatePointValue(this._pv, parseInt(this.skillLevelElem.value))}`;
        });

        this.noteElem = this.shadowRoot.getElementById("note");

        this.submitElem = this.shadowRoot.getElementById("submit");
        this.submitElem.addEventListener("pointerdown", event => {
            this.dispatchEvent(new CustomEvent("submit", {detail: {
                skill: parseInt(this.skillLevelElem.value),
                note: this.noteElem.value || "",
            }}));
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