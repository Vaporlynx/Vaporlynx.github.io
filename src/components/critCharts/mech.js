const template = document.createElement("template");
template.innerHTML = `
    <style>
        :host {
            display: flex;
        }
        #engineContainer {
            position: relative;
            left: 39.5px;
        }
        #fireControlContainer {
            position: relative;
            left: 0px;
        }
        #movementContainer {
            position: relative;
            left: 64px;
        }
        #weaponsContainer {
            position: relative;
            left: 24px;
        }

    </style>
    <div id="chart">
        <vpl-label prefix="ENGINE" id="engineContainer" suffix="+1 Heat/Firing Weapons">
            <vpl-pips id="engine" slot="content" total-pips="1" marked="0"></vpl-pips>
        </vpl-label>
        <vpl-label prefix="FIRE CONTROL" id="fireControlContainer" suffix="+2 To-Hit Each">
            <vpl-pips id="fireControl" slot="content" total-pips="4" marked="0"></vpl-pips>
        </vpl-label>
        <vpl-label prefix="MP" id="movementContainer" suffix="1/2 MV Each">
            <vpl-pips id="movement" slot="content" total-pips="4" marked="0"></vpl-pips>
        </vpl-label>
        <vpl-label prefix="WEAPONS" id="weaponsContainer" suffix="-1 Dmg Each">
            <vpl-pips id="weapons" slot="content" total-pips="4" marked="0"></vpl-pips>
        </vpl-label>
    </div>
`;

export default class mech extends HTMLElement {
    static get template() {
      return template;
    }

    constructor() {
        super();

        this.attachShadow({mode: "open"}).appendChild(this.constructor.template.content.cloneNode(true));

        this.prefixElem = this.shadowRoot.getElementById("prefix");
        this.suffixElem = this.shadowRoot.getElementById("suffix");
    }
}

customElements.define("vpl-mech-crit-chart", mech);