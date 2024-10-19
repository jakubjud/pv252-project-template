const template = document.createElement("template");
template.innerHTML = `
<style>
#list {
  height: var(--height);
  width: var(--width);  
  border: var(--border);
  padding: var(--padding);
  overflow: scroll;
  scrollbar-width: none;
}
#spacer-top {
  width: 100%;
  height: 0px;
}
#spacer-bottom {
  width: 100%;
  height: 1000px;
}
</style>
<div id="list">
  <div id="spacer-top"></div>
  <slot></slot>
  <div id="spacer-bottom"></div>
</div>
`;

export type Renderer<T> = (item: T) => HTMLElement;

export class LazyList<T> extends HTMLElement {
  // By default, the list renders the items as div-s with strings in them.
  #renderFunction: Renderer<T> = (item) => {
    const element = document.createElement("div");
    element.innerText = JSON.stringify(item);
    return element;
  };

  #data: T[] = [];

  // Constants
  #visibleItems: number = 4;
  #itemHeight: number = 370;

  // The index of the first visible data item.
  #visiblePosition: number = 0;

  #topOffsetElement: HTMLElement;
  #bottomOffsetElement: HTMLElement;

  #listElement: HTMLElement;

  static register() {
    customElements.define("lazy-list", LazyList);
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.#topOffsetElement =
      this.shadowRoot.querySelector<HTMLElement>("#spacer-top")!;
    this.#bottomOffsetElement =
      this.shadowRoot.querySelector<HTMLElement>("#spacer-bottom")!;
    this.#listElement = this.shadowRoot.querySelector<HTMLElement>("#list")!;

    this.#listElement.onscroll = () => {
      this.#scrollPositionChanged(this.#listElement.scrollTop);
    };
  }

  setData(data: T[]) {
    this.#data = data;
    this.#contentChanged();
  }

  setRenderer(renderer: Renderer<T>) {
    this.#renderFunction = renderer;
    this.#contentChanged();
  }

  #contentChanged() {
    this.innerHTML = "";
    const visibleItems = this.#data.slice(this.#visiblePosition,
      this.#visiblePosition + this.#visibleItems);
    for (const item of visibleItems) {
      this.appendChild(this.#renderFunction(item));
    }
  }

  #scrollPositionChanged(topOffset: number) {
    // Make sure that the index is not greater than the number of items.
    const newIndex = Math.min(Math.floor(topOffset / this.#itemHeight), this.#data.length);
    // No need to re-render if nothing has changed.
    if (newIndex != this.#visiblePosition) {
      this.#visiblePosition = newIndex;
      this.#contentChanged();
    }

    this.#topOffsetElement.style.height = `${this.#visiblePosition * this.#itemHeight}px`;
    const bottomCount = this.#data.length - this.#visiblePosition - this.#visibleItems;
    this.#bottomOffsetElement.style.height = `${bottomCount * this.#itemHeight}px`;

    // Because the browser will "shift" the visible area to match the height
    // change we just did, we need to also reset the scroll position to
    // the one we originally observed.
    this.#listElement.scrollTop = topOffset;
  }
}
