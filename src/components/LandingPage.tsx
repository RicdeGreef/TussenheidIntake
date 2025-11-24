import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Heart, Users } from "lucide-react";

interface LandingPageProps {
  onStartChat: () => void;
}

export const LandingPage = ({ onStartChat }: LandingPageProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-accent/20">
      <Card className="max-w-2xl w-full p-8 md:p-12 shadow-[var(--shadow-card)]">
        <div className="text-center space-y-6">
          {/* Logo/Header */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-10 h-10 text-primary" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Welkom bij Tussenheid
          </h1>
          
          <p className="text-xl text-muted-foreground leading-relaxed">
            Fijn dat u er bent. We helpen u graag om deel te nemen aan 
            vrijwilligersactiviteiten in uw buurt.
          </p>
          
          {/* Features */}
          <div className="grid md:grid-cols-2 gap-4 py-6">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
              <MessageCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div className="text-left">
                <h3 className="font-semibold text-lg mb-1">Eenvoudig in gesprek</h3>
                <p className="text-sm text-muted-foreground">
                  Praat met ons via spraak, zonder ingewikkelde formulieren
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
              <Users className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div className="text-left">
                <h3 className="font-semibold text-lg mb-1">Persoonlijke match</h3>
                <p className="text-sm text-muted-foreground">
                  We zoeken activiteiten die bij u passen
                </p>
              </div>
            </div>
          </div>
          
          {/* CTA Button */}
          <Button 
            onClick={onStartChat}
            size="lg"
            className="text-lg px-8 py-6 h-auto mt-4 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
          >
            Start Intake Gesprek
          </Button>
          
          {/* Help Link */}
          <p className="text-sm text-muted-foreground pt-4">
            Hulp nodig?{" "}
            <a 
              href="tel:+31201234567" 
              className="text-primary hover:underline font-medium"
            >
              Bel ons op 020-1234567
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
};
