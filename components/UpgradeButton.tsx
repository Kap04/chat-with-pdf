"use client"

import useSubscription from "@/hooks/useSubscription"
import { Button } from "./ui/button"
import { useTransition } from "react";
import Link from "next/link";
import { Loader2Icon, StarIcon } from "lucide-react";
import { createStripePortal } from "@/actions/createStripePortal";
import { useRouter } from "next/navigation";

function UpgradeButton() {
    const { hasActiveMembership, loading } = useSubscription();
    const [isPending, startTransition] = useTransition();
    const router = useRouter()

    const handleAccount = () => {
        startTransition(async () => {
            const stripePortalUrl = await createStripePortal();
            router.push(stripePortalUrl)
        })
    }

    if (!hasActiveMembership && !loading)
        return (
            <Button asChild variant="default" className="border-indigo-600">
                <Link href="/dashboard/upgrade">
                    Upgrade <StarIcon className="ml-3 fill-indigo-600 text-white" />
                </Link>
            </Button>
        )

    if(loading)
        return(
            <Button variant="default" className="border-indigo-600">
                <Loader2Icon className="animate-spin"/>
            </Button>
        )

    return <div>UpgradeButton</div>
}

export default UpgradeButton