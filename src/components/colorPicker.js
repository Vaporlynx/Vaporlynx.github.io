let colors = [
    "000080", "800000", "FF6600", "008000", "008080", "0000FF",
    "FF0000", "FF9900", "99CC00", "33CCCC", "3366FF", "800080",
    "FF00FF", "FFCC00",
];
let colorSeed = Math.ceil(colors.length * Math.random());

const template = document.createElement("template");
template.innerHTML = `
    <style>
        :host {
            display: flex;
            flex-direction: column;
            --swatchHeight: 1em;
            --swatchWidth: 0.8em;
            --swatchIndent: 0.2em;
        }

        #swatchesContainer {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            flex-wrap: wrap;
        }

        .swatch {
            height: var(--swatchHeight);
            width: var(--swatchWidth);
            clip-path: polygon(var(--swatchIndent) 0, calc(100% - var(--swatchIndent)) 0, 100% var(--swatchIndent), calc(100% - var(--swatchIndent)) 100%, var(--swatchIndent) 100%, 0 calc(100% - var(--swatchIndent)));
            padding: calc(var(--swatchIndent) / 2);
            margin: .1em;
        }
        .swatch:hover {
            opacity: 0.7;
        }

        #selectedSwatch {
            width: 3em;
            height: 1.25em;
            align-self: center;
        }
        #selectedSwatch:hover {
            opacity: inherit;
        }

    </style>
    <div id="swatchesContainer"></div>
    <div id="selectedSwatch" class="swatch"></div>
`;

export default class ColorPicker extends HTMLElement {
    static get template() {
      return template;
    }

    constructor() {
        super();

        this.attachShadow({mode: "open"}).appendChild(this.constructor.template.content.cloneNode(true));

        this.previewSwatchElem = this.shadowRoot.getElementById("previewSwatch");

        this.swatchesContainerElem = this.shadowRoot.getElementById("swatchesContainer");

        this.selectedSwatchElem = this.shadowRoot.getElementById("selectedSwatch");
        
        this.colors = colors;

        this.selectedSwatchElem.style.backgroundColor = `#${this._selectedColor = this.colors[colorSeed]}`;

        this.colors.forEach((color, index) => {
            const elem = document.createElement("div");
            elem.classList.add("swatch");
            elem.style.backgroundColor = `#${color}`;
            elem.addEventListener("click", event => {
                for (const child of this.swatchesContainerElem.children) {
                    child.classList.toggle("selected", false);
                }
                this._selectedColor = elem.style.backgroundColor = color;
                this.selectedSwatchElem.style.backgroundColor = `#${this.colors[index]}`;
                colorSeed = index;
            });
            this.swatchesContainerElem.appendChild(elem);
        });
    }

    get selectedColor() {
        return this._selectedColor;
    }
    set selectedColor(color) {
        this._selectedColor = color;
        this.selectedSwatchElem.style.backgroundColor = `#${color}`;
    }
}

customElements.define("vpl-color-picker", ColorPicker);