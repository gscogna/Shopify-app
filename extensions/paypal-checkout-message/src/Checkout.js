import { extension, Text, Checkbox } from '@shopify/ui-extensions/checkout';

export default extension('purchase.checkout.reductions.render-after', (root, api) => {
  let currentMessage = null;
  let creditCardFlag = null;

  let lastCreditCardSelected = null;
  let lastAppliedAttribute = null;
  let applyTimer = null;
  const DEBOUNCE_MS = 300;

  function createMessageAndCheckbox() {
    if (!currentMessage) {
      currentMessage = root.createComponent(
        Text,
        { size: 'medium', appearance: 'critical' },
        'If you pay with a credit card, a 6% fee will be applied.'
      );
      root.appendChild(currentMessage);
    }

    if (!creditCardFlag) {
      creditCardFlag = root.createComponent(
        Checkbox,
        { id: 'credit-card-flag', value: true, disabled: true },
        'Credit card surcharge applied'
      );
      root.appendChild(creditCardFlag);
    }
  }

  function removeUI() {
    if (currentMessage) {
      try { root.removeChild(currentMessage); } catch (e) { }
      currentMessage = null;
    }
    if (creditCardFlag) {
      try { root.removeChild(creditCardFlag); } catch (e) { }
      creditCardFlag = null;
    }
  }

  function scheduleApplyAttribute(value) {
    if (lastAppliedAttribute === value) {
      console.log('⚡ scheduleApplyAttribute: already applied, skip', value);
      return;
    }

    if (applyTimer) {
      clearTimeout(applyTimer);
      applyTimer = null;
    }

    applyTimer = setTimeout(async () => {
      applyTimer = null;

      if (!api.applyAttributeChange) {
        return;
      }

      try {
        const res = await api.applyAttributeChange({
          type: 'updateAttribute', // corretto type
          key: 'creditCard',
          value,
        });

        lastAppliedAttribute = value;
      } catch (err) {
        console.error('❌ Errore applyAttributeChange:', err);
      }
    }, DEBOUNCE_MS);
  }

  function updateUI(show) {
    if (show === lastCreditCardSelected) {
      return;
    }

    lastCreditCardSelected = show;

    if (show) {
      createMessageAndCheckbox();
      scheduleApplyAttribute('yes');
    } else {
      removeUI();
      scheduleApplyAttribute('no');
    }
  }

  lastCreditCardSelected = null;
  updateUI(false);

  api.selectedPaymentOptions?.subscribe((selectedPaymentOptions) => {
    try {
      const creditCardSelected = Array.isArray(selectedPaymentOptions)
        ? selectedPaymentOptions.some(opt =>
          opt?.type === 'creditCard' ||
          (opt?.name && String(opt.name).toLowerCase().includes('amex'))
        )
        : false;

      updateUI(creditCardSelected);
    } catch (err) {
      console.error('❌ errore nella subscription selectedPaymentOptions:', err);
    }
  });

});
