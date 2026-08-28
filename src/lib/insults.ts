import { classifySide } from "@/lib/grading/matchers/matchResult";
import { teamCandidateStrings } from "@/lib/footballData/teamNameMatch";

// Post-upload banter — private friend-group app, tone requested by the
// user. Odds > 3.0 get the "big balls" treatment, odds <= 1.8 (backing a
// heavy favourite) get mocked for playing it safe, everything else gets a
// generic dig at their gambling ability. On top of that, backing a club
// with a well-known fan stereotype ("Spursy", City's 115 charges, etc.)
// tacks on a second line about the team itself.

const GENERIC_INSULTS = [
  "{name}, my dead grandmother makes better betting decisions than you, and she's been in the ground six years.",
  "Bold move, {name}. Shame your brain didn't turn up with you today.",
  "{name}, you bet like someone who's never actually watched a football match.",
  "Statistically, {name}, a coin flip would outperform you this season.",
  "{name}, that selection has 'panic-bet after two pints' written all over it.",
  "Another week, another shocking decision from {name}.",
  "{name}, your gambling strategy appears to be 'close eyes, point finger.'",
  "Genuinely impressive, {name} — didn't think you could pick worse than last week.",
  "{name}, bookies see you coming from a mile off.",
  "Someone remind {name} the point is to actually win money.",
  "{name}, this bet has 'refund my fiver' energy.",
  "Confidence is great, {name}, shame it's completely misplaced here.",
  "{name}, even a dartboard would've picked better than this.",
  "The bookies are sending {name} a fruit basket for this one.",
  "{name}, this is the betting equivalent of setting fire to a fiver.",
  "Not sure what {name} was thinking here, and neither is {name}.",
  "{name}, this pick screams 'didn't check the team news.'",
  "Every week {name} finds a new way to disappoint the group.",
  "{name}, at this rate you'll owe the group money by Christmas.",
  "Bless you, {name}. Someone has to finish bottom of the table.",
];

const LOW_ODDS_INSULTS = [
  "Odds of {odds}, {name}? Only a bloke with a two-inch cock plays it that safe.",
  "{name}, backing a nailed-on favourite at {odds} says everything about the size of your dick. Tiny.",
  "That's a coward's bet, {name} — {odds} odds and a matching tiny cock.",
  "{name}, {odds} odds is what you bet when you're compensating for something down south.",
  "Playing it this safe at {odds}, {name}? Bet your cock's the same size as your ambition.",
  "{name}, {odds} odds on a certainty — bold of you to advertise how small it is.",
  "Nothing says 'tiny penis' quite like a {odds} shot, {name}.",
  "{name}, real men take risks. You took {odds}. Draw your own conclusions.",
];

const HIGH_ODDS_INSULTS = [
  "Fucking hell {name}, {odds} odds? Big balls on you, mate.",
  "{name} backing a {odds} shot — either a genius or you've got balls like beach balls.",
  "Respect for the {odds} punt, {name}, absolute unit of a gamble.",
  "{name}, {odds} odds takes serious bollocks. Let's see if the brain matches the balls.",
  "That's a proper set of balls on {name}, going in at {odds}.",
  "{name}, {odds} odds — you've either got balls of steel or you've lost the plot completely.",
  "Massive balls, {name}, absolutely massive, going for {odds}.",
  "{name}, backing {odds} odds is either genius or your balls made a very expensive decision.",
];

// Keys are the canonical form teamCandidateStrings() resolves a club's full
// name to (e.g. "Tottenham Hotspur FC" -> "tottenham hotspur"), so matching
// against a bet's home/away team is a straight lookup — no fuzzy logic here.
const TEAM_INSULTS: Record<string, string[]> = {
  "tottenham hotspur": [
    "Backing Spurs, {name}? Get ready to bottle it from a winning position — it's tradition at this point.",
    "{name}, you know Spurs are going to find a way to fuck it up. It's basically a house style.",
    "Only {name} would trust Tottenham not to be Tottenham. Spursy till the day you die.",
    "{name}, Spurs fans have been saying 'this is our year' since 1961. Good luck with that.",
  ],
  arsenal: [
    "{name} backing Arsenal — enjoy watching them bottle another title race in slow motion.",
    "Arsenal, {name}? Specialists in getting so close and then absolutely shitting the bed.",
    "{name}, Arsenal fans have been polishing an empty trophy cabinet since 2004.",
    "Backing the Arsenal, {name}? Hope you like almosts.",
  ],
  "manchester united": [
    "{name}, backing United in this state is like backing a house fire to put itself out.",
    "Man United, {name}? Bold to trust a club that's binned more managers than it's won trophies lately.",
    "{name}, somewhere Sir Alex is watching this bet and shaking his head.",
    "United, {name}? Absolute shambles dressed up as a football club, but sure.",
  ],
  chelsea: [
    "{name}, Chelsea will probably sack the manager mid-match at this rate. Good luck.",
    "Backing Chelsea, {name}? Hope you like chaos, because that's the only consistent thing about them.",
    "{name}, Chelsea's transfer policy makes more sense than this bet, and that's saying something.",
  ],
  liverpool: [
    "{name}, easy there — no need to remind everyone about Istanbul just because you bet on Liverpool.",
    "Liverpool, {name}? Here we go, you're going to bring up 2005 no matter what happens tonight.",
    "{name}, Liverpool fans think they invented football. Betting on them won't change that delusion.",
  ],
  "manchester city": [
    "{name}, backing the club with 115 charges hanging over it — brave choice.",
    "Man City, {name}? Might as well just buy the result while you're at it, seems to be their whole strategy.",
    "{name}, is that a bet or a statement about your morals backing City right now.",
  ],
  "newcastle united": [
    "{name}, Newcastle's Saudi money still can't buy them a personality, but go off.",
    "Backing Newcastle, {name}? All that oil money and still can't buy consistency.",
  ],
  "west ham united": [
    "{name}, classic West Ham pick — brace yourself for a moan-fest regardless of the result.",
    "West Ham, {name}? Typical Hammers, find a way to disappoint even when they're winning.",
  ],
  everton: [
    "{name}, backing Everton in a relegation scrap again, some things never change.",
    "Everton, {name}? Bold considering they're allergic to a mid-table finish these days.",
  ],
  "leeds united": [
    "{name}, Leeds are going to concede three in the last ten minutes, it's basically written in stone.",
    "Backing Leeds, {name}? All heart, no game management — classic collapse incoming.",
  ],
  "nottingham forest": [
    "{name}, Forest fans still bring up 1979 like it happened last week. Betting on them changes nothing.",
    "Nottingham Forest, {name}? Enjoy the chaos, that club runs on vibes and dodgy VAR decisions alone.",
  ],
};

export interface BetContext {
  homeTeam: string;
  awayTeam: string;
  selection: string;
  betType: string;
}

function pickTeamInsult(context: BetContext, userName: string): string | null {
  const candidateTeams =
    context.betType === "MATCH_RESULT"
      ? (() => {
          const side = classifySide(context.selection, context.homeTeam, context.awayTeam);
          if (side === "home") return [context.homeTeam];
          if (side === "away") return [context.awayTeam];
          return [context.homeTeam, context.awayTeam]; // draw, or unresolved
        })()
      : [context.homeTeam, context.awayTeam];

  for (const team of candidateTeams) {
    const candidates = teamCandidateStrings(team);
    for (const [key, pool] of Object.entries(TEAM_INSULTS)) {
      if (candidates.includes(key)) {
        const template = pool[Math.floor(Math.random() * pool.length)];
        return template.replace(/\{name\}/g, userName);
      }
    }
  }
  return null;
}

function fill(template: string, name: string, odds: number): string {
  return template.replace(/\{name\}/g, name).replace(/\{odds\}/g, odds.toFixed(2));
}

export function pickInsult(userName: string, odds: number, context?: BetContext): string {
  const pool = odds > 3 ? HIGH_ODDS_INSULTS : odds <= 1.8 ? LOW_ODDS_INSULTS : GENERIC_INSULTS;
  const template = pool[Math.floor(Math.random() * pool.length)];
  const base = fill(template, userName, odds);

  const teamLine = context ? pickTeamInsult(context, userName) : null;
  return teamLine ? `${base} ${teamLine}` : base;
}
