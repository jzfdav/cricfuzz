export class CommentaryEngine {
    constructor() {
        this.templates = {
            wicket: [
                "In the air... and TAKEN! {batter} hits it straight to the fielder!",
                "Bowled him! The timber is disturbed! {bowler} breaks through!",
                "Edged and gone! {bowler} gets the wicket of {batter}.",
                "{batter} walks back to the pavilion. Massive blow!",
                "Caught! Simple catch in the end. {batter} departs.",
                "Cleaned him up! {bowler} is on fire! You miss, I hit!",
                "LBW! {batter} is trapped in front!",
                "Run out! {batter} is short of the crease. Tragedy!"
            ],
            four: [
                "Four runs! {batter} times that to perfection.",
                "Beautifully driven by {batter}! That's pure class.",
                "Cracked through the covers! No one moved.",
                "Short and punished by {batter}! Raced to the fence.",
                "Tickled fine for four. Smart batting from {batter}.",
                "Power and placement! {batter} finds the gap."
            ],
            six: [
                "SIX! {batter} launches that into orbit!",
                "Maximum! {batter} picked the length early and dispatched it.",
                "That's huge! {bowler} watches it sail over his head!",
                "High and handsome! Six runs for {batter}.",
                "Muscle! Sheer muscle from {batter}! Clears the boundary ease.",
                "Downtown! {batter} hits a monster!"
            ],
            dot: [
                "No run. Good solid defense from {batter}.",
                "Straight to the fielder. {batter} can't pierce the gap.",
                "Beaten! Lovely bowling from {bowler}.",
                "Play and a miss. {bowler} asking questions.",
                "Dot ball. Pressure building on {batter}.",
                "Fielded well at point. No run."
            ],
            single: [
                "Just a single. {batter} rotates the strike.",
                "Pushed to long-on for one.",
                "Quick single! Good running.",
                "Dropped into the gap and they scamper through.",
                "Worked away for a single."
            ],
            maiden: [
                "MAIDEN OVER! Brilliant stuff from {bowler}.",
                "Six dots in a row! {bowler} is tightening the screws.",
                "A maiden! Supreme control from the bowler."
            ],
            fifty: [
                "Fifty for {batter}! A fine innings, well constructed.",
                "Half-century! {batter} raises the bat to the applause.",
                "That's 50! A crucial knock for the team."
            ],
            century: [
                "HUNDRED! What a magnificent innings by {batter}! Take a bow!",
                "Century! {batter} is playing a masterclass today.",
                "100 runs! A special performance from {batter} on the big stage."
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

    getSurname(fullName) {
        if (!fullName) return "The batter";
        const parts = fullName.trim().split(' ');
        return parts.length > 1 ? parts[parts.length - 1] : fullName;
    }

    getCommentary(result, state, bowlerName, batterName) {
        // Fix: State values are Preact Signals, so we need to access .value
        const score = state.score.value;
        const wickets = state.wickets.value;
        const balls = state.balls.value;
        const target = state.target.value;
        const format = state.format.value;

        const over = Math.floor(balls / 6);
        const ballInOver = balls % 6;
        const config = format === 'T20' ? { balls: 120 } : format === 'ODI' ? { balls: 300 } : { balls: 2400 };

        let lines = [];
        if (result === 'W') lines = this.templates.wicket;
        else if (result === 6) lines = this.templates.six;
        else if (result === 4) lines = this.templates.four;
        else if (result === 0) lines = this.templates.dot;
        else lines = this.templates.single;

        // Contextual Overrides
        if (target && (target - score) < 20 && (config.balls - balls) < 18) {
            if (Math.random() > 0.6) return this.getRandom(this.templates.closeGame);
        }
        if (format === 'T20' && over >= 16 && wickets < 8 && ballInOver === 1) {
            if (Math.random() > 0.7) return this.getRandom(this.templates.deathOvers);
        }

        const rawLine = this.getRandom(lines);
        const bName = this.getSurname(batterName);
        const boName = this.getSurname(bowlerName);

        return rawLine.replace(/{batter}/g, bName).replace(/{bowler}/g, boName);
    }

    getRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    getMaidenCommentary(bowlerName) {
        const line = this.getRandom(this.templates.maiden);
        return line.replace(/{bowler}/g, this.getSurname(bowlerName) || "the bowler");
    }

    getIntroCommentary(winner, decision, pitch) {
        const templates = [
            `Welcome everyone! ${winner} has won the toss and decided to ${decision} first. The pitch looks ${pitch}.`,
            `We are live! ${winner} wins the coin flip. They will ${decision} on this ${pitch} surface.`,
            `Toss news: ${winner} elects to ${decision}. Pitch report suggests it is ${pitch}.`
        ];
        return this.getRandom(templates);
    }

    getMilestoneCommentary(milestone, batterName) { // Added batterName
        const bName = this.getSurname(batterName);
        let lines = [];
        if (milestone === 'fifty') lines = this.templates.fifty;
        if (milestone === 'century') lines = this.templates.century;
        if (!lines.length) return null;

        return this.getRandom(lines).replace(/{batter}/g, bName);
    }
}
