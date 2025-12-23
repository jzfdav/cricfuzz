import { GameState } from "./engine/GameState";

interface CommentaryTemplates {
    wicket: string[];
    four: string[];
    six: string[];
    dot: string[];
    single: string[];
    maiden: string[];
    fifty: string[];
    century: string[];
    closeGame: string[];
    deathOvers: string[];
    newBatter: string[];
    situation: string[];
}

export class CommentaryEngine {
    templates: CommentaryTemplates;

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
                "Run out! {batter} is short of the crease. Tragedy!",
                "GOT HIM! {bowler} induces the false shot and {batter} has to go!",
                "Straight to mid-off! {batter} will be disappointed with that shot.",
                "Up goes the finger! LBW! {bowler} pleads and the umpire agrees.",
                "Chopped on! {batter} drags it onto the stumps. Unlucky!",
                "Stumped! The batter stepped out, missed the turn, and the keeper did the rest.",
                "A screamer of a catch! {batter} can't believe it!",
                "The bails fly! Pace and accuracy from {bowler} proved too much."
            ],
            four: [
                "Four runs! {batter} times that to perfection.",
                "Beautifully driven by {batter}! That's pure class.",
                "Cracked through the covers! No one moved.",
                "Short and punished by {batter}! Raced to the fence.",
                "Tickled fine for four. Smart batting from {batter}.",
                "Power and placement! {batter} finds the gap.",
                "Slashed away past point! Variable bounce helps the batter.",
                "Over the infield and runs away for four!",
                "Full toss and put away! {batter} accepts the gift.",
                "Swept away fine! The fielder had no chance."
            ],
            six: [
                "SIX! {batter} launches that into orbit!",
                "Maximum! {batter} picked the length early and dispatched it.",
                "That's huge! {bowler} watches it sail over his head!",
                "High and handsome! Six runs for {batter}.",
                "Muscle! Sheer muscle from {batter}! Clears the boundary with ease.",
                "Downtown! {batter} hits a monster!",
                "That's gone miles! Clean striking from {batter}.",
                "Crowd catch! {batter} deposits that into the stands!",
                "Flat six! That travelled like a bullet."
            ],
            dot: [
                "No run. Good solid defense from {batter}.",
                "Straight to the fielder. {batter} can't pierce the gap.",
                "Beaten! Lovely bowling from {bowler}.",
                "Play and a miss. {bowler} asking questions.",
                "Dot ball. Pressure building on {batter}.",
                "Fielded well at point. No run.",
                "Shouldering arms. Good carry to the keeper.",
                "Solid block. Respecting the good ball."
            ],
            single: [
                "Just a single. {batter} rotates the strike.",
                "Pushed to long-on for one.",
                "Quick single! Good running.",
                "Dropped into the gap and they scamper through.",
                "Worked away for a single.",
                "Soft hands, they steal a run."
            ],
            maiden: [
                "MAIDEN OVER! Brilliant stuff from {bowler}.",
                "Six dots in a row! {bowler} is tightening the screws.",
                "A maiden! Supreme control from the bowler.",
                "Not a run conceded. Perfect line and length."
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
            ],
            newBatter: [
                "New batter {batter} walks to the crease. Can they steady the ship?",
                "Here comes {batter}. Big responsibility on their shoulders.",
                "{batter} joins the action. Needs to build a partnership here.",
                "Enter {batter}. Known for their {style} play.",
                "The crowd welcomes {batter} to the middle."
            ],
            situation: [
                "The run rate is creeping up. Need a boundary soon.",
                "Crucial phase of the game. Wickets in hand are key.",
                "The fielding captain brings the field up to save the single.",
                "The bowler is finding some reverse swing now.",
                "Partnership is building nicely. Frustration for the fielding side."
            ]
        };
    }

    getSurname(fullName: string | null | undefined): string {
        if (!fullName) return "The batter";
        const parts = fullName.trim().split(' ');
        return parts.length > 1 ? parts[parts.length - 1] : fullName;
    }

    getCommentary(result: number | string, state: typeof GameState, bowlerName: string, batterName: string): string | undefined {
        // Fix: State values are Preact Signals, so we need to access .value
        const score = state.score.value;
        const wickets = state.wickets.value;
        const balls = state.balls.value;
        const target = state.target.value;
        const format = state.format.value;

        const over = Math.floor(balls / 6);
        const ballInOver = balls % 6;
        const config = format === 'T20' ? { balls: 120 } : format === 'ODI' ? { balls: 300 } : { balls: 2400 };

        let lines: string[] = [];
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

        if (!rawLine) return undefined;

        return rawLine.replace(/{batter}/g, bName).replace(/{bowler}/g, boName);
    }

    getRandom(arr: string[]): string {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    getMaidenCommentary(bowlerName?: string): string {
        const line = this.getRandom(this.templates.maiden);
        return line.replace(/{bowler}/g, this.getSurname(bowlerName) || "the bowler");
    }

    getIntroCommentary(winner: string, decision: string, pitch: string): string {
        const templates = [
            `Welcome everyone! ${winner} has won the toss and decided to ${decision} first. The pitch looks ${pitch}.`,
            `We are live! ${winner} wins the coin flip. They will ${decision} on this ${pitch} surface.`,
            `Toss news: ${winner} elects to ${decision}. Pitch report suggests it is ${pitch}.`
        ];
        return this.getRandom(templates);
    }

    getMilestoneCommentary(milestone: 'fifty' | 'century', batterName: string): string | null {
        const bName = this.getSurname(batterName);
        let lines: string[] = [];
        if (milestone === 'fifty') lines = this.templates.fifty;
        if (milestone === 'century') lines = this.templates.century;
        if (!lines.length) return null;

        return this.getRandom(lines).replace(/{batter}/g, bName);
    }

    getNewBatterCommentary(batterName: string): string {
        const bName = this.getSurname(batterName);
        const line = this.getRandom(this.templates.newBatter);
        return line.replace(/{batter}/g, bName).replace(/{style}/g, "aggressive");
    }

    getSituationCommentary(): string {
        return this.getRandom(this.templates.situation);
    }
}
