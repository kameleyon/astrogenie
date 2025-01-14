declare module "https://esm.sh/stripe@12.0.0" {
  import Stripe from "stripe";
  const stripe: typeof Stripe;
  export default stripe;
  export * from "stripe";
}
