
import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TestimonialCardProps {
    name: string;
    role: string;
    company: string;
    content: string;
    avatarUrl?: string;
    initials: string;
}

export function TestimonialCard({
    name,
    role,
    company,
    content,
    avatarUrl,
    initials,
}: TestimonialCardProps) {
    return (
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:border-emerald-500/30 transition-colors duration-300">
            <CardContent className="p-6">
                <Quote className="w-8 h-8 text-emerald-500/40 mb-4" />
                <p className="text-white/80 mb-6 italic leading-relaxed">"{content}"</p>
                <div className="flex items-center gap-4">
                    <Avatar className="w-10 h-10 border border-white/10">
                        <AvatarImage src={avatarUrl} alt={name} />
                        <AvatarFallback className="bg-emerald-500/20 text-emerald-400">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="text-white font-medium">{name}</div>
                        <div className="text-xs text-white/50">{role}, {company}</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
