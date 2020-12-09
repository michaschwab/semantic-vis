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
    template = document.createElement('template');
    element = this.element;
    parent = this.parent; // declare variable without overriding them if they are set in parent.
    initialized = false;
    svgWrapper = true;

    constructor() {
        super();
        console.log(this, this.parent);
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
        /*this.setAllAttributes();
        this.setContents();*/
    }

    setContents() {
        let html = this.render();
        if(this.svgWrapper) {
            html = `<svg>${html}</svg>`;
        }
        this.template.innerHTML = html;

        if(this.template.content.firstElementChild) {
            const element = this.template.content.firstElementChild.cloneNode(true);
            this.element = this.svgWrapper ? element.firstChild : element;
        } else {
            console.log('no content found', this, this.template.innerHTML)
        }

        this.renderChildren();
        this.doneRendering();
    }

    renderChildren() {
        if(this.originalChildren.length) {
            const provide = this.provideToChildren();

            this.originalChildren.forEach(child => {
                for(const attrName in provide) {
                    //child.setAttribute(attrName, provide[attrName]);
                    child[snakeToCamel(attrName)] = provide[attrName];
                }
                child.parent = this.getChildParent() || this.parent;
            });
        }
    }

    provideToChildren() {
        const skipped = ['originalChildren', 'render', 'parent', 'element', 'template', 'initialized', 'svgWrapper'];
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

    doneRendering() {
        if(!this.initialized && this.element) {
            this.initialized = true;
            this.parent.appendChild(this.element);
            console.log('adding ', this.element, ' to ', this.parent, 'for ', this);
        } else {
            console.log('no', this.initialized, this.element, this)
        }
    }

    getChildParent() {
        return this.element;
    }
}

class ResponsiveVis extends ResponsiveVisElement {
    parent = this.parentElement;
    svgWrapper = false;

    render() {
        return `<div class="responsive-vis">
                    <style>
                    .responsive-vis svg {
                        position: absolute;
                        width: ${this.visWidth}px;
                        height: ${this.visHeight}px;
                    }
                    </style>
                    <svg></svg>
                </div>`;
    }

    getChildParent() {
        return this.element.querySelector('svg');
    }
}

window.customElements.define('responsive-vis', ResponsiveVis);
