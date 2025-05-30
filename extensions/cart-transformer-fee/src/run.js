// @ts-check

/*
A straightforward example of a function that updates a line item title and price for VIP customers.

The function reads the cart and checks if the customer is a VIP. For VIP customers,
each line item will be updated with a custom title and a discounted price of $50 off
the original price.
*/

/**
 * @typedef {import("../generated/api").Input} Input
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 * @typedef {import("../generated/api").CartOperation} CartOperation
 */

/**
 * @type {FunctionRunResult}
 */
const NO_CHANGES = {
  operations: [],
};

/**
 * @param {Input} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  // const isVipCustomer = input.cart.buyerIdentity?.customer?.hasAnyTag ?? false;
  //
  // if (!isVipCustomer) {
  //   return NO_CHANGES;
  // }

  const operations = input.cart.lines.reduce(
    /** @param {CartOperation[]} acc */
    (acc, cartLine) => {
      const updateOperation = buildVipUpdateOperation(cartLine);
      return [...acc, { update: updateOperation }];
    },
    []
  );

  return operations.length > 0 ? { operations } : NO_CHANGES;
}

/**
 * @param {Input['cart']['lines'][number]} cartLine
 */
function buildVipUpdateOperation(
  { id: cartLineId, cost }
) {
  return {
    cartLineId,
    title: "Commissione Paypal2",
    price: {
      adjustment: {
        fixedPricePerUnit: {
          amount: cost.amountPerQuantity.amount *2,
        },
      },
    },
  };
}
