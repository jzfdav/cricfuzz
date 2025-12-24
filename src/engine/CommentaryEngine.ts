import { GameState } from "./GameState";
import { BallOutcome } from "./SimulationEngine";

interface CommentaryTemplates {
    wicket: {
        bowled: string[];
        caught: string[];
        lbw: string[];
        runout: string[];
        default: string[];
        spin: string[];
    };
    four: {
        drive: string[];
        cutPull: string[];
        edge: string[];
        default: string[];
    };
    six: {
        pull: string[];
        slog: string[];
        drive: string[];
        default: string[];
        spin: string[];
    };
    dot: {
        bouncer: string[];
        yorker: string[];
        beaten: string[];
        default: string[];
        spin: string[];
    };
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
            wicket: {
                bowled: [
                    "Bowled him! The timber is disturbed! {bowler} breaks through!",
                    "Cleaned him up! {bowler} is on fire! You miss, I hit!",
                    "Chopped on! {batter} drags it onto the stumps. Unlucky!",
                    "Castled! A beauty of a delivery from {bowler}.",
                    "Through the gate! {batter} is beaten for pace."
                ],
                caught: [
                    "In the air... and TAKEN! {batter} hits it straight to the fielder!",
                    "Edged and gone! {bowler} gets the wicket of {batter}.",
                    "Caught! Simple catch in the end. {batter} departs.",
                    "A screamer of a catch! {batter} can't believe it!",
                    "Straight to mid-off! {batter} will be disappointed with that shot."
                ],
                lbw: [
                    "LBW! {batter} is trapped in front!",
                    "Up goes the finger! LBW! {bowler} pleads and the umpire agrees.",
                    "Plumb in front! No doubt about that one."
                ],
                runout: [
                    "Run out! {batter} is short of the crease. Tragedy!",
                    "Mix up in the middle! {batter} is stranded."
                ],
                spin: [
                    "Foxed him! The batter had no clue about the turn.",
                    "Stumped? Yes! Leading edge and gone.",
                    "Trapped in the web! The spinner strikes.",
                    "Clean bowled! Ripped through the gate."
                ],
                default: [
                    "GOT HIM! {bowler} induces the false shot and {batter} has to go!",
                    "{batter} walks back to the pavilion. Massive blow!",
                    "The bails fly! Pace and accuracy from {bowler} proved too much."
                ]
            },
            four: {
                drive: [
                    "Beautifully driven by {batter}! That's pure class.",
                    "Cracked through the covers! No one moved.",
                    "Full toss and put away! {batter} accepts the gift."
                ],
                cutPull: [
                    "Short and punished by {batter}! Raced to the fence.",
                    "Slashed away past point! Variable bounce helps the batter.",
                    "Swept away fine! The fielder had no chance."
                ],
                edge: [
                    "Tickled fine for four. Smart batting from {batter}.",
                    "Edged but safe! Runs away to the boundary."
                ],
                default: [
                    "Four runs! {batter} times that to perfection.",
                    "Over the infield and runs away for four!",
                    "Power and placement! {batter} finds the gap."
                ]
            },
            six: {
                pull: [
                    "That's huge! {bowler} watches it sail over his head!",
                    "Short ball, deposited into the stands by {batter}!",
                    "High and handsome! Six runs for {batter}."
                ],
                slog: [
                    "SIX! {batter} launches that into orbit!",
                    "Muscle! Sheer muscle from {batter}! Clears the boundary with ease.",
                    "Downtown! {batter} hits a monster!"
                ],
                drive: [
                    "Maximum! {batter} picked the length early and dispatched it.",
                    "Lofted over extra cover! What a shot!"
                ],
                spin: [
                    "Down the track and BANG! Into the sightscreen.",
                    "Uses the feet and clears long off! Massive hit.",
                    "Dispatched against the turn! Brave shot."
                ],
                default: [
                    "That's gone miles! Clean striking from {batter}.",
                    "Crowd catch! {batter} deposits that into the stands!",
                    "Flat six! That travelled like a bullet."
                ]
            },
            dot: {
                bouncer: [
                    "Bouncer! {batter} ducks underneath it.",
                    "Well directed short ball. {batter} sways out of the way.",
                    "Chin music! {bowler} testing the batter."
                ],
                yorker: [
                    "Yorker! dug out well by {batter}.",
                    "Toe-crusher! {batter} does well to keep it out.",
                    "Right in the blockhole. No run."
                ],
                beaten: [
                    "Beaten! Lovely bowling from {bowler}.",
                    "Play and a miss. {bowler} asking questions.",
                    "So close! That missed the edge by a whisker."
                ],
                spin: [
                    "Turn and bounce! {batter} is lucky not to edge that.",
                    "Beaten in flight! Great delivery.",
                    "Ripped past the outside edge!",
                    "Solid defense against the turning ball."
                ],
                default: [
                    "No run. Good solid defense from {batter}.",
                    "Straight to the fielder. {batter} can't pierce the gap.",
                    "Dot ball. Pressure building on {batter}.",
                    "Fielded well at point. No run.",
                    "Shouldering arms. Good carry to the keeper.",
                    "Solid block. Respecting the good ball."
                ]
            },
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

    getCommentary(result: BallOutcome, bowlerName: string, batterName: string): string | undefined {
        const state = GameState;
        const score = state.score.value;
        const balls = state.balls.value;
        const target = state.target.value;
        const format = state.format.value;
        const config = format === 'T20' ? { balls: 120 } : format === 'ODI' ? { balls: 300 } : { balls: 2400 };

        // --- Contextual Overrides ---
        if (target && (target - score) < 20 && (config.balls - balls) < 18) {
            if (Math.random() > 0.6) return this.getRandom(this.templates.closeGame);
        }

        let templatePool: string[] = [];

        // Find Bowler Style
        const bowlerObj = GameState.bowlingSquad.value.find(p => p.name === bowlerName);
        const style = bowlerObj?.bowlingStyle || 'Pace';

        if (result.isWicket) {
            // Wicket Logic
            if (style === 'Spin' && Math.random() > 0.5) templatePool = this.templates.wicket.spin;
            else if (result.wicketType === 'bowled') templatePool = this.templates.wicket.bowled;
            else if (result.wicketType === 'lbw') templatePool = this.templates.wicket.lbw;
            else if (result.wicketType === 'runout') templatePool = this.templates.wicket.runout;
            else templatePool = this.templates.wicket.caught;

            if (!templatePool || templatePool.length === 0) templatePool = this.templates.wicket.default;

        } else if (result.runs === 6) {
            // Six Logic
            if (style === 'Spin' && Math.random() > 0.6) templatePool = this.templates.six.spin;
            else if (result.shotType === 'pull') templatePool = this.templates.six.pull;
            else if (result.shotType === 'slog') templatePool = this.templates.six.slog;
            else if (result.shotType === 'drive') templatePool = this.templates.six.drive;
            else templatePool = this.templates.six.default;

        } else if (result.runs === 4) {
            // Four Logic
            if (result.shotType === 'drive') templatePool = this.templates.four.drive;
            else if (result.shotType === 'pull' || result.shotType === 'cut') templatePool = this.templates.four.cutPull;
            else if (result.shotType === 'edge') templatePool = this.templates.four.edge;
            else templatePool = this.templates.four.default;

        } else if (result.runs === 0) {
            // Dot Logic
            if (style === 'Spin' && (result.deliveryType === 'full' || result.deliveryType === 'length')) {
                if (Math.random() > 0.4) templatePool = this.templates.dot.spin;
                else templatePool = this.templates.dot.default;
            }
            else if (result.deliveryType === 'bouncer') templatePool = this.templates.dot.bouncer;
            else if (result.deliveryType === 'yorker') templatePool = this.templates.dot.yorker;
            else if (result.timing === 'missed' || result.timing === 'poor') templatePool = this.templates.dot.beaten;
            else templatePool = this.templates.dot.default;

        } else {
            // Single/Runs Logic
            templatePool = this.templates.single;
        }

        const rawLine = this.getRandom(templatePool);
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
