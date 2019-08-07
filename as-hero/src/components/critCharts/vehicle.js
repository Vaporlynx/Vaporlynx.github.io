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

        #motiveLabel {
            --suffixWidth: 0%;
        }

        #motiveContainer {
            display: flex;
        }

        #motiveContainer > vpl-label {
            --prefixWidth: 10%;
            --suffixFontSize: 50%;
        }

        #motiveContainer > vpl-label > vpl-pips {
            width: 100%;
        }
    </style>
    <vpl-label prefix="ENGINE" id="engineContainer" suffix="1/2MV and Damage">
        <vpl-pips id="engine" slot="content" total-pips="1" marked="0"></vpl-pips>
    </vpl-label>
    <vpl-label prefix="FIRE CONTROL" id="fireControlContainer" suffix="+2 To-Hit Each">
        <vpl-pips id="fireControl" slot="content" total-pips="4" marked="0"></vpl-pips>
    </vpl-label>
    <vpl-label prefix="WEAPONS" id="weaponsContainer" suffix="-1 Dmg Each">
    <vpl-pips id="weapons" slot="content" total-pips="4" marked="0"></vpl-pips>
    </vpl-label>
    <vpl-label prefix="MOTIVE" id="motiveLabel">
        <div id="motiveContainer" slot="content">
            <vpl-label suffix="-2 MV">
                <vpl-pips id="minusTwo" slot="content" total-pips="2" marked="0"></vpl-pips>
            </vpl-label>
            <vpl-label suffix="1/2 MV">
                <vpl-pips id="half" slot="content" total-pips="2" marked="0"></vpl-pips>
            </vpl-label>
            <vpl-label suffix="0 MV">
                <vpl-pips id="zero" slot="content" total-pips="1" marked="0"></vpl-pips>
            </vpl-label>
        </div>
<   /vpl-label>
`;

export default class vehicle extends HTMLElement {
    static get template() {
      return template;
    }

    constructor() {
        super();

        this.attachShadow({mode: "open"}).appendChild(this.constructor.template.content.cloneNode(true));
    }
}

customElements.define("vpl-vehicle-crit-chart", vehicle);