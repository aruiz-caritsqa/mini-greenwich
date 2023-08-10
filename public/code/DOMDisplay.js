// /* eslint-disable no-restricted-syntax */
// class DOMDisplay {
//   constructor(parent, level) {
//     this.dom = elt('div', { class: 'game' }, drawGrid(level));
//     this.actorLayer = null;
//     parent.appendChild(this.dom);
//   }

//   static elt(name, attrs, ...children) {
//     const dom = document.createElement(name);
//     for (const attr of Object.keys(attrs)) {
//       dom.setAttribute(attr, attrs[attr]);
//     }
//     for (const child of children) {
//       dom.appendChild(child);
//     }
//     return dom;
//   }

//   clear() { this.dom.remove(); }
// }

// module.exports = { DOMDisplay };
