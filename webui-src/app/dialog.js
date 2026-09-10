const m = require('mithril');

// Mount only while open. Native modal dialogs make the rest of the page inert
// and provide dialog semantics; callers own the open state and sheet content.
const Dialog = () => {
  let opener;
  return {
    oncreate: ({ dom }) => {
      opener = document.activeElement;
      dom.showModal();
    },
    onremove: ({ dom }) => {
      dom.close();
      if (opener && opener.isConnected) opener.focus();
    },
    view: ({ attrs, children }) => m('dialog.accessible-dialog', {
      class: attrs.overlayClass,
      'aria-label': attrs.label,
      'aria-modal': 'true',
      oncancel: (event) => {
        event.preventDefault();
        attrs.onclose();
      },
      onclick: (event) => {
        if (event.target === event.currentTarget) attrs.onclose();
      },
      onkeydown: (event) => {
        if (event.key !== 'Tab') return;
        const dialog = event.currentTarget;
        const controls = Array.from(dialog.querySelectorAll(
          'a[href], button, input, select, textarea, [tabindex], [contenteditable="true"]'
        )).filter((element) => element.tabIndex >= 0 &&
          !element.matches(':disabled') && !element.closest('[inert]') &&
          element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden');
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (!first) {
          event.preventDefault();
        } else if (event.shiftKey && (document.activeElement === first || !controls.includes(document.activeElement))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !controls.includes(document.activeElement))) {
          event.preventDefault();
          first.focus();
        }
      },
    }, m('div', { class: attrs.sheetClass }, children)),
  };
};

module.exports = Dialog;
