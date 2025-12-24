import { GameState } from "./GameState";
import { Player } from "../types";

export class BowlingEngine {
    // Track stats that aren't in the Player model (transient spell data)
    private spellData: Map<string, { currentSpellBalls: number; ballsSinceLastSpell: number }> = new Map();

    constructor() {
        this.reset();
    }

    reset() {
        this.spellData.clear();
    }

    // Called at end of every over
    updateSpells(lastBowlerName: string) {
        // Increment rest for everyone else
        this.spellData.forEach((data, name) => {
            if (name !== lastBowlerName) {
                data.ballsSinceLastSpell += 6;
                // Only reset the spell if they have rested for more than 1 over (i.e. > 12 balls gap)
                // This allows them to bowl Over 1, skip Over 2 (other end), and bowl Over 3 as part of same spell.
                if (data.ballsSinceLastSpell > 12) {
                    data.currentSpellBalls = 0;
                }
            }
        });

        // Update current bowler
        if (!this.spellData.has(lastBowlerName)) {
            this.spellData.set(lastBowlerName, { currentSpellBalls: 0, ballsSinceLastSpell: 0 });
        }
        const bowlerData = this.spellData.get(lastBowlerName)!;
        bowlerData.currentSpellBalls += 6;
        bowlerData.ballsSinceLastSpell = 0;
    }

    getSpellStatus(bowlerName: string) {
        if (!this.spellData.has(bowlerName)) {
            this.spellData.set(bowlerName, { currentSpellBalls: 0, ballsSinceLastSpell: 999 });
        }
        return this.spellData.get(bowlerName)!;
    }

    // Returns a score (higher is better) for selecting this bowler
    getSelectionScore(p: Player, currentBowler: string): number {
        const format = GameState.format.value;
        const stats = this.getSpellStatus(p.name);

        // Limits
        const limitInfo = {
            'T20': { maxSpell: 18, minRest: 6 }, // Max 3 overs spell
            'ODI': { maxSpell: 36, minRest: 12 }, // Max 6 overs spell
            'TEST': { maxSpell: 48, minRest: 12 }  // Max 8 overs spell
        }[format];

        if (!limitInfo) return 1;

        // Hard checks
        if (p.name === currentBowler) return -1; // Can't bowl consecutive overs

        // Fatigue / Spell Limit
        // If they just finished a spell, they need rest
        if (stats.ballsSinceLastSpell < limitInfo.minRest && stats.ballsSinceLastSpell > 0) return 0;

        // Skill Base
        let score = p.bowlingSkill || 70;

        // Spell Logic: Prefer continuing a spell if not exhausted
        // But since we can't bowl consecutive, this logic applies to "Can I come back for a 2nd over in my spell?"
        // Actually, in cricket, spells are broken by the OTHER end. 
        // So `currentSpellBalls` accumulates across overs? 
        // No, usually "Spell" means consecutive overs from ONE END.
        // But our engine switches ends every over implicitly by selecting a NEW bowler.
        // So we need to track if they are "in a spell".

        // Simplification: 
        // A bowler is "Active" if ballsSinceLastSpell <= 12 (1 over gap).

        const isWarm = stats.ballsSinceLastSpell <= 12;
        const isTired = stats.currentSpellBalls >= limitInfo.maxSpell;

        if (isTired) return 1; // Avoid unless desperate
        if (isWarm) score *= 1.5; // Keep them on if they are bowling well/in a spell

        // Random jitter
        score += Math.random() * 20;

        return score;
    }
}
