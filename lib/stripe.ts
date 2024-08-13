import Stripe from "stripe"

const stripeSecereteKey = process.env.STRIPE_API_KEY

if(!stripeSecereteKey){
    throw new Error("STRIPE_API_KEY is not set")
}

const stripe = new Stripe(stripeSecereteKey)

export default stripe