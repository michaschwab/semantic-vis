const snakeToCamel = (str) => str.replace(
    /([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '')
);
const camelToSnakeCase = str => str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);


class ResponsiveVisElement extends HTMLElement {
    static get observedAttributes() {
        return ['vis-width', 'vis-height'];
    }

    visWidth = 600;
    visHeight = 400;

    constructor() {
        super();
        this.setAllAttributes();
        this.originalChildren = [...this.children];
    }

    setAllAttributes() {
        for(const attribute of this.attributes) {
            const value = `${parseInt(attribute.value)}` === attribute.value ? parseInt(attribute.value) : attribute.value;
            this[snakeToCamel(attribute.name)] = value;
        }
    }

    connectedCallback() {
        this.setContents();
    }

    attributeChangedCallback() {
        this.setAllAttributes();
        this.setContents();
    }

    setContents() {
        const slotHtml = !this.originalChildren.length ? '' :
            `<foreignObject width="${this.visWidth}" height="${this.visHeight}" id="slot"></foreignObject>`;

        this.innerHTML = this.render() + slotHtml;

        if(this.originalChildren.length) {
            const slot = this.querySelector('#slot');
            const provide = this.provideToChildren();

            this.originalChildren.forEach(child => {
                for(const attrName in provide) {
                    child.setAttribute(attrName, provide[attrName]);
                    child[snakeToCamel(attrName)] = provide[attrName];
                }
                slot.appendChild(child);
            });
        }

        this.doneRendering();
    }

    provideToChildren() {
        const skipped = ['originalChildren', 'render'];
        const props = Object.getOwnPropertyNames(this).filter(p => !skipped.includes(p));

        const provide = {};
        for(const prop of props) {
            provide[camelToSnakeCase(prop)] = this[prop];
        }
        return provide;
    }

    render() {
        return '';
    }

    doneRendering() {}
}

class ResponsiveVis extends ResponsiveVisElement {
    render() {
        return `
                <style>
                responsive-vis svg {
                    position: absolute;
                    width: ${this.visWidth}px;
                    height: ${this.visHeight}px;
                }
                </style>
                <svg></svg>`;
    }
}

window.customElements.define('responsive-vis', ResponsiveVis);
