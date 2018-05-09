const template = document.createElement("template");
template.innerHTML = `
    <style>
        :host {
            display: flex;
            flex-direction: column;
        }

        #previewContainer {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
        }

        .swatch {
            width: 20px;
            height: 20px;
        }

    </style>
    <div id="previewContainer">
        <div id="previewSwatch" class="swatch"></div>
        <div id="submit">OK</div>
    </div>
    <div id="swatchesContainer"></div>
`;

export default class pips extends HTMLElement {
    static get template() {
      return template;
    }

    constructor() {
        super();

        this.attachShadow({mode: "open"}).appendChild(this.constructor.template.content.cloneNode(true));

        this.previewSwatchElem = this.shadowRoot.getElementById("previewSwatch");

        this.swatchesContainerElem = this.shadowRoot.getElementById("swatchesContainer");

        this._colors = [
            "000000", "993300", "333300", "000080", "333399", "333333", "800000", "FF6600",
            "808000", "008000", "008080", "0000FF", "666699", "808080", "FF0000", "FF9900",
            "99CC00", "339966", "33CCCC", "3366FF", "800080", "999999", "FF00FF", "FFCC00",
            "FFFF00", "00FF00", "00FFFF", "00CCFF", "993366", "C0C0C0", "FF99CC", "FFCC99",
            "FFFF99", "CCFFFF", "99CCFF", "FFFFFF",
        ];

        for (const color of this._colors) {
            const elem = document.createElement("div");
            elem.classList.add("swatch");
            elem.style.backgroundColor = color;
            elem.addEventListener("pointer-down", event => {
                this._selectedColor = this.swatchesContainerElem.style.backgroundColor = color;
            });
            this.swatchesContainerElem.appendChild(elem);
        }


        this.submitElem = this.shadowRoot.getElementById("submit");
        this.submitElem.addEventListener("pointer-down", event => {
            this.dispatchEvent(new CustomEvent("submitted", {detail: {color: this._color}}));
        });
    }
}

customElements.define("vpl-add-unit-modal", pips);