
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface PricingFeature {
    text: string;
    included: boolean;
}

interface PricingCardProps {
    title: string;
    price: string;
    description: string;
    features: PricingFeature[];
    isPopular?: boolean;
    ctaText?: string;
    onCtaClick?: () => void;
}

export function PricingCard({
    title,
    price,
    description,
    features,
    isPopular = false,
    ctaText = "Get Started",
    onCtaClick,
}: PricingCardProps) {
    return (
        <Card className={`relative flex flex-col h-full backdrop-blur-sm ${isPopular ? 'border-emerald-500 shadow-lg shadow-emerald-500/20 bg-emerald-950/30' : 'border-white/10 bg-white/5'}`}>
            {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold rounded-full">
                    Most Popular
                </div>
            )}
            <CardHeader>
                <CardTitle className="text-xl text-white">{title}</CardTitle>
                <div className="mt-4 mb-2">
                    <span className="text-4xl font-bold text-white">{price}</span>
                    {price !== "Custom" && <span className="text-white/60 ml-1">/month</span>}
                </div>
                <CardDescription className="text-white/60">{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <ul className="space-y-3">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm">
                            <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${feature.included ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/20'}`}>
                                <Check className="w-3 h-3" />
                            </div>
                            <span className={feature.included ? 'text-white/80' : 'text-white/40'}>{feature.text}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                <Button
                    className={`w-full ${isPopular ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                    onClick={onCtaClick}
                >
                    {ctaText}
                </Button>
            </CardFooter>
        </Card>
    );
}
