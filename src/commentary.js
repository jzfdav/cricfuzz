export class CommentaryEngine {
    constructor() {
        this.templates = {
            wicket: [
                "In the air... and TAKEN! A massive blow!",
                "Bowled him! The timber is disturbed! Absolute cracker of a delivery.",
                "Edged and gone! The finger goes up! The bowling captain is ecstatic.",
                "That is a huge wicket in the context of this game!",
                "Silence in the ground. The big man has to go.",
                "Caught! A simple catch in the end, but the pressure forced the error.",
                "Cleaned him up! You miss, I hit!",
                "LBW! That looked plumb in front.",
                "Run out! A tragedy of errors in the middle!"
            ],
            four: [
                "Four runs! That raced away to the fence like a rocket.",
                "Beautifully driven! That's pure class.",
                "Cracked through the covers! No one moved.",
                "Short and punished! That's a boundary any day of the week.",
                "Tickled fine for four. Smart batting.",
                "Power and placement! One bounce and over the ropes for four."
            ],
            six: [
                "SIX! That's gone like a tracer bullet into the stands!",
                "Maximum! He picked the length early and dispatched it.",
                "That's huge! It's out of the stadium!",
                "High and handsome! Six runs.",
                "Muscle! Sheer muscle! Clears the long-on boundary with ease.",
                "Downtown! That is a monster hit!"
            ],
            dot: [
                "No run. Good solid defense.",
                "Straight to the fielder.",
                "Beaten! Lovely bowling.",
                "Play and a miss. The bowler is asking questions here.",
                "Dot ball. Pressure building.",
                "Fielded well at point. No run."
            ],
            single: [
                "Just a single. Rotating the strike.",
                "Pushed to long-on for one.",
                "Quick single! Good running between the wickets.",
                "Dropped into the gap and they scamper through.",
                "Direct hit would have been interesting! Safe in the end."
            ],
            maiden: [
                "MAIDEN OVER! Brilliant stuff. The batter had no answers.",
                "Six dots in a row! That is gold dust in this format.",
                "A maiden! Supreme control from the bowler."
            ],
            fifty: [
                "Fifty for the batter! A fine innings, well constructed.",
                "Half-century! Raises the bat to the applause of the crowd.",
                "That's 50! A crucial knock for the team."
            ],
            century: [
                "HUNDRED! What a magnificent innings! Take a bow!",
                "Century! A masterclass in batting today.",
                "100 runs! A special performance on the big stage."
            ],
            closeGame: [
                "Heart rates are peaking! We are heading for a grandstand finish.",
                "This is going down to the wire!",
                "Nail-biting stuff! Anyone's game now.",
                "The crowd is on the edge of their seats!"
            ],
            deathOvers: [
                "The death overs are here. Expect some fireworks now!",
                "Slog time! Every ball counts.",
                "Bowlers under pressure. Batters looking to launch."
            ]
        };
    }

    getCommentary(result, state, bowlerName, batterName) {
        const { score, wickets, balls, target, format } = state;
        const over = Math.floor(balls / 6);
        const ballInOver = balls % 6;
        const config = format === 'T20' ? { balls: 120 } : format === 'ODI' ? { balls: 300 } : { balls: 2400 }; // Simplified access

        let lines = [];

        // Special Events
        if (result === 'W') lines = this.templates.wicket;
        else if (result === 6) lines = this.templates.six;
        else if (result === 4) lines = this.templates.four;
        else if (result === 0) lines = this.templates.dot;
        else lines = this.templates.single;

        // Contextual Overrides
        // High Pressure Chase
        if (target && (target - score) < 20 && (config.balls - balls) < 18) {
            if (Math.random() > 0.6) return this.getRandom(this.templates.closeGame);
        }

        // Death Overs (T20 specific for now)
        if (format === 'T20' && over >= 16 && wickets < 8 && ballInOver === 1) {
            if (Math.random() > 0.7) return this.getRandom(this.templates.deathOvers);
        }

        // Maidens are handled by the consumer usually, but we have lines for it

        // Default Event Commentary
        const baseLine = this.getRandom(lines);

        // Add flavor strictly for output construction if needed, 
        // but for now, we return the base line as the "Vibey" part.
        // The calling code constructs the "Bowler to Batter" part.

        return baseLine;
    }

    getRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    getMaidenCommentary() {
        return this.getRandom(this.templates.maiden);
    }

    getIntroCommentary(winner, decision, pitch) {
        const templates = [
            `Welcome everyone! ${winner} has won the toss and decided to ${decision} first. The pitch looks ${pitch}.`,
            `We are live! ${winner} wins the coin flip. They will ${decision} on this ${pitch} surface.`,
            `Toss news: ${winner} elects to ${decision}. Pitch report suggests it is ${pitch}.`
        ];
        return this.getRandom(templates);
    }

    getMilestoneCommentary(milestone) {
        if (milestone === 'fifty') return this.getRandom(this.templates.fifty);
        if (milestone === 'century') return this.getRandom(this.templates.century);
        return null;
    }
}
