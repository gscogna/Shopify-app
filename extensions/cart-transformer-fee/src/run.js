// @ts-check
/**
 * @typedef {import("../generated/api").Input} Input
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 * @typedef {import("../generated/api").CartOperation} CartOperation
 */

/** @type {FunctionRunResult} */
const NO_CHANGES = { operations: [] };

/**
 * @param {Input} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  console.log('🟢 Cart-transform function start');
  console.log('📦 Full cart input (partial):', JSON.stringify(input.cart, null, 2));

  // ATTENZIONE: cart.attribute è un SINGOLO oggetto Attribute o null
  console.log('📌 cart.attribute:', input.cart.attribute);

  const creditCardSelected =
    input.cart.attribute?.key === 'creditCard' &&
    input.cart.attribute?.value === 'yes';

  console.log('🎯 creditCardSelected:', creditCardSelected);

  if (!creditCardSelected) {
    console.log('⛔ No credit card surcharge applied');
    return NO_CHANGES;
  }

  console.log('✅ Applying 6% surcharge to all lines');

  const operations = input.cart.lines.map((line) => buildUpdateOperation(line));

  return operations.length > 0 ? { operations } : NO_CHANGES;
}

/**
 * @param {Input['cart']['lines'][number]} cartLine
 */
function buildUpdateOperation({ id: cartLineId, cost }) {
  const originalAmount = parseFloat(cost.amountPerQuantity.amount);
  const updatedAmount = (originalAmount * 1.06).toFixed(2);

  console.log(`💰 Updating line ${cartLineId}: ${originalAmount} -> ${updatedAmount}`);

  return {
    update: {
      cartLineId,
      price: {
        adjustment: {
          fixedPricePerUnit: { amount: updatedAmount },
        },
      },
    },
  };
}
