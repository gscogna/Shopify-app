import {
  extension,
  Text,
} from '@shopify/ui-extensions/checkout';

// 1. Choose an extension target
export default extension(
  'purchase.checkout.reductions.render-after',
  (root, api) => {
    // console.log('Extension loaded successfully');

    let currentMessage = null;
    let isPayPalSelected = false;

    // Funzione per aggiornare il messaggio
    function updateMessage() {
      // console.log('Updating message, PayPal selected:', isPayPalSelected);

      const messageText = isPayPalSelected
        ? 'Sovrapprezzo PayPal applicato: +3%'
        : 'Se utilizzi PayPal come metodo di pagamento, verrà applicato un sovrapprezzo del 3%.';

      if (currentMessage) {
        root.removeChild(currentMessage);
        // console.log('Removed existing message');
      }

      // 2. Render a UI
      currentMessage = root.createComponent(
        Text,
        {
          size: 'small',
          appearance: isPayPalSelected ? 'critical' : 'subdued'
        },
        messageText
      );

      root.appendChild(currentMessage);
      // console.log('New message rendered:', messageText);
    }

    // Renderizza il messaggio iniziale
    updateMessage();

    if (api.selectedPaymentOptions) {
      // console.log('SelectedPaymentOptions API available');

      api.selectedPaymentOptions.subscribe((selectedPaymentOptions) => {
        // console.log('Payment options changed:', selectedPaymentOptions);

        const hasPayPal = selectedPaymentOptions.some(option => {
          // Controlla handle, type e name per PayPal
          const isPayPal =
            option.handle?.includes('paypal') ||
            option.handle?.includes('wallet-paypal') ||
            (option.type === 'wallet' && option.handle?.includes('paypal')) ||
            option.name?.toLowerCase().includes('paypal') ||
            option.type === 'paypal';

          // console.log('Checking payment option:', {
          //   handle: option.handle,
          //   type: option.type,
          //   name: option.name
          // }, 'Is PayPal:', isPayPal);

          return isPayPal;
        });

        // console.log('PayPal detected:', hasPayPal);

        if (hasPayPal !== isPayPalSelected) {
          isPayPalSelected = hasPayPal;
          updateMessage();

          // Applica l'attributo quando PayPal è selezionato
          if (api.applyAttributeChange) {
            api.applyAttributeChange({
              key: 'paypal_surcharge_accepted',
              type: 'updateAttribute',
              value: isPayPalSelected ? 'yes' : 'no',
            }).then(result => {
              // console.log('Attribute change result:', result);
            }).catch(error => {
              // console.error('Error applying attribute change:', error);
            });
          }
        }
      });
    } else {
      // console.error('SelectedPaymentOptions API not available');
    }

    // Debug: log delle API disponibili
    // console.log('Available APIs:', Object.keys(api));
  },
);
